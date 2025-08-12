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
  } catch { 
    return null; 
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    const token = getToken(req);

    // Controlla che abbiamo tutto il necessario
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not found in environment');
      return res.status(500).json({ 
        success: false, 
        error: 'Secret key not configured' 
      });
    }

    if (!token) {
      console.error('No token received from client');
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing' 
      });
    }

    console.log('Verifying token with Cloudflare...');

    // Chiamata a Cloudflare per verificare il token
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
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
      console.error(`Cloudflare API error: ${verifyResponse.status}`);
      return res.status(500).json({ 
        success: false, 
        error: `Cloudflare API error: ${verifyResponse.status}` 
      });
    }

    const verifyData = await verifyResponse.json();
    console.log('Cloudflare response:', verifyData);

    // Restituisci il risultato
    return res.status(200).json({
      success: verifyData.success === true,
      action: verifyData.action,
      hostname: verifyData.hostname,
      'error-codes': verifyData['error-codes'] || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}