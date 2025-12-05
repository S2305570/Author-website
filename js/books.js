(() => {
  const grid = document.querySelector('#books-grid');
  const status = document.querySelector('[data-books-status]');
  if (!grid) return;

  const render = (books) => {
    if (!books.length) {
      grid.innerHTML = '';
      if (status) status.textContent = 'Books will appear soon.';
      return;
    }

    const html = books
      .map(
        (book) => `
        <article class="book-card">
          <div class="book-cover">
            ${
              book.coverImageUrl
                ? `<img src="${book.coverImageUrl}" alt="${book.title} cover">`
                : '<div class="placeholder">Cover coming soon</div>'
            }
          </div>
          <h3>${book.title}</h3>
          ${book.subtitle ? `<p class="meta">${book.subtitle}</p>` : ''}
          <p>${book.shortDescription || ''}</p>
          <p class="meta">${book.status || 'TBA'} · ${book.year || ''}</p>
        </article>`
      )
      .join('');

    grid.innerHTML = html;
    if (status) status.textContent = '';
  };

  fetch('/api/books')
    .then((res) => (res.ok ? res.json() : []))
    .then(render)
    .catch(() => {
      if (status) status.textContent = 'Could not load books right now.';
    });
})();
