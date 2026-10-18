'use strict';

/**
 * server.js — Main entry point for miljonaaripeli
 *
 * Stack:
 *   - Express  → HTTP API + static file serving
 *   - ws       → WebSocket server for real-time game events
 *   - better-sqlite3 → persistent storage
 *   - node-fetch     → Open Trivia API fallback + Twitch OAuth
 *
 * Game flow:
 *   1. Admin calls POST /api/game/start
 *   2. Questions loaded from DB (or fetched from Open Trivia API)
 *   3. Each question cycles: voting phase → host_turn phase → revealing phase
 *   4. After all questions: game_over, scores saved to DB
 */

require('dotenv').config();

const express    = require('express');
const http       = require('http');
const WebSocket  = require('ws');
const cors       = require('cors');
const path       = require('path');
const crypto     = require('crypto');
const fetch      = globalThis.fetch;
const uuidv4     = () => crypto.randomUUID();

const {
  getQuestions,
  saveGameResults,
  getLeaderboard,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  db,
} = require('./db');

// ---------------------------------------------------------------------------
// Express app + HTTP server
// ---------------------------------------------------------------------------
const app    = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Minimal cookie-based session without a heavy dependency
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_this_secret';
const sessions = {}; // sessionId → { username, platform, twitchId, ... }

/**
 * Read or create a session.  Returns { sessionId, data }.
 */
function getSession(req, res) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/sess=([^;]+)/);
  const sid    = match ? match[1] : null;

  if (sid && sessions[sid]) {
    return { sessionId: sid, data: sessions[sid] };
  }

  // Create new session
  const newSid  = crypto.randomBytes(24).toString('hex');
  sessions[newSid] = {};
  res.setHeader('Set-Cookie', `sess=${newSid}; HttpOnly; Path=/; SameSite=Lax`);
  return { sessionId: newSid, data: sessions[newSid] };
}

// ---------------------------------------------------------------------------
// WebSocket server (attached to same HTTP server, path /ws)
// ---------------------------------------------------------------------------
const wss = new WebSocket.Server({ server, path: '/ws' });

// Track all connected WS clients with metadata
const clients = new Map(); // ws → { username, platform, channel, id }

// ---------------------------------------------------------------------------
// Game state (singleton — one game at a time)
// ---------------------------------------------------------------------------
/**
 * @typedef {object} GameState
 */
const defaultGameState = () => ({
  active:            false,
  phase:             'waiting',       // waiting | voting | host_turn | revealing | game_over
  currentQuestion:   null,
  questionNumber:    0,
  totalQuestions:    0,
  timeLeft:          0,
  votingTimeSeconds: 30,
  hostTimeSeconds:   30,
  votes:             { A: 0, B: 0, C: 0, D: 0 },
  voters:            {},              // username → answer
  lifelines: {
    removeWrong:  { total: 1, used: 0 },
    addTime:      { total: 1, used: 0 },
    extraHint:    { total: 1, used: 0 },
    askAudience:  { total: 1, used: 0 },
  },
  gameMode:          'trivia',        // trivia | chat_quotes
  connectedPlayers:  0,
  sessionScores:     {},             // username → { score, correct, streak, lastCorrect }
  eliminatedAnswers: [],             // letters removed by removeWrong lifeline
  sessionId:         null,           // DB game_sessions.id
  channel:           null,
  questions:         [],             // all loaded questions for this session
});

let gameState = defaultGameState();
let timerInterval = null;

// ---------------------------------------------------------------------------
// Utility: broadcast to all connected WS clients
// ---------------------------------------------------------------------------
function broadcast(payload, skipWs = null) {
  const msg = JSON.stringify(payload);
  for (const [ws] of clients) {
    if (ws !== skipWs && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

/** Send the full game state to all clients (or a single client). */
function broadcastGameState(targetWs = null) {
  // Strip internal-only fields before sending
  const publicState = {
    ...gameState,
    questions:         undefined, // don't leak future questions
    currentQuestion:   gameState.currentQuestion
      ? sanitizeQuestion(gameState.currentQuestion, gameState.phase)
      : null,
  };
  const payload = { type: 'game_state', state: publicState };
  if (targetWs) {
    targetWs.send(JSON.stringify(payload));
  } else {
    broadcast(payload);
  }
}

/**
 * Strip the correct_answer from the question unless we are in the revealing phase.
 */
function sanitizeQuestion(q, phase) {
  if (!q) return null;
  const { correct_answer, ...rest } = q;
  if (phase === 'revealing') return { ...rest, correct_answer };
  return rest;
}

// ---------------------------------------------------------------------------
// Timer management
// ---------------------------------------------------------------------------
function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Start a countdown timer.
 * @param {number}   seconds   - initial value
 * @param {function} onTick    - called every second with (remaining)
 * @param {function} onExpire  - called when timer reaches 0
 */
function startTimer(seconds, onTick, onExpire) {
  clearTimer();
  gameState.timeLeft = seconds;

  timerInterval = setInterval(() => {
    gameState.timeLeft -= 1;
    broadcast({ type: 'timer', timeLeft: gameState.timeLeft });
    onTick(gameState.timeLeft);

    if (gameState.timeLeft <= 0) {
      clearTimer();
      onExpire();
    }
  }, 1000);
}

// ---------------------------------------------------------------------------
// Score calculation
// ---------------------------------------------------------------------------
const DIFFICULTY_POINTS = { easy: 100, medium: 250, hard: 500 };
const TIME_BONUS_PER_SEC = 10;

/**
 * Calculate score for a correct answer.
 * @param {string} difficulty
 * @param {number} timeLeft   - remaining seconds when answer was recorded
 * @param {number} streak     - current streak count BEFORE this answer
 */
function calcScore(difficulty, timeLeft, streak) {
  const base      = DIFFICULTY_POINTS[difficulty] || 100;
  const timeBonus = Math.max(0, timeLeft) * TIME_BONUS_PER_SEC;
  const raw       = base + timeBonus;
  // Streak multiplier: ×1.5 for 3+ correct in a row
  const mult      = streak >= 2 ? 1.5 : 1;
  return Math.round(raw * mult);
}

// ---------------------------------------------------------------------------
// Question lifecycle
// ---------------------------------------------------------------------------

/** Present the next question to all clients. */
function presentNextQuestion() {
  const idx = gameState.questionNumber; // 0-based index into gameState.questions

  if (idx >= gameState.questions.length) {
    endGame();
    return;
  }

  const question = gameState.questions[idx];
  gameState.currentQuestion   = question;
  gameState.questionNumber    = idx + 1; // 1-based for display
  gameState.phase             = 'voting';
  gameState.votes             = { A: 0, B: 0, C: 0, D: 0 };
  gameState.voters            = {};
  gameState.eliminatedAnswers = [];

  broadcast({
    type:         'question',
    question:     sanitizeQuestion(question, 'voting'),
    timeLeft:     gameState.votingTimeSeconds,
    votingOpen:   true,
    questionNumber: gameState.questionNumber,
    totalQuestions: gameState.totalQuestions,
  });
  broadcastGameState();

  // Voting phase countdown
  startTimer(
    gameState.votingTimeSeconds,
    () => {
      // Every tick: send live vote update
      broadcast({
        type:       'vote_update',
        votes:      { ...gameState.votes },
        totalVoters: Object.keys(gameState.voters).length,
      });
    },
    () => {
      // Voting time expired → host phase
      startHostPhase();
    }
  );
}

/** Switch to host_turn phase (host has time to deliberate). */
function startHostPhase() {
  gameState.phase = 'host_turn';
  broadcastGameState();
  broadcast({ type: 'vote_update', votes: { ...gameState.votes }, totalVoters: Object.keys(gameState.voters).length });

  startTimer(
    gameState.hostTimeSeconds,
    () => {},
    () => {
      // Host ran out of time — auto-reveal with no host answer (scores still calculated from chat votes)
      revealAnswer(null);
    }
  );
}

/**
 * Reveal the answer and award points.
 * @param {'A'|'B'|'C'|'D'|null} hostAnswer - null if host timed out
 */
function revealAnswer(hostAnswer) {
  clearTimer();
  const q       = gameState.currentQuestion;
  const correct = q.correct_answer;

  gameState.phase = 'revealing';

  // Calculate scores for all voters
  const playerResults = [];

  for (const [username, answer] of Object.entries(gameState.voters)) {
    const isCorrect = answer === correct;
    const pState    = gameState.sessionScores[username] || { score: 0, correct: 0, streak: 0, platform: 'guest', lastCorrect: false };

    // Update streak
    if (isCorrect) {
      pState.streak++;
      pState.correct++;
    } else {
      pState.streak = 0;
    }

    const earned = isCorrect
      ? calcScore(q.difficulty, gameState.timeLeft, pState.streak - (isCorrect ? 1 : 0))
      : 0;

    pState.score        += earned;
    pState.lastCorrect   = isCorrect;
    gameState.sessionScores[username] = pState;

    playerResults.push({ username, answer, isCorrect, earned, score: pState.score });
  }

  broadcast({
    type:          'answer_reveal',
    correct,
    hostAnswer,
    playerResults,
    question:      q, // full question with correct_answer now visible
    votes:         { ...gameState.votes },
    totalVoters:   Object.keys(gameState.voters).length,
  });

  broadcastGameState();

  // Top-10 leaderboard update
  broadcastLeaderboardUpdate();

  // Advance after a short delay to let the UI show the result
  setTimeout(() => {
    if (gameState.active) {
      presentNextQuestion();
    }
  }, 5000);
}

/** Compute and broadcast a mini leaderboard of top 10 this session. */
function broadcastLeaderboardUpdate() {
  const top10 = Object.entries(gameState.sessionScores)
    .map(([username, s]) => ({ username, platform: s.platform, score: s.score, correct: s.correct }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  broadcast({ type: 'leaderboard_update', top10 });
}

/** End the game, save scores to DB, broadcast game_over. */
function endGame() {
  clearTimer();
  gameState.active = false;
  gameState.phase  = 'game_over';

  const finalLeaderboard = Object.entries(gameState.sessionScores)
    .map(([username, s]) => ({ username, platform: s.platform, score: s.score, correct: s.correct, streak: s.streak }))
    .sort((a, b) => b.score - a.score);

  broadcast({ type: 'game_over', finalLeaderboard });
  broadcastGameState();

  // Persist to DB
  try {
    const playerScores = finalLeaderboard.map(p => ({
      username:       p.username,
      platform:       p.platform || 'guest',
      score:          p.score,
      correct:        p.correct,
      total_answered: gameState.sessionScores[p.username] ? Object.keys(gameState.voters).length : 0,
      streak:         p.streak || 0,
    }));

    saveGameResults(
      {
        game_mode:       gameState.gameMode,
        total_questions: gameState.totalQuestions,
        channel:         gameState.channel || null,
      },
      playerScores
    );
  } catch (err) {
    console.error('[Game] Failed to save results:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Open Trivia API fallback
// ---------------------------------------------------------------------------
const OTD_CATEGORY_GENERAL = 9;

/**
 * Fetch questions from Open Trivia Database API.
 * Returns them mapped to our question schema (no DB insert — temporary only).
 * @param {number} count
 */
async function fetchOpenTriviaQuestions(count = 10) {
  try {
    const url = `https://opentdb.com/api.php?amount=${count}&type=multiple&lang=fi`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.response_code !== 0 || !data.results) return [];

    return data.results.map((item, i) => {
      // Shuffle all 4 options (1 correct + 3 incorrect)
      const options = [item.correct_answer, ...item.incorrect_answers];
      // Simple deterministic shuffle via sort with random compare
      options.sort(() => Math.random() - 0.5);

      const letters = ['A', 'B', 'C', 'D'];
      const correctIdx = options.indexOf(item.correct_answer);

      return {
        id:             -(i + 1), // negative id to distinguish from DB rows
        question_fi:    decodeHTMLEntities(item.question),
        option_a:       decodeHTMLEntities(options[0]),
        option_b:       decodeHTMLEntities(options[1]),
        option_c:       decodeHTMLEntities(options[2]),
        option_d:       decodeHTMLEntities(options[3]),
        correct_answer: letters[correctIdx],
        difficulty:     item.difficulty,
        category:       item.category,
        hint:           null,
        mode:           'trivia',
      };
    });
  } catch (err) {
    console.error('[OpenTrivia] Fetch failed:', err.message);
    return [];
  }
}

/** Basic HTML entity decoder (opentdb returns encoded strings). */
function decodeHTMLEntities(str) {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ouml;/g,  'ö')
    .replace(/&auml;/g,  'ä')
    .replace(/&aring;/g, 'å');
}

// ---------------------------------------------------------------------------
// Kick Chat WebSocket integration
// ---------------------------------------------------------------------------
// Kick uses a Pusher-based WebSocket endpoint.
// Pusher app key for Kick (public, found in their frontend JS): 32cbd69e4b950bf97679
const KICK_PUSHER_WS  = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false';

let kickWs = null; // active Kick WebSocket connection

/**
 * Connect to Kick Pusher WebSocket and subscribe to a channel's chatroom.
 * @param {string} chatroomId  - Kick chatroom ID (numeric string)
 * @param {string} channelName - human-readable channel name (for display)
 */
async function connectKickChat(rawIdOrName, channelName) {
  if (kickWs) {
    kickWs.terminate();
    kickWs = null;
  }

  let chatroomId = String(rawIdOrName || channelName || '').trim();
  // If not purely numeric, resolve slug via Kick API
  if (!/^\d+$/.test(chatroomId)) {
    const slug = chatroomId.replace(/^https?:\/\/(www\.)?kick\.com\//i, '').replace(/\/.*$/, '').trim();
    try {
      console.log(`[Kick] Looking up chatroom ID for "${slug}"...`);
      const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (r.ok) {
        const d = await r.json();
        if (d?.chatroom?.id) {
          chatroomId = String(d.chatroom.id);
          console.log(`[Kick] Resolved "${slug}" -> chatroom ${chatroomId}`);
        }
      }
    } catch (err) {
      console.warn(`[Kick] Could not resolve chatroom ID: ${err.message}`);
    }
  }

  console.log(`[Kick] Connecting to chatroom ${chatroomId} (${channelName || rawIdOrName})`);
  kickWs = new WebSocket(KICK_PUSHER_WS);

  kickWs.on('open', () => {
    console.log('[Kick] WebSocket connected, subscribing to chatroom...');
    // Subscribe to the chatroom channel
    kickWs.send(JSON.stringify({
      event: 'pusher:subscribe',
      data:  { auth: '', channel: `chatroom.${chatroomId}.v2` },
    }));
  });

  kickWs.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    // Pusher keepalive
    if (msg.event === 'pusher:ping') {
      kickWs.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
      return;
    }

    // Chat message event
    if (msg.event === 'App\\Events\\ChatMessageEvent') {
      let data;
      try { data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data; } catch { return; }

      const username   = data?.sender?.username || 'anonymous';
      const content    = (data?.content || '').trim();

      // Forward to all WS clients as chat_message
      broadcast({ type: 'chat_message', username, message: content, platform: 'kick' });

      // Parse vote if voting phase is open
      handleChatVote(username, content, 'kick');
    }
  });

  kickWs.on('error', (err) => console.error('[Kick] WebSocket error:', err.message));
  kickWs.on('close', (code) => {
    console.log(`[Kick] WebSocket closed (${code}). Reconnecting in 5s...`);
    setTimeout(() => {
      if (gameState.active) connectKickChat(chatroomId, channelName);
    }, 5000);
  });
}

// ---------------------------------------------------------------------------
// Twitch Chat IRC integration
// ---------------------------------------------------------------------------
const TWITCH_IRC_WS = 'wss://irc-ws.chat.twitch.tv/';

let twitchIrcWs      = null; // active Twitch IRC WebSocket
let twitchIrcChannel = null; // joined channel (with #)

/**
 * Connect to Twitch IRC and join a channel.
 * If TWITCH_CLIENT_ID / SECRET are set and we have an OAuth token from session,
 * we can authenticate properly. Otherwise fall back to anonymous read-only.
 * @param {string} channel       - channel name without #
 * @param {string|null} oauthToken - "oauth:TOKEN" or null for anon
 */
function connectTwitchChat(channel, oauthToken = null) {
  if (twitchIrcWs) {
    twitchIrcWs.terminate();
    twitchIrcWs = null;
  }

  twitchIrcChannel = `#${channel.toLowerCase().replace('#', '')}`;
  console.log(`[Twitch] Connecting to IRC channel ${twitchIrcChannel}`);

  twitchIrcWs = new WebSocket(TWITCH_IRC_WS);

  twitchIrcWs.on('open', () => {
    // Capability request for tags (gives us display-name, etc.)
    twitchIrcWs.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    // Auth
    if (oauthToken) {
      twitchIrcWs.send(`PASS ${oauthToken}`);
      twitchIrcWs.send(`NICK ${channel.toLowerCase()}`);
    } else {
      // Anonymous connection (read-only for public channels)
      twitchIrcWs.send('PASS SCHMOOPIIE');
      twitchIrcWs.send('NICK justinfan' + Math.floor(Math.random() * 80000 + 1000));
    }
    twitchIrcWs.send(`JOIN ${twitchIrcChannel}`);
    console.log(`[Twitch] Joined ${twitchIrcChannel}`);
  });

  twitchIrcWs.on('message', (raw) => {
    const line = raw.toString().trim();

    // Respond to PING
    if (line.startsWith('PING')) {
      twitchIrcWs.send('PONG :tmi.twitch.tv');
      return;
    }

    // Parse PRIVMSG
    // Example: @display-name=SomeUser;... :someuser!someuser@someuser.tmi.twitch.tv PRIVMSG #channel :hello
    const privmsgMatch = line.match(/^(?:@[^ ]+ )?:([^!]+)![^ ]+ PRIVMSG [^ ]+ :(.*)$/);
    if (privmsgMatch) {
      // Try to get display-name from tags
      const tagsStr     = line.startsWith('@') ? line.split(' ')[0].slice(1) : '';
      const tagMap      = {};
      tagsStr.split(';').forEach(t => {
        const [k, v] = t.split('=');
        if (k) tagMap[k] = v || '';
      });
      const username = tagMap['display-name'] || privmsgMatch[1];
      const content  = privmsgMatch[2];

      broadcast({ type: 'chat_message', username, message: content, platform: 'twitch' });
      handleChatVote(username, content, 'twitch');
    }
  });

  twitchIrcWs.on('error', (err) => console.error('[Twitch] IRC error:', err.message));
  twitchIrcWs.on('close', (code) => {
    console.log(`[Twitch] IRC closed (${code}). Reconnecting in 5s...`);
    setTimeout(() => {
      if (gameState.active) connectTwitchChat(channel, oauthToken);
    }, 5000);
  });
}

// ---------------------------------------------------------------------------
// Shared chat vote handler (Kick + Twitch)
// ---------------------------------------------------------------------------
const VOTE_REGEX = /^[!]?([ABCD])$/i; // matches A B C D or !A !B !C !D

/**
 * Register a chat vote if voting phase is active.
 * Each user can only vote once per question.
 */
function handleChatVote(username, content, platform) {
  if (gameState.phase !== 'voting') return;

  const match = content.trim().match(VOTE_REGEX);
  if (!match) return;

  const answer = match[1].toUpperCase();

  // Ignore if this answer letter has been eliminated
  if (gameState.eliminatedAnswers.includes(answer)) return;

  // One vote per user
  if (gameState.voters[username]) return;

  // Register vote
  gameState.voters[username] = answer;
  gameState.votes[answer]++;

  // Ensure the voter exists in sessionScores
  if (!gameState.sessionScores[username]) {
    gameState.sessionScores[username] = { score: 0, correct: 0, streak: 0, platform, lastCorrect: false };
  }

  // Broadcast live vote update
  broadcast({
    type:       'vote_update',
    votes:      { ...gameState.votes },
    totalVoters: Object.keys(gameState.voters).length,
  });
}

// ---------------------------------------------------------------------------
// WebSocket connection handler
// ---------------------------------------------------------------------------
wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  clients.set(ws, { id: clientId, username: null, platform: 'guest', channel: null });

  console.log(`[WS] Client connected: ${clientId}`);

  // Update connected players count
  gameState.connectedPlayers = clients.size;
  broadcastGameState();

  // Send current game state to new client immediately
  broadcastGameState(ws);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    const meta = clients.get(ws);

    switch (msg.type) {
      // -----------------------------------------------------------------------
      // Player joins the game
      // -----------------------------------------------------------------------
      case 'join': {
        const username = (msg.username || '').trim().slice(0, 32) || `Guest_${clientId.slice(0,6)}`;
        const platform = ['kick','twitch','guest'].includes(msg.platform) ? msg.platform : 'guest';
        const channel  = (msg.channel || '').trim();

        meta.username = username;
        meta.platform = platform;
        meta.channel  = channel;

        // Register in session scores if game is active
        if (gameState.active && !gameState.sessionScores[username]) {
          gameState.sessionScores[username] = { score: 0, correct: 0, streak: 0, platform, lastCorrect: false };
        }

        console.log(`[WS] ${username} (${platform}) joined`);
        broadcastGameState(ws);
        break;
      }

      // -----------------------------------------------------------------------
      // Player votes
      // -----------------------------------------------------------------------
      case 'vote': {
        const username = meta.username;
        if (!username) break;
        const answer = (msg.answer || '').toUpperCase();
        if (!['A','B','C','D'].includes(answer)) break;
        handleChatVote(username, answer, meta.platform);
        break;
      }

      // -----------------------------------------------------------------------
      // Broadcaster requests chat integration
      // -----------------------------------------------------------------------
      case 'chat_connect': {
        const channel  = (msg.channel || '').trim();
        const platform = msg.platform;

        if (platform === 'kick') {
          // For Kick we need the chatroomId.  If msg.chatroomId is provided use it,
          // otherwise use channel as-is (caller should pass the numeric chatroom ID).
          const chatroomId = msg.chatroomId || channel;
          connectKickChat(chatroomId, channel);
          ws.send(JSON.stringify({ type: 'chat_connect_ack', platform: 'kick', channel }));
        } else if (platform === 'twitch') {
          const oauthToken = msg.oauthToken || null;
          connectTwitchChat(channel, oauthToken);
          ws.send(JSON.stringify({ type: 'chat_connect_ack', platform: 'twitch', channel }));
        }
        break;
      }

      // -----------------------------------------------------------------------
      // Keepalive
      // -----------------------------------------------------------------------
      case 'ping': {
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      }

      default:
        // Unknown message type — ignore silently
        break;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    gameState.connectedPlayers = clients.size;
    console.log(`[WS] Client disconnected: ${clientId}`);
    broadcastGameState();
  });

  ws.on('error', (err) => console.error(`[WS] Error for ${clientId}:`, err.message));
});

// ---------------------------------------------------------------------------
// HTTP Routes — static pages
// ---------------------------------------------------------------------------
app.get('/',            (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin',       (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/leaderboard', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'leaderboard.html')));

// ---------------------------------------------------------------------------
// HTTP Routes — API
// ---------------------------------------------------------------------------

// ---- Leaderboard ----
app.get('/api/leaderboard', (req, res) => {
  const period = ['alltime','week','month'].includes(req.query.period) ? req.query.period : 'alltime';
  const limit  = Math.min(parseInt(req.query.limit) || 50, 100);
  try {
    const rows = getLeaderboard(period, limit);
    res.json({ success: true, period, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Questions CRUD ----
app.get('/api/questions', (req, res) => {
  const mode       = req.query.mode       || null;
  const difficulty = req.query.difficulty || null;

  let sql  = 'SELECT * FROM questions WHERE 1=1';
  const params = [];
  if (mode)       { sql += ' AND mode = ?';       params.push(mode); }
  if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
  sql += ' ORDER BY id DESC';

  try {
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/questions', (req, res) => {
  const { question_fi, option_a, option_b, option_c, option_d,
          correct_answer, difficulty, category, hint, mode } = req.body;

  if (!question_fi || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const id = addQuestion({ question_fi, option_a, option_b, option_c, option_d,
                              correct_answer: correct_answer.toUpperCase(),
                              difficulty: difficulty || 'medium',
                              category:   category   || 'Yleistieto',
                              hint:       hint       || null,
                              mode:       mode       || 'trivia' });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/questions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });

  try {
    updateQuestion(id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/questions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });

  try {
    deleteQuestion(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- Game state ----
app.get('/api/game-state', (_req, res) => {
  res.json({
    success: true,
    state: {
      ...gameState,
      questions:       undefined,
      currentQuestion: gameState.currentQuestion
        ? sanitizeQuestion(gameState.currentQuestion, gameState.phase)
        : null,
    },
  });
});

// ---- Game control ----

/**
 * POST /api/game/start
 * Body: { mode, questionCount, votingTimeSeconds, hostTimeSeconds, channel }
 */
app.post('/api/game/start', async (req, res) => {
  if (gameState.active) {
    return res.status(409).json({ success: false, error: 'Game already running' });
  }

  const mode               = req.body.mode               || 'trivia';
  const questionCount      = Math.min(parseInt(req.body.questionCount) || 10, 50);
  const votingTimeSeconds  = Math.min(parseInt(req.body.votingTimeSeconds) || 30, 120);
  const hostTimeSeconds    = Math.min(parseInt(req.body.hostTimeSeconds)   || 30, 120);
  const channel            = req.body.channel            || null;

  // Load questions from DB
  let questions = getQuestions(mode, questionCount);

  // Fallback to Open Trivia API if not enough questions in DB
  if (questions.length < questionCount && mode === 'trivia') {
    console.log(`[Game] Only ${questions.length}/${questionCount} questions in DB — fetching from OpenTrivia...`);
    const apiQuestions = await fetchOpenTriviaQuestions(questionCount - questions.length);
    questions = [...questions, ...apiQuestions];
  }

  if (questions.length === 0) {
    return res.status(422).json({ success: false, error: 'No questions available' });
  }

  // Reset game state
  gameState = {
    ...defaultGameState(),
    active:            true,
    phase:             'voting',
    gameMode:          mode,
    totalQuestions:    questions.length,
    votingTimeSeconds,
    hostTimeSeconds,
    channel,
    questions,
    questionNumber:    0,
  };

  console.log(`[Game] Starting: ${questions.length} questions, mode=${mode}, votingTime=${votingTimeSeconds}s`);

  broadcastGameState();
  res.json({ success: true, totalQuestions: questions.length });

  // Start the first question after a short delay
  setTimeout(presentNextQuestion, 2000);
});

/**
 * POST /api/game/stop
 * Force-stop the game immediately.
 */
app.post('/api/game/stop', (req, res) => {
  if (!gameState.active) {
    return res.status(409).json({ success: false, error: 'No game running' });
  }
  endGame();
  res.json({ success: true });
});

/**
 * POST /api/game/next-question
 * Admin manually advances to the next question (skips current).
 */
app.post('/api/game/next-question', (req, res) => {
  if (!gameState.active) {
    return res.status(409).json({ success: false, error: 'No game running' });
  }
  clearTimer();
  presentNextQuestion();
  res.json({ success: true });
});

/**
 * POST /api/game/answer
 * Host submits the chosen answer.
 * Body: { answer: 'A'|'B'|'C'|'D' }
 */
app.post('/api/game/answer', (req, res) => {
  if (!gameState.active) {
    return res.status(409).json({ success: false, error: 'No game running' });
  }
  if (!['voting','host_turn'].includes(gameState.phase)) {
    return res.status(409).json({ success: false, error: `Cannot answer in phase: ${gameState.phase}` });
  }

  const answer = (req.body.answer || '').toUpperCase();
  if (!['A','B','C','D'].includes(answer)) {
    return res.status(400).json({ success: false, error: 'Invalid answer' });
  }

  revealAnswer(answer);
  res.json({ success: true });
});

/**
 * POST /api/game/use-lifeline
 * Body: { lifeline: 'removeWrong'|'addTime'|'extraHint'|'askAudience' }
 */
app.post('/api/game/use-lifeline', (req, res) => {
  if (!gameState.active) {
    return res.status(409).json({ success: false, error: 'No game running' });
  }

  const { lifeline } = req.body;
  const ll = gameState.lifelines[lifeline];

  if (!ll) {
    return res.status(400).json({ success: false, error: 'Unknown lifeline' });
  }
  if (ll.used >= ll.total) {
    return res.status(409).json({ success: false, error: 'Lifeline already used' });
  }

  ll.used++;

  switch (lifeline) {
    // Remove 2 wrong answers randomly
    case 'removeWrong': {
      const q       = gameState.currentQuestion;
      const correct = q.correct_answer;
      const wrong   = ['A','B','C','D'].filter(l => l !== correct && !gameState.eliminatedAnswers.includes(l));
      // Shuffle and take 2
      wrong.sort(() => Math.random() - 0.5);
      const eliminated = wrong.slice(0, 2);
      gameState.eliminatedAnswers.push(...eliminated);
      broadcast({ type: 'lifeline_result', lifeline: 'removeWrong', data: { eliminated } });
      break;
    }

    // Add 30 seconds to the current timer
    case 'addTime': {
      gameState.timeLeft += 30;
      broadcast({ type: 'lifeline_result', lifeline: 'addTime', data: { addedSeconds: 30, newTimeLeft: gameState.timeLeft } });
      break;
    }

    // Show the question's hint text
    case 'extraHint': {
      const hint = gameState.currentQuestion?.hint || 'Ei vihjeä saatavilla.';
      broadcast({ type: 'lifeline_result', lifeline: 'extraHint', data: { hint } });
      break;
    }

    // Show current audience vote distribution as percentages
    case 'askAudience': {
      const total = Object.values(gameState.votes).reduce((a, b) => a + b, 0) || 1;
      const distribution = {
        A: Math.round((gameState.votes.A / total) * 100),
        B: Math.round((gameState.votes.B / total) * 100),
        C: Math.round((gameState.votes.C / total) * 100),
        D: Math.round((gameState.votes.D / total) * 100),
      };
      broadcast({ type: 'lifeline_result', lifeline: 'askAudience', data: { distribution, total } });
      break;
    }
  }

  broadcastGameState();
  res.json({ success: true, lifelines: gameState.lifelines });
});

// ---------------------------------------------------------------------------
// Twitch OAuth routes
// ---------------------------------------------------------------------------
const TWITCH_AUTH_URL     = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_TOKEN_URL    = 'https://id.twitch.tv/oauth2/token';
const TWITCH_VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';
const TWITCH_USERS_URL    = 'https://api.twitch.tv/helix/users';

// Simple state store for CSRF protection (state param → expiry)
const oauthStates = {};

/** GET /auth/twitch — redirect to Twitch OAuth consent page */
app.get('/auth/twitch', (req, res) => {
  const clientId   = process.env.TWITCH_CLIENT_ID;
  const baseUrl    = process.env.BASE_URL || `http://localhost:${PORT}`;
  const redirectUri = `${baseUrl}/auth/twitch/callback`;

  if (!clientId) {
    return res.status(503).send('TWITCH_CLIENT_ID not configured');
  }

  const state = crypto.randomBytes(16).toString('hex');
  oauthStates[state] = Date.now() + 10 * 60 * 1000; // valid 10 min

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'chat:read chat:edit user:read:email',
    state,
  });

  res.redirect(`${TWITCH_AUTH_URL}?${params.toString()}`);
});

/** GET /auth/twitch/callback — Twitch redirects here after consent */
app.get('/auth/twitch/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect('/?auth_error=' + encodeURIComponent(error));
  }

  // Validate CSRF state
  if (!state || !oauthStates[state] || oauthStates[state] < Date.now()) {
    return res.status(400).send('Invalid OAuth state. Please try again.');
  }
  delete oauthStates[state];

  const clientId     = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const baseUrl      = process.env.BASE_URL || `http://localhost:${PORT}`;
  const redirectUri  = `${baseUrl}/auth/twitch/callback`;

  try {
    // Exchange code for token
    const tokenRes = await fetch(TWITCH_TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        grant_type:    'authorization_code',
        redirect_uri:  redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access_token in response');

    // Fetch user info
    const userRes = await fetch(TWITCH_USERS_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Client-Id':     clientId,
      },
    });
    const userData = await userRes.json();
    const user = userData.data?.[0];
    if (!user) throw new Error('No user data returned');

    // Store in session
    const { sessionId, data: sessionData } = getSession(req, res);
    sessionData.username     = user.display_name || user.login;
    sessionData.platform     = 'twitch';
    sessionData.twitchId     = user.id;
    sessionData.accessToken  = tokenData.access_token;
    sessionData.refreshToken = tokenData.refresh_token;

    console.log(`[Auth] Twitch login: ${sessionData.username}`);
    res.redirect('/?logged_in=1');
  } catch (err) {
    console.error('[Auth] Twitch callback error:', err.message);
    res.redirect('/?auth_error=' + encodeURIComponent(err.message));
  }
});

/** GET /auth/me — return current session user info */
app.get('/auth/me', (req, res) => {
  const { data } = getSession(req, res);
  if (data.username) {
    res.json({ success: true, user: { username: data.username, platform: data.platform } });
  } else {
    res.json({ success: true, user: null });
  }
});

/** POST /auth/logout — clear session */
app.post('/auth/logout', (req, res) => {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/sess=([^;]+)/);
  if (match) delete sessions[match[1]];
  res.setHeader('Set-Cookie', 'sess=; HttpOnly; Path=/; Max-Age=0');
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// 404 handler for API routes
// ---------------------------------------------------------------------------
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error('[Express] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`\n🎮 Miljonaaripeli server running at http://localhost:${PORT}`);
  console.log(`   Admin panel:  http://localhost:${PORT}/admin`);
  console.log(`   Leaderboard:  http://localhost:${PORT}/leaderboard`);
  console.log(`   WebSocket:    ws://localhost:${PORT}/ws`);
  console.log('');
});

module.exports = { app, server, wss }; // for testing
