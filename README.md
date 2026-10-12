# Leaderm – web a administrácia oznamov

Web kožnej ambulancie LEADERM, s.r.o. (React + Less, predrenderované stránky) a jednoduchý admin na oznamy (PHP + MariaDB).

## Lokálny vývoj

Požiadavky: Node 22 (`nvm use`), PHP 8.3+ s `pdo_mysql`, Docker.

```bash
nvm use
npm install
docker compose up -d                 # MariaDB 11.4 na porte 3307 (schéma sa naimportuje automaticky)
cp config/config.sample.php config/config.php   # upraviť: port 3307, heslo leaderm, allowed_origins [http://localhost:5173], secure_cookie false
php bin/create-user.php              # vytvorí účet do adminu
npm run dev:api                      # PHP API na 127.0.0.1:8080
npm run dev                          # web na http://localhost:5173, admin na /admin/
```

## Testy

```bash
npm test             # frontend (Vitest)
npm run test:php     # backend (vyžaduje bežiacu DB)
npm run typecheck
```

## Obrázky

Plné obrázky z dizajnu patria do `design/assets/` a `design/assets/stock/`. Potom:

```bash
npm run images       # vygeneruje public/img/*-800/1600.(webp|jpg) a public/og.jpg
npm run favicons     # favicon.ico/.svg, apple-touch-icon, ikony pre manifest
```

## Build

```bash
npm run build        # dist/: 8 stránok + 404.html + admin/ + sitemap.xml + .htaccess
```

Lokálna kontrola buildu: `php -S 127.0.0.1:8080 api/router-dev.php` → http://127.0.0.1:8080

## Nasadenie na WebSupport

`npm run release` spraví build a pripraví priečinok `release/` presne v štruktúre pre hosting (`web/`, `config/`, `bin/`, `schema.sql`). Celý `leader-web` na FTP **nenahrávaj**.

Štruktúra na hostingu (koreň FTP; webroot domény býva priečinok `web/` – over vo WebAdmine):

```
/                       ← koreň hostingu (mimo webroot)
├── config/config.php   ← údaje k DB (NIKDY nie vo webroote)
├── bin/create-user.php
└── web/                ← webroot
    ├── (obsah dist/)
    └── api/            ← obsah priečinka api/
```

1. **Databáza:** WebAdmin → Databázy → vytvor MariaDB databázu a používateľa (silné heslo). V phpMyAdmin importuj `sql/schema.sql`.
2. **Config:** podľa `config/config.sample.php` vytvor `config/config.php` (DSN s hostom z WebAdminu, `allowed_origins` = `['https://www.leaderm.sk']`, `secure_cookie` = `true`) a nahraj ho do `/config/` mimo webroot. `api/lib/bootstrap.php` ho nájde o dve aj tri úrovne vyššie.
3. **Build:** `npm run build` a nahraj celý obsah `dist/` (vrátane skrytého `.htaccess`) do webrootu.
4. **API:** nahraj priečinok `api/` do webrootu (`web/api/`). `api/router-dev.php` nenahrávaj.
5. **Účet:** nahraj `bin/` mimo webroot, cez SSH spusti:
   ```bash
   LEADERM_API_DIR=~/web/api php ~/bin/create-user.php
   ```
   Rovnaký príkaz s existujúcim e-mailom zmení heslo.

   **Bez SSH:** lokálne vygeneruj hash a vlož používateľa cez phpMyAdmin (SQL):
   ```bash
   php -r 'echo password_hash(trim(fgets(STDIN)), PASSWORD_ARGON2ID), PHP_EOL;'   # zadaj heslo, skopíruj výstup
   ```
   ```sql
   INSERT INTO users (email, password_hash, name) VALUES ('leadermsro@gmail.com', '<HASH>', 'MUDr. Iveta Kupcová');
   ```
   Heslo si potom môžeš zmeniť priamo v admine (Zmeniť heslo).
6. **PHP verzia:** vo WebAdmine nastav PHP 8.3 alebo novšie.
7. **Kontrola:** https://www.leaderm.sk/admin/ (prihlásenie), vytvor testovací oznam, over pop-up a pás na webe; hlavičky na securityheaders.com; Lighthouse.

## Ako funguje oznam

- Admin → nový oznam: nadpis, text, dátum od–do (vrátane celého dňa „do“). Naraz môže platiť iba jeden oznam.
- Web načíta aktívny oznam z `/api/announcement` (cache 60 s). Prvýkrát sa zobrazí ako pop-up, po zatvorení ostáva dole úzky pás s odkazom „Viac“.
- „Ukončiť teraz“ oznam okamžite skryje, „Vymazať“ ho odstráni zo zoznamu.

## Bezpečnosť

Heslá Argon2id, session cookie HttpOnly/Secure/SameSite=Strict, CSRF token, limit 5 pokusov / 15 min, prepared statements, prísne HTTP hlavičky (CSP, HSTS) v `.htaccess`, admin a API sú `noindex`.
