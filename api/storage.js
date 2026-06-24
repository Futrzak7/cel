const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data.json');
let kv = null;
let useKV = false;

try {
  if (process.env.VERCEL_KV_URL) {
    kv = require('@vercel/kv');
    useKV = true;
  }
} catch (error) {
  useKV = false;
}

function loadLocal() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    const initial = { amounts: { kuba: 0, adrian: 0 }, current: 'kuba' };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveLocal(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function loadState() {
  if (useKV && kv) {
    try {
      const state = await kv.get('funds_state');
      if (state) return state;
    } catch (error) {
      // fallback to local
    }
  }
  return loadLocal();
}

async function saveState(data) {
  if (useKV && kv) {
    try {
      await kv.set('funds_state', data);
      return;
    } catch (error) {
      // fallback to local save
    }
  }
  saveLocal(data);
}

module.exports = { loadState, saveState, useKV };
