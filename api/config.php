<?php
require __DIR__ . '/config.local.php';

return [
    'db' => [
        'host' => $DB_HOST ?? 'localhost',
        'name' => $DB_NAME ?? '',
        'user' => $DB_USER ?? '',
        'pass' => $DB_PASS ?? '',
    ],
    'cors' => [
        'origin' => $CORS_ORIGIN ?? '*',
    ],
    'session' => [
        'name' => $SESSION_NAME ?? 'dlcf_session',
        'cookie_secure' => $SESSION_SECURE ?? false,
        'cookie_samesite' => $SESSION_SAMESITE ?? 'Lax',
        'cookie_domain' => $SESSION_DOMAIN ?? '',
        'cookie_lifetime' => $SESSION_LIFETIME ?? 0,
    ],
];
