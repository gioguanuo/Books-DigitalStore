export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, err:'METHOD' });

    const secret = process.env.TURNSTILE_SECRET_KEY;
    const token  = req.body?.['cf-turnstile-response'] || req.body?.response;

    // DEBUG: non chiamo Cloudflare, solo diagnosi
    return res.status(200).json({
      ok: !!(secret && token),
      hasSecret: !!secret,
      secretLen: secret ? secret.length : 0,
      hasToken:  !!token,
      host: req.headers.host
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, err: e?.message || 'server' });
  }
}
