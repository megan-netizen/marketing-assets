// api/tapcart-proxy.js
// Proxies requests to app.tapcart.com to avoid CORS issues in the browser.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { appId } = req.query;
  if (!appId) {
    return res.status(400).json({ error: 'Missing appId' });
  }

  try {
    const upstream = await fetch(`https://app.tapcart.com/v1/apps/${appId}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const text = await upstream.text();

    // Guard against HTML error pages (Tapcart returns HTML for unknown app IDs)
    if (!upstream.ok || text.trim().startsWith('<')) {
      return res.status(upstream.status).json({
        error: `App not found or API unavailable (HTTP ${upstream.status})`,
      });
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);

  } catch (err) {
    console.error('[tapcart-proxy] error:', err);
    return res.status(500).json({ error: err.message });
  }
}
