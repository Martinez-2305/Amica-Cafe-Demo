// Generates optimised image derivatives from the untouched originals in /images.
// Run with: npm run images   (requires the sharp devDependency)
// Originals are never modified. Metadata (EXIF/GPS) is stripped from derivatives.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = JSON.parse(fs.readFileSync(path.join(root, 'src/data/assets.json'), 'utf8'));
const outDir = path.join(root, 'src/img');
fs.mkdirSync(outDir, { recursive: true });

for (const img of assets.images) {
  const src = path.join(root, img.original);
  const meta = await sharp(src).metadata();
  for (const w of img.widths) {
    if (w > meta.width) throw new Error(`${img.id}: ${w}px exceeds original width ${meta.width}px`);
    const base = sharp(src).rotate().resize({ width: w });
    await base.clone().webp({ quality: 78 }).toFile(path.join(outDir, `${img.id}-${w}.webp`));
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(outDir, `${img.id}-${w}.jpg`));
  }
  console.log(`✓ ${img.id} (${img.widths.join(', ')})`);
}

// Logo: the supplied file is light artwork on a black square. Convert brightness to
// alpha and recolour: warm (saturated) pixels keep the brand tan, neutral pixels
// (the lettering) become the chosen ink colour. Produces dark and light variants.
async function extractLogo(ink, name) {
  const src = path.join(root, assets.logo.original);
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  const tan = [176, 138, 104];
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const colour = sat > 0.18 ? tan : ink;
    out[j] = colour[0]; out[j + 1] = colour[1]; out[j + 2] = colour[2];
    out[j + 3] = max < 18 ? 0 : Math.min(255, Math.round(max * 1.15));
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: 480 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, name));
  console.log(`✓ ${name}`);
}
await extractLogo([43, 36, 32], 'logo-dark.png');
await extractLogo([246, 239, 230], 'logo-light.png');

// Favicon: logo on the paper colour, square.
await sharp(path.join(outDir, 'logo-dark.png'))
  .resize({ width: 96, height: 96, fit: 'contain', background: '#f6efe6' })
  .flatten({ background: '#f6efe6' })
  .extend({ top: 16, bottom: 16, left: 16, right: 16, background: '#f6efe6' })
  .png().toFile(path.join(outDir, 'favicon.png'));
console.log('✓ favicon.png');
