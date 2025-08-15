// /api/turnstile-verify.js - VERSIONE CORRETTA SENZA BUG
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      'error-codes': ['method-not-allowed']
    });
  }

  const startTime = Date.now();
  
  try {
    // 1. VALIDATE ENVIRONMENT
    const secret = process.env.TURNSTILE_SECRET_KEY;
    
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error',
        'error-codes': ['missing-secret-key']
      });
    }

    // 2. EXTRACT AND VALIDATE TOKEN (FIXED)
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body format',
        'error-codes': ['invalid-body-format']
      });
    }

    const requestData = req.body;
    const token = requestData['cf-turnstile-response'];

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token missing or invalid',
        'error-codes': ['missing-input-response']
      });
    }

    // Basic token format validation
    if (token.length < 10 || token.length > 2000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token format invalid',
        'error-codes': ['invalid-token-format']
      });
    }

    // 3. GET CLIENT INFO
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const hostname = req.headers.host || 'unknown';

    // Optional: Basic rate limiting check
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        'error-codes': ['rate-limit-exceeded']
      });
    }

    // 4. VERIFY WITH CLOUDFLARE
    console.log(`Verifying Turnstile token for IP: ${clientIP}, Host: ${hostname}`);

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
      console.error(`Cloudflare API error: ${verifyResponse.status} ${verifyResponse.statusText}`);
      return res.status(502).json({ 
        success: false, 
        error: 'Verification service unavailable',
        'error-codes': ['service-unavailable']
      });
    }

    // 5. PARSE CLOUDFLARE RESPONSE
    let result;
    try {
      result = await verifyResponse.json();
    } catch (parseError) {
      console.error('Failed to parse Cloudflare response:', parseError);
      return res.status(502).json({ 
        success: false, 
        error: 'Invalid response from verification service',
        'error-codes': ['invalid-service-response']
      });
    }

    // 6. ADDITIONAL SECURITY VALIDATIONS
    const validations = {
      cloudflareSuccess: result.success === true,
      validAction: !result.action || isValidAction(result.action, requestData.action),
      validHostname: !result.hostname || isValidHostname(result.hostname, hostname),
      notExpired: !result['challenge-ts'] || isNotExpired(result['challenge-ts'])
    };

    const finalSuccess = Object.values(validations).every(Boolean);

    // 7. LOG RESULT FOR MONITORING
    const responseTime = Date.now() - startTime;
    logVerificationAttempt({
      success: finalSuccess,
      clientIP,
      hostname,
      responseTime,
      errorCodes: result['error-codes'] || [],
      validations
    });

    // 8. RETURN FINAL RESPONSE
    const statusCode = finalSuccess ? 200 : 400;
    
    return res.status(statusCode).json({
      success: finalSuccess,
      action: result.action || null,
      hostname: result.hostname || null,
      'challenge-ts': result['challenge-ts'] || null,
      'error-codes': result['error-codes'] || (finalSuccess ? [] : ['validation-failed']),
      timestamp: new Date().toISOString(),
      responseTime: responseTime
    });

  } catch (error) {
    // 9. ERROR HANDLING
    const responseTime = Date.now() - startTime;
    
    console.error('Turnstile verification error:', {
      error: error.message,
      stack: error.stack,
      responseTime
    });

    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      'error-codes': ['internal-error'],
      timestamp: new Date().toISOString(),
      responseTime: responseTime
    });
  }
}

// HELPER FUNCTIONS

function getClientIP(req) {
  // Get the real client IP from various headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return req.headers['x-real-ip'] || 
         req.headers['cf-connecting-ip'] ||
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         '127.0.0.1';
}

function isValidAction(resultAction, requestedAction) {
  // Validate that the action matches expected values
  const allowedActions = ['homepage', 'login', 'contact', 'api'];
  
  if (!resultAction) return true; // No action is OK
  
  if (requestedAction && resultAction !== requestedAction) {
    return false; // Action mismatch
  }
  
  return allowedActions.includes(resultAction);
}

function isValidHostname(resultHostname, requestHostname) {
  // Validate hostname against expected domains
  if (!resultHostname) return true; // No hostname is OK
  
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    requestHostname,
    'www.sectest-lab.space',
    'sectest-lab.space'
  ];
  
  return allowedDomains.some(domain => 
    resultHostname === domain || 
    resultHostname.endsWith('.vercel.app') ||
    resultHostname.endsWith('.localhost')
  );
}

function isNotExpired(challengeTs) {
  // Check if challenge is not too old (5 minutes max)
  if (!challengeTs) return true;
  
  const challengeTime = new Date(challengeTs).getTime();
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  return (now - challengeTime) <= maxAge;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map();

function checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupRateLimit(windowStart);
  }
  
  return true;
}

function cleanupRateLimit(cutoffTime) {
  for (const [ip, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > cutoffTime);
    if (validRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, validRequests);
    }
  }
}

function logVerificationAttempt(data) {
  // Log for monitoring and analytics
  console.log('Turnstile verification attempt:', {
    timestamp: new Date().toISOString(),
    success: data.success,
    clientIP: data.clientIP,
    hostname: data.hostname,
    responseTime: data.responseTime,
    errorCodes: data.errorCodes,
    validations: data.validations
  });
}