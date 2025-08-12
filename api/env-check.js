// /api/env-check.js
export default function handler(req, res) {
  const s = process.env.TURNSTILE_SECRET_KEY;
  res.status(200).json({ hasSecret: !!s, secretLen: s ? s.length : 0, host: req.headers.host });
}