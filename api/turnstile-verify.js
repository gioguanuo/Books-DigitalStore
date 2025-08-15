// /api/turnstile-verify.js - ENHANCED DEBUG
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

    // 2. DEBUG: Log everything about the request
    const contentType = req.headers['content-type'] || '';
    
    console.log('=== ENHANCED DEBUG ===');
    console.log('Content-Type:', contentType);
    console.log('Body type:', typeof req.body);
    console.log('Body content:', req.body);
    
    if (req.body && typeof req.body === 'object') {
      console.log('Body keys:', Object.keys(req.body));
      console.log('Body values:', Object.values(req.body));
      for (const [key, value] of Object.entries(req.body)) {
        console.log(`  ${key}: ${value} (${typeof value})`);
      }
    }

    // 3. Extract token from different formats
    let token = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      console.log('Processing form data...');
      
      if (typeof req.body === 'string') {
        console.log('Body is string, parsing URLSearchParams...');
        const params = new URLSearchParams(req.body);
        token = params.get('cf-turnstile-response');
        console.log('Token from URLSearchParams:', token);
      } else if (req.body && typeof req.body === 'object') {
        console.log('Body is object, extracting directly...');
        // Try different possible keys
        token = req.body['cf-turnstile-response'] || 
                req.body.cfTurnstileResponse ||
                req.body['cf_turnstile_response'];
        console.log('Token from object:', token);
      }
      
    } else if (contentType.includes('application/json')) {
      console.log('Processing JSON data...');
      
      if (typeof req.body === 'string') {
        try {
          console.log('Parsing JSON string...');
          const parsed = JSON.parse(req.body);
          console.log('Parsed JSON:', parsed);
          token = parsed['cf-turnstile-response'];
        } catch (error) {
          console.error('JSON parse error:', error.message);
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid JSON format',
            'error-codes': ['invalid-json']
          });
        }
      } else if (req.body && typeof req.body === 'object') {
        console.log('JSON body is already object');
        token = req.body['cf-turnstile-response'];
      }
      
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported content type' 
      });
    }

    console.log('Final token:', token);
    console.log('Token type:', typeof token);

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing or invalid',
        'error-codes': ['missing-input-response'],
        debug: {
          tokenReceived: !!token,
          tokenType: typeof token,
          tokenValue: token,
          bodyType: typeof req.body,
          bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : 'N/A',
          contentType: contentType
        }
      });
    }

    // 4. Get client IP
    const clientIP = req.headers['cf-connecting-ip'] || 
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    req.headers['x-real-ip'] || 
                    '127.0.0.1';

    console.log('Verifying token for IP:', clientIP);

    // 5. Verify with Cloudflare
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
    
    console.log('Cloudflare verification result:', result);

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