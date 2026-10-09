<?php
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/announcements.php';
require __DIR__ . '/lib/ratelimit.php';
require __DIR__ . '/lib/csrf.php';
require __DIR__ . '/lib/auth.php';

header('Cache-Control: no-store');
$method = $_SERVER['REQUEST_METHOD'];
$path = '/' . trim(preg_replace('#^.*/api#', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)), '/');

try {
    if ($method === 'GET' && $path === '/announcement') {
        $a = ann_active();
        header('Cache-Control: public, max-age=60');
        if (!$a) json_out(204);
        json_out(200, $a);
    }

    session_boot();

    if ($method === 'POST' && $path === '/auth/login') {
        $in = json_in();
        json_out(200, auth_login((string) ($in['email'] ?? ''), (string) ($in['password'] ?? '')));
    }
    if ($method === 'GET' && $path === '/auth/me') {
        auth_user_id();
        json_out(200, ['user' => ['name' => $_SESSION['name'], 'email' => $_SESSION['email']], 'csrf' => csrf_token()]);
    }
    if ($method === 'POST' && $path === '/auth/logout') {
        csrf_require();
        auth_logout();
        json_out(204);
    }

    $uid = auth_user_id();
    if ($method !== 'GET') csrf_require();

    if ($method === 'POST' && $path === '/auth/password') {
        $in = json_in();
        auth_change_password($uid, (string) ($in['current'] ?? ''), (string) ($in['new'] ?? ''));
        session_regenerate_id(true);
        json_out(200, ['ok' => true, 'csrf' => csrf_token()]);
    }

    if ($path === '/admin/announcements') {
        if ($method === 'GET') json_out(200, ann_list());
        if ($method === 'POST') json_out(201, ann_get(ann_create(json_in(), $uid)));
    }
    if (preg_match('#^/admin/announcements/(\d+)(/end)?$#', $path, $m)) {
        $id = (int) $m[1];
        if (!empty($m[2]) && $method === 'POST') { ann_end_now($id); json_out(200, ['ok' => true]); }
        if (empty($m[2]) && $method === 'PUT') { ann_update($id, json_in()); json_out(200, ann_get($id)); }
        if (empty($m[2]) && $method === 'DELETE') { ann_delete($id); json_out(204); }
    }
    throw new HttpError(404, 'Nenájdené.');
} catch (HttpError $e) {
    json_out($e->status, ['error' => $e->getMessage()]);
} catch (Throwable $e) {
    error_log('[leaderm] ' . $e);
    json_out(500, ['error' => 'Nastala chyba servera.']);
}
