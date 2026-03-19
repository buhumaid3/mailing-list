const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
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
      // 201 = created, 204 = already exists — both are success
      if (response.statusCode === 201 || response.statusCode === 204) {
        res.status(200).json({ success: true });
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
        });
      }
      resolve();
    });

    request.on('error', () => {
      res.status(500).json({ error: 'Server error' });
      resolve();
    });

    request.write(body);
    request.end();
  });
};
