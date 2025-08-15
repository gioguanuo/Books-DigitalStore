// /api/turnstile-verify.js - RAW BODY HANDLING
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

    // 2. Handle raw body - bypass Vercel's automatic parsing
    let rawBody = '';
    let requestData = null;

    // Check if we have a raw body to read
    if (req.body !== undefined) {
      console.log('Body available, type:', typeof req.body);
      
      // Try different approaches to get the body
      if (typeof req.body === 'string') {
        rawBody = req.body;
      } else if (typeof req.body === 'object' && req.body !== null) {
        // If it's already an object, use it directly
        requestData = req.body;
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'No request body received' 
        });
      }

      // If we have a raw string, try to parse it
      if (rawBody && !requestData) {
        try {
          console.log('Parsing raw body string...');
          requestData = JSON.parse(rawBody);
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message);
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid JSON format',
            'error-codes': ['invalid-json']
          });
        }
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'No request body' 
      });
    }

    console.log('Request data parsed successfully');

    // 3. Extract token
    const token = requestData && requestData['cf-turnstile-response'];

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing or invalid',
        'error-codes': ['missing-input-response']
      });
    }

    console.log('Token extracted, length:', token.length);

    // 4. Get client IP
    const clientIP = req.headers['cf-connecting-ip'] || 
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    req.headers['x-real-ip'] || 
                    '127.0.0.1';

    console.log('Verifying with Cloudflare for IP:', clientIP);

    // 5. Verify with Cloudflare
    const verifyPayload = new URLSearchParams({
      secret: secret,
      response: token.trim(),
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
      console.error('Cloudflare API error:', verifyResponse.status, verifyResponse.statusText);
      return res.status(502).json({ 
        success: false, 
        error: 'Verification service unavailable',
        'error-codes': ['service-unavailable']
      });
    }

    const result = await verifyResponse.json();
    
    console.log('Cloudflare verification result:', {
      success: result.success,
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