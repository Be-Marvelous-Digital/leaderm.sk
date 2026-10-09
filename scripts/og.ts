import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const W = 1200, H = 630;

const portrait = await sharp(resolve(root, 'design/assets/kupcova-portret.jpg'))
  .resize({ width: 520, height: H, fit: 'cover', position: 'top' })
  .toBuffer();

const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#2B211C"/>
  <text x="72" y="120" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="#E8B08F">KOŽNÁ AMBULANCIA · GALANTA</text>
  <text x="72" y="300" font-family="Georgia, serif" font-size="92" fill="#F7F1EA">Leaderm</text>
  <text x="72" y="380" font-family="Georgia, serif" font-style="italic" font-size="44" fill="#E8B08F">MUDr. Iveta Kupcová</text>
  <text x="72" y="540" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#F7F1EA" opacity=".8">Dermatológia · Laser · Estetika</text>
</svg>`);

await sharp(text)
  .composite([{ input: portrait, left: W - 520, top: 0 }])
  .jpeg({ quality: 85 })
  .toFile(resolve(root, 'public/og.jpg'));
console.log('og.jpg done');
