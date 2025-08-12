// /api/turnstile-verify.js - TEST SE TROVA LA SECRET KEY
export default async function handler(req, res) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  
  console.log('=== ENVIRONMENT CHECK ===');
  console.log('Secret exists:', !!secret);
  console.log('Secret starts with:', secret?.substring(0, 8) + '...' || 'NONE');
  console.log('All ENV keys with TURN:', Object.keys(process.env).filter(k => k.includes('TURN')));
  
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    hasSecret: !!secret,
    secretPreview: secret ? secret.substring(0, 8) + '...' : 'NOT_FOUND',
    environmentCheck: 'OK',
    message: secret ? 'SECRET KEY TROVATA!' : 'SECRET KEY MANCANTE'
  });
}