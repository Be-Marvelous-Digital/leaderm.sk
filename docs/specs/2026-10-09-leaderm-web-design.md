# Leaderm web + admin oznamov — špecifikácia

Dátum: 2026-10-09 · Stav: schválené používateľom

## 1. Cieľ

Implementovať web kožnej ambulancie LEADERM, s.r.o. podľa dizajnu z claude.ai/design (`design/*.dc.html`) a pridať jednoduchý admin, v ktorom lekárka vytvára časovo ohraničené oznamy (napr. dovolenka). Oznam sa na webe zobrazí ako pop-up a po zatvorení ako sticky pás na spodku obrazovky. Hosting: WebSupport.sk (PHP + MariaDB, bez Node.js na serveri).

## 2. Rozsah

- 7 verejných stránok: `/`, `/liecba/`, `/estetika/`, `/objednanie/`, `/o-nas/`, `/cennik/`, `/kontakt/`
- 1 nová stránka: `/ochrana-osobnych-udajov/` (GDPR)
- Admin `/admin/` (login, zoznam, vytvorenie, úprava, ukončenie, vymazanie oznamu)
- PHP API `/api/`
- Mimo rozsahu: viac jazykov, CMS pre obsah stránok, 2FA, reset hesla cez e-mail, viac používateľských rolí.

## 3. Hosting (WebSupport)

- PHP 8.2–8.5 (cieľ 8.3), MariaDB 11.4, Apache + nginx, Let's Encrypt, SSH (256 MB, 1 h).
- Node.js na serveri nie je → build lokálne, na server ide statický výstup + PHP.
- `.htaccess` (mod_rewrite, hlavičky) — overiť na hostingu pri prvom nasadení.

## 4. Architektúra

```
leader-web/
  design/                  zdrojový dizajn (read-only referencia)
  src/
    styles/                tokens.less, base.less, mixins.less
    components/            Nav, Footer, FloatingCta, Reveal, Faq, PriceTabs, Marquee, Announcement, …
    pages/                 Home, Liecba, Estetika, Objednanie, ONas, Cennik, Kontakt, Gdpr
    data/                  site.ts (kontakty, hodiny, cenníky, FAQ — jediný zdroj pravdy)
    admin/                 React admin SPA
    entry-client.tsx       hydratácia verejných stránok
    entry-server.tsx       renderToString pre prerender
  scripts/prerender.ts     po `vite build` vygeneruje dist/<route>/index.html
  public/                  fonts/, img/, og.jpg, robots.txt, sitemap.xml, .htaccess, favicon
  api/                     PHP (nasadzuje sa do webroot/api)
    index.php              router
    lib/                   db.php, auth.php, csrf.php, ratelimit.php, http.php
    announcements.php, auth.php (endpointy)
  config/config.sample.php nasadzuje sa MIMO webroot
  sql/schema.sql
  bin/create-user.php      CLI: vytvorenie/zmena hesla používateľa (mimo webroot)
```

Stack: Vite + React 19 + TypeScript + Less (CSS moduly + globálne tokeny). Bez client routera — každá verejná stránka je samostatné predrenderované HTML s hydratáciou. Admin je SPA bez SSR.

## 5. Design systém (z dizajnu)

| Token | Hodnota |
|---|---|
| bg | `#F7F1EA` |
| surface | `#FFFCF8` |
| sand | `#EFE5DA` |
| ink | `#2A211C` |
| dark | `#2B211C` |
| terra / terra-dark / terra-light | `#A9583A` / `#8E4630` / `#C26A49` |
| blush / peach / peach-2 | `#F2DDD0` / `#E8B08F` / `#E0A483` |
| muted | `#6B5D53` |
| line / line-2 | `#E3D6C8` / `#D9CBBB` |
| green / green-bg / green-ink | `#4F6B4C` / `#E4EADF` / `#3D5639` |

Fonty: Instrument Serif (400, italic) a Hanken Grotesk (400/500/600), self-hosted woff2. Pill tlačidlá, karty s radius 24–32 px, max šírka obsahu 1240 px.

Animácie z dizajnu zachovať: hero clip-path odhalenie, marquee, reveal pri scrolle, sticky telefón s krokmi eČakárne, postupný citát, cenníkové taby, FAQ akordeón, plávajúca CTA lišta. Pri `prefers-reduced-motion: reduce` sa animácie vypnú a obsah je hneď viditeľný. Obsah je viditeľný aj bez JS (skrývanie pre reveal sa aktivuje až triedou `js` na `<html>`).

## 6. Oznamy

### Dátový model (MariaDB, utf8mb4)

```sql
users(id PK, email UNIQUE, password_hash, name, created_at, last_login_at NULL)
announcements(id PK, title VARCHAR(120), body TEXT(max 1000 znakov), starts_at DATETIME, ends_at DATETIME,
              deleted_at NULL, created_by FK users, created_at, updated_at)
login_attempts(id PK, ip VARBINARY(16), email, attempted_at, INDEX(ip, attempted_at), INDEX(email, attempted_at))
```

Časy sa ukladajú v Europe/Bratislava (PHP `date_default_timezone_set` + `SET time_zone`). Formulár pracuje s dátumami: `starts_at = deň od 00:00`, `ends_at = deň do 23:59:59`.

### Pravidlá

- Aktívny oznam: `deleted_at IS NULL AND starts_at <= NOW() AND ends_at >= NOW()`.
- Naraz môže byť aktívny najviac jeden. Pri ukladaní API odmietne prekrytie intervalu s iným nevymazaným oznamom (HTTP 409, zrozumiteľná hláška).
- `ends_at >= starts_at`; text a nadpis povinné; text sa ukladá ako čistý text (zalomenia riadkov povolené), na výstupe escapovaný.
- „Ukončiť teraz“ nastaví `ends_at = NOW()`. „Vymazať“ nastaví `deleted_at` (soft delete), po potvrdení v dialógu.

### Zobrazenie na webe (všetky stránky)

- Po hydratácii `GET /api/announcement` → `{id, title, body, startsAt, endsAt, version}` alebo `204`. Odpoveď cache `max-age=60`.
- Ak existuje a v `localStorage` nie je `leaderm-ann-dismissed = <id>:<version>` → pop-up. Inak priamo pás.
- Pop-up: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, Esc a klik na pozadie zatvárajú, focus sa vráti na pôvodný prvok. Vizuál: karta `surface`, radius 28, nadpis Instrument Serif, riadok s dátumom „od – do“, tlačidlo terra „Rozumiem“. Pozadie `rgba(42,33,28,.55)` + blur.
- Pás: fixný na spodku, plná šírka, `dark` pozadie, `peach` bodka, skrátený nadpis + „Viac“ (otvorí pop-up). `role="region"` `aria-label="Oznam"`. Nedá sa zavrieť. `body` dostane `padding-bottom` = výška pásu; plávajúca CTA lišta sa posunie nad pás.
- Chyba API → nič sa nezobrazí (web funguje ďalej).

### Admin

- `/admin/` — login (e-mail + heslo), potom zoznam: Aktívny / Naplánované / Ukončené (štítky green / blush / sand).
- Formulár: nadpis, text (počítadlo znakov), dátum od, dátum do (natívny `<input type="date">`, štýlovaný), živý náhľad pop-upu a pásu.
- Akcie: Upraviť, Ukončiť teraz, Vymazať (potvrdzovací dialóg). Odhlásenie.
- Vizuál podľa webu (tokeny, fonty, pill tlačidlá, karty).

## 7. API

| Metóda | Cesta | Auth | Popis |
|---|---|---|---|
| GET | `/api/announcement` | nie | aktuálny aktívny oznam |
| POST | `/api/auth/login` | nie | `{email, password}` → session |
| POST | `/api/auth/logout` | áno | |
| GET | `/api/auth/me` | áno | `{user, csrf}` |
| GET | `/api/admin/announcements` | áno | zoznam nevymazaných |
| POST | `/api/admin/announcements` | áno+CSRF | vytvoriť |
| PUT | `/api/admin/announcements/{id}` | áno+CSRF | upraviť |
| POST | `/api/admin/announcements/{id}/end` | áno+CSRF | ukončiť teraz |
| DELETE | `/api/admin/announcements/{id}` | áno+CSRF | soft delete |

JSON všade, chyby `{error: "…"}` so správnym HTTP kódom. Validácia na serveri je autoritatívna.

## 8. Bezpečnosť

- Heslá `password_hash(PASSWORD_ARGON2ID)` (fallback BCRYPT, ak Argon2 nie je dostupný), `password_needs_rehash` pri logine. Min. dĺžka hesla 12.
- Žiadna registrácia; účet cez `php bin/create-user.php` (SSH).
- Session: vlastné meno cookie, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `session_regenerate_id(true)` po logine, idle timeout 30 min, absolútny 8 h, `session.use_strict_mode=1`.
- CSRF token v session, posielaný v hlavičke `X-CSRF-Token`, porovnanie `hash_equals`. Kontrola `Origin`.
- Rate limit: 5 neúspešných pokusov / 15 min na IP aj na e-mail → 429. Jednotná chybová hláška („Nesprávny e-mail alebo heslo“), konštantný čas (dummy verify pri neexistujúcom účte).
- Iba PDO prepared statements, `ATTR_EMULATE_PREPARES=false`.
- `.htaccess`: HTTPS redirect, HSTS, CSP (`default-src 'self'`; fonty self; `frame-src https://www.google.com https://maps.google.com`; `script-src 'self'` — JSON-LD sa nevykonáva, CSP ho neblokuje), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY`. Zakázaný listing adresárov, blok `.`-súborov.
- `/admin/` a `/api/` → `X-Robots-Tag: noindex`; `/admin/` v robots.txt Disallow.
- `config.php` mimo webroot; chyby PHP sa nezobrazujú (`display_errors=0`), logujú sa.

## 9. SEO a prístupnosť

- Meta, OG, canonical a JSON-LD (MedicalClinic, WebPage, FAQPage, BreadcrumbList) prevziať z dizajnu pre každú stránku. `og.jpg` 1200×630 vytvoriť z portrétu.
- `sitemap.xml` (8 URL), `robots.txt`, `lang="sk"`, jeden `h1` na stránku, `alt` texty.
- Obrázky: WebP + JPEG fallback, rozmery (`width/height`), `loading="lazy"` mimo hero, `fetchpriority="high"` pre hero.
- Prístupnosť (WCAG 2.2 AA): skip-link, viditeľný `:focus-visible`, FAQ `aria-expanded`/`aria-controls`, cenník `role="tablist"`/`tab`/`tabpanel` s ovládaním šípkami, mobilné menu `aria-expanded` + Esc + focus trap, kontrast textu ≥ 4.5:1, ciele dotyku ≥ 44 px.
- Cieľ Lighthouse ≥ 95 vo všetkých kategóriách.

## 10. GDPR

- Fonty self-hosted (žiadne Google Fonts).
- Google mapa: iframe sa načíta hneď (`loading="lazy"`), ako v dizajne; GDPR stránka uvádza prenos údajov (IP) spoločnosti Google pri zobrazení mapy.
- `localStorage` len na zapamätanie zatvoreného oznamu (nevyhnutné/funkčné, bez súhlasu). Žiadna analytika ani tracking → žiadna cookie lišta.
- Stránka `/ochrana-osobnych-udajov/` — prevádzkovateľ:
  - LEADERM, s.r.o., kpt. Nálepku 727/13, 924 01 Galanta
  - IČO 36 286 371, DIČ 2022178147
  - zapísaná v OR Okresného súdu Trnava, oddiel Sro, vložka č. 18268/T
  - konatelia: MUDr. Iveta Kupcová, Mgr. Lea Eliašová
  - kontakt: leadermsro@gmail.com, 0948 956 353
  - obsah: rozsah spracúvania na webe (e-mail/telefón pri kontakte, technické logy hostingu, localStorage), sprostredkovateľ hostingu (Websupport s.r.o.), tretie strany (vložená Google mapa na stránkach Domov a Kontakt, eČakáreň ako samostatný prevádzkovateľ), doby uchovávania, práva dotknutej osoby, právo podať návrh na Úrad na ochranu osobných údajov SR. Spracúvanie zdravotných údajov v ambulancii sa riadi osobitnými predpismi a nie je predmetom webu.
  - Text je šablóna na kontrolu prevádzkovateľom; na stránke dátum účinnosti.

## 11. Nasadenie

1. `npm run build` → `dist/` (statické stránky + `admin/`).
2. Nahrať `dist/*` a `api/` do webroot, `config/config.php` a `bin/` mimo webroot (overiť štruktúru adresárov na WebSupporte).
3. WebAdmin: vytvoriť MariaDB DB + používateľa, importovať `sql/schema.sql`.
4. Vyplniť `config.php` (DB, cesta, názov cookie).
5. SSH: `php bin/create-user.php` → účet lekárky.
6. Overiť HTTPS, hlavičky (securityheaders.com), Lighthouse.

Návod v `README.md` po slovensky.

## 12. Testovanie

- PHP: jednoduché testy bez frameworku (`php tests/run.php`) na validáciu, prekrytie intervalov, aktívny oznam, rate limit, CSRF; proti lokálnej MariaDB/MySQL (Docker alebo Homebrew).
- Frontend: Vitest pre logiku oznamu (dismiss/version, výber pop-up vs. pás) a formulárovú validáciu v admine.
- Manuálne/Playwright: prechod stránok, pop-up → pás → „Viac“, klávesnica (Tab, Esc), mobil 375 px, reduced-motion, admin CRUD.
- Lokálny vývoj: `vite` dev server + `php -S` pre `/api` (proxy vo Vite).

## 13. Úpravy obsahu oproti dizajnu

- Kontakt: „Dovolenky a zmeny ordinačných hodín zverejňujeme v aplikácii eČakáreň“ → „…zverejňujeme na tomto webe a v aplikácii eČakáreň“.
- Pätička: odkaz „Ochrana osobných údajov“ → `/ochrana-osobnych-udajov/`.
- Odkazy `*.dc.html` → čisté URL zo sekcie 2.

## 14. Otvorené závislosti

- Plnohodnotné obrázky z `design/assets/` — API vracia orezané súbory >190 KB; používateľ ich exportuje ručne.
- Foto sestry (v dizajne placeholder) — zatiaľ neutrálny placeholder s iniciálami.
