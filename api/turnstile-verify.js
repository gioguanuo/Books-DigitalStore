// /api/turnstile-verify.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metodo non consentito' });
  }

  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ success: false, error: 'TURNSTILE_SECRET_KEY non configurata' });
    }

    // Leggi il token dal body (JSON o x-www-form-urlencoded)
    const token =
      (typeof req.body === 'object' && (req.body['cf-turnstile-response'] || req.body.response)) ||
      null;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token mancante' });
    }

    // IP del visitatore (best effort)
    const remoteIp =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      undefined;

    // Prepara payload per Siteverify (URL-encoded)
    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (remoteIp) form.append('remoteip', remoteIp);
    // (Opzionale) idempotency per eventuali retry controllati
    try {
      form.append('idempotency_key', crypto.randomUUID());
    } catch {}

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });

    const data = await verify.json(); // { success, "error-codes", hostname, action, ... }

    // Controlli extra opzionali (allinea queste variabili ai tuoi valori reali)
    const EXPECTED_ACTION = 'homepage'; // cambia se usi un altro data-action o rimuovi il check
    const ALLOWED_HOSTS = ['www.sectest-lab.space', 'sectest-lab.space'];

    const ok =
      data.success === true &&
      (data.action ? data.action === EXPECTED_ACTION : true) &&
      (data.hostname ? ALLOWED_HOSTS.includes(data.hostname) : true);

    return res.status(ok ? 200 : 403).json({ ok, ...data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Errore server' });
  }
}
