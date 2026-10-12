<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if (!getenv('LEADERM_CONFIG')) putenv('LEADERM_CONFIG=' . __DIR__ . '/../config/config.php');
$apiDir = getenv('LEADERM_API_DIR') ?: __DIR__ . '/../api';
require $apiDir . '/lib/bootstrap.php';
require $apiDir . '/lib/auth.php';

$opts = getopt('', ['email:', 'name:', 'password-stdin']);
if (isset($opts['password-stdin'])) {
    $email = mb_strtolower(trim((string) ($opts['email'] ?? '')));
    $name = trim((string) ($opts['name'] ?? ''));
    $pw = trim(fgets(STDIN) ?: '');
} else {
    $email = mb_strtolower(trim(readline('E-mail: ') ?: ''));
    $name = trim(readline('Meno: ') ?: '');
    echo 'Heslo (min. 12 znakov): ';
    system('stty -echo'); $pw = trim(fgets(STDIN) ?: ''); system('stty echo'); echo "\n";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $name === '' || mb_strlen($pw) < 12) { fwrite(STDERR, "Neplatné údaje.\n"); exit(1); }
db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), session_version = session_version + 1')
    ->execute([$email, pw_hash($pw), $name]);
echo "Používateľ $email uložený.\n";
