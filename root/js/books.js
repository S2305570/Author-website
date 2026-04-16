(() => {
  const grid = document.querySelector('#books-grid');
  const status = document.querySelector('[data-books-status]');
  if (!grid) return;

  const getLang = () => document.body?.dataset.lang || 'en';
  const featuredBookCopy = {
    'theres-something-wrong-in-finland': {
      en: {
        description: [
          'This archival material is intended for adult readers. This is not a traditional short story collection.',
          'This book consists of 25 documents, including found notes, diaries, reports, and witness statements from different parts of Finland and from several time periods.',
          'The texts are direct, unsettling, and at times brutal. They offer no comfort.',
          'If dark and unrelenting material does not feel like your kind of reading, this can be left aside. If you continue, read carefully. Approach the material with caution.',
          'Something is wrong in Finland.',
          'And is still here.',
        ],
      },
      fi: {
        description: [
          'T\u00E4m\u00E4 arkistoaineisto on tarkoitettu aikuisille lukijoille. T\u00E4m\u00E4 ei ole perinteinen tarinakokoelma.',
          'T\u00E4m\u00E4 kirja koostuu 25 asiakirjasta; mukaan lukien l\u00F6ydetyist\u00E4 muistiinpanoista, p\u00E4iv\u00E4kirjoista, raporteista ja todistajanlausunnoista eri puolilta Suomea ja useilta aikakausilta.',
          'Tekstit ovat suoria, levottomia ja paikoin julmia. Ne eiv\u00E4t tarjoa helpotusta.',
          'Jos synkk\u00E4 ja kohtuuton aineisto ei tunnu omalta, t\u00E4m\u00E4n voi j\u00E4tt\u00E4\u00E4 v\u00E4liin. Jos jatkat, lue tarkasti. Suhtaudu aineistoon varauksella.',
          'Jokin on vialla Suomessa.',
          'Ja on yh\u00E4 t\u00E4\u00E4ll\u00E4.',
        ],
      },
    },
  };

  let currentBooks = [];

  const getBookDescription = (book) => {
    const lang = featuredBookCopy[book.slug]?.[getLang()] ? getLang() : 'en';
    const localized = featuredBookCopy[book.slug]?.[lang];
    if (localized?.description?.length) {
      return localized.description;
    }

    if (book.longDescription) return [book.longDescription];
    if (book.shortDescription) return [book.shortDescription];
    return [];
  };

  const render = (books) => {
    currentBooks = books;
    if (!books.length) {
      grid.innerHTML = '';
      if (status) status.textContent = 'Books will appear soon.';
      return;
    }

    const html = books
      .map(
        (book) => `
        <article class="book-card${featuredBookCopy[book.slug] ? ' is-featured' : ''}">
          <div class="book-cover">
            ${
              book.coverImageUrl
                ? `<img src="${book.coverImageUrl}" alt="${book.title} cover">`
                : '<div class="placeholder">Cover coming soon</div>'
            }
          </div>
          <h3>${book.title}</h3>
          ${book.subtitle ? `<p class="meta">${book.subtitle}</p>` : ''}
          <div class="book-description">
            ${getBookDescription(book)
              .map((paragraph) => `<p>${paragraph}</p>`)
              .join('')}
          </div>
          <p class="meta">${book.status || 'TBA'} \u00B7 ${book.year || ''}</p>
        </article>`
      )
      .join('');

    grid.innerHTML = html;
    if (status) status.textContent = '';
  };

  const fetchJson = (url) =>
    fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(`Request failed for ${url}`);
      }
      return res.json();
    });

  fetchJson('/api/books')
    .catch(() => fetchJson('data/books.json'))
    .then(render)
    .catch(() => {
      if (status) status.textContent = 'Could not load books right now.';
    });

  document.addEventListener('languagechange', () => {
    if (currentBooks.length) {
      render(currentBooks);
    }
  });
})();
