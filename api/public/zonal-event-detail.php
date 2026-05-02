<?php

require __DIR__ . '/../lib/response.php';
require __DIR__ . '/../lib/db.php';

$config = require __DIR__ . '/../config.php';
$corsOrigin = $config['cors']['origin'] ?? '*';
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowOrigin = '';
if ($corsOrigin === '*') {
    $allowOrigin = '*';
} else {
    $allowed = array_map('trim', explode(',', $corsOrigin));
    if ($requestOrigin && in_array($requestOrigin, $allowed, true)) {
        $allowOrigin = $requestOrigin;
    } elseif (!empty($allowed)) {
        $allowOrigin = $allowed[0];
    }
}

if ($allowOrigin !== '') {
    header('Access-Control-Allow-Origin: ' . $allowOrigin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_method('GET');
$db = db_connect($config);

$identifier = trim($_GET['id'] ?? $_GET['slug'] ?? '');
if ($identifier === '') {
    json_error('Event id or slug is required', 422);
}

if (ctype_digit($identifier)) {
    $stmt = db_prepare($db, 'SELECT id, title, slug, feature_image_url, content, type, status, published_at, event_location, event_start_date, event_end_date, event_time_label, recurrence_mode, recurrence_day_of_week, created_at, updated_at FROM zonal_events WHERE id = ? AND status = "published" LIMIT 1', 'i', [(int) $identifier]);
} else {
    $stmt = db_prepare($db, 'SELECT id, title, slug, feature_image_url, content, type, status, published_at, event_location, event_start_date, event_end_date, event_time_label, recurrence_mode, recurrence_day_of_week, created_at, updated_at FROM zonal_events WHERE slug = ? AND status = "published" LIMIT 1', 's', [$identifier]);
}
$stmt->execute();
$rows = db_fetch_all($stmt);
if (!$rows) {
    json_error('Not found', 404);
}
$item = $rows[0];
$item['state_name'] = 'DLCF South West';
json_ok(['item' => $item]);
