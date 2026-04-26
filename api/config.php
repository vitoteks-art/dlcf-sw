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
    'log_path' => $LOG_PATH ?? (__DIR__ . '/storage/app.log'),
    'mail' => [
        'from_email' => $MAIL_FROM_EMAIL ?? 'no-reply@dlcfsw.org.ng',
        'from_name' => $MAIL_FROM_NAME ?? 'DLCF South West',
        'smtp_host' => $SMTP_HOST ?? '',
        'smtp_port' => $SMTP_PORT ?? '',
        'smtp_user' => $SMTP_USER ?? '',
        'smtp_pass' => $SMTP_PASS ?? '',
    ],
    'evolution_api' => [
        'base_url' => $EVOLUTION_API_BASE_URL ?? '',
        'instance' => $EVOLUTION_API_INSTANCE ?? '',
        'api_key' => $EVOLUTION_API_KEY ?? '',
        'default_country_code' => $EVOLUTION_DEFAULT_COUNTRY_CODE ?? '234',
    ],
];
