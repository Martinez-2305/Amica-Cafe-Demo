// Central content loader and validation. No dependencies.
// A ContentField is: { value, status: "confirmed" | "pending", placeholder, source }
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));

export function loadContent() {
  return {
    business: read('business.json'),
    hire: read('hire.json'),
    menu: read('menu.json'),
    assets: read('assets.json'),
    reviews: read('reviews.json'),
    site: read('site.json'),
  };
}

export const isField = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) && 'status' in v && 'placeholder' in v && 'value' in v;

/** Walk any data object and return every ContentField with its path. */
export function collectFields(node, trail = '') {
  const out = [];
  if (isField(node)) {
    out.push({ path: node.key || (node.day ? `${trail}(${node.day})` : trail), field: node });
    return out;
  }
  if (Array.isArray(node)) node.forEach((n, i) => out.push(...collectFields(n, `${trail}[${i}]`)));
  else if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) out.push(...collectFields(v, trail ? `${trail}.${k}` : k));
  return out;
}

/** Site + form-delivery configuration. Both are explicit; invalid combinations are rejected. */
export function resolveConfig({ mode = process.env.SITE_MODE || 'demo', formDelivery = process.env.FORM_DELIVERY || 'preview' } = {}) {
  const errors = [];
  if (!['demo', 'live'].includes(mode)) errors.push(`SITE_MODE must be "demo" or "live" (got "${mode}")`);
  if (!['preview', 'disabled', 'live'].includes(formDelivery))
    errors.push(`FORM_DELIVERY must be "preview", "disabled" or "live" (got "${formDelivery}")`);
  if (mode === 'demo' && formDelivery === 'live') errors.push('A demo build must never deliver real enquiries (FORM_DELIVERY=live with SITE_MODE=demo).');
  if (mode === 'live' && formDelivery === 'preview') errors.push('A live site must not show the demo preview form. Use FORM_DELIVERY=disabled until real delivery exists.');
  if (formDelivery === 'live') errors.push('FORM_DELIVERY=live is not implemented: no enquiry endpoint, server validation or spam controls exist yet.');
  return { mode, formDelivery, errors };
}

/** Structural checks (always) plus launch gates (live mode only). */
export function validateContent(content, config) {
  const errors = [...config.errors];
  const warnings = [];
  const all = [
    ...collectFields(content.business, 'business'),
    ...collectFields(content.hire.sections, 'hire'),
    ...collectFields(content.menu.pending, 'menu.pending'),
  ];

  for (const { path: p, field } of all) {
    if (!['confirmed', 'pending'].includes(field.status)) errors.push(`${p}: status must be "confirmed" or "pending"`);
    if (typeof field.placeholder !== 'string' || !field.placeholder.trim()) errors.push(`${p}: a readable placeholder is required`);
    if (field.status === 'confirmed' && (field.value === null || field.value === '')) errors.push(`${p}: confirmed field has no value`);
    if (field.status === 'confirmed' && !field.source) errors.push(`${p}: confirmed field must name its source`);
    if (field.status === 'pending' && field.value !== null) errors.push(`${p}: pending field must have a null value`);
  }

  for (const f of content.business.facilities) {
    if (![true, false, null].includes(f.available)) errors.push(`facility ${f.key}: "available" must be true, false or null (unknown)`);
    if (f.available !== null && !f.source) errors.push(`facility ${f.key}: a yes/no answer must name its source`);
  }

  // Menu integrity: unique ids and a price or variants on every item.
  const ids = new Set();
  for (const cat of content.menu.categories)
    for (const g of cat.groups)
      for (const item of g.items) {
        if (ids.has(item.id)) errors.push(`menu: duplicate item id "${item.id}"`);
        ids.add(item.id);
        const hasPrice = typeof item.price === 'number' && item.price > 0;
        const hasVariants = Array.isArray(item.variants) && item.variants.length > 0 && item.variants.every((v) => typeof v.price === 'number' && v.label);
        if (hasPrice === hasVariants) errors.push(`menu: "${item.id}" needs either a price or variants (not both, not neither)`);
        if (item.needsConfirmation) warnings.push(`menu: "${item.id}" needs client confirmation – ${item.sourceNote}`);
      }

  const hireKeys = new Set(content.hire.sections.flatMap((s) => s.fields.map((f) => f.key)));
  for (const q of content.hire.faq) for (const k of q.fields) if (!hireKeys.has(k)) errors.push(`hire FAQ references unknown field "${k}"`);

  const pending = all.filter(({ field }) => field.status === 'pending');
  if (config.mode === 'live') {
    for (const { path: p, field } of pending) if (field.required) errors.push(`LIVE GATE: required content still pending – ${p}`);
    if (!content.menu.source.clientApprovedCurrent) errors.push('LIVE GATE: client has not confirmed the menu PDF is current');
    if (!content.site.urlConfirmed || content.site.url.includes('example.com')) errors.push('LIVE GATE: live site address not set in src/data/site.json');
    if (content.site.url.endsWith('/') || !content.site.url.startsWith('https://')) errors.push('LIVE GATE: site url must start with https:// and have no trailing slash');
    for (const f of content.business.facilities) if (f.available === null) warnings.push(`facility "${f.label}" unknown – it will be omitted from the live site`);
  }
  return { errors, warnings, pending, total: all.length };
}
