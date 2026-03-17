// api/screenshot-proxy.js
// Proxies screenshot capture requests to the Cloud Run Playwright service.
// Set SCREENSHOT_SERVICE_URL in your Vercel project environment variables.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceUrl = process.env.SCREENSHOT_SERVICE_URL;
  if (!serviceUrl) {
    return res.status(500).json({ error: 'SCREENSHOT_SERVICE_URL not configured' });
  }

  try {
    const upstream = await fetch(`${serviceUrl}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: text });
    }

    // The Cloud Run service returns JSON with a base64 image
    const data = await upstream.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('[screenshot-proxy] error:', err);
    return res.status(500).json({ error: err.message });
  }
}
