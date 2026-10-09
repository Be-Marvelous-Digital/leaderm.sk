import opentype from 'opentype.js';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pub = resolve(root, 'public');
const TERRA = '#A9583A';
const CREAM = '#FFFCF8';
const BG = '#F7F1EA';

const buf = readFileSync(resolve(root, 'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff'));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

function glyphPath(size: number, box: number, scale: number): string {
  const fontSize = box * scale;
  const probe = font.getPath('L', 0, 0, fontSize).getBoundingBox();
  const x = (size - (probe.x2 - probe.x1)) / 2 - probe.x1;
  const y = (size - (probe.y2 - probe.y1)) / 2 - probe.y1;
  return font.getPath('L', x, y, fontSize).toPathData(2);
}

const circleSvg = (size: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${TERRA}"/><path fill="${CREAM}" d="${glyphPath(size, size, 0.92)}"/></svg>`;

const squareSvg = (size: number, safe: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${TERRA}"/><path fill="${CREAM}" d="${glyphPath(size, size * safe, 0.9)}"/></svg>`;

writeFileSync(resolve(pub, 'favicon.svg'), circleSvg(64));

const png = (svg: string, size: number) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

const ico16 = await png(circleSvg(64), 16);
const ico32 = await png(circleSvg(64), 32);
const ico48 = await png(circleSvg(64), 48);

function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

writeFileSync(resolve(pub, 'favicon.ico'), ico([{ size: 16, data: ico16 }, { size: 32, data: ico32 }, { size: 48, data: ico48 }]));
writeFileSync(resolve(pub, 'favicon-32.png'), ico32);
writeFileSync(resolve(pub, 'apple-touch-icon.png'), await png(squareSvg(180, 0.82), 180));
writeFileSync(resolve(pub, 'icon-192.png'), await png(circleSvg(192), 192));
writeFileSync(resolve(pub, 'icon-512.png'), await png(circleSvg(512), 512));
writeFileSync(resolve(pub, 'icon-maskable-512.png'), await png(squareSvg(512, 0.6), 512));

writeFileSync(resolve(pub, 'site.webmanifest'), JSON.stringify({
  name: 'Leaderm – kožná ambulancia Galanta',
  short_name: 'Leaderm',
  lang: 'sk',
  start_url: '/',
  display: 'browser',
  background_color: BG,
  theme_color: BG,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2) + '\n');

console.log('favicons done');
