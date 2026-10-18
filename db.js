'use strict';

/**
 * db.js — SQLite database layer for miljonaaripeli
 * Powered by Node.js built-in node:sqlite (zero native compilation needed)
 *
 * Tables:
 *   questions      — trivia/chat-quote questions with 4 options
 *   leaderboard    — per-user cumulative stats across all sessions
 *   game_sessions  — one row per game session
 *   session_scores — per-player score within a session
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'miljonaaripeli.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// ---------------------------------------------------------------------------
// Schema creation
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    question_fi    TEXT    NOT NULL,
    option_a       TEXT    NOT NULL,
    option_b       TEXT    NOT NULL,
    option_c       TEXT    NOT NULL,
    option_d       TEXT    NOT NULL,
    correct_answer TEXT    NOT NULL CHECK(correct_answer IN ('A','B','C','D')),
    difficulty     TEXT    NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
    category       TEXT    NOT NULL DEFAULT 'Yleistieto',
    hint           TEXT,
    mode           TEXT    NOT NULL DEFAULT 'trivia' CHECK(mode IN ('trivia','chat_quotes')),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL,
    platform        TEXT    NOT NULL DEFAULT 'guest',
    total_score     INTEGER NOT NULL DEFAULT 0,
    games_played    INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_answers   INTEGER NOT NULL DEFAULT 0,
    best_streak     INTEGER NOT NULL DEFAULT 0,
    last_played     DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, platform)
  );

  CREATE TABLE IF NOT EXISTS game_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at        DATETIME,
    game_mode       TEXT    NOT NULL DEFAULT 'trivia',
    total_questions INTEGER NOT NULL DEFAULT 0,
    channel         TEXT
  );

  CREATE TABLE IF NOT EXISTS session_scores (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id     INTEGER NOT NULL REFERENCES game_sessions(id),
    username       TEXT    NOT NULL,
    platform       TEXT    NOT NULL DEFAULT 'guest',
    score          INTEGER NOT NULL DEFAULT 0,
    correct        INTEGER NOT NULL DEFAULT 0,
    total_answered INTEGER NOT NULL DEFAULT 0
  );
`);

// Transaction helper for node:sqlite
function withTransaction(fn) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const res = fn();
    db.exec('COMMIT;');
    return res;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Seed sample data if empty
// ---------------------------------------------------------------------------
const countRow = db.prepare('SELECT COUNT(*) AS n FROM questions').get();
const questionCount = countRow ? countRow.n : 0;

if (questionCount === 0) {
  const insert = db.prepare(`
    INSERT INTO questions
      (question_fi, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, hint, mode)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialQuestions = [
    // MAANTIETO
    {
      question_fi:    'Mikä on Suomen pääkaupunki?',
      option_a:       'Tampere',
      option_b:       'Turku',
      option_c:       'Helsinki',
      option_d:       'Oulu',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Maantieto',
      hint:           'Se sijaitsee Etelä-Suomessa Suomenlahden rannalla.',
      mode:           'trivia',
    },
    {
      question_fi:    'Montako maan rajanaapuria Suomella on?',
      option_a:       '2',
      option_b:       '3',
      option_c:       '4',
      option_d:       '5',
      correct_answer: 'B',
      difficulty:     'easy',
      category:       'Maantieto',
      hint:           'Naapurit: Ruotsi, Norja ja Venäjä.',
      mode:           'trivia',
    },
    {
      question_fi:    'Mikä on Suomen pisin joki?',
      option_a:       'Ounasjoki',
      option_b:       'Tornionjoki',
      option_c:       'Oulujoki',
      option_d:       'Kemijoki',
      correct_answer: 'D',
      difficulty:     'medium',
      category:       'Maantieto',
      hint:           'Se virtaa Lapin läpi Perämereen ja on n. 550 km pitkä.',
      mode:           'trivia',
    },
    {
      question_fi:    'Missä kaupungissa sijaitsi Suomen vanhin yliopisto alun perin (Turun Akatemia)?',
      option_a:       'Helsinki',
      option_b:       'Turku',
      option_c:       'Tampere',
      option_d:       'Jyväskylä',
      correct_answer: 'B',
      difficulty:     'medium',
      category:       'Maantieto',
      hint:           'Yliopisto perustettiin vuonna 1640 Aurajoen rannalle.',
      mode:           'trivia',
    },
    {
      question_fi:    'Mikä on Suomen suurin järvi?',
      option_a:       'Päijänne',
      option_b:       'Oulujärvi',
      option_c:       'Saimaa',
      option_d:       'Näsijärvi',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Maantieto',
      hint:           'Se on myös Euroopan neljänneksi suurin luonnonjärvi.',
      mode:           'trivia',
    },
    // HISTORIA
    {
      question_fi:    'Minä vuonna Suomi julistautui itsenäiseksi?',
      option_a:       '1905',
      option_b:       '1917',
      option_c:       '1919',
      option_d:       '1921',
      correct_answer: 'B',
      difficulty:     'medium',
      category:       'Historia',
      hint:           'Itsenäisyyspäivää vietetään 6. joulukuuta.',
      mode:           'trivia',
    },
    {
      question_fi:    'Kuka oli Suomen ensimmäinen tasavallan presidentti?',
      option_a:       'Pehr Evind Svinhufvud',
      option_b:       'Lauri Kristian Relander',
      option_c:       'Kaarlo Juho Ståhlberg',
      option_d:       'Kyösti Kallio',
      correct_answer: 'C',
      difficulty:     'medium',
      category:       'Historia',
      hint:           'Hän toimi presidenttinä vuosina 1919–1925.',
      mode:           'trivia',
    },
    {
      question_fi:    'Minä vuonna kesäolympialaiset järjestettiin Helsingissä?',
      option_a:       '1948',
      option_b:       '1950',
      option_c:       '1952',
      option_d:       '1956',
      correct_answer: 'C',
      difficulty:     'medium',
      category:       'Historia',
      hint:           'Kisoja varten valmistui Olympiastadion.',
      mode:           'trivia',
    },
    {
      question_fi:    'Mikä sota käytiin marraskuun 1939 ja maaliskuun 1940 välisenä aikana?',
      option_a:       'Jatkosota',
      option_b:       'Sisällissota',
      option_c:       'Talvisota',
      option_d:       'Lapin sota',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Historia',
      hint:           'Kesti 105 kunniakasta päivää.',
      mode:           'trivia',
    },
    // TIEDE & LUONTO
    {
      question_fi:    'Mikä on Suomen kansallislintu?',
      option_a:       'Merikotka',
      option_b:       'Keltasirkku',
      option_c:       'Laulujoutsen',
      option_d:       'Metso',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Luonto',
      hint:           'Se on komea valkoinen vesilintu.',
      mode:           'trivia',
    },
    {
      question_fi:    'Millä tieteellisellä nimellä tunnetaan pohjoisen revontulet?',
      option_a:       'Borealis aurora',
      option_b:       'Aurora australis',
      option_c:       'Aurora borealis',
      option_d:       'Polaris lux',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Tiede',
      hint:           'Latinankielinen nimi viittaa pohjoistuuleen (Boreas).',
      mode:           'trivia',
    },
    {
      question_fi:    'Kuka suomalainen tiedemies voitti kemian Nobel-palkinnon AIV-rehun keksinnöstä (1945)?',
      option_a:       'Artturi Ilmari Virtanen',
      option_b:       'Ragnar Granit',
      option_c:       'Bengt Holmström',
      option_d:       'Johan Gadolin',
      correct_answer: 'A',
      difficulty:     'hard',
      category:       'Tiede',
      hint:           'Keksinnön nimikirjaimet tulevat suoraan hänen nimestään.',
      mode:           'trivia',
    },
    {
      question_fi:    'Mikä on Suomen kansallispuu?',
      option_a:       'Mänty',
      option_b:       'Kuusi',
      option_c:       'Rauduskoivu',
      option_d:       'Haapa',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Luonto',
      hint:           'Tämä lehtipuu tunnetaan valkoisesta tuohirungostaan.',
      mode:           'trivia',
    },
    // KULTTUURI & VIIHDE
    {
      question_fi:    'Kuka kirjoitti kansallisromaanin "Seitsemän veljestä"?',
      option_a:       'J. L. Runeberg',
      option_b:       'Aleksis Kivi',
      option_c:       'Mika Waltari',
      option_d:       'Väinö Linna',
      correct_answer: 'B',
      difficulty:     'easy',
      category:       'Kulttuuri',
      hint:           'Hänen syntymäpäivänsä 10. lokakuuta on suomalaisen kirjallisuuden päivä.',
      mode:           'trivia',
    },
    {
      question_fi:    'Kuka loi rakastetut Muumit?',
      option_a:       'Astrid Lindgren',
      option_b:       'Mauri Kunnas',
      option_c:       'Kirsi Kunnas',
      option_d:       'Tove Jansson',
      correct_answer: 'D',
      difficulty:     'easy',
      category:       'Kulttuuri',
      hint:           'Hän asui ja maalasi pitkään Klovharun saarella.',
      mode:           'trivia',
    },
    {
      question_fi:    'Minä vuonna Lordi voitti Euroviisut kappaleella "Hard Rock Hallelujah"?',
      option_a:       '2004',
      option_b:       '2006',
      option_c:       '2007',
      option_d:       '2008',
      correct_answer: 'B',
      difficulty:     'medium',
      category:       'Viihde',
      hint:           'Kilpailu pidettiin Ateenassa Kreikassa.',
      mode:           'trivia',
    },
    // URHEILU
    {
      question_fi:    'Kuinka monta olympiakultaa kestävyysjuoksija Paavo Nurmi voitti urallaan?',
      option_a:       '7',
      option_b:       '8',
      option_c:       '9',
      option_d:       '12',
      correct_answer: 'C',
      difficulty:     'hard',
      category:       'Urheilu',
      hint:           '"Lentävä suomalainen" voitti 9 kultaa ja 3 hopeaa.',
      mode:           'trivia',
    },
    {
      question_fi:    'Kuka suomalainen F1-kuljettaja voitti maailmanmestaruuden Ferrarilla vuonna 2007?',
      option_a:       'Mika Häkkinen',
      option_b:       'Kimi Räikkönen',
      option_c:       'Valtteri Bottas',
      option_d:       'Keke Rosberg',
      correct_answer: 'B',
      difficulty:     'medium',
      category:       'Urheilu',
      hint:           'Hänet tunnetaan lempinimellä "The Iceman".',
      mode:           'trivia',
    },
    {
      question_fi:    'Missä kaupungissa SM-liigajoukkue Tappara pelaa kotiottelunsa?',
      option_a:       'Helsinki',
      option_b:       'Turku',
      option_c:       'Tampere',
      option_d:       'Oulu',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Urheilu',
      hint:           'He pelaavat Nokia Arenalla.',
      mode:           'trivia',
    },
    {
      question_fi:    'Kuka voitti Suomen miesten ensimmäisen hiihdon olympiakullan 50 km matkalla Sotshissa 2014?',
      option_a:       'Iivo Niskanen',
      option_b:       'Sami Jauhojärvi',
      option_c:       'Matti Heikkinen',
      option_d:       'Juha Mieto',
      correct_answer: 'A',
      difficulty:     'hard',
      category:       'Urheilu',
      hint:           'Hän on sittemmin voittanut kultaa myös Pyeongchangissa ja Pekingissä.',
      mode:           'trivia',
    },
    // CHAT QUOTES / STRIIMIKULTTUURI
    {
      question_fi:    'Mitä tarkoittaa chat-termi "Kappa"?',
      option_a:       'Peukku ylös',
      option_b:       'Häviö pelissä',
      option_c:       'Sarkasmia ja ironiaa osoittava emote',
      option_d:       'Uusi seuraaja',
      correct_answer: 'C',
      difficulty:     'easy',
      category:       'Striimikulttuuri',
      hint:           'Yksi maailman tunnetuimmista mustavalkoisista kasvot-emotesta.',
      mode:           'chat_quotes',
    },
    {
      question_fi:    'Mitä "PogChamp" tai "POG" tarkoittaa chatissa?',
      option_a:       'Tylsää tai noloa hetkeä',
      option_b:       'Suurta innostusta, hypeä tai upeaa suoritusta',
      option_c:       'Pelin lopettamista',
      option_d:       'Musiikin vaihtoa',
      correct_answer: 'B',
      difficulty:     'easy',
      category:       'Striimikulttuuri',
      hint:           'Käytetään kun striimissä tapahtuu jotain uskomatonta!',
      mode:           'chat_quotes',
    },
    {
      question_fi:    'Mitä pelikeskustelussa ja chatissa tarkoittaa kirjain "W"?',
      option_a:       'Varoitus (Warning)',
      option_b:       'Voitto / onnistuminen (Win)',
      option_c:       'Miksi (Why)',
      option_d:       'Odotus (Wait)',
      correct_answer: 'B',
      difficulty:     'easy',
      category:       'Striimikulttuuri',
      hint:           'Vastakohta on "L" (Loss).',
      mode:           'chat_quotes',
    },
    {
      question_fi:    'Mitä "GG" tarkoittaa ottelun päätyttyä moninpelissä tai chatissa?',
      option_a:       'Good Game (Hyvä peli)',
      option_b:       'Get Good (Opi pelaamaan)',
      option_c:       'Going Going (Lähden pois)',
      option_d:       'Great Guy (Hieno tyyppi)',
      correct_answer: 'A',
      difficulty:     'easy',
      category:       'Striimikulttuuri',
      hint:           'Kohtelias urheiluhenkinen ele pelin päättyessä.',
      mode:           'chat_quotes',
    },
    {
      question_fi:    'Mitä ilmaus "no cap" tarkoittaa modernissa nettislangissa?',
      option_a:       'Ei lippalakkia',
      option_b:       'Totta / Ei valhetta (totta puhuen)',
      option_c:       'Ei rajoitusta striimille',
      option_d:       'Lopeta chattiin kirjoittaminen',
      correct_answer: 'B',
      difficulty:     'medium',
      category:       'Striimikulttuuri',
      hint:           'Slangissa "cap" tarkoittaa valhetta tai liioittelua.',
      mode:           'chat_quotes',
    },
  ];

  withTransaction(() => {
    for (const q of initialQuestions) {
      insert.run(
        q.question_fi,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.difficulty,
        q.category,
        q.hint,
        q.mode
      );
    }
  });

  console.log('[DB] Seeded 25 sample questions into SQLite database.');
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getQuestions(mode = 'trivia', count = 10, difficulty = null) {
  let sql = 'SELECT * FROM questions WHERE mode = ?';
  const params = [mode];

  if (difficulty && difficulty !== 'all') {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }

  sql += ' ORDER BY RANDOM()';

  if (count) {
    sql += ' LIMIT ?';
    params.push(count);
  }

  return db.prepare(sql).all(...params);
}

function saveGameResults(sessionData, playerScores) {
  const insertSession = db.prepare(`
    INSERT INTO game_sessions (game_mode, total_questions, channel, ended_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const insertScore = db.prepare(`
    INSERT INTO session_scores (session_id, username, platform, score, correct, total_answered)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const upsertLeaderboard = db.prepare(`
    INSERT INTO leaderboard (username, platform, total_score, games_played, correct_answers, total_answers, best_streak, last_played)
    VALUES (?, ?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(username, platform) DO UPDATE SET
      total_score     = total_score + excluded.total_score,
      games_played    = games_played + 1,
      correct_answers = correct_answers + excluded.correct_answers,
      total_answers   = total_answers + excluded.total_answers,
      best_streak     = MAX(best_streak, excluded.best_streak),
      last_played     = CURRENT_TIMESTAMP
  `);

  return withTransaction(() => {
    const res = insertSession.run(
      sessionData.game_mode || 'trivia',
      sessionData.total_questions || 0,
      sessionData.channel || ''
    );
    const sessionId = res.lastInsertRowid;

    for (const p of playerScores) {
      insertScore.run(
        sessionId,
        p.username,
        p.platform || 'guest',
        p.score || 0,
        p.correct || 0,
        p.total_answered || 0
      );
      upsertLeaderboard.run(
        p.username,
        p.platform || 'guest',
        p.score || 0,
        p.correct || 0,
        p.total_answered || 0,
        p.streak || 0
      );
    }

    return sessionId;
  });
}

function getLeaderboard(period = 'alltime', limit = 50) {
  let sql;

  if (period === 'week') {
    sql = `
      SELECT ss.username, ss.platform,
             SUM(ss.score)          AS total_score,
             COUNT(DISTINCT ss.session_id) AS games_played,
             SUM(ss.correct)        AS correct_answers,
             SUM(ss.total_answered) AS total_answers
      FROM session_scores ss
      JOIN game_sessions gs ON gs.id = ss.session_id
      WHERE gs.ended_at >= datetime('now', '-7 days')
      GROUP BY ss.username, ss.platform
      ORDER BY total_score DESC
      LIMIT ?
    `;
  } else if (period === 'month') {
    sql = `
      SELECT ss.username, ss.platform,
             SUM(ss.score)          AS total_score,
             COUNT(DISTINCT ss.session_id) AS games_played,
             SUM(ss.correct)        AS correct_answers,
             SUM(ss.total_answered) AS total_answers
      FROM session_scores ss
      JOIN game_sessions gs ON gs.id = ss.session_id
      WHERE gs.ended_at >= datetime('now', '-30 days')
      GROUP BY ss.username, ss.platform
      ORDER BY total_score DESC
      LIMIT ?
    `;
  } else {
    sql = `
      SELECT username, platform, total_score, games_played,
             correct_answers, total_answers, best_streak, last_played
      FROM leaderboard
      ORDER BY total_score DESC
      LIMIT ?
    `;
  }

  return db.prepare(sql).all(limit);
}

function addQuestion(data) {
  const stmt = db.prepare(`
    INSERT INTO questions
      (question_fi, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, hint, mode)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const res = stmt.run(
    data.question_fi,
    data.option_a,
    data.option_b,
    data.option_c,
    data.option_d,
    data.correct_answer,
    data.difficulty || 'medium',
    data.category || 'Yleistieto',
    data.hint || null,
    data.mode || 'trivia'
  );
  return res.lastInsertRowid;
}

function updateQuestion(id, data) {
  const allowed = ['question_fi','option_a','option_b','option_c','option_d',
                   'correct_answer','difficulty','category','hint','mode'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));
  if (fields.length === 0) return;

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => data[f]);
  values.push(id);

  const stmt = db.prepare(`UPDATE questions SET ${setClause} WHERE id = ?`);
  stmt.run(...values);
}

function deleteQuestion(id) {
  db.prepare('DELETE FROM questions WHERE id = ?').run(id);
}

module.exports = {
  db,
  getQuestions,
  saveGameResults,
  getLeaderboard,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
