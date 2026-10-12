<?php
declare(strict_types=1);

final class HttpError extends Exception {
    public function __construct(public int $status, string $message) { parent::__construct($message); }
}

function json_out(int $status, $data = null): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Robots-Tag: noindex');
    if ($data !== null) echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function json_in(): array {
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 20000) throw new HttpError(413, 'Požiadavka je príliš veľká.');
    $data = json_decode($raw, true);
    if (!is_array($data)) throw new HttpError(400, 'Neplatné dáta.');
    return $data;
}

function client_ip(): string {
    return inet_pton($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0') ?: "\0\0\0\0";
}

/** Jediný spôsob normalizácie e-mailu – používa ho prihlásenie aj rate limit. */
function email_norm(string $email): string {
    if (!mb_check_encoding($email, 'UTF-8')) return '';
    return mb_strtolower(preg_replace('/^[\s\p{Z}\x{200B}\x{FEFF}]+|[\s\p{Z}\x{200B}\x{FEFF}]+$/u', '', $email) ?? '');
}

function is_https(): bool {
    return (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off')
        || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https'
        || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';
}
