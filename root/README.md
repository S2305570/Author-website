# Author Website

K statinen sivu- ja serverless‑kokonaisuus kirjailijalle V. L. Nikolai. Julkiset sivut (etusivu, about, kirjat, yhteys) ovat puhdasta HTML/CSS/JS:ää ja toimivat Vercelissä ilman buildia. Taustalla on kevyt API kirjojen hallintaan ja yhteydenottojen välittämiseen sähköpostilla, sekä yksinkertainen admin-näkymä.

## Sisältö
- `index.html`, `about.html`, `books.html`, `contact.html`, `admin.html` – sivut
- `css/styles.css` – typografia, layout, teema
- `js/main.js` – navigaatio, kielenvaihto (EN/FI), yhteydenottolomakkeen käsittely
- `js/books.js` – kirjalistan haku ja renderöinti
- `js/admin.js` – kirjautuminen (JWT), kirjojen CRUD
- `api/` – Vercel serverless -reitit (`/api/login`, `/api/contact`, `/api/books`, `/api/books/[id]`)
- `api/_lib/booksStore.js` & `data/books.json` – tiedostopohjainen kirjadatan säilytys
- `dev-server.js` – Express-pohjainen paikallinen dev-palvelin, joka peilaa API-logiikan
- `pictures/` – kansikuvat; `robots.txt`, `sitemap.xml`, `vercel.json`

## Vaatimukset
- Node 18+ suositeltu (Vercelin default)
- npm

## Käyttöönotto paikallisesti
```bash
npm install

# Vaihtoehto 1: Express dev-server (lukee/kirjoittaa data/books.json)
npm run dev:local
# → http://localhost:3000

# Vaihtoehto 2: Vercel CLI, jos haluat serverless-reitit 1:1
npx vercel dev
```

### Admin- ja API-kirjautuminen
1) Aseta `.env` (katso alla).  
2) Mene `http://localhost:3000/admin` (tai `/admin.html`).  
3) Kirjaudu ADM IN_EMAIL/ADMIN_PASSWORD -tiedoilla; saat JWT-tokenin localStorageen.  
4) Token lähetetään `Authorization: Bearer <token>` -otsikossa kirjojen muokkauspyyntöihin.

### Kirjadatan sijainti
- Paikallisesti kaikki muokkaukset menevät tiedostoon `data/books.json`.
- Tuotannossa kannattaa vaihtaa oikeaan tietokantaan, jos useampi käyttäjä tai rinnakkaiset kirjoitukset ovat mahdollisia.

## Ympäristömuuttujat
Katso `.env.example`. Ydinmuuttujat:
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` – admin-kirjautuminen
- `JWT_SECRET` – allekirjoittaa tokenit (vaihda oletus)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` – SMTP, jos et käytä Resendiä
- `RESEND_API_KEY` – vaihtoehto SMTP:lle; käytetään jos asetettu
- `CONTACT_TO`, `CONTACT_FROM` – vastaanottaja/lähettäjä contact-lomakkeelle

## API-pikaohje
Kaikki palauttavat JSON:ia.

- `POST /api/login` → `{ token }` kun ADMIN_EMAIL/PASSWORD täsmää
- `POST /api/contact` body: `name`, `email`, `subject?`, `message`, `website?` (honeypot)  
  Lähettää sähköpostin Resend-API:lla jos `RESEND_API_KEY`, muuten SMTP:llä.

### Kirjat
- `GET /api/books` → lista
- `POST /api/books` (Bearer JWT vaadittu) → lisää kirja. Pakolliset: `title`, `year`, `status`, `shortDescription`, `longDescription`, `coverImageUrl`. `slug` generoidaan otsikosta jos puuttuu.
- `GET /api/books/:id` → yksittäinen
- `PUT /api/books/:id` (Bearer) → päivitys, yllä olevat kentät sallittuja; `slug` normalisoidaan
- `DELETE /api/books/:id` (Bearer) → poisto

## Frontend-muistiinpanot
- Kielenvaihto EN/FI tallennetaan localStorageen (`js/main.js`).
- Kirjalista renderöidään API:n vastauksesta (`js/books.js`).
- Yhteydenottolomake postaa `/api/contact`iin ja näyttää tilaviestit (`js/main.js`).
- Admin-näkymä (`admin.html`) käyttää samoja API-reittejä kuin julkinen kirjadata.

## Deploy
- Vercel-konfiguraatio `vercel.json` käyttää `cleanUrls`ia ja ohjaa `/admin` → `/admin.html`.
- Ei erillistä buildia; staattiset tiedostot ja `api/`-funktiot riittävät.
