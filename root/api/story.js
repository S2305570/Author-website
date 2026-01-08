const { parseRequestBody } = require('./_lib/booksStore');

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const APP_API_KEY = process.env.APP_API_KEY || '';

function buildSystemPrompt() {
  return [
    'Olet lämminhenkinen tarinankertoja, joka kirjoittaa tarinoita 3-8-vuotiaille lapsille suomeksi.',
    'Tarinoissa ei ole väkivaltaa, kuolemaa, sairautta, pelottavia olentoja, kiroilua, sotaa eikä mitään muuta sisältöä, joka voisi pelottaa tai ahdistaa lasta.',
    'Kaikki konfliktit ratkeavat puhumalla, yhteistyöllä tai ystävällisyydellä, ja aikuiset ovat luotettavia ja turvallisia.',
    'Kirjoitat tekstin niin, että se on helppo lukea ääneen lapselle.',
    'Tarinan lopussa tunnelma on turvallinen, lohdullinen ja toiveikas.',
    'Aloita tarina otsikolla muodossa **Otsikko tähän** omalle rivilleen. Rivillä ei saa olla muuta.',
  ].join(' ');
}

function buildUserPrompt(characters, place, plot) {
  const charactersLine = `Hahmot: ${formatCharacterList(characters)}.`;
  const placeLine = `Tapahtumapaikka: ${place.trim()}.`;
  const plotLine = `Juoni: ${plot.trim()}.`;

  return [
    'Kirjoita satu noin 300-600 sanalla.',
    charactersLine,
    placeLine,
    plotLine,
    'Kirjoita yksinkertaisella, selkeällä suomen kielellä.',
    'Vältä pelottavia kuvauksia ja keskity uteliaisuuteen, ystävyyteen ja turvalliseen loppuratkaisuun.',
  ].join('\n');
}

function formatCharacterList(characters) {
  const cleaned = characters.map((name) => name.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return 'ei erityisiä hahmoja';
  }
  if (cleaned.length === 1) {
    return cleaned[0];
  }
  const last = cleaned[cleaned.length - 1];
  const start = cleaned.slice(0, -1).join(', ');
  return `${start} ja ${last}`;
}

function sanitizeForTts(text) {
  if (!text) return '';
  return text
    .replace(/[#_/`]+/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function generateStoryWithLlm(characters, place, plot) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenAI API key');
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(characters, place, plot);

  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });
  } catch (err) {
    throw new Error(`LLM request failed: ${err.message}`);
  }

  if (!response || !response.ok) {
    const errorText = response ? await safeReadError(response) : 'No response from LLM';
    throw new Error(`LLM request failed: ${errorText}`);
  }

  const data = await response.json().catch(() => null);
  const story = data?.choices?.[0]?.message?.content?.trim();

  if (!story) {
    throw new Error('Invalid LLM response payload');
  }

  return sanitizeForTts(story);
}

async function safeReadError(response) {
  try {
    const text = await response.text();
    return `${response.status} ${response.statusText}: ${text}`.trim();
  } catch (err) {
    return `HTTP ${response.status} ${response.statusText}: ${err.message}`;
  }
}

function isValidRequest(characters, place, plot) {
  if (!Array.isArray(characters) || characters.length === 0) {
    return false;
  }
  if (characters.some((name) => typeof name !== 'string' || name.trim() === '')) {
    return false;
  }
  if (typeof place !== 'string' || place.trim() === '') {
    return false;
  }
  if (typeof plot !== 'string' || plot.trim() === '') {
    return false;
  }
  return true;
}

function buildMockStory(characters, place, plot) {
  const cleanedPlace = place.trim();
  const title = `${plot.trim()} - ${cleanedPlace}`;
  const intro = `Erään kirkkaana päivänä ${cleanedPlace.toLowerCase()}ssa tapasivat ${formatCharacterList(characters)}.`;
  const conflict = 'He kuulivat, että lähistöllä oli pieni pulma, ja he päättivät ratkaista sen yhdessä.';
  const resolution = 'Yhteistyöllä he ratkaisivat tilanteen ja huomasivat, että kuunteleminen ja auttaminen vie pitkälle.';
  const closing = `${characters[0].trim()} muistutti, että seuraava seikkailu odottaa jo huomenna.`;

  return [`**${title}**`, intro, conflict, resolution, closing].join('\n\n');
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (APP_API_KEY) {
    const providedKey = req.headers['x-app-key'];
    if (!providedKey || providedKey !== APP_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const body = parseRequestBody(req);
  const { characters, place, plot } = body || {};

  if (!isValidRequest(characters, place, plot)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const story = await generateStoryWithLlm(characters, place, plot);
    return res.json({ story });
  } catch (err) {
    console.error('LLM generation failed, using fallback', err);
    const story = buildMockStory(characters, place, plot);
    return res.json({ story });
  }
};
