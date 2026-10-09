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
