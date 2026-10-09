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
