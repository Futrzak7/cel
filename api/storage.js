const fs = require('fs');
const os = require('os');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data.json');
const TMP_FILE = path.join(os.tmpdir(), 'funds_state.json');
const INITIAL_STATE = { amounts: { kuba: 0, adrian: 0 }, current: 'kuba' };
const KV_BINDING_NAME = process.env.KV_BINDING_NAME || 'KV';

function resolveKV() {
  if (typeof globalThis !== 'undefined') {
    const candidate = globalThis[KV_BINDING_NAME] || globalThis.KV;
    if (candidate && typeof candidate.get === 'function' && typeof candidate.set === 'function') {
      return candidate;
    }
  }
  if (typeof KV !== 'undefined' && KV && typeof KV.get === 'function' && typeof KV.set === 'function') {
    return KV;
  }
  return null;
}

const kv = resolveKV();
const isVercel = Boolean(process.env.VERCEL);
const persistenceWarning = isVercel && !kv ? 'missing_vercel_kv_binding' : null;

function readFileJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function loadLocal() {
  const sources = [TMP_FILE, DATA_FILE];
  for (const filePath of sources) {
    try {
      if (fs.existsSync(filePath)) {
        return readFileJson(filePath);
      }
    } catch (error) {
      // ignore and try next fallback
    }
  }
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(INITIAL_STATE, null, 2));
  } catch (e) {
    // ignore write failure
  }
  return INITIAL_STATE;
}

function saveLocal(data) {
  const filePath = isVercel ? TMP_FILE : DATA_FILE;
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Local save failed', error && error.message);
    return false;
  }
}

async function loadState() {
  if (kv) {
    try {
      const raw = await kv.get('funds_state');
      if (raw) {
        try { return JSON.parse(raw); } catch (e) { return raw; }
      }
    } catch (error) {
      console.error('KV load failed', error && error.message);
    }
  }
  return loadLocal();
}

async function saveState(data) {
  if (kv) {
    try {
      await kv.set('funds_state', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('KV save failed', error && error.message);
    }
  }

  const saved = saveLocal(data);
  if (!saved && isVercel) {
    console.error('Local file persistence failed on Vercel without KV binding');
  }
  return saved;
}

module.exports = {
  loadState,
  saveState,
  hasKV: !!kv,
  persistenceWarning,
  initialState: INITIAL_STATE
};
