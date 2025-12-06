(() => {
  const tokenKey = 'authorAdminToken';
  let authToken = (() => {
    try {
      return localStorage.getItem(tokenKey) || '';
    } catch {
      return '';
    }
  })();
  let editingId = null;

  const els = {
    loginPanel: document.querySelector('#login-panel'),
    sessionPanel: document.querySelector('#session-panel'),
    managePanel: document.querySelector('#manage-panel'),
    formPanel: document.querySelector('#form-panel'),
    loginForm: document.querySelector('#login-form'),
    loginStatus: document.querySelector('#login-status'),
    logoutBtn: document.querySelector('#logout-btn'),
    bookList: document.querySelector('#book-list'),
    form: document.querySelector('#book-form'),
    formTitle: document.querySelector('#form-title'),
    submitBtn: document.querySelector('#book-submit'),
    cancelBtn: document.querySelector('#book-cancel'),
    alert: document.querySelector('#admin-alert'),
  };

  const getFormValues = () => ({
    title: els.form.title.value.trim(),
    subtitle: els.form.subtitle.value.trim(),
    year: els.form.year.value,
    status: els.form.status.value.trim(),
    shortDescription: els.form.shortDescription.value.trim(),
    longDescription: els.form.longDescription.value.trim(),
    coverImageUrl: els.form.coverImageUrl.value.trim(),
    slug: els.form.slug.value.trim(),
  });

  const setAuthUI = (authed) => {
    els.loginPanel.hidden = authed;
    els.sessionPanel.hidden = !authed;
    els.managePanel.hidden = !authed;
    els.formPanel.hidden = !authed;
    if (!authed) {
      els.loginStatus.textContent = 'Enter admin credentials to continue.';
    }
  };

  const setAlert = (message, tone = 'info') => {
    if (!els.alert) return;
    els.alert.textContent = message || '';
    els.alert.style.color = tone === 'error' ? '#ff7b54' : '#aeb3c0';
  };

  const authHeaders = () => (authToken ? { Authorization: `Bearer ${authToken}` } : {});

  const renderBooks = (books) => {
    if (!els.bookList) return;
    if (!books.length) {
      els.bookList.innerHTML = '<p class="meta">No books yet. Add one below.</p>';
      return;
    }

    const html = books
      .map(
        (book) => `
        <article class="book-card" data-id="${book.id}">
          <div class="book-cover">
            ${
              book.coverImageUrl
                ? `<img src="${book.coverImageUrl}" alt="${book.title} cover">`
                : '<div class="placeholder">Cover coming soon</div>'
            }
          </div>
          <h3>${book.title}</h3>
          <p class="meta">${book.subtitle || ''}</p>
          <p class="meta">${book.status} · ${book.year || 'Year TBA'}</p>
          <p>${book.shortDescription || ''}</p>
          <div class="hero-actions">
            <button class="button secondary" type="button" data-action="edit">Edit</button>
            <button class="button" type="button" data-action="delete">Delete</button>
          </div>
        </article>`
      )
      .join('');

    els.bookList.innerHTML = html;
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const books = res.ok ? await res.json() : [];
      renderBooks(books);
      setAlert('');
    } catch {
      setAlert('Could not load books.', 'error');
    }
  };

  const resetForm = () => {
    editingId = null;
    els.form.reset();
    els.submitBtn.textContent = 'Create book';
    els.cancelBtn.hidden = true;
    els.formTitle.textContent = 'Add a book';
  };

  const handleEditFill = (book) => {
    editingId = book.id;
    els.form.title.value = book.title || '';
    els.form.subtitle.value = book.subtitle || '';
    els.form.year.value = book.year || '';
    els.form.status.value = book.status || '';
    els.form.shortDescription.value = book.shortDescription || '';
    els.form.longDescription.value = book.longDescription || '';
    els.form.coverImageUrl.value = book.coverImageUrl || '';
    els.form.slug.value = book.slug || '';
    els.submitBtn.textContent = 'Save changes';
    els.cancelBtn.hidden = false;
    els.formTitle.textContent = 'Edit book';
  };

  if (els.cancelBtn) {
    els.cancelBtn.addEventListener('click', resetForm);
  }

  if (els.loginForm) {
    els.loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(els.loginForm);
      const payload = {
        email: formData.get('email'),
        password: formData.get('password'),
      };

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          els.loginStatus.textContent = 'Invalid credentials.';
          return;
        }

        const data = await res.json();
        authToken = data.token;
        localStorage.setItem(tokenKey, authToken);
        els.loginStatus.textContent = 'Logged in.';
        setAuthUI(true);
        await fetchBooks();
      } catch {
        els.loginStatus.textContent = 'Login failed. Try again.';
      }
    });
  }

  if (els.logoutBtn) {
    els.logoutBtn.addEventListener('click', () => {
      authToken = '';
      localStorage.removeItem(tokenKey);
      setAuthUI(false);
      resetForm();
    });
  }

  if (els.form) {
    els.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = getFormValues();
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/books/${editingId}` : '/api/books';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          setAlert(error.error || 'Save failed.', 'error');
          return;
        }

        await fetchBooks();
        resetForm();
        setAlert(editingId ? 'Book updated.' : 'Book created.');
      } catch {
        setAlert('Network error while saving.', 'error');
      }
    });
  }

  if (els.bookList) {
    els.bookList.addEventListener('click', async (event) => {
      const action = event.target?.dataset?.action;
      if (!action) return;

      const card = event.target.closest('[data-id]');
      if (!card) return;
      const id = card.dataset.id;

      if (action === 'edit') {
        try {
          const res = await fetch(`/api/books/${id}`);
          if (res.ok) {
            const book = await res.json();
            handleEditFill(book);
          }
        } catch {
          setAlert('Could not load book.', 'error');
        }
      }

      if (action === 'delete') {
        const confirmDelete = window.confirm('Delete this book?');
        if (!confirmDelete) return;
        try {
          const res = await fetch(`/api/books/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
          });
          if (res.ok || res.status === 204) {
            await fetchBooks();
            resetForm();
            setAlert('Book deleted.');
          } else {
            setAlert('Delete failed.', 'error');
          }
        } catch {
          setAlert('Network error while deleting.', 'error');
        }
      }
    });
  }

  setAuthUI(Boolean(authToken));
  if (authToken) fetchBooks();
})();
