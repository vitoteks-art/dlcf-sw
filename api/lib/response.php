<?php

function send_json(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function json_ok(array $data = [], int $status = 200): void
{
    send_json($status, ['ok' => true, 'data' => $data]);
}

function json_error(string $message, int $status = 400): void
{
    send_json($status, ['ok' => false, 'error' => $message]);
}

function read_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        json_error('Method not allowed', 405);
    }
}

function log_error(string $message, string $logPath): void
{
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL;
    @file_put_contents($logPath, $line, FILE_APPEND);
}
