// Focused tests on failure-prone behaviour and the preview/live boundary.
// Run: npm run build && npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, resolveConfig, validateContent } from '../src/lib/content.mjs';
import { renderFacility, renderField } from '../src/lib/render.mjs';
import { validateEnquiry, submitEnquiry } from '../src/js/enquiry-validate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const valid = { type: 'birthday', date: '2027-03-14', guests: '20', frequency: 'one-off', name: 'Sample Person', email: 'sample@example.com' };
const opts = { today: '2026-11-16' };

test('pending required content blocks live mode', () => {
  const result = validateContent(loadContent(), resolveConfig({ mode: 'live', formDelivery: 'disabled' }));
  assert.ok(result.errors.some((e) => e.startsWith('LIVE GATE')));
});

test('demo content passes; invalid mode combinations are rejected', () => {
  assert.deepEqual(validateContent(loadContent(), resolveConfig({ mode: 'demo', formDelivery: 'preview' })).errors, []);
  assert.ok(resolveConfig({ mode: 'demo', formDelivery: 'live' }).errors.length > 0);
  assert.ok(resolveConfig({ mode: 'live', formDelivery: 'preview' }).errors.length > 0);
  assert.ok(resolveConfig({ mode: 'live', formDelivery: 'live' }).errors.length > 0, 'live delivery is not implemented');
});

test('unknown facility renders "To be confirmed", never "No"', () => {
  const html = renderFacility({ label: 'Highchairs', available: null, detail: null });
  assert.match(html, /To be confirmed/);
  assert.doesNotMatch(html, /\bNo\b/);
  assert.equal(renderFacility({ available: false, detail: null }), 'No');
  assert.equal(renderFacility({ available: true, detail: null }), 'Yes');
});

test('pending fields show their placeholder in demo and nothing in live; values are escaped', () => {
  const pending = { value: null, status: 'pending', placeholder: '[Maximum guest count]', source: null };
  assert.match(renderField(pending, 'demo'), /\[Maximum guest count\]/);
  assert.equal(renderField(pending, 'live'), '');
  assert.equal(renderField({ value: '<b>x</b>', status: 'confirmed', placeholder: 'p', source: 's' }), '&lt;b&gt;x&lt;/b&gt;');
});

test('enquiry validation catches missing and invalid fields', () => {
  const empty = validateEnquiry({}, opts);
  assert.equal(empty.valid, false);
  assert.deepEqual(Object.keys(empty.errors).sort(), ['date', 'email', 'frequency', 'guests', 'name', 'type']);
  for (const guests of ['0', '-3', '2.5', 'ten']) assert.ok(validateEnquiry({ ...valid, guests }, opts).errors.guests, `guests "${guests}"`);
  assert.ok(validateEnquiry({ ...valid, email: 'not-an-email' }, opts).errors.email);
  assert.ok(validateEnquiry({ ...valid, date: '2026-01-01' }, opts).errors.date, 'past date');
  assert.ok(validateEnquiry({ ...valid, type: 'wedding' }, opts).errors.type);
});

test('enquiry validation accepts a valid enquiry and a date-not-decided state', () => {
  const ok = validateEnquiry(valid, opts);
  assert.equal(ok.valid, true);
  assert.equal(ok.values.guests, 20);
  const undecided = validateEnquiry({ ...valid, date: '', dateUndecided: true }, opts);
  assert.equal(undecided.valid, true);
  assert.equal(undecided.values.date, '');
  // No venue maximum is invented.
  assert.equal(validateEnquiry({ ...valid, guests: '500' }, opts).valid, true);
});

test('enquiry preview makes no network request and stores nothing', async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (...a) => { calls.push(a); return Promise.reject(new Error('blocked')); };
  try {
    assert.deepEqual(await submitEnquiry(validateEnquiry(valid, opts).values), { delivered: false, mode: 'preview' });
  } finally { globalThis.fetch = originalFetch; }
  assert.equal(calls.length, 0);
  for (const f of fs.readdirSync(path.join(root, 'src/js'))) {
    const src = fs.readFileSync(path.join(root, 'src/js', f), 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '');
    assert.doesNotMatch(src, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|console\.|WebSocket/, `${f} must not send, store or log`);
  }
});

test('built site: all routes exist, are noindex, and internal links resolve', () => {
  const pages = ['index.html', 'menu/index.html', 'private-hire/index.html', 'visit/index.html', 'privacy/index.html', 'cookies/index.html', '404.html'];
  for (const p of pages) {
    const html = fs.readFileSync(path.join(dist, p), 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/, `${p} noindex`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${p} has one h1`);
    assert.doesNotMatch(html, /href="(#|tel:|mailto:)?"|href="[^"]*\[/, `${p} has no placeholder links`);
    assert.doesNotMatch(html, /application\/ld\+json/, `${p} has no structured data`);
    assert.doesNotMatch(html, /Booking confirmed|Message sent/i);
    for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      const target = path.join(dist, url.endsWith('/') ? url + 'index.html' : url);
      assert.ok(fs.existsSync(target), `${p} → ${url} exists`);
    }
    for (const [, set] of html.matchAll(/srcset="([^"]+)"/g))
      for (const part of set.split(', ')) assert.ok(fs.existsSync(path.join(dist, part.split(' ')[0])), `${p} srcset ${part}`);
  }
});

test('demo robots.txt blocks nothing and advertises no sitemap; sitemap lists every public page', () => {
  const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
  const lines = robots.split(/\r?\n/).map((l) => l.trim());
  assert.ok(lines.includes('User-agent: *'));
  assert.ok(lines.includes('Disallow:'), 'nothing is disallowed, so crawlers can read the noindex tag');
  assert.ok(!lines.some((l) => l.startsWith('Disallow:') && l !== 'Disallow:'), 'no path is blocked');
  assert.ok(!lines.some((l) => l.startsWith('Sitemap:')), 'preview sitemap is not advertised');
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  const locs = xml.split('<loc>').slice(1).map((part) => new URL(part.split('</loc>')[0]).pathname);
  assert.deepEqual(locs, ['/', '/menu/', '/private-hire/', '/visit/', '/privacy/', '/cookies/']);
  for (const p of locs) assert.ok(fs.existsSync(path.join(dist, p, 'index.html')), `sitemap page ${p} exists`);
  assert.doesNotMatch(xml, /404/);
});

test('every menu item in the data appears on the built menu page with its price', () => {
  const html = fs.readFileSync(path.join(dist, 'menu/index.html'), 'utf8');
  let count = 0;
  for (const cat of loadContent().menu.categories)
    for (const g of cat.groups)
      for (const item of g.items) {
        count++;
        const block = html.slice(html.indexOf(`id="${item.id}"`)).split('</li>\n')[0];
        assert.ok(html.includes(`id="${item.id}"`), item.id);
        for (const p of item.variants ? item.variants.map((v) => v.price) : [item.price]) assert.ok(block.includes(`£${p.toFixed(2)}`), `${item.id} £${p}`);
      }
  assert.equal(count, 54); // hand-counted from the PDF
});
