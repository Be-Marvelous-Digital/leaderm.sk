import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'release');
const web = resolve(out, 'web');

if (!existsSync(resolve(root, 'dist/index.html'))) throw new Error('Spusti najprv npm run build');

rmSync(out, { recursive: true, force: true });
mkdirSync(web, { recursive: true });

cpSync(resolve(root, 'dist'), web, { recursive: true });
cpSync(resolve(root, 'api'), resolve(web, 'api'), {
  recursive: true,
  filter: (src) => !src.endsWith('router-dev.php'),
});
mkdirSync(resolve(out, 'config'));
cpSync(resolve(root, 'config/config.sample.php'), resolve(out, 'config/config.sample.php'));
cpSync(resolve(root, 'bin'), resolve(out, 'bin'), { recursive: true });
cpSync(resolve(root, 'sql/schema.sql'), resolve(out, 'schema.sql'));

console.log('release/ pripravený:');
console.log('  web/      → nahraj do webrootu (web/) vrátane .htaccess');
console.log('  config/   → nahraj mimo webrootu, premenuj config.sample.php na config.php a vyplň');
console.log('  bin/      → nahraj mimo webrootu (vytvorenie účtu cez SSH)');
console.log('  schema.sql → importuj v phpMyAdmin (aj pri aktualizácii – obsahuje migráciu), NENAHRÁVAJ na FTP');
