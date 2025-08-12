// /api/turnstile-verify.js
export const config = { api: { bodyParser: true } }; // forza il parser

function getToken(req) {
  try {
    if (typeof req.body === 'string') {
      const j = JSON.parse(req.body);
      return j['cf-turnstile-response'] || j.response || null;
    }
    if (typeof req.body === 'object' && req.body) {
      return req.body['cf-turnstile-response'] || req.body.response || null;
    }
    return null;
  } catch { return null; }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ success:false, error:'Method not allowed' });

    const secret = process.env.TURNSTILE_SECRET_KEY || '';
    const token  = getToken(req);

    // DIAGNOSTICA: niente chiamata a Cloudflare finché non vediamo ok
    return res.status(200).json({
      success: !!(secret && token),
      hasSecret: !!secret,
      secretLen: secret.length,
      hasToken: !!token,
      bodyType: typeof req.body,
    });
  } catch (e) {
    return res.status(500).json({ success:false, error: e?.message || 'server' });
  }
}

