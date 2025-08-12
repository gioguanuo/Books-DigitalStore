// /api/turnstile-verify.js
export const config = { api: { bodyParser: true } };

function getToken(req) {
  try {
    if (typeof req.body === 'string') {
      const j = JSON.parse(req.body);
      return j['cf-turnstile-response'] || j.response || null;
    }
    if (typeof req.body === 'object' && req.body) {
      return req.body['cf-turnstile-response'] || req.body.response || null;
    }
    return null;
  } catch { return null; }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    const token = getToken(req);

    if (!secret) {
      return res.status(500).json({ success: false, error: 'Secret key not configured' });
    }

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token missing' });
    }

    // Verifica con Cloudflare
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secret,
        response: token,
        remoteip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown'
      })
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudflare verification failed' 
      });
    }

    // Controlli aggiuntivi per sicurezza
    const isValid = verifyData.success === true &&
                   verifyData.action === 'homepage' &&
                   (verifyData.hostname === 'tuo-dominio.vercel.app' || 
                    verifyData.hostname === 'tuodominio.com'); // Sostituisci con i tuoi domini

    return res.status(200).json({
      success: isValid,
      action: verifyData.action,
      hostname: verifyData.hostname,
      'error-codes': verifyData['error-codes'] || []
    });

  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
