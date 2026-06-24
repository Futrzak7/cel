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
    const payload = { ok: true, state };
    if (storage.persistenceWarning) {
      payload.warning = storage.persistenceWarning;
    }
    return res.status(200).json(payload);
  } catch (ex) {
    return res.status(500).json({ ok: false, error: 'Server exception: ' + (ex && ex.message) });
  }
};
