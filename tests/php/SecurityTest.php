<?php
t('rate limit allows 5 then blocks', function () {
    $ip = inet_pton('10.9.9.' . random_int(1, 250)); $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) { eq(rl_blocked($ip, $email), false); rl_record($ip, $email); }
    eq(rl_blocked($ip, $email), true);
});
t('rate limit by email across IPs', function () {
    $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) rl_record(inet_pton("10.8.$i.1"), $email);
    eq(rl_blocked(inet_pton('10.7.7.7'), $email), true);
});
t('rate limit clear', function () {
    $ip = inet_pton('10.6.6.' . random_int(1, 250)); $email = 'rl' . random_int(1, 1e6) . '@x.sk';
    for ($i = 0; $i < 5; $i++) rl_record($ip, $email);
    rl_clear($ip, $email);
    eq(rl_blocked($ip, $email), false);
});
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
