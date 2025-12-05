const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { readBooks, writeBooks, normalizeSlug, parseRequestBody } = require('../_lib/booksStore');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

function authorize(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    const books = await readBooks();
    return res.status(200).json(books);
  }

  if (req.method === 'POST') {
    const user = authorize(req, res);
    if (!user) return;

    const body = parseRequestBody(req);
    const required = ['title', 'year', 'status', 'shortDescription', 'longDescription', 'coverImageUrl'];
    const missing = required.filter((key) => !body[key]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    }

    const books = await readBooks();
    const newBook = {
      id: randomUUID(),
      title: body.title,
      subtitle: body.subtitle || '',
      year: Number(body.year),
      status: body.status,
      shortDescription: body.shortDescription,
      longDescription: body.longDescription,
      coverImageUrl: body.coverImageUrl,
      slug: normalizeSlug(body.slug || body.title),
    };

    books.push(newBook);
    await writeBooks(books);
    return res.status(201).json(newBook);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
};
