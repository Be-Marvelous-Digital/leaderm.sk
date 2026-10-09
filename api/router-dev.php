<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
if ($uri === '/api' || str_starts_with($uri, '/api/')) { require __DIR__ . '/index.php'; return true; }

$dist = realpath(__DIR__ . '/../dist');
if (!$dist) return false;
$rel = rawurldecode($uri);
foreach ([$rel, rtrim($rel, '/') . '/index.html'] as $candidate) {
    $file = realpath($dist . $candidate);
    if ($file && is_file($file) && str_starts_with($file, $dist . DIRECTORY_SEPARATOR)) {
        $types = ['html' => 'text/html; charset=utf-8', 'js' => 'text/javascript', 'mjs' => 'text/javascript', 'css' => 'text/css',
            'json' => 'application/json', 'svg' => 'image/svg+xml', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp', 'avif' => 'image/avif', 'woff2' => 'font/woff2', 'ico' => 'image/x-icon', 'txt' => 'text/plain', 'xml' => 'application/xml'];
        header('Content-Type: ' . ($types[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? 'application/octet-stream'));
        readfile($file);
        return true;
    }
}
return false;
