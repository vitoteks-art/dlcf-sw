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

$q = trim($_GET['q'] ?? '');
$sql = 'SELECT id, "zonal" AS scope, "DLCF South West" AS state_name, title, slug, feature_image_url, content, type, status, published_at, event_location, event_start_date, event_end_date, event_time_label, recurrence_mode, recurrence_day_of_week, created_at, updated_at
        FROM zonal_events
        WHERE status = "published"';
$types = '';
$params = [];
if ($q !== '') {
    $like = '%' . $q . '%';
    $sql .= ' AND (title LIKE ? OR type LIKE ? OR content LIKE ? OR event_location LIKE ?)';
    $types = 'ssss';
    $params = [$like, $like, $like, $like];
}
$sql .= ' ORDER BY CASE WHEN recurrence_mode = "weekly" THEN 0 ELSE 1 END,
                 event_start_date IS NULL ASC, event_start_date ASC, published_at DESC, id DESC';
$stmt = db_prepare($db, $sql, $types, $params);
$stmt->execute();
json_ok(['items' => db_fetch_all($stmt)]);
