<?php

function start_session(array $config): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_name($config['session']['name']);
        // Cookies must be configured correctly or CSRF will fail (new session per request).
        // Notes:
        // - SameSite=None requires Secure=true (modern browsers will drop the cookie otherwise).
        // - On local HTTP dev, Secure cookies will not be set.
        $secure = (bool)($config['session']['cookie_secure'] ?? false);
        $samesite = (string)($config['session']['cookie_samesite'] ?? 'Lax');
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
        if (!$isHttps) {
            // Avoid breaking local/dev over http.
            $secure = false;
            if (strtolower($samesite) === 'none') {
                $samesite = 'Lax';
            }
        }

        $domain = $config['session']['cookie_domain'] ?? '';

        session_set_cookie_params([
            'lifetime' => $config['session']['cookie_lifetime'] ?? 0,
            'path' => '/',
            'domain' => $domain !== '' ? $domain : null,
            'httponly' => true,
            'secure' => $secure,
            'samesite' => $samesite,
        ]);
        session_start();
    }
}

function current_user(): ?array
{
    return $_SESSION['user'] ?? null;
}

function require_auth(): void
{
    if (!current_user()) {
        json_error('Unauthorized', 401);
    }
}

function login_user(array $user): void
{
    $_SESSION['user'] = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'state' => $user['state'] ?? null,
        'region' => $user['region'] ?? null,
        'fellowship_centre_id' => $user['fellowship_centre_id'] ?? null,
        'work_units' => $user['work_units'] ?? '[]',
    ];
}

function logout_user(): void
{
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}

function require_csrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!$token || !isset($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $token)) {
        json_error('Invalid CSRF token', 403);
    }
}
