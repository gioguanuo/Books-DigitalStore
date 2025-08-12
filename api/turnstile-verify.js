// /api/turnstile-verify.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metodo non consentito' });
  }

  const token = req.body?.['cf-turnstile-response'];
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token mancante' });
  }

  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      throw new Error('TURNSTILE_SECRET_KEY non configurata');
    }

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    if (req.headers['x-forwarded-for']) {
      formData.append('remoteip', req.headers['x-forwarded-for'].split(',')[0]);
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await verifyRes.json();
    return res.status(data.success ? 200 : 403).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
