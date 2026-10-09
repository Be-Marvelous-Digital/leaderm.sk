import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const { render, PATHS, SITE_URL } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);

const pages: [string, string][] = [...Object.entries(PATHS as Record<string, string>), ['notfound', '/404.html']];

for (const [key, path] of pages) {
  const { html, head } = render(key);
  const out = template.replace('<!--head-->', head).replace('<!--route-->', key).replace('<!--app-->', html);
  const file = path.endsWith('.html') ? resolve(dist, path.slice(1)) : resolve(dist, path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  console.log('prerendered', path);
}

const today = new Date().toISOString().slice(0, 10);
const urls = Object.values(PATHS as Record<string, string>)
  .map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n');
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

const inline = template.match(/<script>([^<]*)<\/script>/)?.[1] ?? '';
const hash = createHash('sha256').update(inline).digest('base64');
const htaccess = resolve(dist, '.htaccess');
if (existsSync(htaccess)) writeFileSync(htaccess, readFileSync(htaccess, 'utf8').replace('__INLINE_SCRIPT_HASH__', `'sha256-${hash}'`));

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
