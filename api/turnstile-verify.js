// /api/turnstile-verify.js - VERSIONE MINIMAL PER DEBUG
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // 1. Check environment
    const secret = process.env.TURNSTILE_SECRET_KEY;
    
    if (!secret) {
      return res.status(500).json({ 
        success: false, 
        error: 'Secret key not configured' 
      });
    }

    // 2. Validate body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body format' 
      });
    }

    // 3. Extract token
    const token = req.body['cf-turnstile-response'];

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing or invalid' 
      });
    }

    // 4. Get client IP (simplified)
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                    req.headers['x-real-ip'] || 
                    '127.0.0.1';

    console.log('Verifying token:', {
      tokenLength: token.length,
      clientIP: clientIP,
      secret: secret ? 'PRESENT' : 'MISSING'
    });

    // 5. Verify with Cloudflare
    const verifyPayload = new URLSearchParams({
      secret: secret,
      response: token,
      remoteip: clientIP
    });

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: verifyPayload
    });

    if (!verifyResponse.ok) {
      console.error('Cloudflare API error:', verifyResponse.status);
      return res.status(502).json({ 
        success: false, 
        error: 'Verification service unavailable' 
      });
    }

    const result = await verifyResponse.json();
    
    console.log('Cloudflare result:', result);

    // 6. Return result
    return res.status(200).json({
      success: result.success === true,
      action: result.action,
      hostname: result.hostname,
      'error-codes': result['error-codes'] || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verification error:', {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      debug: error.message  // Temporary debug info
    });
  }
}