const storage = require('./storage');

module.exports = async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    const state = await storage.loadState();
    return res.status(200).json({ ok: true, state });
  } catch (ex) {
    return res.status(500).json({ ok: false, error: 'Server exception: ' + (ex && ex.message) });
  }
};
