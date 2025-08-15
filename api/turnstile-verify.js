// /api/turnstile-verify.js - SUPPORTO FORM DATA E JSON
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

    // 2. Extract token from different formats
    let token = null;
    const contentType = req.headers['content-type'] || '';

    console.log('Content-Type:', contentType);
    console.log('Body type:', typeof req.body);

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Form data
      console.log('Processing form data...');
      token = req.body?.['cf-turnstile-response'];
    } else if (contentType.includes('application/json')) {
      // JSON data
      console.log('Processing JSON data...');
      
      if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          token = parsed['cf-turnstile-response'];
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid JSON format',
            'error-codes': ['invalid-json']
          });
        }
      } else if (req.body && typeof req.body === 'object') {
        token = req.body['cf-turnstile-response'];
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported content type' 
      });
    }

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing or invalid',
        'error-codes': ['missing-input-response']
      });
    }

    console.log('Token extracted successfully, length:', token.length);

    // 3. Get client IP
    const clientIP = req.headers['cf-connecting-ip'] || 
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    req.headers['x-real-ip'] || 
                    '127.0.0.1';

    // 4. Verify with Cloudflare
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secret,
        response: token.trim(),
        remoteip: clientIP
      })
    });

    if (!verifyResponse.ok) {
      console.error('Cloudflare API error:', verifyResponse.status);
      return res.status(502).json({ 
        success: false, 
        error: 'Verification service unavailable',
        'error-codes': ['service-unavailable']
      });
    }

    const result = await verifyResponse.json();
    
    console.log('Verification result:', result.success, result['error-codes']);

    // 5. Return result
    return res.status(200).json({
      success: result.success === true,
      action: result.action || null,
      hostname: result.hostname || null,
      'challenge-ts': result['challenge-ts'] || null,
      'error-codes': result['error-codes'] || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verification error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      'error-codes': ['internal-error'],
      timestamp: new Date().toISOString()
    });
  }
}