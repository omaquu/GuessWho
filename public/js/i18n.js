'use strict';

/**
 * i18n.js — Finnish & English translation dictionary and language manager
 */

const translations = {
  fi: {
    // Navigation & Topbar
    app_title: 'Kuka haluaa miljonääriksi?',
    nav_leaderboard: '🏆 Tulostaulukko',
    nav_admin: '⚙️ Isäntä / Admin',
    nav_login_twitch: 'Kirjaudu Twitchillä',
    mute_label: 'Mykistä musiikki',
    volume_label: 'Musiikin voimakkuus',

    // Header & LED
    logo_title: 'KUKA HALUAA MILJONÄÄRIKSI?',
    subtitle: 'Live Kick & Twitch Trivia — Kilpaile chatin kanssa!',
    led_question: 'Kysymys',
    led_streak: 'Putki',
    led_score: 'Pisteet',

    // Join Bar
    join_placeholder: 'Kirjoita nimimerkkisi...',
    platform_guest: 'Vieras',
    platform_kick: 'Kick-käyttäjä',
    platform_twitch: 'Twitch-käyttäjä',
    btn_join: '🎮 Liity peliin',
    player_prefix: 'Pelaat nimellä:',
    btn_start_game: '▶️ Aloita peli',
    btn_host_settings: '⚙️ Kanava-asetukset',

    // Waiting Screen
    waiting_title: 'ODOTETAAN PELIN ALKUA',
    waiting_desc: 'Isäntä aloittaa uuden kierroksen pian. Liity peliin nimimerkilläsi tai osallistu suoraan Kick/Twitch-chatissa kirjoittamalla A, B, C tai D!',
    status_connecting: 'Yhdistetään palvelimeen...',
    status_connected: 'Yhdistetty palvelimeen ✓',
    status_standalone: 'Valmis peliin (GitHub Pages -tila) ✓',

    // Phases
    phase_waiting: '⏳ ODOTETAAN PELIÄ',
    phase_voting: '🗳️ CHATTILAISET ÄÄNESTÄVÄT',
    phase_host_turn: '🎤 ISÄNNÄN VUORO',
    phase_revealing: '✅ VASTAUS PALJASTETTU',
    phase_game_over: '🏁 PELI OHI',

    // Lifelines
    ll_removeWrong: '❌ 50:50 Poista väärät',
    ll_addTime: '⏱️ +30s Lisäaika',
    ll_extraHint: '💡 Lisävihje',
    ll_askAudience: '👥 Kysy yleisöltä',
    ll_banner_5050: '❌ 50:50 POISTETTU 2 VÄÄRÄÄ VASTAUSTA!',
    ll_banner_time: '⏱️ AIKAA LISÄTTY +30 SEKUNTIA!',
    ll_banner_hint: '💡 LISÄVIHJE:',
    ll_banner_audience: '👥 KYSY YLEISÖLTÄ -TULOKSET:',

    // Answer results
    result_correct: '🌟 OIKEIN VASTATTU!',
    result_wrong: '❌ VÄÄRIN. Oikea vastaus oli:',
    result_timeout: 'Vastausaika päättyi! Oikea vastaus:',

    // Vote stats & chat
    vote_stats_title: '👥 Yleisön ja Chatin live-äänet',
    chat_panel_title: '💬 Chat-syöte (Kick & Twitch)',
    chat_empty: 'Odotetaan chatti-viestejä...',
    score_panel_title: '🏆 Tämän pelin kärki',
    score_empty: 'Ei pelaajia vielä',

    // Points ladder
    ladder_title: '🎯 PISTETAULUKKO',
    my_points_lbl: 'Omat pisteet:',
    voted_locked: 'Vastaus lukittu! Tarkistetaan...',

    // Lock-in confirmation
    confirm_prefix: 'Valitsit vaihtoehdon',
    confirm_question: 'Oletko aivan varma? Lukitaanko vastaus?',
    confirm_btn_yes: 'Kyllä, lukitse vastaus',
    confirm_btn_no: 'Ei, haluan vaihtaa',
    status_selected: 'Valitsit vaihtoehdon {letter}. Vahvista lukitus tai valitse toinen!',

    // Game Over
    game_over_title: 'PELI PÄÄTTYI!',
    game_over_final_scores: 'Lopulliset tulokset:',
    btn_view_full_lb: 'Katso koko tulostaulukko',

    // Settings Modal
    modal_title: '⚙️ Kanava- ja peliasetukset',
    label_twitch_channel: 'Twitch-kanava:',
    label_kick_channel: 'Kick-kanava (tai chatroom ID):',
    label_game_mode: 'Pelimoodi:',
    mode_trivia: 'Yleistieto & Trivia',
    mode_stream: 'Striimikulttuuri & Meemit',
    label_question_count: 'Kysymysten määrä:',
    label_voting_time: 'Äänestysaika (s):',
    btn_save_settings: 'Tallenna ja yhdistä',
    btn_close: 'Sulje',

    // Difficulties
    diff_easy: 'Helppo',
    diff_medium: 'Keskivaikea',
    diff_hard: 'Vaikea',
  },

  en: {
    // Navigation & Topbar
    app_title: 'Who Wants to Be a Millionaire?',
    nav_leaderboard: '🏆 Leaderboard',
    nav_admin: '⚙️ Host / Admin',
    nav_login_twitch: 'Login with Twitch',
    mute_label: 'Mute music',
    volume_label: 'Music volume',

    // Header & LED
    logo_title: 'WHO WANTS TO BE A MILLIONAIRE?',
    subtitle: 'Live Kick & Twitch Trivia — Compete with chat!',
    led_question: 'Question',
    led_streak: 'Streak',
    led_score: 'Score',

    // Join Bar
    join_placeholder: 'Enter your nickname...',
    platform_guest: 'Guest',
    platform_kick: 'Kick User',
    platform_twitch: 'Twitch User',
    btn_join: '🎮 Join Game',
    player_prefix: 'Playing as:',
    btn_start_game: '▶️ Start Game',
    btn_host_settings: '⚙️ Stream Settings',

    // Waiting Screen
    waiting_title: 'WAITING FOR GAME TO START',
    waiting_desc: 'The host will start a new round shortly. Enter your nickname to play, or vote directly in Kick or Twitch chat by typing A, B, C, or D!',
    status_connecting: 'Connecting to server...',
    status_connected: 'Connected to server ✓',
    status_standalone: 'Ready to play (GitHub Pages mode) ✓',

    // Phases
    phase_waiting: '⏳ WAITING FOR GAME',
    phase_voting: '🗳️ CHAT IS VOTING',
    phase_host_turn: '🎤 HOST TURN',
    phase_revealing: '✅ ANSWER REVEALED',
    phase_game_over: '🏁 GAME OVER',

    // Lifelines
    ll_removeWrong: '❌ 50:50 Fifty-Fifty',
    ll_addTime: '⏱️ +30s Extra Time',
    ll_extraHint: '💡 Extra Hint',
    ll_askAudience: '👥 Ask Audience',
    ll_banner_5050: '❌ 50:50 ELIMINATED 2 WRONG ANSWERS!',
    ll_banner_time: '⏱️ ADDED +30 SECONDS!',
    ll_banner_hint: '💡 EXTRA HINT:',
    ll_banner_audience: '👥 ASK AUDIENCE RESULTS:',

    // Answer results
    result_correct: '🌟 CORRECT ANSWER!',
    result_wrong: '❌ WRONG. The correct answer was:',
    result_timeout: 'Time expired! Correct answer:',

    // Vote stats & chat
    vote_stats_title: '👥 Audience & Chat Live Votes',
    chat_panel_title: '💬 Live Chat (Kick & Twitch)',
    chat_empty: 'Waiting for chat messages...',
    score_panel_title: '🏆 Current Game Top Players',
    score_empty: 'No players yet',

    // Points ladder
    ladder_title: '🎯 POINTS LADDER',
    my_points_lbl: 'My Points:',
    voted_locked: 'Answer locked in! Checking...',

    // Lock-in confirmation
    confirm_prefix: 'You selected option',
    confirm_question: 'Are you sure? Is that your final answer?',
    confirm_btn_yes: 'Yes, final answer',
    confirm_btn_no: 'No, change answer',
    status_selected: 'Selected option {letter}. Confirm to lock in or pick another answer!',

    // Game Over
    game_over_title: 'GAME OVER!',
    game_over_final_scores: 'Final standings:',
    btn_view_full_lb: 'View Full Leaderboard',

    // Settings Modal
    modal_title: '⚙️ Stream & Channel Settings',
    label_twitch_channel: 'Twitch Channel:',
    label_kick_channel: 'Kick Channel (or chatroom ID):',
    label_game_mode: 'Game Mode:',
    mode_trivia: 'General Trivia & Knowledge',
    mode_stream: 'Stream Culture & Memes',
    label_question_count: 'Number of Questions:',
    label_voting_time: 'Voting Time (s):',
    btn_save_settings: 'Save & Connect',
    btn_close: 'Close',

    // Difficulties
    diff_easy: 'Easy',
    diff_medium: 'Medium',
    diff_hard: 'Hard',
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('mp_lang') || 'fi';
  }

  get lang() {
    return this.currentLang;
  }

  t(key) {
    const dict = translations[this.currentLang] || translations.fi;
    return dict[key] !== undefined ? dict[key] : (translations.fi[key] || key);
  }

  setLanguage(lang) {
    if (!['fi', 'en'].includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem('mp_lang', lang);
    this.apply();
  }

  apply() {
    document.documentElement.lang = this.currentLang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) el.textContent = text;
    });

    // Update all elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) el.setAttribute('placeholder', text);
    });

    // Update all elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = this.t(key);
      if (text) el.setAttribute('title', text);
    });

    // Update language switch button appearance
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.innerHTML = this.currentLang === 'fi'
        ? '<span style="font-size:1.1rem">🇫🇮</span> <strong>FI</strong> / EN'
        : '<span style="font-size:1.1rem">🇬🇧</span> FI / <strong>EN</strong>';
    }

    // Trigger custom event for components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
  }
}

window.i18n = new I18nManager();
