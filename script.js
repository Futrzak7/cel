const GOALS = {
  kuba: { title: 'Kuba — Falcon Pro', target: 19500 },
  adrian: { title: 'Adrian — Surroin Light Bee X', target: 13300 }
};

// NOTE: demo passwords (change in code for production)
// Updated per user request: Kuba -> '13', Adrian -> '67'
const PASSWORDS = { kuba: '13', adrian: '67' };

// Use localhost backend when developing locally; on Vercel use same-origin paths.
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:4000'
  : '';

let state = { amounts: { kuba:0, adrian:0 }, current:'kuba', admin:{name:''}, sessionUser: null };
let sessionPass = null; // keep password in memory during session only

async function fetchJson(url, options){
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

async function fetchServerState(){
  try{
    const { response, json } = await fetchJson(API_BASE + '/api/state');
    if(response.ok && json && json.ok && json.state) return json.state;
  }catch(e){
    return null;
  }
  return null;
}

async function saveToServerChange(user, amount){
  try{
    const { response, json } = await fetchJson(API_BASE + '/api/change', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user, amount, password: sessionPass })
    });
    if(response.ok && json.ok) return json.state;
    throw new Error(json && json.error ? json.error : 'Server error');
  }catch(e){
    throw e;
  }
}

async function saveCurrentToServer(current){
  try{
    const { response, json } = await fetchJson(API_BASE + '/api/setCurrent', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ current })
    });
    if(response.ok && json.ok) return json.state;
  }catch(e){
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
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginStatus = document.getElementById('login-status');
const adminNameInput = document.getElementById('admin-name');
const saveAdminBtn = document.getElementById('save-admin');
const adminModeCheckbox = document.getElementById('admin-mode');

function render(){
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
  adminNameInput.value = state.admin.name || '';
  // show login status
  const logged = state.sessionUser;
  if(loginStatus) loginStatus.textContent = logged ? ('Zalogowany: ' + logged) : 'Brak zalogowanego użytkownika';
  // enable/disable change buttons: only the logged-in user for current goal can change
  changeButtons.forEach(btn => {
    const allowed = (logged === state.current);
    btn.disabled = !allowed;
    btn.classList.toggle('disabled', btn.disabled);
  });
}

function addAmount(amount){
  const cur = state.current;
  const newVal = (state.amounts[cur] || 0) + amount;
  state.amounts[cur] = Math.max(0, newVal);
  // try save to server; if fails, fallback to local change
  if(state.sessionUser && sessionPass){
    saveToServerChange(state.sessionUser, amount).then(s=>{
      if(s){ state = Object.assign(state, s); render(); }
    }).catch(err=>{
      // fallback locally
      saveLocal();
      render();
      alert('Nie udało się zsynchronizować z serwerem: ' + err.message);
    });
  } else {
    // no session or server — just local change
    saveLocal();
    render();
  }
}

function saveLocal(){
  try{ localStorage.setItem('funds_app_v1', JSON.stringify(state)); }catch(e){}
}

async function initState(){
  // try server first
  const s = await fetchServerState();
  if(s){ state = Object.assign(state, s); render(); return; }
  // fallback to localStorage
  try{
    const raw = localStorage.getItem('funds_app_v1');
    if(raw) state = JSON.parse(raw);
  }catch(e){}
  render();
}

goalButtons.forEach(btn => {
  btn.addEventListener('click', ()=>{
    state.current = btn.dataset.id;
    // persist current to server if possible
    saveCurrentToServer(state.current).then(s=>{ if(s) state = Object.assign(state, s); saveLocal(); render(); }).catch(()=>{ saveLocal(); render(); });
  })
});

changeButtons.forEach(btn => {
  btn.addEventListener('click', ()=>{
    const amount = Number(btn.dataset.amount)||0;
    addAmount(amount);
  })
});

// Login handlers
if(loginBtn){
  loginBtn.addEventListener('click', ()=>{
    const user = document.querySelector('input[name="login-user"]:checked').value;
    const pass = loginPassword.value || '';
    // validate with server by attempting a no-op change of 0
    sessionPass = pass;
    saveToServerChange(user, 0).then(s=>{
      state.sessionUser = user;
      if(s) state = Object.assign(state, s);
      saveLocal(); render();
      alert('Zalogowano jako ' + user);
    }).catch(e=>{
      sessionPass = null;
      alert('Błąd logowania: ' + (e.message || 'Błędne hasło dla ' + user));
    }).finally(()=>{ loginPassword.value = ''; });
  });
}

if(logoutBtn){
  logoutBtn.addEventListener('click', ()=>{
    state.sessionUser = null;
    saveLocal();
    render();
    alert('Wylogowano');
  });
}

saveAdminBtn.addEventListener('click', ()=>{
  state.admin.name = adminNameInput.value.trim();
  saveLocal();
  alert('Profil administratora zapisany: ' + (state.admin.name||'(puste)'));
});

// Admin mode: when enabled, clicking any goal's name also shows a confirm+add quick flow
adminModeCheckbox.addEventListener('change', ()=>{
  // when admin mode on, show small visual (we don't create extra UI here)
  document.body.classList.toggle('admin-mode', adminModeCheckbox.checked);
});

// init
initState();
