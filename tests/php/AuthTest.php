<?php
t('verify credentials ok and wrong', function () {
    $email = 'a' . random_int(1, 1e6) . '@x.sk';
    db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
        ->execute([$email, password_hash('spravneheslo123', PASSWORD_ARGON2ID), 'A']);
    eq(auth_check_credentials($email, 'spravneheslo123')['email'] ?? null, $email);
    eq(auth_check_credentials($email, 'zle'), null);
    eq(auth_check_credentials('nikto@x.sk', 'zle'), null);
});
t('auth_user_id requires session uid and current session_version', function () {
    $uid = make_user();
    $_SESSION = [];
    throws(fn() => auth_user_id(), 401);
    $_SESSION = ['uid' => $uid, 'ver' => 0];
    eq(auth_user_id(), $uid);
    $_SESSION = ['uid' => $uid];
    throws(fn() => auth_user_id(), 401);
    $_SESSION = ['uid' => 999999, 'ver' => 0];
    throws(fn() => auth_user_id(), 401);
    $_SESSION = [];
});
t('change password requires correct current', function () {
    $email = 'p' . random_int(1, 1e6) . '@x.sk';
    db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
        ->execute([$email, pw_hash('stareheslo1234'), 'P']);
    $uid = (int) db()->lastInsertId();
    throws(fn() => auth_change_password($uid, 'zle', 'noveheslo12345'), 422);
    throws(fn() => auth_change_password($uid, 'stareheslo1234', 'kratke'), 422);
    throws(fn() => auth_change_password($uid, 'stareheslo1234', 'stareheslo1234'), 422);
    auth_change_password($uid, 'stareheslo1234', 'noveheslo12345');
    eq(auth_check_credentials($email, 'noveheslo12345')['email'] ?? null, $email);
    eq(auth_check_credentials($email, 'stareheslo1234'), null);
});

t('login normalizes e-mail (case, whitespace)', function () {
    as_ip('10.20.0.' . random_int(1, 250));
    $email = 'n' . random_int(1, 1e6) . '@x.sk';
    make_user_with($email, 'spravneheslo123');
    eq(auth_login("  \t" . strtoupper($email) . "\u{00A0} ", 'spravneheslo123')['user']['email'], $email);
    eq($_SESSION['ver'], 0);
});
t('login rejects oversized / invalid e-mail without recording attempt', function () {
    as_ip('10.21.0.' . random_int(1, 250));
    throws(fn() => auth_login(str_repeat('a', 300) . '@x.sk', 'x'), 401);
    throws(fn() => auth_login("\xff\xfe", 'x'), 401);
    eq(rl_counts(rl_ip_key(client_ip()), '')['ip'], 0);
});
t('change password: other sessions are invalidated, current stays', function () {
    $email = 's' . random_int(1, 1e6) . '@x.sk';
    $uid = make_user_with($email, 'stareheslo1234');
    as_ip('10.22.0.' . random_int(1, 250));
    auth_login($email, 'stareheslo1234');
    $other = $_SESSION;                       // druhé zariadenie s rovnakou verziou
    auth_change_password($uid, 'stareheslo1234', 'noveheslo12345');
    eq(auth_user_id(), $uid, 'current session');
    $_SESSION = $other;
    throws(fn() => auth_user_id(), 401);
});
t('change password: wrong current password is rate limited', function () {
    $email = 'w' . random_int(1, 1e6) . '@x.sk';
    $uid = make_user_with($email, 'stareheslo1234');
    as_ip('10.23.0.' . random_int(1, 250));
    for ($i = 0; $i < 5; $i++) throws(fn() => auth_change_password($uid, 'zle', 'noveheslo12345'), 422);
    throws(fn() => auth_change_password($uid, 'stareheslo1234', 'noveheslo12345'), 429);
});
t('create-user style upsert bumps session_version', function () {
    $email = 'c' . random_int(1, 1e6) . '@x.sk';
    make_user_with($email, 'stareheslo1234');
    db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), session_version = session_version + 1')
        ->execute([$email, pw_hash('noveheslo12345'), 'T']);
    $st = db()->prepare('SELECT session_version FROM users WHERE email = ?'); $st->execute([$email]);
    eq((int) $st->fetchColumn(), 1);
});
