const GOALS = {
  adrian: { title: 'Adrian — Surroin Light Bee X', target: 13300 }
};

// Use localhost backend when developing locally; on Vercel use same-origin paths.
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:4000'
  : '';

let state = { amounts: { adrian: 0 }, current: 'adrian' };

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error('Invalid JSON response from server: ' + text.trim().slice(0, 120));
  }
  return { response, json };
}

async function fetchServerState() {
  try {
    const { response, json } = await fetchJson(API_BASE + '/api/state');
    if (response.ok && json && json.ok && json.state) return json.state;
  } catch (e) {
    return null;
  }
  return null;
}

async function saveToServerChange(user, amount) {
  try {
    const { response, json } = await fetchJson(API_BASE + '/api/change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, amount })
    });
    if (response.ok && json.ok) return json.state;
    throw new Error(json && json.error ? json.error : 'Server error');
  } catch (e) {
    throw e;
  }
}

async function saveCurrentToServer(current) {
  try {
    const { response, json } = await fetchJson(API_BASE + '/api/setCurrent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current })
    });
    if (response.ok && json.ok) return json.state;
  } catch (e) {
    return null;
  }
  return null;
}

// DOM refs
const goalTitle = document.getElementById('goal-title');
const collectedEl = document.getElementById('collected');
const targetEl = document.getElementById('target');
const percentEl = document.getElementById('percent');
const progressFill = document.getElementById('progress-fill');
const goalButtons = document.querySelectorAll('.goal');
const changeButtons = document.querySelectorAll('.change-btn');

function render() {
  const cur = state.current;
  const g = GOALS[cur];
  goalTitle.textContent = g.title;
  const collected = state.amounts[cur] || 0;
  collectedEl.textContent = collected.toLocaleString('pl-PL');
  targetEl.textContent = g.target.toLocaleString('pl-PL');
  const pct = Math.min(100, Math.round((collected / g.target) * 100));
  percentEl.textContent = pct + '%';
  progressFill.style.width = pct + '%';
  goalButtons.forEach(b => b.classList.toggle('active', b.dataset.id === cur));
  // Enable all change buttons (no login required)
  changeButtons.forEach(btn => {
    btn.disabled = false;
    btn.classList.toggle('disabled', false);
  });
}

function addAmount(amount) {
  const cur = state.current;
  const newVal = (state.amounts[cur] || 0) + amount;
  state.amounts[cur] = Math.max(0, newVal);
  // Always try to save to server
  saveToServerChange(cur, amount).then(s => {
    if (s) {
      state = Object.assign(state, s);
      saveLocal();
      render();
    }
  }).catch(err => {
    // fallback locally
    saveLocal();
    render();
    alert('Błąd synchronizacji: ' + err.message);
  });
}

function saveLocal() {
  try {
    localStorage.setItem('funds_app_v1', JSON.stringify(state));
  } catch (e) { }
}

async function initState() {
  // Load local state first so UI shows immediately
  try {
    const raw = localStorage.getItem('funds_app_v1');
    if (raw) state = JSON.parse(raw);
  } catch (e) { }
  render();
  // Then try to fetch authoritative state from server and update UI when available
  fetchServerState().then(s => {
    if (s) {
      state = Object.assign(state, s);
      saveLocal();
      render();
    }
  }).catch(() => {
    // silent fallback; keep local
  });
}

goalButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    state.current = btn.dataset.id;
    // persist current to server if possible
    saveCurrentToServer(state.current).then(s => {
      if (s) state = Object.assign(state, s);
      saveLocal();
      render();
    }).catch(() => {
      saveLocal();
      render();
    });
  })
});

changeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const amount = Number(btn.dataset.amount) || 0;
    addAmount(amount);
  })
});

// init
initState();

