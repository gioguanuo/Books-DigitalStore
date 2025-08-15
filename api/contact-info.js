// /api/contact-info.js - GET E POST PROTETTI CON TURNSTILE
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. CONTROLLO METODO: Solo GET e POST permessi
    if (!['GET', 'POST'].includes(req.method)) {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        'error-codes': ['method-not-allowed'],
        message: 'Only GET and POST methods are allowed'
      });
    }

    // 2. VERIFICA TURNSTILE OBBLIGATORIA PER ENTRAMBI I METODI
    console.log(`${req.method} request detected, verifying Turnstile token...`);
    
    const turnstileResult = await verifyTurnstileToken(req);
    
    if (!turnstileResult.success) {
      return res.status(401).json({
        success: false,
        error: 'Turnstile verification required',
        'error-codes': turnstileResult.errorCodes,
        message: 'Access denied. Please complete the anti-bot verification.',
        hint: 'Include cf-turnstile-response token in request body (POST) or Authorization header (GET)',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Turnstile verification successful for ${req.method} request`);

    // 3. RESTITUISCI DATI CONTACT INFO (ora accessibili solo con verifica)
    const contactInfo = {
      company: "Libreria Digitale",
      address: {
        street: "Via dei Libri 123",
        city: "Milano",
        country: "Italia",
        zipCode: "20121"
      },
      phone: "+39 02 1234567",
      email: "info@libreriadigitale.it",
      socialMedia: {
        facebook: "libreriadigitale",
        twitter: "@libreriadigit",
        instagram: "libreria_digitale",
        linkedin: "libreria-digitale"
      },
      businessHours: {
        monday: "9:00-18:00",
        tuesday: "9:00-18:00",
        wednesday: "9:00-18:00",
        thursday: "9:00-18:00",
        friday: "9:00-18:00",
        saturday: "9:00-13:00",
        sunday: "Chiuso"
      },
      support: {
        email: "support@libreriadigitale.it",
        phone: "+39 02 1234568",
        hours: "Lun-Ven 9:00-17:00"
      },
      // Dati sensibili (ora sempre inclusi per richieste verificate)
      sensitive: {
        internalPhone: "+39 02 1234569",
        emergencyContact: "emergency@libreriadigitale.it",
        adminEmail: "admin@libreriadigitale.it",
        directManagerPhone: "+39 02 1234570",
        securityContact: "security@libreriadigitale.it"
      },
      lastUpdated: new Date().toISOString(),
      accessLevel: "verified-user"
    };

    return res.status(200).json({
      success: true,
      data: contactInfo,
      method: req.method,
      verified: true,
      accessGranted: new Date().toISOString(),
      message: "Access granted to verified user",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact-info error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      'error-codes': ['internal-error'],
      timestamp: new Date().toISOString()
    });
  }
}

// FUNZIONE DI VERIFICA TURNSTILE (supporta GET e POST)
async function verifyTurnstileToken(req) {
  try {
    let token = null;

    // Estrazione token basata sul metodo HTTP
    if (req.method === 'GET') {
      // Per GET: cerca il token nell'header Authorization o query parameter
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      } else {
        // Fallback: query parameter
        token = req.query['cf-turnstile-response'];
      }
      
      console.log('GET request - token source:', authHeader ? 'Authorization header' : 'Query parameter');
      
    } else if (req.method === 'POST') {
      // Per POST: cerca il token nel body
      const contentType = req.headers['content-type'] || '';

      if (contentType.includes('application/x-www-form-urlencoded')) {
        if (typeof req.body === 'string') {
          const params = new URLSearchParams(req.body);
          token = params.get('cf-turnstile-response');
        } else if (req.body && typeof req.body === 'object') {
          token = req.body['cf-turnstile-response'];
        }
      } else if (contentType.includes('application/json')) {
        if (typeof req.body === 'string') {
          const parsed = JSON.parse(req.body);
          token = parsed['cf-turnstile-response'];
        } else if (req.body && typeof req.body === 'object') {
          token = req.body['cf-turnstile-response'];
        }
      }
      
      console.log('POST request - content type:', contentType);
    }

    console.log('Token extracted:', token ? 'YES' : 'NO');

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return {
        success: false,
        errorCodes: ['missing-input-response']
      };
    }

    // Verifica con Cloudflare
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not configured');
      return {
        success: false,
        errorCodes: ['server-configuration-error']
      };
    }

    const clientIP = req.headers['cf-connecting-ip'] || 
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    '127.0.0.1';

    console.log('Verifying with Cloudflare for IP:', clientIP);

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
      return {
        success: false,
        errorCodes: ['verification-service-error']
      };
    }

    const result = await verifyResponse.json();
    
    console.log('Cloudflare verification result:', {
      success: result.success,
      errorCodes: result['error-codes']
    });
    
    return {
      success: result.success === true,
      errorCodes: result['error-codes'] || []
    };

  } catch (error) {
    console.error('Turnstile verification error:', error);
    return {
      success: false,
      errorCodes: ['verification-internal-error']
    };
  }
}
}