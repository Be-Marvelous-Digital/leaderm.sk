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
