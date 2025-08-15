// /api/turnstile-verify.js - FIX FINALE
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

    // 2. Parse request body properly
    let requestData;
    
    if (typeof req.body === 'string') {
      try {
        requestData = JSON.parse(req.body);
      } catch (parseError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        });
      }
    } else if (req.body && typeof req.body === 'object') {
      requestData = req.body;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing request body' 
      });
    }

    // 3. Extract token
    const token = requestData['cf-turnstile-response'];

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing or invalid',
        'error-codes': ['missing-input-response']
      });
    }

    // 4. Get client IP
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    req.headers['x-real-ip'] || 
                    req.connection?.remoteAddress ||
                    '127.0.0.1';

    console.log('Verifying token:', {
      tokenLength: token.length,
      clientIP: clientIP,
      bodyType: typeof req.body,
      hasSecret: !!secret
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
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Vercel-Function/1.0'
      },
      body: verifyPayload
    });

    if (!verifyResponse.ok) {
      console.error('Cloudflare API error:', verifyResponse.status, verifyResponse.statusText);
      return res.status(502).json({ 
        success: false, 
        error: 'Verification service unavailable',
        'error-codes': ['service-unavailable']
      });
    }

    const result = await verifyResponse.json();
    
    console.log('Cloudflare result:', {
      success: result.success,
      action: result.action,
      hostname: result.hostname,
      errorCodes: result['error-codes']
    });

    // 6. Return result
    return res.status(200).json({
      success: result.success === true,
      action: result.action || null,
      hostname: result.hostname || null,
      'challenge-ts': result['challenge-ts'] || null,
      'error-codes': result['error-codes'] || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verification error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      'error-codes': ['internal-error'],
      timestamp: new Date().toISOString()
    });
  }
}