const https = require('https');

module.exports = async function handler(req, res) {
  // CORS headers must be set on EVERY response including OPTIONS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Chrome extensions send a preflight OPTIONS request first
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email } = req.body || {};
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  const body = JSON.stringify({
    email,
    listIds: [parseInt(process.env.BREVO_LIST_ID || '2')],
    updateEnabled: true
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const request = https.request(options, (response) => {
      if (response.statusCode === 201 || response.statusCode === 204) {
        res.status(200).json({ success: true });
        resolve();
      } else {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            res.status(400).json({ error: parsed.message || 'Brevo error' });
          } catch {
            res.status(400).json({ error: 'Brevo error' });
          }
          resolve();
        });
      }
    });

    request.on('error', (err) => {
      res.status(500).json({ error: 'Server error' });
      resolve();
    });

    request.write(body);
    request.end();
  });
};
