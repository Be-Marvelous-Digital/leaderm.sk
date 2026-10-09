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
