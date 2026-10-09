<?php
declare(strict_types=1);

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_valid(string $token): bool {
    return !empty($_SESSION['csrf']) && $token !== '' && hash_equals($_SESSION['csrf'], $token);
}

function origin_allowed(string $origin, string $host): bool {
    if ($origin === '') return true;
    if (in_array($origin, config()['allowed_origins'] ?? [], true)) return true;
    $parts = parse_url($origin);
    if (!$parts || empty($parts['host'])) return false;
    $originHost = $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
    return strcasecmp($originHost, $host) === 0;
}

function csrf_require(): void {
    $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? $_SERVER['HTTP_HOST'] ?? '';
    if (!origin_allowed($_SERVER['HTTP_ORIGIN'] ?? '', $host)) throw new HttpError(403, 'Neplatný pôvod požiadavky.');
    if (!csrf_valid($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) throw new HttpError(403, 'Neplatný bezpečnostný token. Obnovte stránku.');
}
