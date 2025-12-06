(() => {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');

  if (nav && toggle) {
    const closeNav = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 900px)').matches) {
          closeNav();
        }
      });
    });

    document.addEventListener('keyup', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
      }
    });
  }

  const page = document.body?.dataset.page;
  if (page) {
    document.querySelectorAll('.nav-list a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const name = href.replace('.html', '');
      if (name === page) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear().toString();
  });

  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.books': 'Books',
      'nav.contact': 'Contact',
      'hero.kicker': 'Anthology / Early 2026',
      'hero.title': "There's Something Wrong in Finland",
      'hero.lede':
        'Found-footage and folklore-inspired stories across Finland. The first release is a 25-story anthology framed like recovered documents and testimony.',
      'hero.cta.primary': 'View the book',
      'hero.cta.secondary': 'Contact',
      'hero.meta.one': '25 stories from Finland / Found-footage folklore / Publishing early 2026',
      'hero.meta.two': 'Tone: evidence-style horror that feels real',
      'about.heading': 'About the author',
      'about.subhead':
        'Working across centuries, from shadowed battlefields to quiet lakeside cabins and present-day apartments that never feel entirely empty. The work follows the faint disturbances between reality and an echo, inside which something old still lingers - uninvited and unfinished.',
      'about.card1.title': 'Found-footage tone',
      'about.card1.body':
        'Fragments, transcripts, field notes and half-lost voices. Stories built not as narratives, but as evidence - the kind you were never meant to read.',
      'about.card2.title': 'Folklore in the cracks',
      'about.card2.body':
        'The stories hinge on uncertainty: everything remains plausible in the real world, even when the old stories feel uncomfortably compatible with the details.',
      'about.card3.title': 'Framing',
      'about.card3.body':
        'The material is treated as evidence: plain, understated, and fully compatible with everyday explanations. The unease comes not from what is shown, but from what remains uncrossed, unfinished or unexplained.',
      'footer.tagline': 'Stories that feel like evidence from stranger corners of Finland.',
      'aboutpage.badge': 'Finland',
      'aboutpage.heading': 'About the author',
      'aboutpage.p1':
        'Working across centuries, from shadowed battlefields to quiet lakeside cabins and present-day apartments that never feel entirely empty. The work follows the faint disturbances between reality and an echo, inside which something old still lingers - uninvited and unfinished.',
      'aboutpage.p2':
        'The material is treated as evidence: plain, understated, and fully compatible with everyday explanations. The unease comes not from what is shown, but from what remains uncrossed, unfinished or unexplained.',
      'aboutpage.photo': 'Author photo placeholder',
      'books.heading': 'Books',
      'books.intro': 'The first release arrives early 2026. Future titles will be added as they form.',
      'books.card1.title': "There's Something Wrong in Finland",
      'books.card1.body':
        'An anthology of 25 stories across Finland, told like recovered documents and interviews. Found-footage folklore horror meant to feel real.',
      'books.card1.meta': 'Publishing early 2026',
      'books.card2.title': 'Next project',
      'books.card2.body': 'Details to come.',
      'books.card2.meta': 'To be announced',
      'contact.heading': 'Contact',
      'contact.intro': 'Email me for readings, interviews, events, or collaboration ideas.',
      'contact.note': 'Send a message with the form below and I will reply by email.',
      'contact.instagram': 'Instagram @V.L.Nikolai',
      'contact.youtube': 'YouTube',
      'contact.form.name': 'Name',
      'contact.form.email': 'Email',
      'contact.form.subject': 'Subject (optional)',
      'contact.form.message': 'Message',
      'contact.form.submit': 'Send message',
      'contact.form.sending': 'Sending...',
      'contact.form.success': 'Thanks! Your message was sent.',
      'contact.form.error': 'Could not send the message right now.',
      'contact.form.required': 'Name, email, and message are required.',
    },
    fi: {
      'nav.home': 'Etusivu',
      'nav.about': 'Kirjailijasta',
      'nav.books': 'Teokset',
      'nav.contact': 'Yhteys',
      'hero.kicker': 'Antologia / Alkuvuosi 2026',
      'hero.title': "There's Something Wrong in Finland",
      'hero.lede':
        'Found footage -henkiset, folkloreen nojaavat tarinat ymp„ri Suomea. Ensimm„inen julkaisu on 25 tarinan antologia, kehystetty l”ydettyin„ dokumentteina ja todistuksina.',
      'hero.cta.primary': 'Katso kirja',
      'hero.cta.secondary': 'Ota yhteytt„',
      'hero.meta.one': '25 tarinaa Suomesta / Found-footage folklore / Julkaistaan alkuvuonna 2026',
      'hero.meta.two': 'S„vy: dokumenttimainen kauhu, joka tuntuu todelta',
      'about.heading': 'Kirjailijasta',
      'about.subhead':
        'Liikun vuosisatojen halki: h„m„rilt„ taistelukentilt„ hiljaisille rantam”keille ja nykyisiin asuntoihin, jotka eiv„t koskaan tunnu t„ysin tyhjilt„. Seuraan h„iri”it„ todellisuuden ja kaikuina palaavan menneen v„lill„ - jotakin vanhaa j„„ j„ljelle, kutsumatta ja kesken.',
      'about.card1.title': 'Found-footage -s„vy',
      'about.card1.body':
        'Sirpaleita, transkriptioita, kentt„muistiinpanoja ja puoliksi kadonneita „„ni„. Tarinat rakennetaan todisteiksi, ei kertomuksiksi - sellaisiksi, joita ei ollut tarkoitus lukea.',
      'about.card2.title': 'Folklore raoissa',
      'about.card2.body':
        'Ep„varmuus kantaa: kaikki pysyy mahdollisena todellisessa maailmassa, vaikka vanhat tarinat sopisivat h„tk„hdytt„v„n hyvin yksityiskohtiin.',
      'about.card3.title': 'Kehyst„minen',
      'about.card3.body':
        'Aineistoa kohdellaan todisteena: pelkistettyn„, hillittyn„ ja arjen selitysten kanssa t„ysin yhteensopivana. Levottomuus syntyy siit„, mik„ j„„ yliviivaamatta, kesken tai selitt„m„tt„.',
      'footer.tagline': 'Tarinoita, jotka tuntuvat todisteilta Suomen oudommista kulmista.',
      'aboutpage.badge': 'Suomi',
      'aboutpage.heading': 'Kirjailijasta',
      'aboutpage.p1':
        'Liikun vuosisatojen halki: h„m„rilt„ taistelukentilt„ hiljaisille rantam”keille ja nykyisiin asuntoihin, jotka eiv„t koskaan tunnu t„ysin tyhjilt„. Seuraan h„iri”it„ todellisuuden ja kaikuina palaavan menneen v„lill„ - jotakin vanhaa j„„ j„ljelle, kutsumatta ja kesken.',
      'aboutpage.p2':
        'Aineistoa kohdellaan todisteena: pelkistettyn„, hillittyn„ ja arjen selitysten kanssa t„ysin yhteensopivana. Levottomuus syntyy siit„, mik„ j„„ yliviivaamatta, kesken tai selitt„m„tt„.',
      'aboutpage.photo': 'Kirjailijan kuva t„h„n',
      'books.heading': 'Teokset',
      'books.intro': 'Ensimm„inen julkaisu tulee alkuvuodesta 2026. Uudet nimet lis„t„„n kun ne muotoutuvat.',
      'books.card1.title': "There's Something Wrong in Finland",
      'books.card1.body':
        '25 tarinaa Suomesta, kerrottuna l”ydettyin„ dokumentteina ja haastatteluina. Found-footage folklore -kauhua, joka tuntuu todelta.',
      'books.card1.meta': 'Julkaistaan alkuvuonna 2026',
      'books.card2.title': 'Seuraava projekti',
      'books.card2.body': 'Lis„tiedot my”hemmin.',
      'books.card2.meta': 'Ilmoitetaan my”hemmin',
      'contact.heading': 'Yhteys',
      'contact.intro': 'Laita s„hk”postia esiintymisist„, haastatteluista, tapahtumista tai ideoista.',
      'contact.note': 'L„het„ viesti lomakkeella, vastaan s„hk”postitse.',
      'contact.instagram': 'Instagram @V.L.Nikolai',
      'contact.youtube': 'YouTube',
      'contact.form.name': 'Nimi',
      'contact.form.email': 'S„hk”posti',
      'contact.form.subject': 'Aihe (valinnainen)',
      'contact.form.message': 'Viesti',
      'contact.form.submit': 'L„het„ viesti',
      'contact.form.sending': 'L„hetet„„n...',
      'contact.form.success': 'Kiitos! Viesti l„hetettiin.',
      'contact.form.error': 'Viestin l„hetys ep„onnistui.',
      'contact.form.required': 'Nimi, s„hk”posti ja viesti ovat pakollisia.',
    },
  };

  const getLang = () => document.body?.dataset.lang || 'en';
  const t = (key) => translations[getLang()]?.[key] || translations.en[key] || key;

  const applyLanguage = (lang) => {
    const targetLang = translations[lang] ? lang : 'en';
    const dict = translations[targetLang];
    document.documentElement.setAttribute('lang', targetLang);
    document.body.dataset.lang = targetLang;

    document.querySelectorAll('.lang-switch a').forEach((link) => {
      const isActive = link.dataset.lang === targetLang;
      link.classList.toggle('is-active', isActive);
      link.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const text = dict[key];
      if (text) {
        el.textContent = text;
      }
    });

    try {
      localStorage.setItem('siteLang', targetLang);
    } catch {
      // storage might be blocked; ignore
    }
  };

  const savedLang = (() => {
    try {
      return localStorage.getItem('siteLang');
    } catch {
      return null;
    }
  })();

  applyLanguage(savedLang || document.documentElement.lang || 'en');

  document.querySelectorAll('.lang-switch a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const lang = link.dataset.lang;
      applyLanguage(lang);
    });
  });

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const statusEl = document.querySelector('#contact-status');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const setStatus = (message, tone = 'info') => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.style.color = tone === 'error' ? '#ff7b54' : '#aeb3c0';
    };

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const payload = {
        name: (formData.get('name') || '').toString(),
        email: (formData.get('email') || '').toString(),
        subject: (formData.get('subject') || '').toString(),
        message: (formData.get('message') || '').toString(),
        website: (formData.get('website') || '').toString(),
      };

      if (!payload.name.trim() || !payload.email.trim() || !payload.message.trim()) {
        setStatus(t('contact.form.required'), 'error');
        return;
      }

      const originalText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t('contact.form.sending');
      }
      setStatus(t('contact.form.sending'));

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          contactForm.reset();
          setStatus(t('contact.form.success'));
        } else {
          setStatus(data.error || t('contact.form.error'), 'error');
        }
      } catch {
        setStatus(t('contact.form.error'), 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText || t('contact.form.submit');
        }
      }
    });
  }
})();
