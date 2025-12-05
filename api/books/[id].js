const jwt = require('jsonwebtoken');
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
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'Book id required' });

  const books = await readBooks();
  const index = books.findIndex((book) => book.id === id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });

  if (req.method === 'GET') {
    return res.status(200).json(books[index]);
  }

  const user = authorize(req, res);
  if (!user) return;

  if (req.method === 'PUT') {
    const body = parseRequestBody(req);
    const updated = { ...books[index], ...body, id };

    if (body.title && !body.slug) updated.slug = normalizeSlug(body.title);
    if (body.slug) updated.slug = normalizeSlug(body.slug);
    if (body.year) updated.year = Number(body.year);

    books[index] = updated;
    await writeBooks(books);
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    books.splice(index, 1);
    await writeBooks(books);
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method Not Allowed' });
};
