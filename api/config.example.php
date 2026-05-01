<?php
// Copy to config.local.php and adjust values for local/dev use.
$DB_HOST = 'localhost';
$DB_NAME = 'dlcf_weekly';
$DB_USER = 'dlcf_user';
$DB_PASS = 'change_me';
$CORS_ORIGIN = 'http://localhost:5173';
$SESSION_NAME = 'dlcf_session';

// Uploads. On production, set URL to the public API/domain uploads path.
$UPLOADS_DIR = __DIR__ . '/uploads';
$UPLOADS_URL = '/uploads';
$UPLOADS_MAX_BYTES = 100 * 1024 * 1024;

// Follow-up workflow notifications. Keep real values server-side only.
$MAIL_FROM_EMAIL = 'no-reply@dlcfsw.org.ng';
$MAIL_FROM_NAME = 'DLCF South West';
$SMTP_HOST = '';
$SMTP_PORT = '';
$SMTP_USER = '';
$SMTP_PASS = '';

$EVOLUTION_API_BASE_URL = '';
$EVOLUTION_API_INSTANCE = '';
$EVOLUTION_API_INSTANCE_KEY = '';
$EVOLUTION_API_KEY = '';
$EVOLUTION_API_ENABLED = false;
$EVOLUTION_API_SEND_ENDPOINT_PATH = '/message/sendText/{instance_name}';
$EVOLUTION_DEFAULT_COUNTRY_CODE = '234';
