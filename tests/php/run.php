<?php
declare(strict_types=1);
putenv('LEADERM_CONFIG=' . __DIR__ . '/../../config/config.php');
require __DIR__ . '/../../api/lib/bootstrap.php';
require __DIR__ . '/../../api/lib/announcements.php';
require __DIR__ . '/../../api/lib/ratelimit.php';
require __DIR__ . '/../../api/lib/csrf.php';
require __DIR__ . '/../../api/lib/auth.php';

$failures = 0; $count = 0;
function t(string $name, callable $fn): void {
    global $failures, $count; $count++;
    db()->beginTransaction();
    db()->exec('UPDATE announcements SET deleted_at = NOW() WHERE deleted_at IS NULL');
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
