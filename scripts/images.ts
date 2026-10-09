import sharp from 'sharp';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'public/img');
mkdirSync(out, { recursive: true });

const sources = [resolve(root, 'design/assets'), resolve(root, 'design/assets/stock')]
  .filter(existsSync)
  .flatMap((dir) => readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f)).map((f) => resolve(dir, f)));

for (const src of sources) {
  const name = basename(src, extname(src));
  if (name.endsWith('-blur')) {
    copyFileSync(src, resolve(out, basename(src)));
    continue;
  }
  for (const w of [800, 1600]) {
    const img = sharp(src).rotate().resize({ width: w, withoutEnlargement: true });
    await img.clone().webp({ quality: 78 }).toFile(resolve(out, `${name}-${w}.webp`));
    await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(resolve(out, `${name}-${w}.jpg`));
  }
  const meta = await sharp(src).metadata();
  console.log(name, `${meta.width}x${meta.height}`);
}
