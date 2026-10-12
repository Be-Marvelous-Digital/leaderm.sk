<?php
declare(strict_types=1);

/*
 * Ochrana prihlásenia (OWASP: Blocking Brute Force Attacks / Device Cookies).
 *
 *  - IP + e-mail:   5 neúspešných pokusov / 15 min  – platí vždy
 *  - IP (všetky e-maily): 20 / 15 min               – password spraying z jednej siete
 *  - e-mail (všetky IP):  20 / 15 min               – distribuovaný útok na jeden účet
 *
 * IP a e-mailové limity sa NEuplatnia na zariadenie, z ktorého sa používateľ už úspešne
 * prihlásil (trusted device cookie). Útočník tak nemôže lekárku zamknúť z vlastného
 * zariadenia – a sám k tomuto cookie nemá prístup.
 *
 * IPv6 sa počíta po /64 (jeden pripojený klient dostáva celý /64 rozsah).
 */

const RL_WINDOW_MIN = 15;
const RL_MAX_PAIR = 5;
const RL_MAX_IP = 20;
const RL_MAX_EMAIL = 20;
const RL_LOCK_TIMEOUT = 10;

const DEVICE_COOKIE = 'ldm_device';
const DEVICE_TTL_DAYS = 180;

function rl_ip_key(string $packed): string {
    if (strlen($packed) !== 16) return $packed;
    if (str_starts_with($packed, str_repeat("\0", 10) . "\xff\xff")) return substr($packed, 12);
    return substr($packed, 0, 8) . str_repeat("\0", 8);
}

/** @return array{pair:int, ip:int, email:int} */
function rl_counts(string $ip, string $email): array {
    $st = db()->prepare('SELECT
            COALESCE(SUM(ip = ? AND email = ?), 0) AS pair,
            COALESCE(SUM(ip = ?), 0) AS by_ip,
            COALESCE(SUM(email = ?), 0) AS by_email
        FROM login_attempts
        WHERE (ip = ? OR email = ?) AND attempted_at > NOW() - INTERVAL ' . RL_WINDOW_MIN . ' MINUTE');
    $st->execute([$ip, $email, $ip, $email, $ip, $email]);
    $r = $st->fetch();
    return ['pair' => (int) $r['pair'], 'ip' => (int) $r['by_ip'], 'email' => (int) $r['by_email']];
}

function rl_blocked(string $ip, string $email, bool $trustedDevice = false): bool {
    $c = rl_counts(rl_ip_key($ip), email_norm($email));
    if ($c['pair'] >= RL_MAX_PAIR) return true;
    if ($trustedDevice) return false;
    return $c['ip'] >= RL_MAX_IP || $c['email'] >= RL_MAX_EMAIL;
}

function rl_record(string $ip, string $email): void {
    db()->prepare('INSERT INTO login_attempts (ip, email) VALUES (?, ?)')
        ->execute([rl_ip_key($ip), mb_substr(email_norm($email), 0, 190)]);
    if (random_int(1, 50) === 1) db()->exec('DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL 1 DAY');
}

/** Po úspešnom prihlásení zmaže iba pokusy z tejto IP na tento e-mail – cudzie pokusy na účet ostávajú. */
function rl_clear(string $ip, string $email): void {
    db()->prepare('DELETE FROM login_attempts WHERE ip = ? AND email = ?')->execute([rl_ip_key($ip), email_norm($email)]);
}

/**
 * Serializuje kontrolu limitu + overenie hesla pre jeden e-mail, aby paralelné requesty
 * nemohli naraz prejsť cez rl_blocked() skôr, než sa zapíšu.
 */
function rl_with_lock(string $email, callable $fn): mixed {
    $name = 'ldm_login_' . substr(hash('sha256', email_norm($email)), 0, 40);
    $st = db()->prepare('SELECT GET_LOCK(?, ?)');
    $st->execute([$name, RL_LOCK_TIMEOUT]);
    if ((int) $st->fetchColumn() !== 1) throw new HttpError(429, 'Server je zaneprázdnený. Skúste to znova o chvíľu.');
    try {
        return $fn();
    } finally {
        db()->prepare('SELECT RELEASE_LOCK(?)')->execute([$name]);
    }
}

/* ---------- Dôveryhodné zariadenie ---------- */

function device_token_from_cookie(): string {
    $t = $_COOKIE[DEVICE_COOKIE] ?? '';
    return is_string($t) && preg_match('/^[a-f0-9]{64}$/', $t) ? $t : '';
}

function device_is_trusted(string $token, string $email): bool {
    if ($token === '') return false;
    $st = db()->prepare('SELECT 1 FROM trusted_devices d JOIN users u ON u.id = d.user_id
        WHERE d.token_hash = ? AND u.email = ? AND d.last_used_at > NOW() - INTERVAL ' . DEVICE_TTL_DAYS . ' DAY');
    $st->execute([hash('sha256', $token), email_norm($email)]);
    return (bool) $st->fetchColumn();
}

/** Po úspešnom prihlásení: obnoví existujúce zariadenie alebo vydá nové. Vracia token pre cookie. */
function device_remember(int $userId, string $token): string {
    if ($token !== '') {
        $st = db()->prepare('SELECT id FROM trusted_devices WHERE token_hash = ? AND user_id = ?');
        $st->execute([hash('sha256', $token), $userId]);
        $id = $st->fetchColumn();
        if ($id !== false) {
            db()->prepare('UPDATE trusted_devices SET last_used_at = NOW() WHERE id = ?')->execute([$id]);
            return $token;
        }
    }
    $token = bin2hex(random_bytes(32));
    db()->prepare('INSERT INTO trusted_devices (user_id, token_hash) VALUES (?, ?)')->execute([$userId, hash('sha256', $token)]);
    if (random_int(1, 20) === 1) db()->exec('DELETE FROM trusted_devices WHERE last_used_at < NOW() - INTERVAL ' . DEVICE_TTL_DAYS . ' DAY');
    return $token;
}

function device_set_cookie(string $token): void {
    if (headers_sent()) return;
    setcookie(DEVICE_COOKIE, $token, [
        'expires' => time() + DEVICE_TTL_DAYS * 86400, 'path' => '/api/auth/',
        'secure' => (bool) config()['secure_cookie'], 'httponly' => true, 'samesite' => 'Strict',
    ]);
}
