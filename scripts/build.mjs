// Static site generator: reads src/data/*.json and writes plain HTML/CSS/JS to dist/.
// Zero runtime dependencies. Usage: node scripts/build.mjs [--mode=demo|live]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, resolveConfig, validateContent } from '../src/lib/content.mjs';
import { esc, renderField, renderFacility, price } from '../src/lib/render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const config = resolveConfig({ mode: arg('mode'), formDelivery: arg('form') });
const content = loadContent();
const { business: biz, hire, menu, assets, reviews, site } = content;

const check = validateContent(content, config);
if (check.errors.length) {
  console.error(`\nBuild stopped (${config.mode} mode):\n` + check.errors.map((e) => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}

const demo = config.mode === 'demo';
const F = (field) => renderField(field, config.mode);
const name = biz.identity.name.value;
const hireField = Object.fromEntries(hire.sections.flatMap((s) => s.fields.map((f) => [f.key, f])));
const img = Object.fromEntries(assets.images.map((i) => [i.id, i]));

function picture(id, { sizes, eager = false, alt } = {}) {
  const a = img[id];
  const set = (ext) => a.widths.map((w) => `/img/${id}-${w}.${ext} ${w}w`).join(', ');
  const largest = a.widths[a.widths.length - 1];
  return `<picture>
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img src="/img/${id}-${largest}.jpg" srcset="${set('jpg')}" sizes="${sizes}" width="${a.width}" height="${a.height}" alt="${esc(alt ?? a.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>
  </picture>`;
}

const NAV = [
  { href: '/menu/', label: 'Menu', short: 'Menu' },
  { href: '/private-hire/', label: 'Private Hire & Groups', short: 'Hire' },
  { href: '/visit/', label: 'Visit Us', short: 'Visit' },
];
const current = (href, here) => (href === here ? ' aria-current="page"' : '');

function layout({ here, title, description, body, scripts = '' }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}${demo ? ' (website preview)' : ''}</title>
<meta name="description" content="${esc(description)}">
${demo ? '<meta name="robots" content="noindex, nofollow">' : (here.endsWith('/') ? `<link rel="canonical" href="${esc(site.url + here)}">` : '')}
<meta name="theme-color" content="#f6efe6">
<link rel="preload" href="/fonts/source-sans-3-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/bree-serif-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/global.css">
<link rel="icon" href="/img/favicon.png" type="image/png">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
${demo ? '<div class="demo-notice" role="note"><p>Website preview. Some details are awaiting confirmation.</p></div>' : ''}
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-logo" href="/"${current('/', here)}><img src="/img/logo-dark.png" width="480" height="386" alt="${esc(name)} – home"></a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle__bars" aria-hidden="true"></span>Browse</button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <ul>
        <li><a href="/"${current('/', here)}>Home</a></li>
        ${NAV.map((n) => `<li><a href="${n.href}"${current(n.href, here)}>${esc(n.label)}</a></li>`).join('\n        ')}
        ${biz.location.directionsUrl.status === 'confirmed' ? `<li class="site-nav__cta"><a class="btn" href="${esc(biz.location.directionsUrl.value)}" rel="noopener">Get Directions</a></li>` : ''}
      </ul>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div>
        <img class="site-footer__logo" src="/img/logo-light.png" width="480" height="386" alt="${esc(name)}">
        <p>${F(biz.policies.walkIns)}</p>
      </div>
      <div>
        <h2>Explore</h2>
        <ul>
          <li><a href="/">Home</a></li>
          ${NAV.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h2>Find us</h2>
        <p>${F(biz.location.address)}</p>
        <p><a href="/visit/">Opening hours and visiting details</a></p>
        ${biz.google ? `<p><a href="${esc(biz.google.profileUrl)}" rel="noopener">Find us on Google</a></p>` : ''}
      </div>
      <div>
        <h2>Gatherings</h2>
        <p>Celebrations, community groups and meetups.</p>
        <p><a href="/private-hire/">Private hire and group enquiries</a></p>
      </div>
    </div>
    <div class="site-footer__base">
      <p>${demo ? 'This is a website preview, not a live site.' : `© ${new Date().getFullYear()} ${esc(name)}`}</p>
      <ul class="site-footer__legal">
        <li><a href="/privacy/">Privacy policy${demo ? ' (draft)' : ''}</a></li>
        <li><a href="/cookies/">Cookies policy${demo ? ' (draft)' : ''}</a></li>
      </ul>
      <p class="site-footer__credit">Created by <a href="https://www.martkamdigital.com/" rel="noopener">MartKam Digital</a></p>
    </div>
  </div>
</footer>
<nav class="mobile-actions" aria-label="Quick links">
  ${[NAV[0], NAV[2], NAV[1]].map((n) => `<a href="${n.href}"${current(n.href, here)}>${n.short}</a>`).join('\n  ')}
</nav>
<script src="/js/navigation.js" defer></script>
<script src="/js/site.js" defer></script>
${scripts}
</body>
</html>
`;
}

/* ---------- Shared fragments ---------- */
const hoursPending = biz.hours.opening.every((d) => d.status === 'pending');
// Consecutive days with the same hours are grouped: "Mon – Tue: Closed".
const hourGroups = [];
for (const d of biz.hours.opening) {
  const last = hourGroups[hourGroups.length - 1];
  if (last && last.html === F(d)) last.to = d.day;
  else hourGroups.push({ from: d.day, to: d.day, html: F(d) });
}
const hoursSummary = hoursPending
  ? `<p><span class="pending">[Opening hours to be confirmed]</span></p>`
  : `<ul class="hours-summary">${hourGroups.map((g) => `<li><span>${g.from === g.to ? g.from.slice(0, 3) : `${g.from.slice(0, 3)} – ${g.to.slice(0, 3)}`}</span> <span>${g.html}</span></li>`).join('')}</ul>`;

// The Google "G" marks where each review was posted (attribution only).
const GOOGLE_G = '<svg class="review__g" viewBox="0 0 48 48" width="22" height="22" role="img" aria-label="Posted on Google"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

/* Google reviews: real, quoted excerpts. Hidden on a live build until the client approves them. */
const showReviews = biz.google && (demo || reviews.clientApproved);
const asOf = biz.google ? new Date(biz.google.retrieved).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const ratingLine = biz.google ? `Rated ${biz.google.rating} out of 5 from ${biz.google.reviewCount} Google reviews (as of ${asOf}).` : '';
const reviewsSection = (placement, heading) => !showReviews ? '' : `
<section class="section" aria-labelledby="reviews-h">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Google reviews</p>
      <h2 id="reviews-h">${heading}</h2>
      <p class="rating-badge"><span class="stars" style="--rating:${biz.google.rating}" role="img" aria-label="${biz.google.rating} out of 5 stars"></span> <strong>${biz.google.rating}</strong> <span>from ${biz.google.reviewCount} Google reviews · as of ${asOf}</span></p>
    </div>
    <ul class="reviews">
      ${reviews.reviews.filter((r) => r.placement === placement).map((r) => `<li><article class="review" data-review>
        <header class="review__head">
          <span class="review__avatar" aria-hidden="true">${esc(r.name.charAt(0))}</span>
          <span class="review__who"><strong>${esc(r.name)}</strong><span>Google review</span></span>
          ${GOOGLE_G}
        </header>
        <p class="review__stars" role="img" aria-label="${r.rating} out of 5 stars">${'★'.repeat(r.rating)}<span>${'★'.repeat(5 - r.rating)}</span></p>
        <p class="review__text">${esc(r.text)}</p>
        <button class="review__more" type="button" aria-expanded="false" hidden>Read more</button>
      </article></li>`).join('')}
    </ul>
    <p style="margin-top:var(--s5)"><a class="arrow-link" href="${esc(biz.google.profileUrl)}" rel="noopener">Read all ${biz.google.reviewCount} reviews on Google</a></p>
  </div>
</section>`;

const essentials = (h = 'h2') => `<div class="essentials">
  <div><${h}>Where</${h}><p>${F(biz.location.address)}</p><p><a class="arrow-link" href="/visit/">Plan your visit</a></p></div>
  <div><${h}>Opening hours</${h}>${hoursSummary}<p><a class="arrow-link" href="/visit/#hours">Full hours</a></p></div>
  <div><${h}>Tables</${h}><p>${F(biz.policies.walkIns)}</p><p><a class="arrow-link" href="/private-hire/">Planning a gathering?</a></p></div>
</div>`;

const factList = (fields) => `<dl class="facts">
  ${fields.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${F(f)}</dd></div>`).join('\n  ')}
</dl>`;

const section = (id) => hire.sections.find((s) => s.id === id);

/* ---------- Hero (full-width image or video) ---------- */
const heroCfg = assets.hero;
const heroImg = img[heroCfg.type === 'video' && heroCfg.videoPoster ? heroCfg.videoPoster : heroCfg.image];
const heroVideoFile = heroCfg.type === 'video' && heroCfg.video ? path.join(root, 'src/media', heroCfg.video) : null;
const useVideo = heroVideoFile && fs.existsSync(heroVideoFile);
if (heroCfg.type === 'video' && !useVideo) console.log('  ! hero video not found in src/media/ – using the image instead');
const heroSet = (ext) => heroImg.widths.map((w) => `/img/${heroImg.id}-${w}.${ext} ${w}w`).join(', ');
const heroLargest = heroImg.widths[heroImg.widths.length - 1];
const heroSection = `<section class="hero-full">
  <div class="hero-full__media">
    ${useVideo
      ? `<video data-hero-video muted loop playsinline preload="metadata" poster="/img/${heroImg.id}-${heroLargest}.jpg" style="object-position:${esc(heroCfg.position)}" aria-hidden="true" tabindex="-1"><source src="/media/${esc(heroCfg.video)}" type="video/mp4"></video>`
      : `<picture>
      <source type="image/webp" srcset="${heroSet('webp')}" sizes="100vw">
      <img src="/img/${heroImg.id}-${heroLargest}.jpg" srcset="${heroSet('jpg')}" sizes="100vw" width="${heroImg.width}" height="${heroImg.height}" alt="${esc(heroImg.alt)}" fetchpriority="high" style="object-position:${esc(heroCfg.position)}">
    </picture>`}
  </div>
  <div class="container hero-full__content">
    <p class="eyebrow">Est. ${F(biz.identity.established)} · ${F(biz.location.area)}</p>
    <h1>Breakfast, lunch and crepes made fresh at ${esc(name)}</h1>
    <p class="lead">Cooked breakfasts, toasties, bagels and salads, with sweet and savoury crepes, milkshakes and Belgian hot chocolate to follow.</p>
    <div class="btn-row">
      <a class="btn btn--light" href="/menu/">View Menu</a>
      <a class="btn btn--outline-light" href="/visit/">Plan Your Visit</a>
    </div>
    <p class="hero-full__walkin">${F(biz.policies.walkIns)}</p>
    ${useVideo ? '<button class="hero-full__toggle" type="button" data-hero-video-toggle hidden>Pause background video</button>' : ''}
  </div>
</section>`;

/* ---------- Home ---------- */
const FOOD = [
  { id: 'avocado-toast-tea', label: 'Breakfast', href: '/menu/#breakfast', sizes: '(min-width: 56em) 55vw, (min-width: 30em) 50vw, 100vw' },
  { id: 'toasted-sandwich', label: 'Lunch', href: '/menu/#lunch', sizes: '(min-width: 56em) 40vw, (min-width: 30em) 50vw, 100vw' },
  { id: 'bagel-salmon', label: 'Bagels', href: '/menu/#bagels', sizes: '(min-width: 56em) 40vw, (min-width: 30em) 50vw, 100vw' },
  { id: 'crepe-berries', label: 'Crepes', href: '/menu/#crepes', sizes: '(min-width: 56em) 55vw, (min-width: 30em) 50vw, 100vw' },
];

const home = layout({
  here: '/',
  title: `${name} – breakfast, lunch and fresh crepes`,
  description: `${name} serves cooked breakfasts, toasties, bagels and sweet and savoury crepes. Walk-ins welcome.`,
  body: `
${heroSection}

<section class="section section--surface" aria-labelledby="essentials-h">
  <div class="container">
    <h2 class="visually-hidden" id="essentials-h">Visiting essentials</h2>
    ${essentials('h3')}
  </div>
</section>

<section class="section" aria-labelledby="food-h">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Food and drink</p>
      <h2 id="food-h">From the first plate of the morning to something sweet</h2>
      <p class="lead">A few photographs from the café. Follow any of them to that part of the menu.</p>
    </div>
    <ul class="food-grid">
      ${FOOD.map((f) => `<li><a href="${f.href}">${picture(f.id, { sizes: f.sizes })}<span>${f.label}</span></a></li>`).join('\n      ')}
    </ul>
    <div class="btn-row"><a class="btn btn--ghost" href="/menu/">See the full menu</a></div>
  </div>
</section>

${reviewsSection('home', 'What visitors say')}

<section class="section section--surface section-rule" aria-labelledby="owner-h">
  <div class="container split split--center split--narrow-first">
    <div class="owner__media">
      ${biz.identity.ownerPhoto.status === 'confirmed'
        ? picture(biz.identity.ownerPhoto.value, { sizes: '(min-width: 56em) 26rem, 90vw' })
        : demo ? `<div class="placeholder-block placeholder-block--portrait" role="img" aria-label="${esc(biz.identity.ownerPhoto.placeholder)}"><p>${esc(biz.identity.ownerPhoto.placeholder)}</p></div>` : ''}
    </div>
    <div>
      <p class="eyebrow">Meet the owners</p>
      <h2 id="owner-h">The people behind ${esc(name)}</h2>
      <div class="note">
        <p class="note__label">A note from the café</p>
        <p>${F(biz.identity.ownerBio)}</p>
        <p class="note__sign">${F(biz.identity.ownerName)}</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--blush" aria-labelledby="hire-h">
  <div class="container split split--center">
    <div>
      <p class="eyebrow">Private hire &amp; groups</p>
      <h2 id="hire-h">Bringing people together?</h2>
      <p class="lead">Everyday visits need no booking. For a celebration or a group meetup, tell us what you are planning and we will take it from there.</p>
      <div class="options options--stacked">
        <div class="option">
          <h3>Celebrations</h3>
          <p>Birthdays, christenings, First Holy Communions and family gatherings.</p>
        </div>
        <div class="option">
          <h3>Groups and meetups</h3>
          <p>Community groups, networking meetings and one-off or regular get-togethers.</p>
        </div>
      </div>
      <div class="btn-row"><a class="btn" href="/private-hire/">Private hire and groups</a></div>
    </div>
    <figure class="feature-photo">
      ${picture('party-setup', { sizes: '(min-width: 75rem) 35rem, (min-width: 56em) 45vw, 92vw' })}
    </figure>
  </div>
</section>

<section class="section" aria-labelledby="visit-h">
  <div class="container split split--narrow-first">
    <div>
      <p class="eyebrow">Visit us</p>
      <h2 id="visit-h">Come and say hello</h2>
      <div class="notice"><p>${F(biz.policies.walkIns)}</p></div>
      <div class="btn-row">
        ${biz.location.directionsUrl.status === 'confirmed' ? `<a class="btn" href="${esc(biz.location.directionsUrl.value)}" rel="noopener">Get directions</a>` : ''}
        <a class="btn btn--ghost" href="/visit/">Plan your visit</a>
      </div>
    </div>
    <dl class="facts facts--visit">
      <div><dt>Address</dt><dd>${F(biz.location.address)}</dd></div>
      <div><dt>Opening hours</dt><dd>${hoursSummary}</dd></div>
      <div><dt>Parking</dt><dd>${F(biz.practical.parking)}</dd></div>
      <div><dt>Gatherings</dt><dd><a href="/private-hire/">Celebrations and group meetups</a></dd></div>
    </dl>
  </div>
</section>
${biz.google && biz.contact.facebook.status === 'confirmed' ? `
<section class="cta-band" aria-labelledby="follow-h">
  <div class="container">
    <h2 id="follow-h">Keep up with ${esc(name)}</h2>
    <p>See what is new at the café on Facebook, or read what visitors say on Google.</p>
    <div class="btn-row">
      <a class="btn btn--light" href="${esc(biz.contact.facebook.value)}" rel="noopener">${esc(name)} on Facebook</a>
      <a class="btn btn--outline-light" href="${esc(biz.google.profileUrl)}" rel="noopener">Find us on Google</a>
    </div>
  </div>
</section>` : ''}`,
});

/* ---------- Menu ---------- */
const PANELS = new Set(['breakfast-extras', 'milkshakes', 'desserts', 'belgian-hot-chocolate']);

function menuItem(item) {
  const priceHtml = item.variants
    ? ''
    : `<span class="menu-item__dots" aria-hidden="true"></span><span class="menu-item__price">${price(item.price)}</span>`;
  const variants = item.variants
    ? `<ul class="menu-item__variants">${item.variants.map((v) => `<li><span>${esc(v.label)}</span><span class="menu-item__dots" aria-hidden="true"></span><span class="menu-item__price">${price(v.price)}</span></li>`).join('')}</ul>`
    : '';
  const options = item.options ? `<p class="menu-item__desc">${esc(item.options.label)}: ${esc(item.options.values.join(', '))}</p>` : '';
  const confirm = item.needsConfirmation && demo ? `<p class="menu-item__desc"><span class="pending">Prices per option to be confirmed</span></p>` : '';
  return `<li class="menu-item" id="${item.id}">
          <div class="menu-item__row"><p class="menu-item__name">${esc(item.name)}</p>${priceHtml}</div>
          ${item.description ? `<p class="menu-item__desc">${esc(item.description)}</p>` : ''}${options}${variants}${confirm}
        </li>`;
}

function menuGroup(group, headingLevel) {
  const cls = ['menu-group', PANELS.has(group.id) ? 'menu-group--panel' : '', group.title ? '' : 'menu-group--wide'].filter(Boolean).join(' ');
  return `<div class="${cls}" id="${group.id}">
      ${group.title ? `<${headingLevel}>${esc(group.title)}</${headingLevel}>` : ''}
      <ul class="menu-list${!group.title && group.items.length >= 4 ? ' menu-list--cols' : ''}">
        ${group.items.map(menuItem).join('\n        ')}
      </ul>
    </div>`;
}

const menuCategory = (cat) => `<section class="menu-cat" id="${cat.id}" aria-labelledby="${cat.id}-h">
    <div class="menu-cat__head">
      <h2 id="${cat.id}-h">${esc(cat.title)}</h2>
      ${cat.intro ? `<p>${esc(cat.intro)}</p>` : ''}
    </div>
    <div class="menu-groups menu-groups--cols">
    ${cat.groups.map((g) => menuGroup(g, 'h3')).join('\n    ')}
    </div>
  </section>`;

const pdfSrc = path.join(root, menu.source.file);
const pdfMb = (fs.statSync(pdfSrc).size / 1048576).toFixed(1);
const cats = menu.categories;
const crepesIndex = cats.findIndex((c) => c.id === 'crepes');

const menuPage = layout({
  here: '/menu/',
  title: `Menu – ${name}`,
  description: `The ${name} menu: breakfast, lunch, bagels, salads, crepes, milkshakes and desserts, with prices.`,
  body: `
<div class="container">
  <div class="page-intro">
    <p class="eyebrow">Menu</p>
    <h1>What we are serving</h1>
    <p class="lead">Breakfast, lunch, crepes and something sweet. ${F(biz.policies.walkIns)}</p>
  </div>
  <nav class="menu-nav" aria-label="Menu sections">
    <ul>
      ${cats.map((c) => `<li><a href="#${c.id}">${esc(c.title)}</a></li>`).join('\n      ')}
      <li><a href="#menu-notes">Allergens &amp; notes</a></li>
    </ul>
  </nav>
  ${cats.slice(0, crepesIndex).map(menuCategory).join('\n  ')}
  <figure class="menu-figure">${picture('crepe-savoury', { sizes: '(min-width: 75rem) 75rem, 95vw' })}</figure>
  ${cats.slice(crepesIndex).map(menuCategory).join('\n  ')}
</div>

<section class="section" id="menu-notes" aria-labelledby="menu-notes-h">
  <div class="container">
    <h2 id="menu-notes-h">Good to know</h2>
    <div class="menu-notes">
      <div>
        <h3>Allergens and dietary needs</h3>
        <p>${F(menu.pending.allergens)}</p>
        <p>Please do not rely on dish names or photographs to judge whether something is suitable for you.</p>
      </div>
      <div>
        <h3>Coffee, tea and cold drinks</h3>
        <p>${F(menu.pending.hotDrinks)}</p>
      </div>
      <div>
        <h3>Serving times</h3>
        <p>${F(menu.pending.servingTimes)}</p>
      </div>
      <div>
        <h3>Original menu</h3>
        <p><a href="/downloads/amica-cafe-menu.pdf">Open original menu PDF</a> (PDF, ${pdfMb} MB)</p>
        ${demo ? '<p><span class="pending">Prices and dishes are taken from the supplied menu and await confirmation that it is current</span></p>' : ''}
      </div>
    </div>
    <div class="btn-row"><a class="btn" href="/visit/">Plan your visit</a></div>
  </div>
</section>`,
});

/* ---------- Private hire ---------- */
const formHtml = config.formDelivery === 'preview' ? `
    <div class="form-notice" role="note"><p>Demo form. Use sample details only. Nothing will be sent to the café.</p></div>
    <noscript><div class="form-notice"><p>This demo form needs JavaScript to show its preview. Nothing can be sent from this page.</p></div></noscript>
    <div class="error-summary" id="enquiry-errors" role="alert" tabindex="-1" hidden>
      <h3>There is a problem</h3>
      <ul></ul>
    </div>
    <form class="enquiry" id="enquiry-form" method="post" autocomplete="on">
      <fieldset>
        <legend>Your gathering</legend>
        <div class="field">
          <label for="type">Type of gathering</label>
          <select id="type" name="type" required aria-describedby="type-error">
            <option value="">Please choose</option>
            <option value="birthday">Birthday</option>
            <option value="christening">Christening</option>
            <option value="communion">First Holy Communion</option>
            <option value="family">Family gathering</option>
            <option value="networking">Networking meeting</option>
            <option value="community">Community meetup</option>
            <option value="other">Other</option>
          </select>
          <span class="field-error" id="type-error"></span>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="date">Preferred date</label>
            <input type="date" id="date" name="date" aria-describedby="date-error">
            <span class="field-error" id="date-error"></span>
            <div class="check"><input type="checkbox" id="dateUndecided" name="dateUndecided"><label for="dateUndecided">Date not decided</label></div>
          </div>
          <div class="field">
            <label for="time">Preferred time <span class="optional">(optional)</span></label>
            <input type="time" id="time" name="time">
          </div>
        </div>
        <div class="field">
          <label for="guests">Approximate number of guests</label>
          <input type="text" inputmode="numeric" id="guests" name="guests" required aria-describedby="guests-error" style="max-width:10rem">
          <span class="field-error" id="guests-error"></span>
        </div>
        <div class="field" role="radiogroup" aria-labelledby="frequency-label" aria-describedby="frequency-error">
          <span class="label" id="frequency-label">Is this a one-off or a recurring gathering?</span>
          <div class="radios">
            <div class="check"><input type="radio" id="frequency-one-off" name="frequency" value="one-off"><label for="frequency-one-off">One-off</label></div>
            <div class="check"><input type="radio" id="frequency-recurring" name="frequency" value="recurring"><label for="frequency-recurring">Recurring</label></div>
          </div>
          <span class="field-error" id="frequency-error"></span>
        </div>
        <div class="field" id="recurrence-field">
          <label for="recurrence">How often would you like to meet? <span class="optional">(optional)</span></label>
          <input type="text" id="recurrence" name="recurrence">
        </div>
        <div class="field">
          <label for="food">Food and drink preferences <span class="optional">(optional)</span></label>
          <textarea id="food" name="food" rows="3"></textarea>
        </div>
      </fieldset>
      <fieldset>
        <legend>Your details</legend>
        <div class="field">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" autocomplete="name" required aria-describedby="name-error">
          <span class="field-error" id="name-error"></span>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" autocomplete="email" required aria-describedby="email-error">
            <span class="field-error" id="email-error"></span>
          </div>
          <div class="field">
            <label for="phone">Phone <span class="optional">(optional)</span></label>
            <input type="tel" id="phone" name="phone" autocomplete="tel">
          </div>
        </div>
        <div class="field">
          <label for="notes">Anything else we should know? <span class="optional">(optional)</span></label>
          <span class="hint" id="notes-hint">Please do not include health or medical details here.</span>
          <textarea id="notes" name="notes" rows="4" aria-describedby="notes-hint"></textarea>
        </div>
      </fieldset>
      <button class="btn" type="submit" data-preview-button disabled>Preview enquiry</button>
    </form>
    <section class="review" id="enquiry-review" tabindex="-1" aria-labelledby="review-h" hidden>
      <p class="review__banner">Preview only. Your enquiry has not been sent.</p>
      <h3 id="review-h">Your enquiry details</h3>
      <dl></dl>
      <div class="btn-row"><button class="btn btn--ghost" type="button" data-edit>Edit details</button></div>
    </section>` : `
    <div class="form-notice" role="note"><p>Online enquiries are not available yet. ${F(hireField['enquiries.contact'])}</p></div>`;

const hirePage = layout({
  here: '/private-hire/',
  title: `Private hire and groups – ${name}`,
  description: `Celebrations, community groups and meetups at ${name}.`,
  scripts: config.formDelivery === 'preview' ? '<script type="module" src="/js/enquiry.js"></script>' : '',
  body: `
<section class="hero-split">
  <div class="container hero-split__grid">
    <div class="hero-split__text">
      <p class="eyebrow">Private hire &amp; groups</p>
      <h1>Gatherings at ${esc(name)}</h1>
      <p class="lead">From family celebrations to regular community meetups. Tell us what you have in mind and the café will come back to you about what is possible.</p>
      <div class="btn-row"><a class="btn" href="#enquiry">${demo ? 'Preview enquiry' : 'Make an enquiry'}</a></div>
    </div>
    <div class="hero-split__media">
      ${picture('celebration-table', { sizes: '(min-width: 75rem) 40rem, (min-width: 56em) 52vw, 92vw', eager: true })}
    </div>
  </div>
</section>

<section class="section section--blush" aria-labelledby="options-h">
  <div class="container">
    <h2 id="options-h">Two kinds of gathering</h2>
    <div class="options">
      <div class="option">
        <h3>Celebrations</h3>
        <p>For the occasions families mark together.</p>
        <ul><li>Birthdays</li><li>Christenings</li><li>First Holy Communions</li><li>Family gatherings</li></ul>
      </div>
      <div class="option">
        <h3>Groups and meetups</h3>
        <p>For people who want a welcoming place to meet.</p>
        <ul><li>Community groups</li><li>Networking meetings</li><li>One-off get-togethers</li><li>Regular meetups</li></ul>
      </div>
    </div>
  </div>
</section>

${reviewsSection('hire', 'Celebrations held here')}

<section class="section" aria-labelledby="space-h">
  <div class="container split split--narrow-first">
    <div>
      <p class="eyebrow">Space and arrangements</p>
      <h2 id="space-h">How it works in the café</h2>
      <p>A gathering might use the whole café, part of it or a group of tables. The details below will be confirmed by the café.</p>
    </div>
    <div>
      <div class="fact-group"><h3>Celebrations</h3>${factList(section('celebrations').fields)}</div>
      <div class="fact-group"><h3>Groups and meetups</h3>${factList(section('groups').fields)}</div>
      <div class="fact-group"><h3>The space</h3>${factList(section('venue').fields)}</div>
    </div>
  </div>
</section>

<section class="section section--surface section-rule" aria-labelledby="catering-h">
  <div class="container split split--narrow-first">
    <div>
      <p class="eyebrow">Food and drink</p>
      <h2 id="catering-h">Feeding your guests</h2>
      <p>You can see what the café serves day to day on the <a href="/menu/">menu</a>. Arrangements for gatherings are listed here.</p>
    </div>
    <div>${factList(section('catering').fields)}</div>
  </div>
</section>

${demo || hireField['photos.eventAssets'].status === 'confirmed' ? `<section class="section" aria-labelledby="gallery-h">
  <div class="container">
    <h2 id="gallery-h">The space in pictures</h2>
    <div class="placeholder-block"><p>${esc(hireField['photos.eventAssets'].placeholder)}</p></div>
  </div>
</section>` : ''}

<section class="section section--blush" aria-labelledby="steps-h">
  <div class="container">
    <h2 id="steps-h">What happens next</h2>
    <ol class="steps">
      <li><h3>Share your plans</h3><p>Tell the café the occasion, a rough date and how many people you expect.</p></li>
      <li><h3>The café reviews availability</h3><p>Your request is checked against what the café can accommodate.</p></li>
      <li><h3>Arrangements are confirmed directly</h3><p>The café agrees the details with you in person, by phone or by email.</p></li>
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="faq-h">
  <div class="container split split--narrow-first">
    <div>
      <p class="eyebrow">Questions</p>
      <h2 id="faq-h">Practical details</h2>
    </div>
    <div class="faq">
      ${hire.faq.map((q) => `<details>
        <summary>${esc(q.question)}</summary>
        <dl>${q.fields.map((k) => `<div><dt>${esc(hireField[k].label)}</dt><dd>${F(hireField[k])}</dd></div>`).join('')}</dl>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--surface section-rule" id="enquiry" aria-labelledby="enquiry-h">
  <div class="container split split--narrow-first">
    <div>
      <p class="eyebrow">Enquiry</p>
      <h2 id="enquiry-h">Tell us about your gathering</h2>
      <dl class="facts">
        ${section('enquiries').fields.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${F(f)}</dd></div>`).join('')}
      </dl>
    </div>
    <div>${formHtml}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="everyday-h">
  <div class="container">
    <h2 id="everyday-h">Just popping in?</h2>
    <p class="lead">${F(biz.policies.walkIns)}</p>
    <div class="btn-row"><a class="btn btn--ghost" href="/visit/">Opening hours and how to find us</a></div>
  </div>
</section>`,
});

/* ---------- Visit ---------- */
const addressOk = biz.location.address.status === 'confirmed';
const directions = addressOk && biz.location.directionsUrl.status === 'confirmed'
  ? `<p><a class="btn" href="${esc(biz.location.directionsUrl.value)}" rel="noopener">Get directions</a></p>`
  : demo ? `<p><span class="pending">${esc(biz.location.directionsUrl.placeholder)}</span></p>` : '';

const contactRow = (label, f, hrefFor, text) => {
  if (f.status === 'confirmed') return `<div><dt>${label}</dt><dd><a href="${esc(hrefFor(f.value))}">${esc(text || f.value)}</a></dd></div>`;
  return demo ? `<div><dt>${label}</dt><dd>${F(f)}</dd></div>` : '';
};

const visitPage = layout({
  here: '/visit/',
  title: `Visit us – ${name}`,
  description: `Opening hours, location and practical information for visiting ${name}. Walk-ins welcome.`,
  body: `
<div class="container">
  <div class="hero__grid" style="padding-block: clamp(2.5rem, 1.5rem + 4vw, 5rem)">
    <div>
      <p class="eyebrow">Visit us</p>
      <h1>Find a table and stay a while</h1>
      <p class="lead">${F(biz.policies.walkIns)}</p>
      <address class="address" style="margin-top:var(--s5)">${F(biz.location.address)}</address>
      <div style="margin-top:var(--s4)">${directions}</div>
      ${biz.google ? `<p style="margin-top:var(--s4)">${ratingLine}<br><a class="arrow-link" href="${esc(biz.google.profileUrl)}" rel="noopener">View ${esc(name)} on Google</a></p>` : ''}
    </div>
    <div class="hero__media">${picture('latte', { sizes: '(min-width: 56em) 30rem, 90vw', eager: true })}</div>
  </div>
</div>

<section class="section section--surface section-rule" id="hours" aria-labelledby="hours-h">
  <div class="container split">
    <div>
      <h2 id="hours-h">Opening hours</h2>
      <table class="hours">
        <caption class="visually-hidden">Opening hours by day</caption>
        <tbody>
          ${biz.hours.opening.map((d) => `<tr><th scope="row">${d.day}</th><td>${F(d)}</td></tr>`).join('\n          ')}
        </tbody>
      </table>
    </div>
    <div>
      <h3>Kitchen and food service</h3>
      <p>${F(biz.hours.kitchen)}</p>
      <h3 style="margin-top:var(--s6)">Bank holidays</h3>
      <p>${F(biz.hours.bankHolidays)}</p>
      <h3 style="margin-top:var(--s6)">Tables</h3>
      <p>${F(biz.policies.walkIns)}</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="practical-h">
  <div class="container split">
    <div>
      <h2 id="practical-h">Getting here</h2>
      <dl class="facts">
        <div><dt>Parking</dt><dd>${F(biz.practical.parking)}</dd></div>
        <div><dt>Public transport</dt><dd>${F(biz.practical.publicTransport)}</dd></div>
      </dl>
      <h2 style="margin-top:var(--s7)">Get in touch</h2>
      <dl class="facts">
        ${contactRow('Telephone', biz.contact.phone, (v) => `tel:${v.replace(/\s+/g, '')}`)}
        ${contactRow('Email', biz.contact.email, (v) => `mailto:${v}`)}
        ${contactRow('Instagram', biz.contact.instagram, (v) => v, `${name} on Instagram`)}
        ${contactRow('Facebook', biz.contact.facebook, (v) => v, `${name} on Facebook`)}
      </dl>
    </div>
    <div>
      <h2>Facilities</h2>
      <ul class="facilities">
        ${biz.facilities.filter((f) => demo || f.available !== null).map((f) => `<li><span>${esc(f.label)}</span><span>${renderFacility(f, config.mode)}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<section class="section section--blush" aria-labelledby="visit-hire-h">
  <div class="container">
    <h2 id="visit-hire-h">Coming as a group?</h2>
    <p class="lead">Everyday visits need no booking. For celebrations and group meetups, please use the hire enquiry so the café can plan for you.</p>
    <div class="btn-row"><a class="btn" href="/private-hire/">Private hire and groups</a></div>
  </div>
</section>`,
});

/* ---------- Privacy ---------- */
const privacyPage = layout({
  here: '/privacy/',
  title: `Privacy policy – ${name}`,
  description: `How this ${name} website preview handles information.`,
  body: `
<div class="container prose">
  <div class="page-intro">
    ${demo ? '<p class="draft-flag">Draft – describes this website preview only</p>' : ''}
    <h1>Privacy policy</h1>
    <p class="lead">This page explains what this website preview does and does not do with information. It is not yet the café's final privacy notice.</p>
  </div>
  <h2>The demo enquiry form</h2>
  <ul>
    <li>Anything you type into the enquiry form stays in your browser's memory while the page is open.</li>
    <li>The form has no submission endpoint. Nothing is sent to the café or to anyone else.</li>
    <li>Nothing you type is saved to your device, and it is gone when you leave or reload the page.</li>
  </ul>
  <h2>Tracking and cookies</h2>
  <ul>
    <li>No analytics, advertising or marketing tracking is installed on this preview.</li>
    <li>The site itself sets no cookies, which is why there is no cookie banner. See the <a href="/cookies/">cookies policy</a>.</li>
    <li>Fonts and images are served from this site rather than from third parties.</li>
  </ul>
  <h2>Hosting</h2>
  <p>Whichever service hosts this preview may keep standard technical logs, such as IP addresses and the pages requested, as most web hosts do. Those logs are controlled by the hosting provider.</p>
  <h2>Still to be confirmed</h2>
  <ul>
    <li>Business responsible for this website: <span class="pending">[Legal business name and contact details of the data controller]</span></li>
    <li>How real enquiries will be handled once the form is live: <span class="pending">[Enquiry processing, retention and contact details to be agreed]</span></li>
  </ul>
  <div class="btn-row" style="margin-bottom:var(--section)"><a class="btn btn--ghost" href="/">Return to the home page</a></div>
</div>`,
});

/* ---------- Cookies ---------- */
const cookiesPage = layout({
  here: '/cookies/',
  title: `Cookies policy – ${name}`,
  description: `How this ${name} website uses cookies and similar technologies.`,
  body: `
<div class="container prose">
  <div class="page-intro">
    ${demo ? '<p class="draft-flag">Draft – describes this website preview only</p>' : ''}
    <h1>Cookies policy</h1>
    <p class="lead">This page explains what this website stores on your device. The short answer is: nothing.</p>
  </div>
  <h2>Cookies this site sets</h2>
  <ul>
    <li>This website does not set any cookies.</li>
    <li>It does not use local storage or any other way of saving information on your device.</li>
    <li>Because nothing is stored, there is no cookie banner and nothing for you to accept or decline.</li>
  </ul>
  <h2>Analytics and advertising</h2>
  <ul>
    <li>No analytics, advertising or social-media tracking is installed.</li>
    <li>Fonts, images and scripts are served from this website, not from third parties.</li>
  </ul>
  <h2>Links to other websites</h2>
  <p>Some links take you to other services, such as Google Maps, Google reviews and Facebook. Those websites set their own cookies under their own policies once you are on them. This site has no control over that.</p>
  <h2>If this changes</h2>
  <p>If analytics, an embedded map, a booking tool or anything else that uses cookies is added later, this page will be updated first and, where the law requires it, you will be asked for consent before any non-essential cookie is set.</p>
  <h2>Still to be confirmed</h2>
  <ul>
    <li>Who to contact with questions about this policy: <span class="pending">[Business contact details]</span></li>
    <li>Cookies set by the hosting provider, if any: <span class="pending">[To be checked once the live host is chosen]</span></li>
  </ul>
  <p>See also the <a href="/privacy/">privacy policy</a>.</p>
  <div class="btn-row" style="margin-bottom:var(--section)"><a class="btn btn--ghost" href="/">Return to the home page</a></div>
</div>`,
});

/* ---------- 404 ---------- */
const notFound = layout({
  here: '/404.html',
  title: `Page not found – ${name}`,
  description: 'The page you were looking for could not be found.',
  body: `
<div class="container">
  <div class="page-intro" style="padding-bottom:var(--section)">
    <p class="eyebrow">Page not found</p>
    <h1>That page is not on the menu</h1>
    <p class="lead">The address may have changed, or the link may be out of date. These should help:</p>
    <div class="btn-row">
      <a class="btn" href="/">Home</a>
      <a class="btn btn--ghost" href="/menu/">Menu</a>
      <a class="btn btn--ghost" href="/visit/">Visit Us</a>
    </div>
  </div>
</div>`,
});

/* ---------- Write output ---------- */
fs.rmSync(dist, { recursive: true, force: true });
const write = (rel, html) => {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};
write('index.html', home);
write('menu/index.html', menuPage);
write('private-hire/index.html', hirePage);
write('visit/index.html', visitPage);
write('privacy/index.html', privacyPage);
write('cookies/index.html', cookiesPage);
write('404.html', notFound);

const copyDir = (from, to, filter = () => true) => {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) if (filter(f)) fs.copyFileSync(path.join(from, f), path.join(to, f));
};
copyDir(path.join(root, 'src/styles'), path.join(dist, 'css'));
copyDir(path.join(root, 'src/js'), path.join(dist, 'js'));
copyDir(path.join(root, 'src/fonts'), path.join(dist, 'fonts'));
// Only image derivatives that pages actually reference are published (never the raw /images folder).
const allHtml = [home, menuPage, hirePage, visitPage, privacyPage, cookiesPage, notFound].join('');
copyDir(path.join(root, 'src/img'), path.join(dist, 'img'), (f) => allHtml.includes(`/img/${f}`));
if (useVideo) { fs.mkdirSync(path.join(dist, 'media'), { recursive: true }); fs.copyFileSync(heroVideoFile, path.join(dist, 'media', heroCfg.video)); }
fs.mkdirSync(path.join(dist, 'downloads'), { recursive: true });
fs.copyFileSync(pdfSrc, path.join(dist, 'downloads/amica-cafe-menu.pdf'));

/* ---------- robots.txt and sitemap.xml ----------
   Demo: crawlers are NOT blocked (a blocked crawler could never read the noindex tag on each
   page), and the sitemap is not advertised. Live: crawling allowed and the sitemap is listed. */
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
${demo ? `<!-- PREVIEW BUILD. Do not submit this file to search engines.
     The addresses below use the placeholder in src/data/site.json; a live build
     (npm run build:live) writes the real address. -->
` : ''}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${site.sitemap.map((p) => `  <url>
    <loc>${esc(site.url + p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
const robots = demo
  ? `# ${name} - website PREVIEW (not the live site).
# Every page carries <meta name="robots" content="noindex, nofollow">.
# Crawling is deliberately not blocked here: a crawler that is blocked cannot
# read that tag, and blocked pages can still end up listed in search results.
# For real privacy, put the preview behind a password at the host.
User-agent: *
Disallow:

# No Sitemap line on purpose. A live build adds it automatically.
`
  : `# ${name}
User-agent: *
Disallow:

Sitemap: ${site.url}/sitemap.xml
`;
write('sitemap.xml', sitemap);
write('robots.txt', robots);

console.log(`Built ${config.mode} site → dist/  (form: ${config.formDelivery})`);
console.log(`  ${check.total - check.pending.length} confirmed · ${check.pending.length} pending content fields`);
for (const w of check.warnings) console.log(`  ! ${w}`);
