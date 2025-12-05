const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data', 'books.json');

async function readBooks() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeBooks(books) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
}

function normalizeSlug(value) {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return req.body;
}

module.exports = { DATA_FILE, readBooks, writeBooks, normalizeSlug, parseRequestBody };
