# Leaderm web + admin oznamov — implementačný plán

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development alebo superpowers:executing-plans. Kroky používajú checkboxy (`- [ ]`).

**Goal:** 8 predrenderovaných stránok Leaderm (React + Less) podľa dizajnu + PHP/MariaDB API a React admin pre časovo ohraničené oznamy (pop-up + sticky pás), nasaditeľné na WebSupport.

**Architecture:** Vite buildne klientský bundle a SSR bundle; `scripts/prerender.ts` vyrenderuje každú route do `dist/<route>/index.html` s SEO hlavičkou, klient hydratuje. Admin je samostatný Vite entry `/admin/`. PHP API bez frameworku (front controller `api/index.php`), PDO MariaDB, session auth + CSRF.

**Tech Stack:** Node 22 (nvm), Vite 6, React 19, TypeScript, Less (CSS moduly), Vitest + Testing Library, PHP 8.3+, MariaDB 11.4 (lokálne Docker), Playwright MCP na manuálnu kontrolu.

**Spec:** `docs/specs/2026-10-09-leaderm-web-design.md`

**Konvencie:**
- Git repo zatiaľ nie je → commity iba ak používateľ požiada. Kroky „Commit“ sú vynechané.
- Komentáre v kóde minimálne (používateľov CLAUDE.md).
- Zdroj pravdy pre markup/texty/štýly stránok: `design/*.dc.html`. Inline štýly sa prepisujú do `*.module.less` s tokenmi; `{{ }}` väzby a `DCLogic` do React hookov; `style-hover` → `:hover`; `sc-if`/`sc-for` → JSX podmienky/`map`; `dc-import` → komponent; odkazy `*.dc.html` → čisté URL.
- Dáta (kontakt, hodiny, cenníky, FAQ) iba v `src/data/site.ts`.

---

## Súborová štruktúra

```
.nvmrc                          22.13.0
package.json, tsconfig.json, vite.config.ts, vitest.config.ts
index.html                      šablóna verejných stránok (placeholders <!--head-->, <!--app-->)
admin/index.html                entry admina
docker-compose.yml              lokálna MariaDB 11.4
src/
  styles/tokens.less            farby, fonty, radius, breakpointy
  styles/base.less              reset, body, fonty @font-face, focus, skip-link, .js reveal
  data/site.ts                  kontakty, hodiny, cenníky A/B, FAQ, nav položky
  data/seo.ts                   title/description/canonical/jsonld per route
  lib/hours.ts                  stav ordinácie (otvorené/dnes/zajtra) — čistá funkcia
  lib/announcement.ts           API klient + dismiss logika — čisté funkcie
  hooks/useReveal.ts, useScrollY.ts, useMediaQuery.ts, useReducedMotion.ts
  components/Nav/…, Footer/…, FloatingCta/…, Announcement/{AnnouncementDialog,AnnouncementBar,AnnouncementHost}.tsx
  components/Faq/…, PriceTabs/…, PriceList/…, Marquee/…, Hours/…, Map/…, Breadcrumb/…, Layout.tsx
  pages/Home/…, Liecba/…, Estetika/…, Objednanie/…, ONas/…, Cennik/…, Kontakt/…, Gdpr/…
  routes.ts                     route → page komponent + seo kľúč
  entry-client.tsx              hydrateRoot podľa data-route
  entry-server.tsx              render(route) → {html, head}
  admin/main.tsx, App.tsx, api.ts, Login.tsx, List.tsx, Form.tsx, Preview.tsx, admin.module.less
scripts/prerender.ts
public/fonts/*.woff2, public/img/*, public/og.jpg, public/robots.txt, public/sitemap.xml, public/.htaccess, public/favicon.svg
api/.htaccess, api/index.php, api/lib/{bootstrap,db,http,auth,csrf,ratelimit,announcements}.php
config/config.sample.php
sql/schema.sql
bin/create-user.php
tests/php/run.php, tests/php/*Test.php
src/**/*.test.ts(x)
README.md
```

---

## Fáza A — Backend (PHP + DB)

### Task A1: Lokálna DB a schéma

**Files:** Create `docker-compose.yml`, `sql/schema.sql`

- [ ] **Step 1:** `docker-compose.yml`

```yaml
services:
  db:
    image: mariadb:11.4
    environment:
      MARIADB_ROOT_PASSWORD: root
      MARIADB_DATABASE: leaderm
      MARIADB_USER: leaderm
      MARIADB_PASSWORD: leaderm
    ports: ["3307:3306"]
    volumes: ["./sql/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro"]
```

- [ ] **Step 2:** `sql/schema.sql`

```sql
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  body TEXT NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (deleted_at, starts_at, ends_at),
  CONSTRAINT fk_ann_user FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip VARBINARY(16) NOT NULL,
  email VARCHAR(190) NOT NULL,
  attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip (ip, attempted_at),
  INDEX idx_email (email, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- [ ] **Step 3:** `docker compose up -d` → over `docker compose exec db mariadb -uleaderm -pleaderm leaderm -e "SHOW TABLES"` → 3 tabuľky.

### Task A2: Config a bootstrap

**Files:** Create `config/config.sample.php`, `config/config.php` (lokálny, gitignore), `api/lib/bootstrap.php`, `api/lib/db.php`, `api/lib/http.php`

- [ ] **Step 1:** `config/config.sample.php`

```php
<?php
return [
    'db' => [
        'dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=leaderm;charset=utf8mb4',
        'user' => 'leaderm',
        'pass' => 'CHANGE_ME',
    ],
    'timezone' => 'Europe/Bratislava',
    'session_name' => 'ldm_admin',
    'allowed_origin' => 'https://www.leaderm.sk',
    'secure_cookie' => true,
];
```

Lokálny `config/config.php`: rovnaké, `port=3307`, pass `leaderm`, `allowed_origin` `http://localhost:5173`, `secure_cookie` false.

- [ ] **Step 2:** `api/lib/bootstrap.php` — nájde config v poradí: env `LEADERM_CONFIG`, `__DIR__/../../config/config.php`, `__DIR__/../../../config/config.php` (mimo webroot na hostingu).

```php
<?php
declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

function config(): array {
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $candidates = array_filter([
        getenv('LEADERM_CONFIG') ?: null,
        __DIR__ . '/../../config/config.php',
        __DIR__ . '/../../../config/config.php',
    ]);
    foreach ($candidates as $path) {
        if (is_file($path)) {
            $cfg = require $path;
            date_default_timezone_set($cfg['timezone']);
            return $cfg;
        }
    }
    throw new RuntimeException('Config not found');
}

require __DIR__ . '/db.php';
require __DIR__ . '/http.php';
```

- [ ] **Step 3:** `api/lib/db.php`

```php
<?php
declare(strict_types=1);

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $c = config()['db'];
    $pdo = new PDO($c['dsn'], $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '" . (new DateTime())->format('P') . "'");
    return $pdo;
}
```

- [ ] **Step 4:** `api/lib/http.php`

```php
<?php
declare(strict_types=1);

final class HttpError extends Exception {
    public function __construct(public int $status, string $message) { parent::__construct($message); }
}

function json_out(int $status, $data = null): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Robots-Tag: noindex');
    if ($data !== null) echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function json_in(): array {
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 20000) throw new HttpError(413, 'Požiadavka je príliš veľká.');
    $data = json_decode($raw, true);
    if (!is_array($data)) throw new HttpError(400, 'Neplatné dáta.');
    return $data;
}

function client_ip(): string {
    return inet_pton($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0') ?: "\0\0\0\0";
}
```

### Task A3: Doménová logika oznamov (TDD)

**Files:** Create `api/lib/announcements.php`, `tests/php/run.php`, `tests/php/AnnouncementsTest.php`

- [ ] **Step 1:** Test runner `tests/php/run.php`

```php
<?php
declare(strict_types=1);
putenv('LEADERM_CONFIG=' . __DIR__ . '/../../config/config.php');
require __DIR__ . '/../../api/lib/bootstrap.php';
require __DIR__ . '/../../api/lib/announcements.php';
require __DIR__ . '/../../api/lib/ratelimit.php';
require __DIR__ . '/../../api/lib/csrf.php';

$failures = 0; $count = 0;
function t(string $name, callable $fn): void {
    global $failures, $count; $count++;
    db()->beginTransaction();
    try { $fn(); echo "✓ $name\n"; }
    catch (Throwable $e) { $failures++; echo "✗ $name: {$e->getMessage()}\n"; }
    finally { db()->rollBack(); }
}
function eq($a, $b, string $msg = ''): void {
    if ($a !== $b) throw new Exception($msg . ' expected ' . var_export($b, true) . ' got ' . var_export($a, true));
}
function throws(callable $fn, int $status): void {
    try { $fn(); } catch (HttpError $e) { eq($e->status, $status); return; }
    throw new Exception("expected HttpError $status");
}
function make_user(): int {
    db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
        ->execute(['t' . bin2hex(random_bytes(4)) . '@x.sk', password_hash('x', PASSWORD_DEFAULT), 'T']);
    return (int) db()->lastInsertId();
}

foreach (glob(__DIR__ . '/*Test.php') as $f) require $f;
echo "\n$count tests, $failures failures\n";
exit($failures ? 1 : 0);
```

- [ ] **Step 2:** Testy `tests/php/AnnouncementsTest.php`

```php
<?php
t('validate rejects empty title', fn() => throws(fn() => ann_validate(['title' => '', 'body' => 'x', 'startsOn' => '2026-10-10', 'endsOn' => '2026-10-11']), 422));
t('validate rejects end before start', fn() => throws(fn() => ann_validate(['title' => 'a', 'body' => 'x', 'startsOn' => '2026-10-12', 'endsOn' => '2026-10-11']), 422));
t('validate rejects bad date', fn() => throws(fn() => ann_validate(['title' => 'a', 'body' => 'x', 'startsOn' => '2026-13-01', 'endsOn' => '2026-10-11']), 422));
t('validate rejects long body', fn() => throws(fn() => ann_validate(['title' => 'a', 'body' => str_repeat('x', 1001), 'startsOn' => '2026-10-10', 'endsOn' => '2026-10-11']), 422));
t('validate maps days to full-day range', function () {
    $v = ann_validate(['title' => ' Dovolenka ', 'body' => 'Text', 'startsOn' => '2026-10-10', 'endsOn' => '2026-10-11']);
    eq($v['title'], 'Dovolenka');
    eq($v['starts_at'], '2026-10-10 00:00:00');
    eq($v['ends_at'], '2026-10-11 23:59:59');
});
t('create + active returns it', function () {
    $u = make_user();
    $today = date('Y-m-d');
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $today, 'endsOn' => $today], $u);
    eq(ann_active()['id'] ?? null, $id);
});
t('future announcement is not active', function () {
    $u = make_user();
    $d = date('Y-m-d', strtotime('+3 days'));
    ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $d, 'endsOn' => $d], $u);
    eq(ann_active(), null);
});
t('overlap is rejected with 409', function () {
    $u = make_user();
    ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => '2030-01-01', 'endsOn' => '2030-01-10'], $u);
    throws(fn() => ann_create(['title' => 'C', 'body' => 'D', 'startsOn' => '2030-01-10', 'endsOn' => '2030-01-12'], $u), 409);
});
t('update may keep own range', function () {
    $u = make_user();
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => '2030-02-01', 'endsOn' => '2030-02-10'], $u);
    ann_update($id, ['title' => 'A2', 'body' => 'B', 'startsOn' => '2030-02-01', 'endsOn' => '2030-02-11']);
    eq(ann_get($id)['title'], 'A2');
});
t('end now deactivates', function () {
    $u = make_user();
    $today = date('Y-m-d');
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $today, 'endsOn' => $today], $u);
    ann_end_now($id);
    eq(ann_active(), null);
});
t('delete hides from list and active', function () {
    $u = make_user();
    $today = date('Y-m-d');
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $today, 'endsOn' => $today], $u);
    ann_delete($id);
    eq(ann_active(), null);
    eq(in_array($id, array_column(ann_list(), 'id'), true), false);
});
t('deleted does not block overlap', function () {
    $u = make_user();
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => '2031-01-01', 'endsOn' => '2031-01-10'], $u);
    ann_delete($id);
    ann_create(['title' => 'C', 'body' => 'D', 'startsOn' => '2031-01-05', 'endsOn' => '2031-01-06'], $u);
    eq(true, true);
});
t('missing id is 404', fn() => throws(fn() => ann_end_now(999999), 404));
```

- [ ] **Step 3:** Spusti `php tests/php/run.php` → FAIL (`ann_validate` undefined; ratelimit/csrf súbory ešte neexistujú — dočasne vytvor prázdne `api/lib/ratelimit.php` a `api/lib/csrf.php` s `<?php`).

- [ ] **Step 4:** Implementácia `api/lib/announcements.php`

```php
<?php
declare(strict_types=1);

const ANN_TITLE_MAX = 120;
const ANN_BODY_MAX = 1000;

function ann_date(mixed $v, string $field): DateTimeImmutable {
    $d = is_string($v) ? DateTimeImmutable::createFromFormat('!Y-m-d', $v) : false;
    if (!$d || $d->format('Y-m-d') !== $v) throw new HttpError(422, "Neplatný dátum ($field).");
    return $d;
}

function ann_validate(array $in): array {
    $title = trim((string) ($in['title'] ?? ''));
    $body = trim(str_replace("\r\n", "\n", (string) ($in['body'] ?? '')));
    if ($title === '' || mb_strlen($title) > ANN_TITLE_MAX) throw new HttpError(422, 'Nadpis je povinný (max ' . ANN_TITLE_MAX . ' znakov).');
    if ($body === '' || mb_strlen($body) > ANN_BODY_MAX) throw new HttpError(422, 'Text je povinný (max ' . ANN_BODY_MAX . ' znakov).');
    $start = ann_date($in['startsOn'] ?? null, 'od');
    $end = ann_date($in['endsOn'] ?? null, 'do');
    if ($end < $start) throw new HttpError(422, 'Dátum „do“ musí byť rovnaký alebo neskorší ako „od“.');
    return [
        'title' => $title,
        'body' => $body,
        'starts_at' => $start->format('Y-m-d 00:00:00'),
        'ends_at' => $end->format('Y-m-d 23:59:59'),
    ];
}

function ann_assert_no_overlap(array $v, ?int $exceptId = null): void {
    $sql = 'SELECT id FROM announcements WHERE deleted_at IS NULL AND starts_at <= ? AND ends_at >= ?';
    $args = [$v['ends_at'], $v['starts_at']];
    if ($exceptId) { $sql .= ' AND id <> ?'; $args[] = $exceptId; }
    $st = db()->prepare($sql . ' LIMIT 1');
    $st->execute($args);
    if ($st->fetch()) throw new HttpError(409, 'V tomto období už existuje iný oznam. Upravte alebo ukončite ho.');
}

function ann_row(array $r): array {
    return [
        'id' => (int) $r['id'],
        'title' => $r['title'],
        'body' => $r['body'],
        'startsAt' => $r['starts_at'],
        'endsAt' => $r['ends_at'],
        'version' => substr(hash('sha256', $r['updated_at'] . $r['title'] . $r['body'] . $r['starts_at'] . $r['ends_at']), 0, 12),
    ];
}

function ann_get(int $id): array {
    $st = db()->prepare('SELECT * FROM announcements WHERE id = ? AND deleted_at IS NULL');
    $st->execute([$id]);
    $r = $st->fetch();
    if (!$r) throw new HttpError(404, 'Oznam neexistuje.');
    return ann_row($r);
}

function ann_active(): ?array {
    $r = db()->query('SELECT * FROM announcements WHERE deleted_at IS NULL AND starts_at <= NOW() AND ends_at >= NOW() ORDER BY starts_at DESC LIMIT 1')->fetch();
    return $r ? ann_row($r) : null;
}

function ann_list(): array {
    $rows = db()->query('SELECT * FROM announcements WHERE deleted_at IS NULL ORDER BY starts_at DESC')->fetchAll();
    return array_map('ann_row', $rows);
}

function ann_create(array $in, int $userId): int {
    $v = ann_validate($in);
    ann_assert_no_overlap($v);
    db()->prepare('INSERT INTO announcements (title, body, starts_at, ends_at, created_by) VALUES (?, ?, ?, ?, ?)')
        ->execute([$v['title'], $v['body'], $v['starts_at'], $v['ends_at'], $userId]);
    return (int) db()->lastInsertId();
}

function ann_update(int $id, array $in): void {
    ann_get($id);
    $v = ann_validate($in);
    ann_assert_no_overlap($v, $id);
    db()->prepare('UPDATE announcements SET title = ?, body = ?, starts_at = ?, ends_at = ? WHERE id = ?')
        ->execute([$v['title'], $v['body'], $v['starts_at'], $v['ends_at'], $id]);
}

function ann_end_now(int $id): void {
    ann_get($id);
    db()->prepare('UPDATE announcements SET ends_at = LEAST(ends_at, NOW() - INTERVAL 1 SECOND), starts_at = LEAST(starts_at, NOW() - INTERVAL 1 SECOND) WHERE id = ?')->execute([$id]);
}

function ann_delete(int $id): void {
    ann_get($id);
    db()->prepare('UPDATE announcements SET deleted_at = NOW() WHERE id = ?')->execute([$id]);
}
```

- [ ] **Step 5:** `php tests/php/run.php` → všetky ✓.

### Task A4: Rate limit a CSRF (TDD)

**Files:** Modify `api/lib/ratelimit.php`, `api/lib/csrf.php`; Create `tests/php/SecurityTest.php`

- [ ] **Step 1:** Testy

```php
<?php
t('rate limit allows 5 then blocks', function () {
    $ip = inet_pton('10.9.9.' . random_int(1, 250)); $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) { eq(rl_blocked($ip, $email), false); rl_record($ip, $email); }
    eq(rl_blocked($ip, $email), true);
});
t('rate limit by email across IPs', function () {
    $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) rl_record(inet_pton("10.8.$i.1"), $email);
    eq(rl_blocked(inet_pton('10.7.7.7'), $email), true);
});
t('rate limit clear', function () {
    $ip = inet_pton('10.6.6.' . random_int(1, 250)); $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) rl_record($ip, $email);
    rl_clear($ip, $email);
    eq(rl_blocked($ip, $email), false);
});
t('csrf token verify', function () {
    $_SESSION = [];
    $tok = csrf_token();
    eq(csrf_valid($tok), true);
    eq(csrf_valid('nope'), false);
    eq(csrf_valid(''), false);
});
```

- [ ] **Step 2:** `php tests/php/run.php` → FAIL (funkcie chýbajú).

- [ ] **Step 3:** `api/lib/ratelimit.php`

```php
<?php
declare(strict_types=1);

const RL_MAX = 5;
const RL_WINDOW_MIN = 15;

function rl_blocked(string $ip, string $email): bool {
    $st = db()->prepare('SELECT
        (SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND attempted_at > NOW() - INTERVAL ' . RL_WINDOW_MIN . ' MINUTE) AS by_ip,
        (SELECT COUNT(*) FROM login_attempts WHERE email = ? AND attempted_at > NOW() - INTERVAL ' . RL_WINDOW_MIN . ' MINUTE) AS by_email');
    $st->execute([$ip, mb_strtolower($email)]);
    $r = $st->fetch();
    return $r['by_ip'] >= RL_MAX || $r['by_email'] >= RL_MAX;
}

function rl_record(string $ip, string $email): void {
    db()->prepare('INSERT INTO login_attempts (ip, email) VALUES (?, ?)')->execute([$ip, mb_strtolower($email)]);
    if (random_int(1, 50) === 1) db()->exec('DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL 1 DAY');
}

function rl_clear(string $ip, string $email): void {
    db()->prepare('DELETE FROM login_attempts WHERE ip = ? OR email = ?')->execute([$ip, mb_strtolower($email)]);
}
```

- [ ] **Step 4:** `api/lib/csrf.php`

```php
<?php
declare(strict_types=1);

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_valid(string $token): bool {
    return !empty($_SESSION['csrf']) && $token !== '' && hash_equals($_SESSION['csrf'], $token);
}

function csrf_require(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && $origin !== config()['allowed_origin']) throw new HttpError(403, 'Neplatný pôvod požiadavky.');
    if (!csrf_valid($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) throw new HttpError(403, 'Neplatný bezpečnostný token. Obnovte stránku.');
}
```

- [ ] **Step 5:** `php tests/php/run.php` → všetky ✓.

### Task A5: Auth (session, login, logout)

**Files:** Create `api/lib/auth.php`, `tests/php/AuthTest.php`

- [ ] **Step 1:** Test

```php
<?php
t('verify credentials ok and wrong', function () {
    $email = 'a' . random_int(1, 1e6) . '@x.sk';
    db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
        ->execute([$email, password_hash('spravneheslo123', PASSWORD_ARGON2ID), 'A']);
    eq(auth_check_credentials($email, 'spravneheslo123')['email'] ?? null, $email);
    eq(auth_check_credentials($email, 'zle'), null);
    eq(auth_check_credentials('nikto@x.sk', 'zle'), null);
});
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3:** `api/lib/auth.php`

```php
<?php
declare(strict_types=1);

const SESSION_IDLE = 1800;
const SESSION_ABSOLUTE = 28800;

function pw_hash(string $pw): string {
    return password_hash($pw, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT);
}

function session_boot(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $cfg = config();
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name($cfg['session_name']);
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'secure' => $cfg['secure_cookie'],
        'httponly' => true, 'samesite' => 'Strict',
    ]);
    session_start();
    $now = time();
    if (isset($_SESSION['uid'])) {
        if ($now - ($_SESSION['last'] ?? 0) > SESSION_IDLE || $now - ($_SESSION['started'] ?? 0) > SESSION_ABSOLUTE) {
            auth_logout();
            return;
        }
        $_SESSION['last'] = $now;
    }
}

function auth_check_credentials(string $email, string $password): ?array {
    $st = db()->prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?');
    $st->execute([mb_strtolower(trim($email))]);
    $u = $st->fetch();
    $hash = $u['password_hash'] ?? '$argon2id$v=19$m=65536,t=4,p=1$ZHVtbXlzYWx0ZHVtbXk$2pGcNw0pJx0x0JbV6c5xW1t6sD8bZtQ3xH9f8rSx8Ck';
    $ok = password_verify($password, $hash);
    if (!$u || !$ok) return null;
    if (password_needs_rehash($u['password_hash'], defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT)) {
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([pw_hash($password), $u['id']]);
    }
    unset($u['password_hash']);
    return $u;
}

function auth_login(string $email, string $password): array {
    $ip = client_ip();
    if (rl_blocked($ip, $email)) throw new HttpError(429, 'Príliš veľa pokusov. Skúste to znova o 15 minút.');
    $u = auth_check_credentials($email, $password);
    if (!$u) {
        rl_record($ip, $email);
        throw new HttpError(401, 'Nesprávny e-mail alebo heslo.');
    }
    rl_clear($ip, $email);
    session_regenerate_id(true);
    $_SESSION = ['uid' => (int) $u['id'], 'name' => $u['name'], 'email' => $u['email'], 'started' => time(), 'last' => time()];
    db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$u['id']]);
    return ['user' => ['name' => $u['name'], 'email' => $u['email']], 'csrf' => csrf_token()];
}

function auth_logout(): void {
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Strict']);
        session_destroy();
    }
}

function auth_user_id(): int {
    if (empty($_SESSION['uid'])) throw new HttpError(401, 'Prihláste sa.');
    return (int) $_SESSION['uid'];
}
```

Dummy hash: pri implementácii vygeneruj platný cez `php -r 'echo password_hash("dummy-not-used", PASSWORD_ARGON2ID);'` a vlož ho ako konštantu `AUTH_DUMMY_HASH` (aby `password_verify` trval rovnako dlho).

- [ ] **Step 4:** Doplň `require __DIR__ . '/../../api/lib/auth.php';` do `tests/php/run.php`; run → ✓.

### Task A6: Router + .htaccess API

**Files:** Create `api/index.php`, `api/.htaccess`

- [ ] **Step 1:** `api/index.php`

```php
<?php
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/announcements.php';
require __DIR__ . '/lib/ratelimit.php';
require __DIR__ . '/lib/csrf.php';
require __DIR__ . '/lib/auth.php';

header('Cache-Control: no-store');
$method = $_SERVER['REQUEST_METHOD'];
$path = '/' . trim(preg_replace('#^.*/api#', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)), '/');

try {
    if ($method === 'GET' && $path === '/announcement') {
        $a = ann_active();
        header('Cache-Control: public, max-age=60');
        if (!$a) json_out(204);
        json_out(200, $a);
    }

    session_boot();

    if ($method === 'POST' && $path === '/auth/login') {
        $in = json_in();
        json_out(200, auth_login((string) ($in['email'] ?? ''), (string) ($in['password'] ?? '')));
    }
    if ($method === 'GET' && $path === '/auth/me') {
        auth_user_id();
        json_out(200, ['user' => ['name' => $_SESSION['name'], 'email' => $_SESSION['email']], 'csrf' => csrf_token()]);
    }
    if ($method === 'POST' && $path === '/auth/logout') {
        csrf_require();
        auth_logout();
        json_out(204);
    }

    $uid = auth_user_id();
    if ($method !== 'GET') csrf_require();

    if ($path === '/admin/announcements') {
        if ($method === 'GET') json_out(200, ann_list());
        if ($method === 'POST') json_out(201, ann_get(ann_create(json_in(), $uid)));
    }
    if (preg_match('#^/admin/announcements/(\d+)(/end)?$#', $path, $m)) {
        $id = (int) $m[1];
        if (!empty($m[2]) && $method === 'POST') { ann_end_now($id); json_out(200, ['ok' => true]); }
        if (empty($m[2]) && $method === 'PUT') { ann_update($id, json_in()); json_out(200, ann_get($id)); }
        if (empty($m[2]) && $method === 'DELETE') { ann_delete($id); json_out(204); }
    }
    throw new HttpError(404, 'Nenájdené.');
} catch (HttpError $e) {
    json_out($e->status, ['error' => $e->getMessage()]);
} catch (Throwable $e) {
    error_log('[leaderm] ' . $e);
    json_out(500, ['error' => 'Nastala chyba servera.']);
}
```

- [ ] **Step 2:** `api/.htaccess`

```apache
Options -Indexes
RewriteEngine On
RewriteRule ^lib/ - [F,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L,QSA]
<IfModule mod_headers.c>
  Header set X-Robots-Tag "noindex, nofollow"
</IfModule>
```

- [ ] **Step 3:** Manuálny test: `php -S 127.0.0.1:8080 -t . api/router-dev.php` — vytvor `api/router-dev.php` (iba lokálne, nenasadzuje sa):

```php
<?php
if (str_starts_with(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/api')) { require __DIR__ . '/index.php'; return true; }
return false;
```

`curl -i localhost:8080/api/announcement` → `204`. `curl -i -X POST localhost:8080/api/auth/login -d '{"email":"x","password":"y"}'` → `401` JSON.

### Task A7: CLI create-user

**Files:** Create `bin/create-user.php`

- [ ] **Step 1:**

```php
<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../api/lib/bootstrap.php';
require __DIR__ . '/../api/lib/auth.php';

$email = mb_strtolower(trim(readline('E-mail: ') ?: ''));
$name = trim(readline('Meno: ') ?: '');
echo 'Heslo (min. 12 znakov): ';
system('stty -echo'); $pw = trim(fgets(STDIN) ?: ''); system('stty echo'); echo "\n";
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $name === '' || mb_strlen($pw) < 12) { fwrite(STDERR, "Neplatné údaje.\n"); exit(1); }
db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)')
    ->execute([$email, pw_hash($pw), $name]);
echo "Používateľ $email uložený.\n";
```

Na hostingu `bin/` leží mimo webroot vedľa `config/`; bootstrap hľadá `../../config` relatívne k `api/lib` — pre `bin/` nastav pred require `putenv('LEADERM_CONFIG=' . __DIR__ . '/../config/config.php')` ak env nie je nastavená, a `require` cestu na `api/lib` uprav podľa README (premenná `LEADERM_API_DIR`, default `__DIR__ . '/../api'`).

- [ ] **Step 2:** `php bin/create-user.php` lokálne → vytvor `test@leaderm.sk` / `testtesttest12`; login cez curl → 200 + `Set-Cookie`.

---

## Fáza B — Frontend základ

### Task B1: Projekt

- [ ] **Step 1:** `.nvmrc` = `22.13.0`; `nvm use`.
- [ ] **Step 2:** `npm init -y` a závislosti:

```bash
npm i react@19 react-dom@19
npm i -D vite@6 @vitejs/plugin-react typescript @types/react @types/react-dom less vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom tsx
```

- [ ] **Step 3:** `package.json` scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:api": "php -S 127.0.0.1:8080 api/router-dev.php",
    "build": "vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && tsx scripts/prerender.ts",
    "test": "vitest run",
    "test:php": "php tests/php/run.php",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 4:** `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  css: { modules: { localsConvention: 'camelCaseOnly' } },
  server: { proxy: { '/api': 'http://127.0.0.1:8080' } },
  build: {
    rollupOptions: {
      input: { site: resolve(__dirname, 'index.html'), admin: resolve(__dirname, 'admin/index.html') },
    },
  },
});
```

`vitest.config.ts`: `environment: 'jsdom'`, `setupFiles: ['src/test-setup.ts']` (import `@testing-library/jest-dom/vitest`). `tsconfig.json`: `strict`, `jsx: react-jsx`, `moduleResolution: bundler`, `types: ["vite/client"]`, `src/less.d.ts` s `declare module '*.module.less'`.

- [ ] **Step 5:** `npm run typecheck` → OK.

### Task B2: Fonty, tokeny, base

- [ ] **Step 1:** Stiahni woff2 (latin + latin-ext) do `public/fonts/`: Instrument Serif regular+italic, Hanken Grotesk 400/500/600 (z fonts.gstatic cez google-webfonts-helper alebo `npx fontsource` balíky `@fontsource/instrument-serif`, `@fontsource/hanken-grotesk` — skopíruj súbory `*-latin-ext-*` a `*-latin-*`). Preferované: `npm i @fontsource/instrument-serif @fontsource/hanken-grotesk` a import CSS v `base.less` (Vite ich zbalí, self-hosted).
- [ ] **Step 2:** `src/styles/tokens.less`

```less
@bg: #F7F1EA; @surface: #FFFCF8; @sand: #EFE5DA; @ink: #2A211C; @dark: #2B211C;
@terra: #A9583A; @terra-dark: #8E4630; @terra-light: #C26A49;
@blush: #F2DDD0; @peach: #E8B08F; @peach-2: #E0A483;
@muted: #6B5D53; @line: #E3D6C8; @line-2: #D9CBBB; @faint: #8A837B;
@green: #4F6B4C; @green-bg: #E4EADF; @green-ink: #3D5639; @green-dot: #5E8C5C;
@serif: 'Instrument Serif', Georgia, serif;
@sans: 'Hanken Grotesk', system-ui, sans-serif;
@ease: cubic-bezier(.2, 0, 0, 1);
@ease-io: cubic-bezier(.65, 0, .2, 1);
@max: 1240px;
@desk: ~"(min-width: 900px)";
@nav-desk: ~"(min-width: 1100px)";
@sm: ~"(max-width: 639px)";
```

- [ ] **Step 3:** `src/styles/base.less` — reset z dizajnu (`body` bg/farba/font, `a` farby, `*{box-sizing}`), `html{scroll-behavior:smooth}` v `@media (prefers-reduced-motion: no-preference)`, `:focus-visible{outline:2px solid @terra;outline-offset:3px}`, `.skip-link` (skrytý, pri focuse viditeľný hore vľavo), `.sr-only`, reveal:

```less
.js [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .9s @ease, transform 1.1s @ease; transition-delay: var(--d, 0ms); }
.js [data-reveal][data-mask] { transform: translateY(105%); }
.js [data-reveal].is-in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .js [data-reveal] { opacity: 1; transform: none; transition: none; } }
```

`index.html` obsahuje v `<head>` inline `<script>document.documentElement.classList.add('js')</script>` — CSP: pridať jeho sha256 hash do `script-src` (vypočítať v Task E1).

### Task B3: Dáta a SEO

**Files:** Create `src/data/site.ts`, `src/data/seo.ts`

- [ ] **Step 1:** `site.ts` exportuje: `CONTACT` (phone `0948 956 353`, tel `+421948956353`, email, address lines, directions `['Budova vpravo','2. vchod','2. poschodie']`, ecakaren URLs: profile, app, account), `SCHEDULE: Record<number,[number,number]>` = `{1:[420,870],2:[420,870],3:[420,870],4:[420,870]}`, `NAV` (6 položiek s cestami `/liecba/` …), `PRICE_A`, `PRICE_B` (presne polia z `design/Leaderm Homepage.dc.html` riadky 591–596), `FAQ_HOME` (riadky 576–583), `FAQ_ORDER` (z `Objednanie.dc.html`), `MARQUEE` (riadok 555), `COMPANY` (LEADERM, s.r.o., IČO 36 286 371, DIČ 2022178147, OS Trnava, Sro, 18268/T, konatelia).
- [ ] **Step 2:** `seo.ts`: `type Seo = {path, title, description, breadcrumb?: string, faq?: [string,string][]}`; `SEO: Record<RouteKey, Seo>` s textami z `<helmet>` každého design súboru; funkcia `renderHead(key): string` generuje `<title>`, meta description, canonical `https://www.leaderm.sk${path}`, robots, theme-color, OG/Twitter, a JSON-LD `@graph` (MedicalClinic objekt rovnaký ako v dizajne, WebPage, BreadcrumbList pre podstránky, FAQPage pre home). Hodnoty escapuj (`&`,`<`,`>`,`"`). JSON-LD cez `JSON.stringify(...).replace(/</g,'\\u003c')`.
- [ ] **Step 3:** GDPR route `gdpr`: path `/ochrana-osobnych-udajov/`, title `Ochrana osobných údajov | Leaderm`, description `Informácie o spracúvaní osobných údajov na webe LEADERM, s.r.o.`

### Task B4: Čisté funkcie — hodiny a oznam (TDD)

**Files:** Create `src/lib/hours.ts`, `src/lib/hours.test.ts`, `src/lib/announcement.ts`, `src/lib/announcement.test.ts`

- [ ] **Step 1:** Testy hodín

```ts
import { describe, it, expect } from 'vitest';
import { status } from './hours';

const at = (iso: string) => new Date(iso);
describe('status', () => {
  it('open during hours', () => expect(status(at('2026-10-12T09:00:00'))).toMatchObject({ kind: 'open', label: 'Otvorené', time: 'do 14:30' }));
  it('before opening today', () => expect(status(at('2026-10-12T06:00:00'))).toMatchObject({ kind: 'today', label: 'Dnes', time: 'od 7:00' }));
  it('after hours Monday -> tomorrow', () => expect(status(at('2026-10-12T15:00:00'))).toMatchObject({ kind: 'later', label: 'Zajtra', time: 'od 7:00' }));
  it('Thursday evening -> Pondelok', () => expect(status(at('2026-10-15T18:00:00'))).toMatchObject({ label: 'Pondelok' }));
  it('Sunday -> tomorrow', () => expect(status(at('2026-10-11T10:00:00'))).toMatchObject({ label: 'Zajtra' }));
});
```

- [ ] **Step 2:** `npx vitest run src/lib/hours.test.ts` → FAIL.
- [ ] **Step 3:** `hours.ts`

```ts
import { SCHEDULE } from '../data/site';

export type OpenStatus = { kind: 'open' | 'today' | 'later'; label: string; time: string; nextDow: number };
const DAY = ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'];
const hm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

export function status(now: Date): OpenStatus {
  const dow = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const t = SCHEDULE[dow];
  if (t && mins >= t[0] && mins < t[1]) return { kind: 'open', label: 'Otvorené', time: `do ${hm(t[1])}`, nextDow: dow };
  if (t && mins < t[0]) return { kind: 'today', label: 'Dnes', time: `od ${hm(t[0])}`, nextDow: dow };
  let n = dow;
  for (let i = 1; i <= 7; i++) { n = (dow + i) % 7; if (SCHEDULE[n]) break; }
  return { kind: 'later', label: n === (dow + 1) % 7 ? 'Zajtra' : DAY[n], time: `od ${hm(SCHEDULE[n][0])}`, nextDow: n };
}
```

- [ ] **Step 4:** Testy oznamu

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { dismissKey, isDismissed, markDismissed, formatRange } from './announcement';

const a = { id: 3, title: 'Dovolenka', body: 'x', startsAt: '2026-10-12 00:00:00', endsAt: '2026-10-23 23:59:59', version: 'abc' };
describe('announcement', () => {
  beforeEach(() => localStorage.clear());
  it('key combines id and version', () => expect(dismissKey(a)).toBe('3:abc'));
  it('not dismissed by default', () => expect(isDismissed(a)).toBe(false));
  it('dismiss persists', () => { markDismissed(a); expect(isDismissed(a)).toBe(true); });
  it('new version shows again', () => { markDismissed(a); expect(isDismissed({ ...a, version: 'def' })).toBe(false); });
  it('storage failure is safe', () => {
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    expect(isDismissed(a)).toBe(false);
    Storage.prototype.getItem = orig;
  });
  it('formats range', () => expect(formatRange(a)).toBe('12. 10. – 23. 10. 2026'));
  it('formats single day', () => expect(formatRange({ ...a, endsAt: '2026-10-12 23:59:59' })).toBe('12. 10. 2026'));
});
```

- [ ] **Step 5:** `announcement.ts`

```ts
export type Announcement = { id: number; title: string; body: string; startsAt: string; endsAt: string; version: string };
const KEY = 'leaderm-ann-dismissed';

export const dismissKey = (a: Announcement) => `${a.id}:${a.version}`;

export function isDismissed(a: Announcement): boolean {
  try { return localStorage.getItem(KEY) === dismissKey(a); } catch { return false; }
}

export function markDismissed(a: Announcement): void {
  try { localStorage.setItem(KEY, dismissKey(a)); } catch { /* storage unavailable */ }
}

const parts = (s: string) => s.slice(0, 10).split('-').map(Number) as [number, number, number];

export function formatRange(a: Pick<Announcement, 'startsAt' | 'endsAt'>): string {
  const [y1, m1, d1] = parts(a.startsAt);
  const [y2, m2, d2] = parts(a.endsAt);
  if (y1 === y2 && m1 === m2 && d1 === d2) return `${d1}. ${m1}. ${y1}`;
  return y1 === y2 ? `${d1}. ${m1}. – ${d2}. ${m2}. ${y2}` : `${d1}. ${m1}. ${y1} – ${d2}. ${m2}. ${y2}`;
}

export async function fetchActive(signal?: AbortSignal): Promise<Announcement | null> {
  const r = await fetch('/api/announcement', { signal, headers: { Accept: 'application/json' } });
  if (r.status !== 200) return null;
  return (await r.json()) as Announcement;
}
```

- [ ] **Step 6:** `npm test` → PASS.

### Task B5: Hooky

**Files:** `src/hooks/useReveal.ts`, `useScrollY.ts`, `useMediaQuery.ts`, `useReducedMotion.ts`

- [ ] **Step 1:** `useMediaQuery(q, ssrDefault)` — `useSyncExternalStore` nad `matchMedia`, server snapshot = `ssrDefault`.
- [ ] **Step 2:** `useReducedMotion()` = `useMediaQuery('(prefers-reduced-motion: reduce)', false)`.
- [ ] **Step 3:** `useScrollY()` — `useSyncExternalStore` s pasívnym scroll listenerom, throttling cez rAF, server snapshot 0.
- [ ] **Step 4:** `useReveal()` — volá sa raz v `Layout`: po mounte nastaví `style.setProperty('--d', data-d+'ms')` na každý `[data-reveal]`, `IntersectionObserver` (threshold .12) pridá `.is-in`; prvky už vo viewporte dostanú `.is-in` po `document.fonts.ready` + 2× rAF (správanie z dizajnu `ready()`).

---

## Fáza C — Komponenty a stránky

Pre každý komponent: markup a štýly preniesť 1:1 z uvedených riadkov dizajnu, inline štýly do `X.module.less`, `{{ }}` hodnoty do React stavu. Prístupnostné doplnky sú uvedené explicitne.

### Task C1: Layout, Nav, Footer, FloatingCta, Breadcrumb

**Zdroj:** `design/SiteNav.dc.html`, `design/SiteFooter.dc.html`

- [ ] **Step 1:** `Layout.tsx`: props `{active: RouteKey, overHero?: boolean, footerBg?: string, children}`. Renderuje skip-link `<a class="skip-link" href="#obsah">Preskočiť na obsah</a>`, `<Nav>`, `<main id="obsah" tabIndex={-1}>`, `<Footer>`, `<FloatingCta>`, `<AnnouncementHost>`; volá `useReveal()`.
- [ ] **Step 2:** `Nav`: desktop (≥1100) pill header + mobil header + fullscreen menu. Na home `position:fixed`, inde `sticky` (prop `overHero`). Pozadie podľa `scrollY > 40`. Status pill z `status(new Date())` — počas SSR sa nerenderuje (render až po mounte cez `useEffect` stav `mounted`, aby nevznikol hydration mismatch). Linky z `NAV`; aktívny `aria-current="page"`. Mobilné menu: `<button aria-expanded aria-controls="mobile-menu" aria-label="Otvoriť menu"/"Zavrieť menu">`, Esc zatvára, `body` overflow hidden pri otvorení, focus na prvý link, po zatvorení späť na tlačidlo. Oba headery renderované vždy, prepínané CSS media query (nie JS) — kvôli SSR.
- [ ] **Step 3:** `Footer` podľa dizajnu; „Ochrana osobných údajov“ → `/ochrana-osobnych-udajov/`; „Späť hore“ `href="#obsah"` + smooth scroll; veľké „Leaderm“ `aria-hidden`; rok `©` z `new Date().getFullYear()` pri builde.
- [ ] **Step 4:** `FloatingCta`: zobrazí sa pri `scrollY > innerHeight*0.9`; `bottom: calc(20px + var(--ann-bar-h, 0px))`; `aria-hidden` + `inert` keď je skrytá.
- [ ] **Step 5:** `Breadcrumb` `<nav aria-label="Omrvinková navigácia">` s `<ol>`.

### Task C2: Announcement (TDD na správanie)

**Files:** `src/components/Announcement/AnnouncementHost.tsx`, `AnnouncementDialog.tsx`, `AnnouncementBar.tsx`, `Announcement.module.less`, `Announcement.test.tsx`

- [ ] **Step 1:** Test

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnnouncementHost } from './AnnouncementHost';

const ann = { id: 1, title: 'Dovolenka', body: 'Ambulancia bude zatvorená.', startsAt: '2026-10-12 00:00:00', endsAt: '2026-10-23 23:59:59', version: 'v1' };
const mockFetch = (status: number, body?: unknown) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status, json: async () => body }));

describe('AnnouncementHost', () => {
  beforeEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

  it('renders nothing without announcement', async () => {
    mockFetch(204);
    const { container } = render(<AnnouncementHost />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('shows dialog, then bar after closing, reopens from bar', async () => {
    mockFetch(200, ann);
    render(<AnnouncementHost />);
    const dialog = await screen.findByRole('dialog', { name: 'Dovolenka' });
    expect(dialog).toHaveTextContent('12. 10. – 23. 10. 2026');
    await userEvent.click(screen.getByRole('button', { name: 'Rozumiem' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    const bar = screen.getByRole('region', { name: 'Oznam' });
    expect(bar).toHaveTextContent('Dovolenka');
    await userEvent.click(screen.getByRole('button', { name: /Viac/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Escape closes dialog', async () => {
    mockFetch(200, ann);
    render(<AnnouncementHost />);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('dismissed version goes straight to bar', async () => {
    localStorage.setItem('leaderm-ann-dismissed', '1:v1');
    mockFetch(200, ann);
    render(<AnnouncementHost />);
    await screen.findByRole('region', { name: 'Oznam' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implementácia:
  - `AnnouncementHost`: `useEffect` → `fetchActive(abort)`; stav `ann`, `open`. Po načítaní `open = !isDismissed(ann)`. `close()` → `markDismissed`, `open=false`. Renderuje `<AnnouncementBar>` (vždy keď `ann`) a `<AnnouncementDialog>` keď `open`. Chyby fetch ignoruje.
  - `AnnouncementDialog`: natívny `<dialog>` s `showModal()` (focus trap, Esc a `::backdrop` zadarmo); `aria-labelledby` na `<h2>`; `onCancel` → close; klik na backdrop (target === dialog) → close; tlačidlo „Rozumiem“ autofocus; pri zatvorení vráti focus na `document.activeElement` uložený pri otvorení. jsdom: ak `HTMLDialogElement.prototype.showModal` chýba, v `src/test-setup.ts` polyfill: `showModal(){this.open=true}`, `close(){this.open=false; this.dispatchEvent(new Event('close'))}` a Esc test rieši `keydown` listener na dokumente v komponente (`if (e.key==='Escape') onClose()`).
    Vizuál: karta `@surface`, radius 28px, max-width 520px, padding clamp(24px,4vw,40px); eyebrow „Oznam“ (12px, letter-spacing .2em, uppercase, `@terra`), nadpis serif clamp(32px,4vw,44px), dátumový chip (`@blush` bg, `@terra-dark` text, pill), text 17px/1.6 `@muted` s `white-space: pre-line`, tlačidlo `@terra` pill „Rozumiem“; `::backdrop{background:rgba(42,33,28,.55);backdrop-filter:blur(6px)}`; vstupná animácia scale .96→1 + fade 300ms (vypnutá pri reduced-motion).
  - `AnnouncementBar`: `<section role="region" aria-label="Oznam">` fixed bottom 0, left/right 0, z-index 55, `@dark` bg, `@bg` text, min-height 48px, padding 10px 16px, flex center gap 12px; bodka 8px `@peach`, text 15px ellipsis (`title` + ` · ` + dátum), `<button>` „Viac<span class=sr-only> o ozname</span>“ underline `@peach`. `ResizeObserver` nastaví `--ann-bar-h` na `document.documentElement` a `body{padding-bottom:var(--ann-bar-h)}`; pri unmount odstráni.
- [ ] **Step 4:** `npm test` → PASS.

### Task C3: Interaktívne bloky

- [ ] **Faq** (`components/Faq`): props `items: [string,string][]`, `defaultOpen?: number`. Každá otázka `<h3><button aria-expanded aria-controls={id}>`, panel `<div id role="region" aria-labelledby>`; animácia `grid-template-rows 0fr→1fr` z dizajnu (r. 404–415). Test: klik prepína `aria-expanded`.
- [ ] **PriceTabs** (`components/PriceTabs`): `role="tablist"`, 2× `role="tab"` (`aria-selected`, `aria-controls`, roving `tabIndex`, šípky ←/→ prepínajú), `role="tabpanel"`; posuvný indikátor `translateX` (r. 359–383). Test: ArrowRight prepne tab.
- [ ] **PriceList**: `<ol>` riadkov `i / n / v` (r. 366–372); varianty `tone="blush"|"sand"`.
- [ ] **Marquee**: rAF posun ako v dizajne (r. 491), `aria-hidden="true"`; pri reduced-motion statický. Pre čítačky obsah je inde.
- [ ] **Hours** (dark list z Home r. 438–445 a variant Kontakt): zvýraznenie dneška až po mounte.
- [ ] **Map**: `<iframe title="Mapa, Areál zdravia Galanta" loading="lazy">` so `src` z dizajnu, `referrerPolicy="strict-origin-when-cross-origin"`.

### Task C4: Home

**Zdroj:** `design/Leaderm Homepage.dc.html` (sekcie 01–09). Claim A.

- [ ] Hero: clip-path intro (`circle(9%)` → `circle(130%)` → `none`) a `scale` podľa stavu `intro` 0/1/2 (r. 485–486, 558–559); pri reduced-motion rovno `none`. Obrázky `/img/kupcova-portret-blur.webp` a `/img/kupcova-portret.webp` (+jpg fallback cez `<picture>`), `fetchpriority="high"`. Hero obrázok nie `loading="lazy"` (oprava oproti dizajnu, je to LCP). `h1` 3 riadky s maskovaným reveal.
- [ ] Trust strip, Dve cesty (odkazy `/liecba/`, `/estetika/`), Znamienka, eČakáreň sticky (stav `step` podľa stredu viewportu ≥900px, cyklus 2.8 s pod 900px — pozastaviť pri reduced-motion; telefón je dekoratívny → `aria-hidden="true"`, kroky sú `<ol>`), Tím (citát s postupnou opacitou — pri reduced-motion plná), Cenník (PriceTabs + 3 karty), FAQ, Kontakt (Hours + Map + e-mail karta), Footer `outerBg=@dark`.
- [ ] Foto sestry: kruh 88px s iniciálami „PF“ na `@blush`.

### Task C5: Podstránky

- [ ] `Liecba` ← `design/Liecba.dc.html`
- [ ] `Estetika` ← `design/Estetika.dc.html`
- [ ] `Objednanie` ← `design/Objednanie.dc.html` (FAQ `FAQ_ORDER`, `defaultOpen=0`)
- [ ] `ONas` ← `design/O nas.dc.html` (sestra: obdĺžnik 4:5 s iniciálami a menom namiesto image-slot)
- [ ] `Cennik` ← `design/Cennik.dc.html`
- [ ] `Kontakt` ← `design/Kontakt.dc.html`; text hodín: „Dovolenky a zmeny ordinačných hodín zverejňujeme na tomto webe a v aplikácii eČakáreň.“
- [ ] Každá stránka: jeden `h1`, Breadcrumb, odkazy na čisté URL.

### Task C6: GDPR stránka

**Files:** `src/pages/Gdpr/Gdpr.tsx`, `Gdpr.module.less`

- [ ] Layout ako `Cennik` hero (breadcrumb, veľký serif `h1` „Ochrana osobných údajov“), telo max-width 760px, sekcie `h2`:
  1. **Prevádzkovateľ** — LEADERM, s.r.o., kpt. Nálepku 727/13, 924 01 Galanta; IČO 36 286 371; DIČ 2022178147; zapísaná v Obchodnom registri Okresného súdu Trnava, oddiel Sro, vložka č. 18268/T; konatelia MUDr. Iveta Kupcová, Mgr. Lea Eliašová; kontakt leadermsro@gmail.com, 0948 956 353.
  2. **Na čo slúži tento dokument** — informácie podľa čl. 13 GDPR (Nariadenie EÚ 2016/679) a zákona č. 18/2018 Z. z. o spracúvaní osobných údajov pri používaní webu www.leaderm.sk. Poskytovanie zdravotnej starostlivosti a vedenie zdravotnej dokumentácie sa riadi zákonom č. 576/2004 Z. z. a nie je predmetom tohto dokumentu.
  3. **Komunikácia e-mailom a telefonicky** — údaje, ktoré nám pošlete (meno, e-mail, telefón, obsah správy); účel: vybavenie dopytu; právny základ: oprávnený záujem / predzmluvné vzťahy (čl. 6 ods. 1 písm. b) a f)); uchovávanie: po dobu potrebnú na vybavenie, najviac 1 rok od poslednej komunikácie, ak nevznikne iný dôvod. Upozornenie: do e-mailu neposielajte citlivé zdravotné údaje.
  4. **Objednávanie cez eČakáreň** — služba tretej strany, ktorá je samostatným prevádzkovateľom; platia jej podmienky (odkaz https://www.ecakaren.sk).
  5. **Technické údaje a hosting** — pri návšteve webu server spracúva IP adresu, čas, požadovanú stránku a typ prehliadača v serverových logoch na zaistenie bezpečnosti a prevádzky (oprávnený záujem); sprostredkovateľ Websupport s.r.o., Karadžičova 12, 821 08 Bratislava; logy sa uchovávajú podľa nastavení hostingu, spravidla niekoľko týždňov.
  6. **Mapa Google** — na stránkach Domov a Kontakt je vložená mapa Google Maps (Google Ireland Limited). Pri jej zobrazení prehliadač odošle spoločnosti Google najmä IP adresu a môže dôjsť k prenosu do USA (EU–US Data Privacy Framework). Odkaz na zásady Google.
  7. **Úložisko v prehliadači** — web neukladá cookies na sledovanie ani analytiku. V `localStorage` si pamätá iba to, že ste zavreli aktuálny oznam (technicky nevyhnutné, bez osobných údajov). Administrácia používa nevyhnutné session cookie iba pre prihláseného správcu.
  8. **Vaše práva** — prístup, oprava, vymazanie, obmedzenie, prenosnosť, námietka, odvolanie súhlasu; uplatnenie na leadermsro@gmail.com; návrh na začatie konania na Úrad na ochranu osobných údajov SR, Hraničná 12, 820 07 Bratislava 27, www.dataprotection.gov.sk.
  9. **Účinnosť** — „Tieto informácie sú účinné od 1. 11. 2026.“ (dátum upraví prevádzkovateľ pri spustení).

### Task C7: Routes, entry, prerender

- [ ] **Step 1:** `src/routes.ts`

```ts
import type { ComponentType } from 'react';
import Home from './pages/Home/Home';
import Liecba from './pages/Liecba/Liecba';
import Estetika from './pages/Estetika/Estetika';
import Objednanie from './pages/Objednanie/Objednanie';
import ONas from './pages/ONas/ONas';
import Cennik from './pages/Cennik/Cennik';
import Kontakt from './pages/Kontakt/Kontakt';
import Gdpr from './pages/Gdpr/Gdpr';

export type RouteKey = 'home' | 'liecba' | 'estetika' | 'objednanie' | 'onas' | 'cennik' | 'kontakt' | 'gdpr';
export const ROUTES: Record<RouteKey, { path: string; Page: ComponentType }> = {
  home: { path: '/', Page: Home },
  liecba: { path: '/liecba/', Page: Liecba },
  estetika: { path: '/estetika/', Page: Estetika },
  objednanie: { path: '/objednanie/', Page: Objednanie },
  onas: { path: '/o-nas/', Page: ONas },
  cennik: { path: '/cennik/', Page: Cennik },
  kontakt: { path: '/kontakt/', Page: Kontakt },
  gdpr: { path: '/ochrana-osobnych-udajov/', Page: Gdpr },
};
```

- [ ] **Step 2:** `index.html` — `<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" …><!--head--><link rel="icon" href="/favicon.svg"><script>document.documentElement.classList.add('js')</script></head><body><div id="root" data-route="<!--route-->"><!--app--></div><script type="module" src="/src/entry-client.tsx"></script></body></html>`
- [ ] **Step 3:** `entry-server.tsx`: `export function render(key: RouteKey) { const { Page } = ROUTES[key]; return { html: renderToString(<StrictMode><Page/></StrictMode>), head: renderHead(key) }; }`
- [ ] **Step 4:** `entry-client.tsx`: číta `data-route`, `hydrateRoot(root, <StrictMode><Page/></StrictMode>)`. V dev móde (`import.meta.env.DEV`) mapuje `location.pathname` na route a použije `createRoot`.
- [ ] **Step 5:** `scripts/prerender.ts`: načíta `dist/index.html`, importuje `dist-ssr/entry-server.js`, pre každú route nahradí `<!--head-->`, `<!--route-->`, `<!--app-->` a zapíše `dist/<path>/index.html`; vygeneruje `dist/sitemap.xml` (8 URL, `lastmod` dnešok); zmaže `dist-ssr`. Over: `npm run build` → `ls dist/liecba/index.html` a `grep -c "<h1" dist/index.html` = 1.

---

## Fáza D — Admin

### Task D1: API klient (TDD)

**Files:** `src/admin/api.ts`, `src/admin/api.test.ts`

- [ ] **Step 1:** Test: `request` pridá `X-CSRF-Token` pri non-GET, pri 401 vyhodí `AuthError`, pri `{error}` vyhodí `ApiError` so správou.
- [ ] **Step 2:** Implementácia

```ts
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export class AuthError extends ApiError {}
let csrf = '';
export const setCsrf = (t: string) => { csrf = t; };

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-CSRF-Token'] = csrf;
  const r = await fetch(`/api${path}`, { method, headers, credentials: 'same-origin', body: body === undefined ? undefined : JSON.stringify(body) });
  if (r.status === 204) return undefined as T;
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) throw new AuthError(401, data.error ?? 'Prihláste sa.');
  if (!r.ok) throw new ApiError(r.status, data.error ?? 'Nastala chyba.');
  return data as T;
}

export type Me = { user: { name: string; email: string }; csrf: string };
export type AnnInput = { title: string; body: string; startsOn: string; endsOn: string };
export const api = {
  me: () => request<Me>('GET', '/auth/me'),
  login: (email: string, password: string) => request<Me>('POST', '/auth/login', { email, password }),
  logout: () => request<void>('POST', '/auth/logout'),
  list: () => request<import('../lib/announcement').Announcement[]>('GET', '/admin/announcements'),
  create: (a: AnnInput) => request('POST', '/admin/announcements', a),
  update: (id: number, a: AnnInput) => request('PUT', `/admin/announcements/${id}`, a),
  end: (id: number) => request('POST', `/admin/announcements/${id}/end`),
  remove: (id: number) => request('DELETE', `/admin/announcements/${id}`),
};
```

### Task D2: Admin UI

**Files:** `admin/index.html` (`<meta name="robots" content="noindex,nofollow">`, title „Administrácia | Leaderm“), `src/admin/main.tsx`, `App.tsx`, `Login.tsx`, `List.tsx`, `Form.tsx`, `Preview.tsx`, `admin.module.less`, `Form.test.tsx`

- [ ] **App**: pri štarte `api.me()` → prihlásený/odhlásený; `AuthError` kdekoľvek → späť na Login s hláškou „Boli ste odhlásený. Prihláste sa znova.“ Header: logo „L“ kruh + „Leaderm · Administrácia“, meno, „Odhlásiť“.
- [ ] **Login**: karta `@surface` radius 28 na `@bg`, serif nadpis „Prihlásenie“, `<label>` + `<input type="email" autocomplete="username">`, `<input type="password" autocomplete="current-password">`, chyba v `role="alert"`, tlačidlo `@terra` pill (disabled počas requestu).
- [ ] **List**: sekcie Aktívny / Naplánované / Ukončené (podľa `startsAt/endsAt` vs. teraz), karta s nadpisom, rozsahom (`formatRange`), štítkom (green-bg/green-ink „Zobrazuje sa“, blush/terra-dark „Naplánovaný“, sand/muted „Ukončený“); akcie Upraviť, Ukončiť teraz (iba aktívny), Vymazať — potvrdenie natívnym `<dialog>` („Naozaj vymazať oznam „…“? Túto akciu nie je možné vrátiť.“). Prázdny stav: „Zatiaľ žiadne oznamy.“ + tlačidlo „Nový oznam“. Ukončené sa zobrazujú max. 10 posledných.
- [ ] **Form**: nadpis (max 120, počítadlo), text `<textarea>` (max 1000, počítadlo), `Dátum od` a `Dátum do` (`<input type="date">`, `min` od = dnes pri novom, `min` do = od), klientská validácia rovnakých pravidiel ako server, serverové chyby (409/422) v `role="alert"`. Náhľad vpravo (≥900px) / pod formulárom: `Preview` renderuje rovnaké `AnnouncementDialog` karty statický vzhľad (bez `showModal`) a `AnnouncementBar` v ráme — reuse štýlov `Announcement.module.less` cez prop `static`.
- [ ] **Form.test.tsx**: prázdny nadpis → hláška a `create` sa nevolá; `do < od` → hláška; validný → `api.create` volaný s `{title, body, startsOn, endsOn}`.
- [ ] `npm test` → PASS.

---

## Fáza E — Hardening, obsah, overenie

### Task E1: `.htaccess`, robots, og, favicon

- [ ] `public/.htaccess`

```apache
Options -Indexes
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{HTTP_HOST} ^leaderm\.sk$ [NC]
RewriteRule ^ https://www.leaderm.sk%{REQUEST_URI} [L,R=301]
RewriteRule (^|/)\. - [F]
RewriteRule ^admin/?$ /admin/index.html [L]
ErrorDocument 404 /404.html

<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "DENY"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-<HASH_JS_CLASS>'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://maps.google.com https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
  <FilesMatch "\.(js|css|woff2|webp|jpg|png|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
<IfModule mod_rewrite.c>
  RewriteRule ^admin/ - [E=NOINDEX:1]
</IfModule>
Header set X-Robots-Tag "noindex, nofollow" env=NOINDEX
```

`<HASH_JS_CLASS>` vypočítaj: `printf "%s" "document.documentElement.classList.add('js')" | openssl dgst -sha256 -binary | base64` a vlož (prerender skript môže hash vložiť automaticky — implementuj v `prerender.ts` náhradou tokenu v `dist/.htaccess`). `style-src 'unsafe-inline'` je nutné pre React `style` atribúty (CSS custom props); skripty ostávajú striktné.
- [ ] `public/robots.txt`: `User-agent: *`, `Disallow: /admin/`, `Disallow: /api/`, `Sitemap: https://www.leaderm.sk/sitemap.xml`.
- [ ] `public/favicon.svg`: kruh `#A9583A` s kurzívnym „L“ `#FFFCF8` (Instrument Serif fallback Georgia).
- [ ] `og.jpg` 1200×630: portrét vpravo, `@dark` pozadie, „Leaderm — Kožná ambulancia Galanta“ — vygeneruj skriptom `scripts/og.ts` cez `sharp` (`npm i -D sharp`) zo SVG šablóny + portrétu.
- [ ] `404.html`: jednoduchá stránka v štýle webu (prerender route `notfound`, `noindex`).

### Task E2: Obrázky

- [ ] Po dodaní plných súborov do `design/assets/` spusti `scripts/images.ts` (sharp): pre každý zdroj vytvor `public/img/<name>.webp` (q 78) a `.jpg` (q 80) v šírkach 800 a 1600; zdroje >2000px zmenši. Komponent `Img` renderuje `<picture>` so `srcset` a `width/height`.

### Task E3: README (SK) a nasadenie

- [ ] `README.md`: lokálny vývoj (`nvm use`, `docker compose up -d`, `npm run dev:api`, `npm run dev`), testy, build, štruktúra na WebSupporte:

```
/ (domovský priečinok hostingu)
  config/config.php        ← mimo webroot
  bin/create-user.php      ← mimo webroot
  <webroot>/               ← obsah dist/ + api/
```

  kroky 1–6 zo spec §11, vytvorenie DB vo WebAdmine, import `sql/schema.sql` cez phpMyAdmin, SSH `php bin/create-user.php`, kontrola securityheaders.com a Lighthouse; ako zmeniť heslo (znova create-user s rovnakým e-mailom).

### Task E4: Overenie

- [ ] `npm run typecheck && npm test && npm run test:php` → všetko zelené.
- [ ] `npm run build` → 8 HTML + `admin/index.html` + `sitemap.xml`.
- [ ] Lokálne: `php -S 127.0.0.1:8080 -t dist api/router-dev.php` (router-dev rozšír: neexistujúce cesty v `dist` → `dist/<path>/index.html`). Playwright: každá stránka bez chýb v konzole; pop-up → Rozumiem → pás → Viac → Esc; reload → rovno pás; FloatingCta nad pásom; mobil 375px bez horizontálneho scrollu; klávesnica: skip-link, menu, FAQ, taby; `emulateMedia reducedMotion`.
- [ ] Admin: login zlé heslo ×6 → 429; vytvoriť oznam na dnes → zobrazí sa na webe do 60 s; prekrytie → 409 hláška; ukončiť → zmizne; vymazať.
- [ ] Lighthouse (mobile) na `/` a `/kontakt/` ≥ 95 Performance/Accessibility/Best Practices/SEO; zapíš výsledky.
- [ ] Porovnanie so screenshotmi dizajnu (`design/screenshots/*` po exporte) — hero, pätička, FAQ.

---

## Self-review

- Spec §2 rozsah → C4–C6, D2 ✓; §3 hosting → E1, E3 ✓; §5 tokeny/animácie/no-JS/reduced-motion → B2, B5, C1–C4 ✓; §6 model+pravidlá → A1, A3 ✓, zobrazenie → C2 ✓, admin → D2 ✓; §7 API → A6 ✓; §8 bezpečnosť → A4–A6, E1 ✓; §9 SEO/a11y → B3, C1–C3, E1, E4 ✓; §10 GDPR → B2 (fonty), C3 (mapa), C6 ✓; §11 → E3 ✓; §12 testy → A3–A5, B4, C2, C3, D1, D2, E4 ✓; §13 úpravy obsahu → C1, C5 ✓; §14 obrázky → E2 ✓.
- Názvy: `fetchActive`, `isDismissed`, `markDismissed`, `formatRange`, `ann_*`, `rl_*`, `csrf_*`, `auth_*`, `status()` konzistentné naprieč taskmi.
- Výnimka z pravidla „kompletný kód v pláne“: JSX/Less stránok sa neprepisuje do plánu, zdrojom je `design/*.dc.html` s presnými odkazmi a pravidlami prevodu — duplicitný prepis ~120 KB markupu by plán znečitateľnil.
