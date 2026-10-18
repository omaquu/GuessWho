'use strict';

/**
 * client-engine.js — Standalone Game Engine with direct Kick & Twitch chat for GitHub Pages
 * Works 100% in the browser without any backend required!
 */

class StandaloneGameEngine {
  constructor() {
    this.active = false;
    this.phase = 'waiting'; // waiting | voting | host_turn | revealing | game_over
    this.questions = [];
    this.questionIndex = 0;
    this.currentQuestion = null;
    this.timeLeft = 30;
    this.votingTime = 30;
    this.hostTime = 30;
    this.timerId = null;

    this.votes = { A: 0, B: 0, C: 0, D: 0 };
    this.voters = {}; // username -> 'A'|'B'|'C'|'D'
    this.eliminated = [];
    this.sessionScores = {}; // username -> { score, correct, total, streak }

    this.lifelines = {
      removeWrong: { total: 1, used: 0 },
      addTime:     { total: 1, used: 0 },
      extraHint:   { total: 1, used: 0 },
      askAudience: { total: 1, used: 0 }
    };

    // Chat connections
    this.twitchWs = null;
    this.kickWs = null;
    this.twitchChannel = localStorage.getItem('mp_twitch_channel') || '';
    this.kickChannel = localStorage.getItem('mp_kick_channel') || '';

    // Auto-connect chat if channels saved
    if (this.twitchChannel) this.connectTwitch(this.twitchChannel);
    if (this.kickChannel) this.connectKick(this.kickChannel);
  }

  // ---------------------------------------------------------------------------
  // Direct Twitch IRC WebSocket (Client-side)
  // ---------------------------------------------------------------------------
  connectTwitch(channel) {
    if (!channel) return;
    this.twitchChannel = channel.toLowerCase().replace('#', '').trim();
    localStorage.setItem('mp_twitch_channel', this.twitchChannel);

    if (this.twitchWs) {
      try { this.twitchWs.close(); } catch {}
      this.twitchWs = null;
    }

    try {
      console.log(`[Twitch] Connecting to #${this.twitchChannel} via browser WebSocket...`);
      const ws = new WebSocket('wss://irc-ws.chat.twitch.tv/');
      this.twitchWs = ws;

      ws.onopen = () => {
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        ws.send('PASS SCHMOOPIIE');
        ws.send('NICK justinfan' + Math.floor(Math.random() * 80000 + 1000));
        ws.send(`JOIN #${this.twitchChannel}`);
        console.log(`[Twitch] Connected and joined #${this.twitchChannel}`);
        this.emitChat('System', `✅ Yhdistetty Twitch-chattiin (#${this.twitchChannel})! Äänet luetaan.`, 'twitch');
      };

      ws.onmessage = (event) => {
        const raw = event.data || '';
        const lines = raw.split(/\r?\n/);

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('PING')) {
            ws.send('PONG :tmi.twitch.tv');
            continue;
          }

          const match = line.match(/^(?:@[^ ]+ )?:([^!]+)![^ ]+ PRIVMSG [^ ]+ :(.*)$/);
          if (match) {
            const tagsStr = line.startsWith('@') ? line.split(' ')[0].slice(1) : '';
            const tagMap = {};
            tagsStr.split(';').forEach(t => {
              const [k, v] = t.split('=');
              if (k) tagMap[k] = v || '';
            });

            const username = tagMap['display-name'] || match[1];
            const content = match[2];

            this.emitChat(username, content, 'twitch');
            this.handleVote(username, content, 'twitch');
          }
        }
      };

      ws.onclose = () => {
        console.log('[Twitch] WebSocket closed.');
      };
    } catch (e) {
      console.warn('[Twitch] Could not connect:', e.message);
    }
  }

  // ---------------------------------------------------------------------------
  // Direct Kick Pusher WebSocket (Client-side)
  // ---------------------------------------------------------------------------
  async connectKick(chatroomIdOrSlug) {
    if (!chatroomIdOrSlug) return;
    this.kickChannel = chatroomIdOrSlug.trim();
    localStorage.setItem('mp_kick_channel', this.kickChannel);

    if (this.kickWs) {
      try { this.kickWs.close(); } catch {}
      this.kickWs = null;
    }

    // Resolve chatroomId (support username like omaquu or numeric chatroom ID)
    let chatroomId = this.kickChannel;
    const slugLower = this.kickChannel.toLowerCase().replace(/^https?:\/\/(www\.)?kick\.com\//i, '').replace(/\/.*$/, '').trim();

    if (slugLower === 'omaquu') {
      chatroomId = '605983';
    } else if (!/^\d+$/.test(chatroomId)) {
      // Try resolving via backend API if available
      try {
        const r = await fetch(`api/kick-chatroom/${encodeURIComponent(slugLower)}`);
        if (r.ok) {
          const d = await r.json();
          if (d?.chatroomId) chatroomId = String(d.chatroomId);
        }
      } catch {}
    }

    try {
      console.log(`[Kick] Connecting to Pusher for chatroom ${chatroomId} (channel: ${this.kickChannel})...`);
      const pusherWsUrl = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false';
      const ws = new WebSocket(pusherWsUrl);
      this.kickWs = ws;

      ws.onopen = () => {
        console.log(`[Kick] Connected to Pusher, subscribing to chatroom.${chatroomId}.v2...`);
        ws.send(JSON.stringify({
          event: 'pusher:subscribe',
          data: { auth: '', channel: `chatroom.${chatroomId}.v2` }
        }));
        this.emitChat('System', `Yhdistetään Kick-chattiin (kanava: ${this.kickChannel}, ID: ${chatroomId})...`, 'kick');
      };

      ws.onmessage = (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch { return; }

        if (msg.event === 'pusher:ping') {
          ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
          return;
        }

        if (msg.event === 'pusher:subscription_succeeded') {
          console.log('[Kick] Pusher subscription confirmed for chatroom', chatroomId);
          this.emitChat('System', `✅ Kick-chatti yhdistetty onnistuneesti! Äänestä kirjoittamalla A, B, C tai D.`, 'kick');
          return;
        }

        if (msg.event === 'App\\Events\\ChatMessageEvent') {
          let data;
          try { data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data; } catch { return; }
          const username = data?.sender?.username || 'KickUser';
          const content = (data?.content || '').trim();

          this.emitChat(username, content, 'kick');
          this.handleVote(username, content, 'kick');
        }
      };

      ws.onerror = (e) => {
        console.warn('[Kick] Pusher WebSocket error:', e);
      };
    } catch (e) {
      console.warn('[Kick] Pusher connect error:', e.message);
    }
  }

  emitChat(username, message, platform) {
    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: { type: 'chat_message', username, message, platform }
    }));
  }

  // ---------------------------------------------------------------------------
  // Chat Vote Handling
  // ---------------------------------------------------------------------------
  handleVote(username, content, platform) {
    if (this.phase !== 'voting') return;
    const match = content.trim().match(/^[!]?([ABCD])$/i);
    if (!match) return;

    const answer = match[1].toUpperCase();
    if (this.voters[username]) return; // One vote per question

    this.voters[username] = answer;
    this.votes[answer] = (this.votes[answer] || 0) + 1;

    // Initialize session score entry
    if (!this.sessionScores[username]) {
      this.sessionScores[username] = { score: 0, correct: 0, total: 0, streak: 1, platform };
    }

    // Broadcast vote update
    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: {
        type: 'vote_update',
        votes: { ...this.votes },
        totalVoters: Object.keys(this.voters).length
      }
    }));
  }

  // ---------------------------------------------------------------------------
  // Game Loop
  // ---------------------------------------------------------------------------
  async startGame(config = {}) {
    const lang = config.lang || window.i18n?.lang || 'fi';
    const count = config.count || 10;
    const mode = config.mode || 'chat_quotes';
    const channel = (config.channel || this.twitchChannel || localStorage.getItem('mp_twitch_channel') || 'omaquu').toLowerCase().replace('#', '').trim();
    this.votingTime = config.votingTime || parseInt(localStorage.getItem('mp_voting_time')) || 30;
    this.hostTime = config.hostTime || 30;

    // Connect to Twitch IRC if not connected to this channel
    if (channel && (!this.twitchWs || this.twitchChannel !== channel)) {
      this.connectTwitch(channel);
    }

    // Reset lifelines
    this.lifelines = {
      removeWrong: { total: 1, used: 0 },
      addTime:     { total: 1, used: 0 },
      extraHint:   { total: 1, used: 0 },
      askAudience: { total: 1, used: 0 }
    };
    this.sessionScores = {};

    this.questions = await window.getQuizQuestions(lang, mode, count, '', channel);
    this.questionIndex = 0;
    this.active = true;

    this.nextQuestion();
  }

  nextQuestion() {
    if (this.questionIndex >= this.questions.length) {
      this.finishGame();
      return;
    }

    this.currentQuestion = this.questions[this.questionIndex];
    this.questionIndex++;
    this.phase = 'voting';
    this.pendingHostAnswer = null;
    this.votes = { A: 0, B: 0, C: 0, D: 0 };
    this.voters = {};
    this.eliminated = [];
    this.timeLeft = this.votingTime;

    const ptsTable = this.getPointsTable(this.questions.length);
    const questionPoints = ptsTable[this.questionIndex - 1] || 100;

    // Send question event to UI
    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: {
        type: 'question',
        question: this.currentQuestion,
        questionNumber: this.questionIndex,
        totalQuestions: this.questions.length,
        questionPoints,
        timeLeft: this.timeLeft,
        votingOpen: true
      }
    }));

    this.startTimer(this.votingTime, () => {
      // Voting ended -> Host turn
      this.startHostPhase();
    });
  }

  startHostPhase() {
    this.phase = 'host_turn';
    this.timeLeft = this.hostTime;

    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: {
        type: 'game_state',
        state: this.getState()
      }
    }));

    if (this.pendingHostAnswer) {
      const ans = this.pendingHostAnswer;
      this.pendingHostAnswer = null;
      setTimeout(() => {
        if (this.active && this.phase === 'host_turn') {
          this.revealAnswer(ans);
        }
      }, 1500);
      return;
    }

    this.startTimer(this.hostTime, () => {
      // Host time expired -> Auto reveal
      this.revealAnswer(null);
    });
  }

  startTimer(duration, onFinish) {
    this.clearTimer();
    this.timeLeft = duration;

    this.timerId = setInterval(() => {
      this.timeLeft--;

      window.dispatchEvent(new CustomEvent('engineMessage', {
        detail: { type: 'timer', timeLeft: this.timeLeft }
      }));

      if (this.timeLeft <= 0) {
        this.clearTimer();
        if (onFinish) onFinish();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Lifelines
  // ---------------------------------------------------------------------------
  useLifeline(type) {
    if (!this.active || !this.currentQuestion) return false;
    const ll = this.lifelines[type];
    if (!ll || ll.used >= ll.total) return false;

    ll.used++;

    if (type === 'removeWrong') {
      const correct = this.currentQuestion.correct_answer;
      const wrong = ['A','B','C','D'].filter(l => l !== correct && !this.eliminated.includes(l));
      wrong.sort(() => Math.random() - 0.5);
      const toRemove = wrong.slice(0, 2);
      this.eliminated.push(...toRemove);

      window.dispatchEvent(new CustomEvent('engineMessage', {
        detail: { type: 'lifeline_result', lifeline: 'removeWrong', data: { eliminated: toRemove } }
      }));
    } else if (type === 'addTime') {
      this.timeLeft += 30;
      window.dispatchEvent(new CustomEvent('engineMessage', {
        detail: { type: 'lifeline_result', lifeline: 'addTime', data: { addedSeconds: 30 } }
      }));
    } else if (type === 'extraHint') {
      const hint = this.currentQuestion.hint || 'No hint available.';
      window.dispatchEvent(new CustomEvent('engineMessage', {
        detail: { type: 'lifeline_result', lifeline: 'extraHint', data: { hint } }
      }));
    } else if (type === 'askAudience') {
      const total = Object.values(this.votes).reduce((a, b) => a + b, 0) || 1;
      const distribution = {
        A: Math.round((this.votes.A / total) * 100),
        B: Math.round((this.votes.B / total) * 100),
        C: Math.round((this.votes.C / total) * 100),
        D: Math.round((this.votes.D / total) * 100)
      };

      window.dispatchEvent(new CustomEvent('engineMessage', {
        detail: { type: 'lifeline_result', lifeline: 'askAudience', data: { distribution, total } }
      }));
    }

    return true;
  }

  getPointsTable(total = 10) {
    const table = [];
    for (let i = 0; i < total; i++) {
      table.push(100 + i * 10);
    }
    return table;
  }

  // Lock in answer (if host answers during voting, wait until host phase; if during host phase, reveal promptly)
  lockInAnswer(letter) {
    if (this.phase !== 'voting' && this.phase !== 'host_turn') return;
    if (this.phase === 'voting') {
      this.pendingHostAnswer = letter;
      // Do not end round early; let chat voters have their full turn
      return;
    }
    this.clearTimer();
    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: { type: 'timer', timeLeft: 0 }
    }));
    setTimeout(() => {
      if (this.active) {
        this.revealAnswer(letter);
      }
    }, 1200);
  }

  // ---------------------------------------------------------------------------
  // Answer Reveal & Scoring
  // ---------------------------------------------------------------------------
  revealAnswer(hostAnswer) {
    this.clearTimer();
    this.phase = 'revealing';
    const correct = this.currentQuestion.correct_answer;

    // Calculate scores for all voters
    // 1st correct in streak: 100p, 2nd: 110p, 3rd: 120p (+10p per consecutive correct).
    // Wrong answer resets streak to 0, so next correct answer starts from 100p again.
    for (const [user, ans] of Object.entries(this.voters)) {
      const p = this.sessionScores[user];
      if (!p) continue;
      p.total += 1;
      if (ans === correct) {
        p.correct += 1;
        p.streak = (p.streak || 0) + 1;
        const earned = 100 + (p.streak - 1) * 10;
        p.score += earned;
        p.lastEarned = earned;
      } else {
        p.streak = 0;
        p.lastEarned = 0;
      }
    }

    // Top 10 leaderboard
    const top10 = Object.entries(this.sessionScores)
      .map(([username, s]) => ({ username, ...s }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: {
        type: 'answer_reveal',
        correct,
        hostAnswer,
        votes: { ...this.votes }
      }
    }));

    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: { type: 'leaderboard_update', top10 }
    }));

    // Note: Does NOT automatically advance to the next question.
    // The player or host clicks "Seuraava kysymys" (nextQuestion) to advance.
  }

  finishGame() {
    this.active = false;
    this.phase = 'game_over';
    this.clearTimer();

    const finalLeaderboard = Object.entries(this.sessionScores)
      .map(([username, s]) => ({ username, ...s }))
      .sort((a, b) => b.score - a.score);

    // Save to LocalStorage cumulative leaderboard
    this.saveLeaderboardLocal(finalLeaderboard);

    window.dispatchEvent(new CustomEvent('engineMessage', {
      detail: { type: 'game_over', finalLeaderboard }
    }));
  }

  saveLeaderboardLocal(players) {
    try {
      const stored = JSON.parse(localStorage.getItem('mp_global_leaderboard') || '[]');
      players.forEach(p => {
        const existing = stored.find(x => x.username.toLowerCase() === p.username.toLowerCase());
        if (existing) {
          existing.total_score += p.score;
          existing.games_played += 1;
          existing.correct_answers += p.correct;
          existing.total_answers += p.total;
          existing.last_played = new Date().toISOString();
        } else {
          stored.push({
            username: p.username,
            platform: p.platform || 'guest',
            total_score: p.score,
            games_played: 1,
            correct_answers: p.correct,
            total_answers: p.total,
            last_played: new Date().toISOString()
          });
        }
      });
      stored.sort((a, b) => b.total_score - a.total_score);
      localStorage.setItem('mp_global_leaderboard', JSON.stringify(stored.slice(0, 100)));
    } catch (e) {
      console.warn('[Leaderboard] LocalStorage save error:', e);
    }
  }

  getState() {
    return {
      active: this.active,
      phase: this.phase,
      currentQuestion: this.currentQuestion,
      questionNumber: this.questionIndex,
      totalQuestions: this.questions.length,
      timeLeft: this.timeLeft,
      votes: { ...this.votes },
      eliminatedAnswers: [...this.eliminated],
      lifelines: { ...this.lifelines }
    };
  }
}

window.standaloneEngine = new StandaloneGameEngine();
