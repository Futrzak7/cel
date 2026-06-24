const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data.json');
// try detect Vercel KV binding named `KV` (global)
const kv = (typeof globalThis !== 'undefined' && globalThis.KV) ? globalThis.KV : (typeof KV !== 'undefined' ? KV : null);

function loadLocal() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    const initial = { amounts: { kuba: 0, adrian: 0 }, current: 'kuba' };
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2)); } catch(e){}
    return initial;
  }
}

function saveLocal(data) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); } catch(e){}
}

async function loadState() {
  if (kv && typeof kv.get === 'function') {
    try {
      const raw = await kv.get('funds_state');
      if (raw) {
        try { return JSON.parse(raw); } catch(e){ return raw; }
      }
    } catch (error) {
      // fallback to local
    }
  }
  return loadLocal();
}

async function saveState(data) {
  if (kv && typeof kv.set === 'function') {
    try {
      await kv.set('funds_state', JSON.stringify(data));
      return true;
    } catch (error) {
      // fallback to local save
      console.error('KV save failed', error && error.message);
    }
  }
  try { saveLocal(data); return true; } catch(e){ return false; }
}

module.exports = { loadState, saveState, hasKV: !!kv };
