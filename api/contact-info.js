// /api/contact-info.js - VERSIONE SEMPLIFICATA E PROTETTA
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. CONTROLLO METODO
    if (!['GET', 'POST'].includes(req.method)) {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    // 2. ESTRAI TOKEN BASATO SUL METODO
    let token = null;

    if (req.method === 'GET') {
      // Per GET: cerca nel query parameter
      token = req.query && req.query['cf-turnstile-response'];
      console.log('GET request, token from query:', token ? 'present' : 'missing');
      
    } else if (req.method === 'POST') {
      // Per POST: cerca nel body
      if (req.body && typeof req.body === 'object') {
        token = req.body['cf-turnstile-response'];
      }
      console.log('POST request, token from body:', token ? 'present' : 'missing');
    }

    // 3. VERIFICA TOKEN OBBLIGATORIO
    if (!token || typeof token !== 'string') {
      return res.status(401).json({
        success: false,
        error: 'Turnstile verification required',
        message: 'Access denied. Please provide a valid Turnstile token.',
        hint: req.method === 'GET' 
          ? 'Add ?cf-turnstile-response=TOKEN to URL' 
          : 'Include cf-turnstile-response in request body'
      });
    }

    // 4. VERIFICA CON CLOUDFLARE
    const secret = process.env.TURNSTILE_SECRET_KEY;
    
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    const clientIP = req.headers['cf-connecting-ip'] || 
                    req.headers['x-forwarded-for']?.split(',')[0] || 
                    '127.0.0.1';

    console.log('Verifying token with Cloudflare...');

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secret,
        response: token,
        remoteip: clientIP
      })
    });

    if (!verifyResponse.ok) {
      return res.status(502).json({
        success: false,
        error: 'Verification service unavailable'
      });
    }

    const result = await verifyResponse.json();

    if (result.success !== true) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired Turnstile token',
        'error-codes': result['error-codes'] || []
      });
    }

    console.log('Turnstile verification successful');

    // 5. RESTITUISCI DATI PROTETTI
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
      // Dati sensibili per utenti verificati
      sensitive: {
        internalPhone: "+39 02 1234569",
        emergencyContact: "emergency@libreriadigitale.it",
        adminEmail: "admin@libreriadigitale.it"
      }
    };

    return res.status(200).json({
      success: true,
      data: contactInfo,
      method: req.method,
      verified: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact-info error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}