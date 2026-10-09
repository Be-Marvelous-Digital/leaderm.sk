<?php
declare(strict_types=1);

const SESSION_IDLE = 1800;
const SESSION_ABSOLUTE = 28800;
const AUTH_DUMMY_HASH = '$argon2id$v=19$m=65536,t=4,p=1$OVBWU0ZJanhNaUVhQTdSQQ$BQajMxMhBFBCprZsL14mlkbGnehz7swkq1qDyzout7M';

function pw_algo(): string {
    return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
}

function pw_hash(string $pw): string {
    return password_hash($pw, pw_algo());
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
    $ok = password_verify($password, $u['password_hash'] ?? AUTH_DUMMY_HASH);
    if (!$u || !$ok) return null;
    if (password_needs_rehash($u['password_hash'], pw_algo())) {
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

const PASSWORD_MIN = 12;

function auth_change_password(int $uid, string $current, string $new): void {
    $st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
    $st->execute([$uid]);
    $hash = $st->fetchColumn();
    if (!$hash) throw new HttpError(401, 'Prihláste sa.');
    if (!password_verify($current, $hash)) throw new HttpError(422, 'Súčasné heslo nie je správne.');
    if (mb_strlen($new) < PASSWORD_MIN) throw new HttpError(422, 'Nové heslo musí mať aspoň ' . PASSWORD_MIN . ' znakov.');
    if (mb_strlen($new) > 200) throw new HttpError(422, 'Nové heslo je príliš dlhé.');
    if ($new === $current) throw new HttpError(422, 'Nové heslo musí byť iné ako súčasné.');
    db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([pw_hash($new), $uid]);
}
