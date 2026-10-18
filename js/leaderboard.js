'use strict';

// ---------------------------------------------------------------------------
// Tulostaulukko logic (leaderboard.js)
// ---------------------------------------------------------------------------

let currentPeriod = 'all';
let refreshInterval = null;
let countdownTimer = null;
let secondsUntilRefresh = 30;

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  loadLeaderboard();
  startAutoRefresh();
});

function setupTabs() {
  const tabs = document.querySelectorAll('.lb-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentPeriod = tab.getAttribute('data-period');
      loadLeaderboard();
      resetRefreshTimer();
    });
  });
}

function startAutoRefresh() {
  secondsUntilRefresh = 30;
  updateCountdownText();

  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    secondsUntilRefresh--;
    if (secondsUntilRefresh <= 0) {
      secondsUntilRefresh = 30;
      loadLeaderboard(true);
    }
    updateCountdownText();
  }, 1000);
}

function resetRefreshTimer() {
  secondsUntilRefresh = 30;
  updateCountdownText();
}

function updateCountdownText() {
  const el = document.getElementById('refresh-countdown');
  if (el) {
    el.textContent = `Päivitetään ${secondsUntilRefresh} s:n kuluttua`;
  }
}

async function loadLeaderboard(silent = false) {
  const loadingEl = document.getElementById('lb-loading');
  const errorEl = document.getElementById('lb-error');
  const emptyEl = document.getElementById('lb-empty');
  const podiumEl = document.getElementById('lb-podium');
  const tbodyEl = document.getElementById('lb-tbody');

  if (!silent) {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (errorEl) errorEl.classList.add('hidden');
  }

  const periodParam = currentPeriod === 'all' ? 'alltime' : currentPeriod;

  let players = [];
  try {
    const res = await fetch(`api/leaderboard?period=${periodParam}&limit=50`);
    if (res.ok) {
      const data = await res.json();
      players = data.data || [];
    } else {
      throw new Error('API not available');
    }
  } catch (err) {
    // Fallback to localStorage (GitHub Pages mode)
    try {
      players = JSON.parse(localStorage.getItem('mp_global_leaderboard') || '[]');
      if (players.length === 0) {
        players = [
          { username: 'SampoGamer', platform: 'kick', total_score: 12500, games_played: 5, correct_answers: 42, total_answers: 48 },
          { username: 'TwitchMestari', platform: 'twitch', total_score: 9800, games_played: 4, correct_answers: 35, total_answers: 40 },
          { username: 'Tietäjä99', platform: 'guest', total_score: 7200, games_played: 3, correct_answers: 26, total_answers: 30 }
        ];
        localStorage.setItem('mp_global_leaderboard', JSON.stringify(players));
      }
    } catch {
      players = [];
    }
  }

  if (loadingEl) loadingEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');

  if (players.length === 0) {
    if (podiumEl) podiumEl.innerHTML = '';
    if (tbodyEl) tbodyEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  renderPodium(players.slice(0, 3));
  renderTable(players);
}

function renderPodium(top3) {
  const podiumEl = document.getElementById('lb-podium');
  if (!podiumEl) return;

  if (top3.length === 0) {
    podiumEl.innerHTML = '';
    return;
  }

  // Classic podium visual order: 2nd (left), 1st (center), 3rd (right)
  const p1 = top3[0] || null;
  const p2 = top3[1] || null;
  const p3 = top3[2] || null;

  const slots = [];

  // Slot 2 (Silver)
  if (p2) {
    slots.push(`
      <div class="podium-slot podium-2">
        <div class="podium-avatar">${getInitials(p2.username)}</div>
        <div class="podium-name">${escapeHtml(p2.username)}</div>
        <div class="podium-score">${p2.total_score.toLocaleString('fi')}</div>
        <div class="podium-block">2</div>
      </div>
    `);
  } else {
    slots.push(`<div class="podium-slot podium-2" style="opacity:0.2;"></div>`);
  }

  // Slot 1 (Gold)
  if (p1) {
    slots.push(`
      <div class="podium-slot podium-1">
        <div class="podium-avatar">👑</div>
        <div class="podium-name">${escapeHtml(p1.username)}</div>
        <div class="podium-score">${p1.total_score.toLocaleString('fi')}</div>
        <div class="podium-block">1</div>
      </div>
    `);
  }

  // Slot 3 (Bronze)
  if (p3) {
    slots.push(`
      <div class="podium-slot podium-3">
        <div class="podium-avatar">${getInitials(p3.username)}</div>
        <div class="podium-name">${escapeHtml(p3.username)}</div>
        <div class="podium-score">${p3.total_score.toLocaleString('fi')}</div>
        <div class="podium-block">3</div>
      </div>
    `);
  } else {
    slots.push(`<div class="podium-slot podium-3" style="opacity:0.2;"></div>`);
  }

  podiumEl.innerHTML = slots.join('');
}

function renderTable(players) {
  const tbody = document.getElementById('lb-tbody');
  if (!tbody) return;

  tbody.innerHTML = players.map((p, index) => {
    const rank = index + 1;
    const rankClass = rank <= 3 ? `rank-${rank}` : '';
    const platform = (p.platform || 'guest').toLowerCase();
    const platformLabel = platform === 'kick' ? 'Kick' : platform === 'twitch' ? 'Twitch' : 'Vieras';

    const accuracy = p.total_answers > 0
      ? Math.round((p.correct_answers / p.total_answers) * 100) + '%'
      : '–';

    return `
      <tr>
        <td class="td-rank">
          <span class="rank-num ${rankClass}">#${rank}</span>
        </td>
        <td>
          <div class="player-cell">
            <div class="lb-avatar">${getInitials(p.username)}</div>
            <span class="lb-username">${escapeHtml(p.username)}</span>
          </div>
        </td>
        <td>
          <span class="lb-platform-badge ${platform}">${platformLabel}</span>
        </td>
        <td>
          <strong style="color:var(--score-color);font-family:'Anton',sans-serif;font-size:1.05rem;">
            ${(p.total_score || 0).toLocaleString('fi')}
          </strong>
        </td>
        <td>${p.games_played || 0}</td>
        <td>${accuracy}</td>
      </tr>
    `;
  }).join('');
}

function getInitials(name) {
  if (!name) return '?';
  const clean = name.trim();
  return clean.slice(0, 2).toUpperCase();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
