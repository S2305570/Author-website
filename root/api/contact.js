const nodemailer = require('nodemailer');
const { parseRequestBody } = require('./_lib/booksStore');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_TO,
  CONTACT_FROM,
  RESEND_API_KEY,
} = process.env;

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = parseRequestBody(req);
  const { name = '', email = '', subject = '', message = '', website = '' } = body || {};

  // Honeypot field to reduce spam bots
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
};
