// api/tapcart-proxy.js
// Proxies requests to app.tapcart.com to avoid CORS issues in the browser.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { appId } = req.query;
  if (!appId) return res.status(400).json({ error: 'Missing appId' });

  try {
    const upstream = await fetch(`https://api.tapcart.com/mobile-native/${appId}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    });

    const text = await upstream.text();

    if (!upstream.ok || text.trim().startsWith('<')) {
      return res.status(upstream.status).json({
        error: `App not found (HTTP ${upstream.status})`,
      });
    }

    return res.status(200).json(JSON.parse(text));

  } catch (err) {
    console.error('[tapcart-proxy] error:', err);
    return res.status(500).json({ error: err.message });
  }
};
