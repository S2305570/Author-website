const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const { readBooks, writeBooks, normalizeSlug } = require('./api/_lib/booksStore');

const app = express();
const PORT = process.env.PORT || 3000;
const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET = 'change-me' } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const authorize = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/login', (req, res) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Auth env vars not configured' });
  }
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/books', async (_req, res) => {
  const books = await readBooks();
  res.json(books);
});

app.post('/api/books', authorize, async (req, res) => {
  const body = req.body || {};
  const required = ['title', 'year', 'status', 'shortDescription', 'longDescription', 'coverImageUrl'];
  const missing = required.filter((key) => !body[key]);
  if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

  const books = await readBooks();
  const newBook = {
    id: crypto.randomUUID(),
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
  res.status(201).json(newBook);
});

app.get('/api/books/:id', async (req, res) => {
  const books = await readBooks();
  const book = books.find((b) => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

app.put('/api/books/:id', authorize, async (req, res) => {
  const books = await readBooks();
  const index = books.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });

  const body = req.body || {};
  const updated = { ...books[index], ...body, id: req.params.id };
  if (body.title && !body.slug) updated.slug = normalizeSlug(body.title);
  if (body.slug) updated.slug = normalizeSlug(body.slug);
  if (body.year) updated.year = Number(body.year);

  books[index] = updated;
  await writeBooks(books);
  res.json(updated);
});

app.delete('/api/books/:id', authorize, async (req, res) => {
  const books = await readBooks();
  const index = books.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  books.splice(index, 1);
  await writeBooks(books);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
});
