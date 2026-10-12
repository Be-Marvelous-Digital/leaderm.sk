<?php
/* ---------- Rate limit: jednotlivé limity ---------- */

t('rate limit: IP + e-mail allows 5 then blocks (even trusted device)', function () {
    $ip = inet_pton('10.9.9.' . random_int(1, 250)); $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) { eq(rl_blocked($ip, $email), false); rl_record($ip, $email); }
    eq(rl_blocked($ip, $email), true);
    eq(rl_blocked($ip, $email, true), true);
});
t('rate limit: e-mail across IPs blocks after 20, not after 5', function () {
    $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) rl_record(inet_pton("10.8.$i.1"), $email);
    eq(rl_blocked(inet_pton('10.7.7.7'), $email), false, 'po 5 z rôznych IP');
    for ($i = 5; $i < 20; $i++) rl_record(inet_pton("10.8.$i.1"), $email);
    eq(rl_blocked(inet_pton('10.7.7.7'), $email), true, 'po 20');
    eq(rl_blocked(inet_pton('10.7.7.7'), $email, true), false, 'trusted device');
});
t('rate limit: IP across e-mails blocks after 20 (password spraying)', function () {
    $ip = inet_pton('10.5.5.' . random_int(1, 250));
    for ($i = 0; $i < 20; $i++) rl_record($ip, "spray$i-" . random_int(1, 1e6) . '@x.sk');
    eq(rl_blocked($ip, 'iny' . random_int(1, 1e6) . '@x.sk'), true);
});
t('rate limit: success clears only own IP + e-mail pair', function () {
    $ip = inet_pton('10.6.6.' . random_int(1, 250)); $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) rl_record($ip, $email);
    for ($i = 0; $i < 3; $i++) rl_record(inet_pton("10.4.4.$i"), $email);
    rl_clear($ip, $email);
    eq(rl_blocked($ip, $email), false);
    eq(rl_counts(rl_ip_key($ip), $email)['email'], 3, 'cudzie pokusy ostávajú');
});
t('rate limit: IPv6 counted per /64, IPv4-mapped as IPv4', function () {
    eq(rl_ip_key(inet_pton('2001:db8:1:2:aaaa::1')), rl_ip_key(inet_pton('2001:db8:1:2:ffff:1:2:3')));
    eq(rl_ip_key(inet_pton('2001:db8:1:2::1')) === rl_ip_key(inet_pton('2001:db8:1:3::1')), false);
    eq(rl_ip_key(inet_pton('::ffff:10.1.2.3')), inet_pton('10.1.2.3'));
    $email = 'v6' . random_int(1, 1e6) . '@x.sk';
    $p = sprintf('2001:db8:%x:%x', random_int(1, 65000), random_int(1, 65000));
    for ($i = 1; $i <= 5; $i++) rl_record(inet_pton("$p::$i"), $email);
    eq(rl_blocked(inet_pton("$p:dead:beef:1:2"), $email), true);
});

/* ---------- Rate limit: end-to-end cez auth_login ---------- */

t('login: whitespace / case variants of e-mail share one counter (bypass fixed)', function () {
    $email = 'bp' . random_int(1, 1e6) . '@x.sk';
    make_user_with($email, 'spravneheslo123');
    as_ip('10.30.0.' . random_int(1, 250));
    foreach ([" $email", "\t$email", strtoupper($email), "  $email ", "\u{00A0}$email"] as $v) {
        throws(fn() => auth_login($v, 'zleheslo'), 401);
    }
    throws(fn() => auth_login($email, 'spravneheslo123'), 429);
});
t('login: attacker cannot lock out owner on her trusted device', function () {
    $email = 'own' . random_int(1, 1e6) . '@x.sk';
    make_user_with($email, 'spravneheslo123');
    as_ip('10.31.0.1');
    auth_login($email, 'spravneheslo123');                 // vydá device token
    $st = db()->prepare('SELECT COUNT(*) FROM trusted_devices d JOIN users u ON u.id = d.user_id WHERE u.email = ?');
    $st->execute([$email]); eq((int) $st->fetchColumn(), 1);
    // útočník zo 4 sietí vyčerpá e-mailový limit
    foreach (['10.32.0.1', '10.33.0.1', '10.34.0.1', '10.35.0.1'] as $ip) { as_ip($ip); fails(5, $email); }
    as_ip('10.36.0.1');
    throws(fn() => auth_login($email, 'spravneheslo123'), 429);   // nové zariadenie: blokované
    // pravé zariadenie (token z cookie) prejde – zahodíme ho a vytvoríme vlastný pre test
    $tok = bin2hex(random_bytes(32));
    $st = db()->prepare('SELECT id FROM users WHERE email = ?'); $st->execute([$email]);
    db()->prepare('INSERT INTO trusted_devices (user_id, token_hash) VALUES (?, ?)')->execute([(int) $st->fetchColumn(), hash('sha256', $tok)]);
    $_COOKIE[DEVICE_COOKIE] = $tok;
    eq(auth_login($email, 'spravneheslo123')['user']['email'], $email);
    unset($_COOKIE[DEVICE_COOKIE]);
});
t('device token: only valid for its own user, bad format ignored', function () {
    $a = 'da' . random_int(1, 1e6) . '@x.sk'; $b = 'db' . random_int(1, 1e6) . '@x.sk';
    $ua = make_user_with($a, 'spravneheslo123'); make_user_with($b, 'spravneheslo123');
    $tok = device_remember($ua, '');
    eq(device_is_trusted($tok, $a), true);
    eq(device_is_trusted($tok, $b), false);
    eq(device_is_trusted('', $a), false);
    $_COOKIE[DEVICE_COOKIE] = "x' OR 1=1 --"; eq(device_token_from_cookie(), ''); unset($_COOKIE[DEVICE_COOKIE]);
    eq(device_remember($ua, $tok), $tok, 'existing token is reused');
});
t('login lock: GET_LOCK is acquired and released', function () {
    $email = 'lk' . random_int(1, 1e6) . '@x.sk';
    $name = 'ldm_login_' . substr(hash('sha256', $email), 0, 40);
    rl_with_lock($email, function () use ($name) {
        $st = db()->prepare('SELECT IS_FREE_LOCK(?)'); $st->execute([$name]); eq((int) $st->fetchColumn(), 0);
    });
    $st = db()->prepare('SELECT IS_FREE_LOCK(?)'); $st->execute([$name]); eq((int) $st->fetchColumn(), 1);
});

/* ---------- CSRF / origin / HTTPS ---------- */

t('csrf token verify', function () {
    $_SESSION = [];
    $tok = csrf_token();
    eq(csrf_valid($tok), true);
    eq(csrf_valid('nope'), false);
    eq(csrf_valid(''), false);
});
t('origin same host allowed', function () {
    eq(origin_allowed('http://127.0.0.1:5173', '127.0.0.1:5173'), true);
    eq(origin_allowed('https://www.leaderm.sk', 'www.leaderm.sk'), true);
});
t('origin from config list allowed', fn() => eq(origin_allowed(config()['allowed_origins'][0] ?? 'x', 'other.host'), true));
t('foreign origin rejected', fn() => eq(origin_allowed('https://evil.example', 'www.leaderm.sk'), false));
t('missing origin allowed (same-origin GET-less clients)', fn() => eq(origin_allowed('', 'www.leaderm.sk'), true));
t('login origin check (login CSRF)', function () {
    $_SERVER['HTTP_HOST'] = 'www.leaderm.sk';
    $_SERVER['HTTP_ORIGIN'] = 'https://evil.example';
    throws(fn() => origin_require(), 403);
    $_SERVER['HTTP_ORIGIN'] = 'https://www.leaderm.sk';
    origin_require();
    unset($_SERVER['HTTP_ORIGIN'], $_SERVER['HTTP_HOST']);
});
t('is_https detection', function () {
    $keep = $_SERVER; unset($_SERVER['HTTPS'], $_SERVER['HTTP_X_FORWARDED_PROTO'], $_SERVER['SERVER_PORT']);
    eq(is_https(), false);
    $_SERVER['HTTPS'] = 'off'; eq(is_https(), false);
    $_SERVER['HTTPS'] = 'on'; eq(is_https(), true);
    unset($_SERVER['HTTPS']); $_SERVER['HTTP_X_FORWARDED_PROTO'] = 'https'; eq(is_https(), true);
    $_SERVER = $keep;
});
