<?php
t('verify credentials ok and wrong', function () {
    $email = 'a' . random_int(1, 1e6) . '@x.sk';
    db()->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
        ->execute([$email, password_hash('spravneheslo123', PASSWORD_ARGON2ID), 'A']);
    eq(auth_check_credentials($email, 'spravneheslo123')['email'] ?? null, $email);
    eq(auth_check_credentials($email, 'zle'), null);
    eq(auth_check_credentials('nikto@x.sk', 'zle'), null);
});
t('auth_user_id requires session uid', function () {
    $_SESSION = [];
    throws(fn() => auth_user_id(), 401);
    $_SESSION = ['uid' => 7];
    eq(auth_user_id(), 7);
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
