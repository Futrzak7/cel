const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data.json');

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    const initial = { amounts: { kuba: 0, adrian: 0 }, current: 'kuba' };
    return initial;
  }
}
let STORE = loadData();

module.exports = function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    return res.status(200).json({ ok: true, state: STORE });
  } catch (ex) {
    return res.status(500).json({ ok: false, error: 'Server exception: ' + (ex && ex.message) });
  }
};
