const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data.json');

const PASSWORDS = {
  kuba: '13',
  adrian: '67'
};

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    const initial = { amounts: { kuba: 0, adrian: 0 }, current: 'kuba' };
    return initial;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = function handler(req, res) {
  try {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  const { user, amount, password } = req.body || {};
  if (!user || typeof amount !== 'number') {
    return res.status(400).json({ ok: false, error: 'Invalid payload' });
  }
  if (!PASSWORDS[user] || PASSWORDS[user] !== String(password)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  const d = loadData();
  d.amounts[user] = Math.max(0, (d.amounts[user] || 0) + amount);
  const saved = saveData(d);
  if (!saved) {
    return res.status(500).json({ ok: false, error: 'Server error: unable to persist data' });
  }
  return res.status(200).json({ ok: true, state: d });
  } catch (ex) {
    return res.status(500).json({ ok: false, error: 'Server exception: ' + (ex && ex.message) });
  }
};
