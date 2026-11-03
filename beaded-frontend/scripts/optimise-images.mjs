/* Turns the originals in assets-src/ into small AVIF and WebP files in public/img/,
   and writes src/data/images.json so pages know each picture's sizes. */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { extname, join, parse } from 'node:path';

import sharp from 'sharp';

const SOURCE = 'assets-src';
const OUTPUT = 'public/img';
const WIDTHS = [640, 1024, 1600];
const SKIP = new Set(['logo.png']);

await mkdir(OUTPUT, { recursive: true });

const manifest = {};
const files = (await readdir(SOURCE)).filter((file) => /\.(png|jpe?g)$/i.test(extname(file)) && !SKIP.has(file));

for (const file of files) {
  const name = parse(file).name.toLowerCase();
  const input = join(SOURCE, file);
  const { width, height } = await sharp(input).metadata();
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 1600)])];

  for (const w of widths) {
    const resized = sharp(input).resize({ width: w });
    await resized.clone().webp({ quality: 78, effort: 6 }).toFile(join(OUTPUT, `${name}-${w}.webp`));
    await resized.clone().avif({ quality: 52, effort: 5 }).toFile(join(OUTPUT, `${name}-${w}.avif`));
  }
  manifest[name] = { width, height, widths };
}

await sharp(join(SOURCE, 'logo.png')).resize(64).png({ compressionLevel: 9 }).toFile('public/favicon.png');
await sharp(join(SOURCE, 'logo.png')).resize(180).png({ compressionLevel: 9 }).toFile('public/apple-touch-icon.png');
await sharp(join(SOURCE, 'hero-flatlay.jpg')).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 78, mozjpeg: true }).toFile('public/og.jpg');

await writeFile('src/data/images.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${files.length} pictures written to ${OUTPUT}`);
