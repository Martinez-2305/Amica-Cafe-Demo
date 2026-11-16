// One-off helper: downloads the Latin subsets of the site fonts (both SIL Open Font License)
// from Google Fonts into src/fonts/ so they can be self-hosted. Run: node scripts/fetch-fonts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/fonts');
const files = { 'Bree Serif': 'bree-serif-latin.woff2', 'Source Sans 3': 'source-sans-3-latin-var.woff2' };
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const res = await fetch('https://fonts.googleapis.com/css2?family=Bree+Serif&family=Source+Sans+3:wght@400..700&display=swap', { headers: { 'User-Agent': ua } });
const css = await res.text();

for (const block of css.split('@font-face').slice(1)) {
  if (!block.includes('U+0000-00FF') || block.includes('italic')) continue;
  const family = block.match(/font-family: '([^']+)'/)[1];
  const url = block.match(/url\(([^)]+)\)/)[1];
  const weight = block.match(/font-weight: ([^;]+)/)[1];
  const data = Buffer.from(await (await fetch(url)).arrayBuffer());
  fs.writeFileSync(path.join(out, files[family]), data);
  console.log(`${family} (weight ${weight}) → ${files[family]} ${Math.round(data.length / 1024)} KB`);
}
