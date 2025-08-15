// /api/turnstile-verify.js - FIX FINALE PER BODY PARSING
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
    // 1. Check environment first
    const secret = process.env.TURNSTILE_SECRET_KEY;
    
    if (!secret) {
      return res.status(500).json({ 
        success: false, 
        error: 'Secret key not configured' 
      });
    }

    // 2. Handle body parsing safely
    let requestData;
    
    try {
      // Don't log req.body directly - it might be corrupted
      console.log('Body type:', typeof req.body);
      
      if (!req.body) {
        return res.status(400).json({ 
          success: false, 
          error: 'Empty request body' 
        });
      }

      if (typeof req.body === 'string') {
        console.log('Parsing string body...');
        requestData = JSON.parse(req.body);
      } else if (typeof req.body === 'object') {
        console.log('Using object body...');
        requestData = req.body;
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid body type' 
        });
      }

    } catch (bodyError) {
      console.error('Body parsing error:', bodyError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid JSON in request body',
        'error-codes': ['invalid-json']
      });
    }

    // 3. Extract and validate token
    const token = requestData['cf-turnstile-response'];

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
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

    console.log('Verifying token for IP:', clientIP);

    // 5. Verify with Cloudflare
    const verifyPayload = new URLSearchParams({
      secret: secret,
      response: token.trim(),
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
      console.error('Cloudflare API error:', verifyResponse.status);
      return res.status(502).json({ 
        success: false, 
        error: 'Verification service unavailable',
        'error-codes': ['service-unavailable']
      });
    }

    const result = await verifyResponse.json();
    
    console.log('Verification result:', {
      success: result.success,
      errorCodes: result['error-codes']
    });

    // 6. Return final result
    return res.status(200).json({
      success: result.success === true,
      action: result.action || null,
      hostname: result.hostname || null,
      'challenge-ts': result['challenge-ts'] || null,
      'error-codes': result['error-codes'] || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Turnstile verification error:', {
      message: error.message,
      name: error.name
    });

    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      'error-codes': ['internal-error'],
      timestamp: new Date().toISOString()
    });
  }
}