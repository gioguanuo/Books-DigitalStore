// /api/turnstile-verify.js - TORNA AL CODICE ORIGINALE FUNZIONANTE
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    
    // Estrai il token dal body della richiesta
    let token = null;
    if (typeof req.body === 'string') {
      const parsed = JSON.parse(req.body);
      token = parsed['cf-turnstile-response'];
    } else if (req.body) {
      token = req.body['cf-turnstile-response'];
    }

    if (!secret) {
      return res.status(500).json({ 
        success: false, 
        error: 'Secret key not configured' 
      });
    }

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing' 
      });
    }

    // Verifica il token con Cloudflare
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secret,
        response: token,
        remoteip: req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection?.remoteAddress || 
                 'unknown'
      })
    });

    if (!verifyResponse.ok) {
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudflare verification failed' 
      });
    }

    const result = await verifyResponse.json();
    
    // Restituisci il risultato
    return res.status(200).json({
      success: result.success === true,
      action: result.action,
      hostname: result.hostname,
      'error-codes': result['error-codes'] || []
    });

  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
}