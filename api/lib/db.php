<?php

function db_connect(array $config): mysqli
{
    $db = new mysqli(
        $config['db']['host'],
        $config['db']['user'],
        $config['db']['pass'],
        $config['db']['name']
    );
    if ($db->connect_error) {
        json_error('Database connection failed', 500);
    }
    $db->set_charset('utf8mb4');
    return $db;
}

function db_prepare(mysqli $db, string $sql, string $types, array $params): mysqli_stmt
{
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        $message = 'Database error';
        if (!empty($db->error)) {
            $message .= ': ' . $db->error;
        }
        json_error($message, 500);
    }
    if ($types !== '' && !empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    return $stmt;
}

function db_fetch_all(mysqli_stmt $stmt): array
{
    $result = $stmt->get_result();
    if (!$result) {
        return [];
    }
    return $result->fetch_all(MYSQLI_ASSOC);
}
