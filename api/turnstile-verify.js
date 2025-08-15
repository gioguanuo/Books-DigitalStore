// /api/turnstile-verify.js - DEBUG VERSION
export default async function handler(req, res) {
  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Step 1: Log everything we can
    console.log('=== DEBUG START ===');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body type:', typeof req.body);
    console.log('Body content:', req.body);
    console.log('Environment check:', {
      hasSecret: !!process.env.TURNSTILE_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // Step 2: Check secret
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.log('ERROR: No secret key');
      return res.status(500).json({ error: 'No secret key' });
    }

    // Step 3: Try to parse body
    let data = null;
    console.log('Attempting to parse body...');
    
    if (typeof req.body === 'string') {
      console.log('Body is string, parsing JSON...');
      data = JSON.parse(req.body);
    } else {
      console.log('Body is object, using directly...');
      data = req.body;
    }
    
    console.log('Parsed data:', data);

    // Step 4: Extract token
    const token = data ? data['cf-turnstile-response'] : null;
    console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'NULL');

    if (!token) {
      console.log('ERROR: No token found');
      return res.status(400).json({ error: 'No token found' });
    }

    // Step 5: Get IP
    const ip = req.headers['x-forwarded-for'] || 'unknown';
    console.log('Client IP:', ip);

    // Step 6: Try Cloudflare call
    console.log('Making Cloudflare request...');
    
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`
    });

    console.log('Cloudflare response status:', response.status);
    
    const result = await response.json();
    console.log('Cloudflare result:', result);

    // Step 7: Return result
    return res.status(200).json({
      success: result.success,
      result: result,
      debug: 'All steps completed successfully'
    });

  } catch (error) {
    // Detailed error logging
    console.error('=== ERROR DETAILS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error at line:', error.stack?.split('\n')[1]);

    return res.status(500).json({ 
      error: 'Internal error',
      errorName: error.name,
      errorMessage: error.message,
      errorType: typeof error,
      debug: 'Error in catch block'
    });
  }
}