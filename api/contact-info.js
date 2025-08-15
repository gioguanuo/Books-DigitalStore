// /api/contact-info.js - SINTASSI CORRETTA PER VERCEL
export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. CONTROLLO METODO
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // 2. ESTRAI TOKEN
  let token = null;

  if (req.method === 'GET') {
    token = req.query && req.query['cf-turnstile-response'];
  } else if (req.method === 'POST') {
    if (req.body && typeof req.body === 'object') {
      token = req.body['cf-turnstile-response'];
    }
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

  // 4. VERIFICA CON CLOUDFLARE (usando async/await con .then())
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

  // Usa .then() invece di async/await per compatibilità
  fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: secret,
      response: token,
      remoteip: clientIP
    })
  })
  .then(verifyResponse => {
    if (!verifyResponse.ok) {
      return res.status(502).json({
        success: false,
        error: 'Verification service unavailable'
      });
    }
    return verifyResponse.json();
  })
  .then(result => {
    if (result.success !== true) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired Turnstile token',
        'error-codes': result['error-codes'] || []
      });
    }

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
  })
  .catch(error => {
    console.error('Contact-info error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });
}