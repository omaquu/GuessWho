'use strict';
const fs = require('fs');
const path = require('path');

const samplePath = path.join(__dirname, '../data/embedded_sample.json');
const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf8'));

const questionsJsPath = path.join(__dirname, '../js/questions.js');
let content = fs.readFileSync(questionsJsPath, 'utf8');

// The replacement code for the bottom of questions.js
const newCode = `
// ---------------------------------------------------------------------------
// Real Twitch Channel Chat Quotes ("Kuka sen sanoi?" / "Who said it?")
// ---------------------------------------------------------------------------

const EMBEDDED_OMAQUU_QUOTES = ${JSON.stringify(sampleData, null, 2)};

/**
 * Format raw chat messages and chatters into multiple-choice quiz questions
 */
function parseAndGenerateQuotes(chatData, channel = 'omaquu', count = 10) {
  const normChannel = (channel || 'omaquu').toLowerCase().replace('#', '').trim() || 'omaquu';
  if (!chatData) return [];

  // Gather unique chatters
  const chatterSet = new Set();
  if (Array.isArray(chatData.chatters)) {
    chatData.chatters.forEach(c => {
      const name = typeof c === 'string' ? c : (c.displayName || c.login);
      if (name) chatterSet.add(name);
    });
  }
  if (Array.isArray(chatData.messages)) {
    chatData.messages.forEach(m => {
      const name = m.author || m.displayName || m.login;
      if (name) chatterSet.add(name);
    });
  }
  const allChatters = Array.from(chatterSet);

  // Filter messages suitable for a quiz question
  const validMessages = (chatData.messages || []).filter(m => {
    if (!m.text) return false;
    const t = m.text.trim();
    if (t.length < 8 || t.length > 130) return false;
    if (/^[!#?]/.test(t)) return false; // commands like !sr, !rank, !points
    if (/^(A|B|C|D|1|2|3|4)$/i.test(t)) return false; // single letter voting spam
    const author = m.author || m.displayName || m.login;
    if (!author) return false;
    if (t.toLowerCase().includes(author.toLowerCase())) return false; // don't spoil author name
    return true;
  });

  if (validMessages.length === 0) return [];

  const shuffled = [...validMessages].sort(() => Math.random() - 0.5);
  const questions = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const msg = shuffled[i];
    const author = msg.author || msg.displayName || msg.login;

    // Pick 3 decoy chatters distinct from author
    const decoys = allChatters
      .filter(c => c.toLowerCase() !== author.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    while (decoys.length < 3) {
      decoys.push(\`Chattaaja_\${decoys.length + 1}\`);
    }

    const options = [author, ...decoys].sort(() => Math.random() - 0.5);
    const letters = ['A', 'B', 'C', 'D'];
    const correctLetter = letters[options.indexOf(author)];

    let hint = 'Twitch-chatin viesti';
    if (msg.sentAt) {
      try {
        const d = new Date(msg.sentAt);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        hint = \`Lähetetty chatissa \${day}.\${month}. klo \${hours}:\${mins}\`;
      } catch {}
    }

    questions.push({
      question_fi: \`"\${msg.text.trim()}"\`,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_answer: correctLetter,
      difficulty: 'medium',
      category: \`Kuka sen sanoi? · #\${normChannel}\`,
      hint,
      mode: 'chat_quotes'
    });
  }

  return questions;
}

/**
 * Fetch channel quotes from backend API, static files, samppalandia, or embedded fallback
 */
async function fetchChannelQuotes(channel = 'omaquu', count = 10) {
  const normChannel = (channel || 'omaquu').toLowerCase().replace('#', '').trim() || 'omaquu';

  // 1. Try local/backend API if running
  try {
    const r = await fetch(\`api/channel-quotes/\${encodeURIComponent(normChannel)}?count=\${count}\`);
    if (r.ok) {
      const data = await r.json();
      if (data && data.questions && data.questions.length > 0) {
        console.log(\`[Quotes] Received \${data.questions.length} quotes from backend API for #\${normChannel}\`);
        return data.questions;
      }
    }
  } catch {}

  // 2. Try static JSON files (works on GitHub Pages and local servers)
  const pathsToTry = [
    \`data/quotes_\${normChannel}.json\`,
    \`data/quotes_omaquu.json\`,
    \`./data/quotes_\${normChannel}.json\`,
    \`./data/quotes_omaquu.json\`
  ];
  for (const p of pathsToTry) {
    try {
      const r = await fetch(p);
      if (r.ok) {
        const data = await r.json();
        if (data && data.messages && data.messages.length > 0) {
          console.log(\`[Quotes] Loaded quotes from static file \${p}\`);
          const questions = parseAndGenerateQuotes(data, normChannel, count);
          if (questions.length > 0) return questions;
        }
      }
    } catch {}
  }

  // 3. Try direct samppalandia.wtf API (if CORS allowed)
  try {
    const r = await fetch(\`https://samppalandia.wtf/kukasano/api/messages.php?channel=\${encodeURIComponent(normChannel)}&mode=kuka\`);
    if (r.ok) {
      const data = await r.json();
      if (data && data.messages && data.messages.length > 0) {
        console.log(\`[Quotes] Loaded live quotes from samppalandia API for #\${normChannel}\`);
        const questions = parseAndGenerateQuotes(data, normChannel, count);
        if (questions.length > 0) return questions;
      }
    }
  } catch {}

  // 4. Fallback to embedded quotes bank
  console.log(\`[Quotes] Using embedded quotes bank for #\${normChannel}\`);
  return parseAndGenerateQuotes(EMBEDDED_OMAQUU_QUOTES, normChannel, count);
}

window.getQuizQuestions = async function(lang = 'fi', mode = 'chat_quotes', count = 10, difficulty = '', channel = '') {
  const targetChannel = (channel || localStorage.getItem('mp_twitch_channel') || 'omaquu').toLowerCase().replace('#', '').trim();

  // If chat_quotes mode or if channel quotes requested
  if (mode === 'chat_quotes' || mode === 'quotes') {
    try {
      const quotes = await fetchChannelQuotes(targetChannel, count);
      if (quotes && quotes.length > 0) return quotes;
    } catch (err) {
      console.warn('[Questions] Failed to fetch channel quotes:', err);
    }
  }

  if (lang === 'en' && Math.random() < 0.6) {
    // Try Open Trivia DB for dynamic English questions, fallback to local
    return await fetchOpenTriviaDB(count, difficulty);
  }
  return getLocalQuestions(lang, mode, count);
};
`;

const targetSplit = 'window.getQuizQuestions = async function';
if (content.includes(targetSplit)) {
  const parts = content.split(targetSplit);
  content = parts[0] + newCode;
} else {
  content += newCode;
}

fs.writeFileSync(questionsJsPath, content, 'utf8');
// Also write to public/js/questions.js
const publicQuestionsJsPath = path.join(__dirname, '../public/js/questions.js');
fs.writeFileSync(publicQuestionsJsPath, content, 'utf8');
console.log('Successfully updated questions.js and public/js/questions.js');
