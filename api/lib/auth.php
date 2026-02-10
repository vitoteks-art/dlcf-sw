<?php

function start_session(array $config): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_name($config['session']['name']);
        session_set_cookie_params([
            'lifetime' => $config['session']['cookie_lifetime'] ?? 0,
            'httponly' => true,
            'secure' => $config['session']['cookie_secure'],
            'samesite' => $config['session']['cookie_samesite'],
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
