export default async function handler(req, res) {
  // Allow requests from the Chrome extension and any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY   // stored safely in Vercel env vars
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(process.env.BREVO_LIST_ID || '2')],
        updateEnabled: true
      })
    });

    // 201 = new contact, 204 = already exists — both are fine
    if (brevoRes.ok || brevoRes.status === 204) {
      return res.status(200).json({ success: true });
    }

    const errData = await brevoRes.json().catch(() => ({}));
    return res.status(400).json({ error: errData.message || 'Brevo error' });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
