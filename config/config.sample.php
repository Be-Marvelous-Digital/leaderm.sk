<?php
return [
    'db' => [
        'dsn' => 'mysql:host=127.0.0.1;port=3306;dbname=leaderm;charset=utf8mb4',
        'user' => 'leaderm',
        'pass' => 'CHANGE_ME',
    ],
    'timezone' => 'Europe/Bratislava',
    'session_name' => 'ldm_admin',
    'allowed_origins' => ['https://www.leaderm.sk'],
    'secure_cookie' => true,
    // 'require_https' => true,   // predvolene = secure_cookie; API odmietne HTTP požiadavky
];
