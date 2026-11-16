// Generates docs/CLIENT_CONTENT_CHECKLIST.md from the central data files so the
// questionnaire always matches the field keys. Run: npm run checklist
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, collectFields } from '../src/lib/content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { business, hire, menu } = loadContent();
const row = (key, q, fmt = '') => `| \`${key}\` | ${q} | ${fmt} | |`;
const head = '| Field key | Question | Expected format | Your answer |\n| --- | --- | --- | --- |';
const L = [];
L.push('# Amica Café – client content checklist', '',
  'Please answer what you can. Anything left blank stays as a clearly marked placeholder on the preview site.',
  'You do not need to edit any code: send the answers back and they will be added for you to review.', '',
  '**Already confirmed from supplied material:** café name (Amica Café), established 2025 (logo), walk-in policy (brief).', '');

L.push('## 1. The café', '', head);
for (const { path: p, field } of collectFields(business, 'business'))
  if (field.status === 'pending' && !p.includes('hours.opening')) L.push(row(p.replace(/^business\./, ''), field.question || field.placeholder));
L.push('', '## 2. Opening hours', '', '| Day | Opens | Closes | Notes |', '| --- | --- | --- | --- |');
for (const d of business.hours.opening) L.push(`| ${d.day} | | | |`);
L.push('', '## 3. Facilities (Yes / No / details)', '', '| Field key | Facility | Yes or No | Details |', '| --- | --- | --- | --- |');
for (const f of business.facilities) L.push(`| \`facilities.${f.key}\` | ${f.label} | | |`);
L.push('', '## 4. Menu', '', head,
  row('menu.clientApprovedCurrent', `Is the supplied menu PDF (${menu.source.file}) the latest version, with current prices?`, 'Yes / No'),
  row('menu.currency', 'Prices are printed without a £ sign. Please confirm all prices are in pounds.', 'Yes / No'),
  row('menu.eggs-benedict', 'Eggs Benedict shows "8.00/9.00" for "ham/salmon". Is ham £8.00 and salmon £9.00?', 'Yes / No'),
  row('menu.pending.hotDrinks', 'The menu has no coffee, tea, smoothies or soft drinks. Please supply the drinks list and prices.', 'List'),
  row('menu.pending.allergens', 'How can customers get allergen information, and who should they speak to?', 'Text'),
  row('menu.pending.servingTimes', 'When are breakfast and lunch served?', 'Text'),
  row('menu.serviceCharge', 'Is there any service charge or other note that should appear with the menu?', 'Text'));
L.push('', '## 5. Private hire and groups');
for (const s of hire.sections) {
  L.push('', `### ${s.title}`, '', head);
  for (const f of s.fields) L.push(row(f.key, f.question, f.format));
}
L.push('', '## 6. Photographs', '',
  '- [ ] Photograph of the owner (the site currently shows an empty placeholder)',
  '- [ ] Interior photographs of the café',
  '- [ ] Exterior / shopfront photograph',
  '- [ ] Photographs of the space set up for a celebration or group, if available',
  '- [ ] Logo as a vector file (SVG, AI, EPS or PDF) if you have one',
  '- [ ] Confirmation that you own or have permission to publish the supplied food photographs (several carry a small camera-icon mark in the corner)',
  '- [ ] Do the smoothies, latte and orange juice in the photographs represent drinks you sell?', '');
fs.writeFileSync(path.join(root, 'docs/CLIENT_CONTENT_CHECKLIST.md'), L.join('\n'));
console.log('Wrote docs/CLIENT_CONTENT_CHECKLIST.md');
