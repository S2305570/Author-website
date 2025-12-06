const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { readBooks, writeBooks, normalizeSlug } = require('./api/_lib/booksStore');

const app = express();
const PORT = process.env.PORT || 3000;
const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET = 'change-me' } = process.env;
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM, RESEND_API_KEY } = process.env;

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

app.post('/api/contact', async (req, res) => {
  const { name = '', email = '', subject = '', message = '', website = '' } = req.body || {};

  if (website) return res.status(204).end();
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const mailText = [
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Subject: ${subject.trim() || '(none)'}`,
    '',
    message.trim(),
  ].join('\n');

  const inferredDomain = (CONTACT_FROM || CONTACT_TO || '').split('@')[1] || 'example.com';
  const fromAddress = (CONTACT_FROM || `Author Site <no-reply@${inferredDomain}>`).replace(/^['"]|['"]$/g, '');

  if (RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [CONTACT_TO || SMTP_USER],
          reply_to: email.trim(),
          subject: subject.trim() || 'New contact form submission',
          text: mailText,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const msg = errorBody.message || errorBody.error || 'Failed to send message';
        return res.status(500).json({ error: msg });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to send message' });
    }
  }

  const portNumber = Number(SMTP_PORT) || 587;
  const transportOptions = {
    host: SMTP_HOST,
    port: portNumber,
    secure: portNumber === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  };

  if (!transportOptions.host || !transportOptions.auth?.user || !transportOptions.auth?.pass) {
    return res.status(500).json({ error: 'Email is not configured' });
  }

  const transport = nodemailer.createTransport(transportOptions);

  try {
    await transport.sendMail({
      from: CONTACT_FROM || SMTP_USER,
      to: CONTACT_TO || SMTP_USER,
      replyTo: email.trim(),
      subject: subject.trim() || 'New contact form submission',
      text: mailText,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
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
