const jwt = require('jsonwebtoken');
const { parseRequestBody } = require('./_lib/booksStore');

const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: 'Auth env vars not configured' });
  }

  const body = parseRequestBody(req);
  if (body.email === ADMIN_EMAIL && body.password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email: body.email }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};
