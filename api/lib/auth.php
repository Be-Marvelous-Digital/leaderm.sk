<?php
declare(strict_types=1);

const SESSION_IDLE = 1800;
const SESSION_ABSOLUTE = 28800;
const AUTH_DUMMY_HASH = '$argon2id$v=19$m=65536,t=4,p=1$OVBWU0ZJanhNaUVhQTdSQQ$BQajMxMhBFBCprZsL14mlkbGnehz7swkq1qDyzout7M';
const AUTH_FAIL_MSG = 'Nesprávny e-mail alebo heslo.';
const AUTH_RL_MSG = 'Príliš veľa pokusov. Skúste to znova o 15 minút.';

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
    $st = db()->prepare('SELECT id, email, name, password_hash, session_version FROM users WHERE email = ?');
    $st->execute([email_norm($email)]);
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
    $email = email_norm($email);
    if ($email === '' || mb_strlen($email) > 190) throw new HttpError(401, AUTH_FAIL_MSG);
    $ip = client_ip();
    $device = device_token_from_cookie();

    $u = rl_with_lock($email, function () use ($ip, $email, $password, $device): array {
        if (rl_blocked($ip, $email, device_is_trusted($device, $email))) throw new HttpError(429, AUTH_RL_MSG);
        $u = auth_check_credentials($email, $password);
        if (!$u) {
            rl_record($ip, $email);
            throw new HttpError(401, AUTH_FAIL_MSG);
        }
        rl_clear($ip, $email);
        return $u;
    });

    device_set_cookie(device_remember((int) $u['id'], $device));
    session_regenerate_id(true);
    $_SESSION = [
        'uid' => (int) $u['id'], 'ver' => (int) $u['session_version'],
        'name' => $u['name'], 'email' => $u['email'], 'started' => time(), 'last' => time(),
    ];
    db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$u['id']]);
    return ['user' => ['name' => $u['name'], 'email' => $u['email']], 'csrf' => csrf_token()];
}

function auth_logout(): void {
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        $p = session_get_cookie_params();
        if (!headers_sent()) {
            setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Strict']);
        }
        session_destroy();
    }
}

/**
 * Overí session a zároveň, že sa medzičasom nezmenilo heslo (session_version).
 * Zmena hesla tak odhlási všetky ostatné prihlásené zariadenia.
 */
function auth_user_id(): int {
    if (empty($_SESSION['uid'])) throw new HttpError(401, 'Prihláste sa.');
    $st = db()->prepare('SELECT session_version FROM users WHERE id = ?');
    $st->execute([(int) $_SESSION['uid']]);
    $ver = $st->fetchColumn();
    if ($ver === false || (int) $ver !== (int) ($_SESSION['ver'] ?? -1)) {
        auth_logout();
        throw new HttpError(401, 'Relácia skončila. Prihláste sa znova.');
    }
    return (int) $_SESSION['uid'];
}

const PASSWORD_MIN = 12;

function auth_change_password(int $uid, string $current, string $new): void {
    $st = db()->prepare('SELECT email, password_hash FROM users WHERE id = ?');
    $st->execute([$uid]);
    $u = $st->fetch();
    if (!$u) throw new HttpError(401, 'Prihláste sa.');

    // Overenie súčasného hesla podlieha rovnakému limitu (IP + e-mail) ako prihlásenie –
    // ukradnutá session sa nedá použiť na hádanie hesla.
    $ip = client_ip();
    rl_with_lock($u['email'], function () use ($ip, $u, $current): void {
        if (rl_blocked($ip, $u['email'], true)) throw new HttpError(429, AUTH_RL_MSG);
        if (!password_verify($current, $u['password_hash'])) {
            rl_record($ip, $u['email']);
            throw new HttpError(422, 'Súčasné heslo nie je správne.');
        }
    });

    if (mb_strlen($new) < PASSWORD_MIN) throw new HttpError(422, 'Nové heslo musí mať aspoň ' . PASSWORD_MIN . ' znakov.');
    if (mb_strlen($new) > 200) throw new HttpError(422, 'Nové heslo je príliš dlhé.');
    if ($new === $current) throw new HttpError(422, 'Nové heslo musí byť iné ako súčasné.');

    db()->prepare('UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?')->execute([pw_hash($new), $uid]);
    $st = db()->prepare('SELECT session_version FROM users WHERE id = ?');
    $st->execute([$uid]);
    $_SESSION['ver'] = (int) $st->fetchColumn();
}
