export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success:false, error:'Method not allowed' });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return res.status(500).json({ success:false, error:'Missing TURNSTILE_SECRET_KEY' });

  const token = req.body?.['cf-turnstile-response'] || req.body?.response;
  if (!token) return res.status(400).json({ success:false, error:'Missing token' });

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);

  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method:'POST', body: form });
  const data = await r.json();         // { success, "error-codes", hostname, action, ... }
  return res.status(data.success ? 200 : 403).json(data);
}
