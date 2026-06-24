const storage = require('./storage');

module.exports = async function handler(req, res) {
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
    const { user, amount } = req.body || {};
    if (!user || typeof amount !== 'number') {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }

    const state = await storage.loadState();
    state.amounts = state.amounts || { kuba: 0, adrian: 0 };
    state.amounts[user] = Math.max(0, (state.amounts[user] || 0) + amount);
    const persisted = await storage.saveState(state);
    const result = { ok: true, state };
    if (!persisted) {
      result.warning = storage.persistenceWarning || 'unable_to_persist';
    }
    return res.status(200).json(result);
  } catch (ex) {
    return res.status(500).json({ ok: false, error: 'Server exception: ' + (ex && ex.message) });
  }
};
