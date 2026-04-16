(() => {
  const body = document.body;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LANGUAGE_TRANSITION_MS = 180;
  let languageTransitionTimer = null;

  if (body) {
    if (prefersReducedMotion) {
      body.classList.add('page-ready');
    } else {
      requestAnimationFrame(() => {
        body.classList.add('page-ready');
      });
    }
  }

  if (!prefersReducedMotion) {
    window.addEventListener('pageshow', () => {
      body?.classList.add('page-ready');
      body?.classList.remove('page-leaving');
    });

    document.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || link.hasAttribute('download')) {
          return;
        }

        if ((link.getAttribute('target') || '').toLowerCase() === '_blank') {
          return;
        }

        const url = new URL(href, window.location.href);
        const isSamePageHash =
          url.origin === window.location.origin &&
          url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          url.hash;

        if (
          url.origin !== window.location.origin ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          isSamePageHash
        ) {
          return;
        }

        event.preventDefault();
        body?.classList.remove('page-ready');
        body?.classList.add('page-leaving');
        window.setTimeout(() => {
          window.location.href = url.href;
        }, 260);
      });
    });
  }

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
        'A horror anthology built from found documents and testimonies. 25 stories from across Finland, where folklore, buried cases, and something older still move just beneath the surface.',
      'hero.cta.primary': 'View the book',
      'hero.cta.secondary': 'Contact',
      'hero.meta.one': 'Publishing early 2026',
      'hero.meta.two': 'Tone: documentary horror',
      'about.heading': 'About the author',
      'about.subhead':
        'I write horror built from documents, notes, diaries, interrogations, and other traces left behind. In my work, the supernatural does not appear as a grand spectacle, but as a fracture in everyday life.',
      'about.card1.title': 'Documentary Horror',
      'about.card1.body':
        'My stories are built on found material: diaries, reports, transcripts, notebooks, and other traces that were never originally meant to be read.',
      'about.card2.title': 'Finnish Folklore',
      'about.card2.body':
        'Folk belief and old beings remain present without being overexplained. They appear in customs, places, fears, and in the ways people try to understand something older than themselves.',
      'about.card3.title': 'A World Built from Archives',
      'about.card3.body':
        'Individual stories gradually form a larger whole. Not everything is visible at once, but the same patterns, places, and shadows begin to return.',
      'footer.tagline': "Curator of Finland's darker stories",
      'aboutpage.badge': 'Finland',
      'aboutpage.heading': 'About the author',
      'aboutpage.p1':
        'I write horror built from documents, notes, diaries, interrogations, and other traces left behind. In my work, the supernatural does not appear as a grand spectacle, but as a fracture in everyday life: a detail that does not fit any explanation, or an observation that continues to haunt.',
      'aboutpage.p2':
        'My work moves through Finnish landscapes and folklore, but does not treat them as decoration. Forests, shorelines, remote places, sites marked by war, apartment blocks, and ordinary homes all carry something older within them, something that has never fully disappeared.',
      'aboutpage.p3':
        'I build stories on evidence rather than confession. The reader is not given a complete answer, but the material itself: something found, preserved, or left unsaid, whose meaning begins to emerge only gradually.',
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
      'contact.intro': 'Send me a message!',
      'contact.note': 'Send a message with the form below and I will reply by email.',
      'contact.instagram': 'Instagram',
      'contact.youtube': 'YouTube',
    },
    fi: {
      'nav.home': 'Etusivu',
      'nav.about': 'Kirjailijasta',
      'nav.books': 'Teokset',
      'nav.contact': 'Yhteys',
      'hero.kicker': 'Antologia / Alkuvuosi 2026',
      'hero.title': "There's Something Wrong in Finland",
      'hero.lede':
        'Löydettyjen dokumenttien ja todistusten varaan rakentuva kauhuantologia. 25 tarinaa eri puolilta Suomea, siellä missä kansanperinne, vaietut tapaukset ja jokin vanhempi kulkevat yhä pinnan alla.',
      'hero.cta.primary': 'Katso kirja',
      'hero.cta.secondary': 'Ota yhteyttä',
      'hero.meta.one': 'Julkaistaan alkuvuonna 2026',
      'hero.meta.two': 'Sävy: dokumenttimainen kauhu',
      'about.heading': 'Kirjailijasta',
      'about.subhead':
        'Kirjoitan kauhua, joka rakentuu asiakirjoista, muistiinpanoista, päiväkirjoista, kuulusteluista ja muista löydetyistä jäljistä. Tarinoissani yliluonnollinen ei näyttäydy suurena eleenä, vaan särönä arjessa.',
      'about.card1.title': 'Dokumentaarinen kauhu',
      'about.card1.body':
        'Tarinoideni pohja on löydetyssä aineistossa: päiväkirjoissa, raporteissa, litteroinneissa, muistikirjoissa ja muissa jäljissä, joita ei alun perin ollut tarkoitettu luettaviksi.',
      'about.card2.title': 'Suomalainen kansanperinne',
      'about.card2.body':
        'Kansanusko ja vanhat olennot kulkevat mukana ilman että niitä selitetään puhki. Ne näkyvät tavoissa, paikoissa, peloissa ja siinä, miten ihmiset yrittävät ymmärtää jotakin itseään vanhempaa.',
      'about.card3.title': 'Arkistosta rakentuva maailma',
      'about.card3.body':
        'Yksittäiset kertomukset muodostavat vähitellen laajemman kokonaisuuden. Kaikki ei ole heti näkyvissä, mutta samat kaavat, paikat ja varjot alkavat toistua.',
      'footer.tagline': 'Suomen synkempien tarinoiden arkistoija',
      'aboutpage.badge': 'Suomi',
      'aboutpage.heading': 'Kirjailijasta',
      'aboutpage.p1':
        'Kirjoitan kauhua, joka rakentuu asiakirjoista, muistiinpanoista, päiväkirjoista, kuulusteluista ja muista löydetyistä jäljistä. Tarinoissani yliluonnollinen ei näyttäydy suurena eleenä, vaan särönä arjessa: yksityiskohtana, joka ei sovi selityksiin, ja havaintona, joka jää vaivaamaan.',
      'aboutpage.p2':
        'Työni liikkuu suomalaisessa maisemassa ja kansanperinteessä, mutta ei käsittele niitä koristeina. Metsät, rannat, syrjäseudut, sodan jättämät paikat, kerrostalot ja tavalliset kodit kantavat mukanaan jotakin vanhempaa, joka ei ole koskaan kadonnut kokonaan.',
      'aboutpage.p3':
        'Rakennan kertomuksia mieluummin todisteiden kuin tunnustusten varaan. Lukija ei saa valmista vastausta, vaan aineiston: jotain löydettyä, talteen jäänyttä tai vaiettua, jonka merkitys alkaa hahmottua vasta vähitellen.',
      'aboutpage.photo': 'Kirjailijan kuva tähän',
      'books.heading': 'Teokset',
      'books.intro': 'Ensimmäinen julkaisu tulee alkuvuodesta 2026. Uudet nimet lisätään kun ne muotoutuvat.',
      'books.card1.title': "There's Something Wrong in Finland",
      'books.card1.body':
        '25 tarinaa Suomesta, kerrottuna löydettyinä dokumentteina ja haastatteluina. Found-footage folklore -kauhua, joka tuntuu todelta.',
      'books.card1.meta': 'Julkaistaan alkuvuonna 2026',
      'books.card2.title': 'Seuraava projekti',
      'books.card2.body': 'Lisätiedot myöhemmin.',
      'books.card2.meta': 'Ilmoitetaan myöhemmin',
      'contact.heading': 'Yhteys',
      'contact.intro': 'Lähetä minulle viesti!',
      'contact.note': 'Lähetä viesti alla olevalla lomakkeella, niin vastaan sähköpostitse.',
      'contact.instagram': 'Instagram',
      'contact.youtube': 'YouTube',
    },
  };

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

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: targetLang } }));
  };

  const transitionLanguage = (lang) => {
    if (prefersReducedMotion || !body) {
      applyLanguage(lang);
      return;
    }

    window.clearTimeout(languageTransitionTimer);
    body.classList.remove('lang-switching-done');
    body.classList.add('lang-switching');

    languageTransitionTimer = window.setTimeout(() => {
      applyLanguage(lang);
      body.classList.add('lang-switching-done');
      body.classList.remove('lang-switching');

      languageTransitionTimer = window.setTimeout(() => {
        body.classList.remove('lang-switching-done');
      }, LANGUAGE_TRANSITION_MS);
    }, LANGUAGE_TRANSITION_MS);
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
      transitionLanguage(lang);
    });
  });
})();
