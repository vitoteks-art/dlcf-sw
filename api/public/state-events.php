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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$db = db_connect($config);

function slugify_public_state_value(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function find_public_state_for_events(mysqli $db, string $selector): ?array
{
    $stmt = $db->prepare('SELECT id, name, slug FROM states WHERE name = ? OR slug = ? LIMIT 1');
    $stmt->bind_param('ss', $selector, $selector);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    if ($rows) {
        return $rows[0];
    }

    $normalized = slugify_public_state_value($selector);
    if ($normalized === '') {
        return null;
    }

    $result = $db->query('SELECT id, name, slug FROM states');
    if (!$result) {
        return null;
    }

    while ($row = $result->fetch_assoc()) {
        $nameSlug = slugify_public_state_value((string) ($row['name'] ?? ''));
        $rowSlug = slugify_public_state_value((string) ($row['slug'] ?? ''));
        if ($normalized === $nameSlug || $normalized === $rowSlug) {
            return $row;
        }
    }

    return null;
}

require_method('GET');

$selector = trim($_GET['slug'] ?? $_GET['state'] ?? '');
if ($selector === '') {
    json_ok(['items' => []]);
}

$state = find_public_state_for_events($db, $selector);
if (!$state) {
    json_ok(['items' => []]);
}

$stateId = (int) $state['id'];
$sql = 'SELECT sp.id, sp.title, sp.slug, sp.type, sp.published_at, sp.feature_image_url,
               sp.event_location, sp.event_start_date, sp.event_end_date, sp.event_time_label,
               sp.recurrence_mode, sp.recurrence_day_of_week, sp.archive_at,
               GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ",") AS categories
        FROM state_posts sp
        LEFT JOIN state_post_categories spc ON spc.post_id = sp.id
        LEFT JOIN categories c ON c.id = spc.category_id
        WHERE sp.state_id = ? AND sp.status = ?
          AND (
            sp.recurrence_mode = "weekly"
            OR COALESCE(sp.event_end_date, sp.event_start_date, DATE(sp.published_at)) >= CURDATE()
          )
        GROUP BY sp.id, sp.title, sp.slug, sp.type, sp.published_at, sp.feature_image_url,
                 sp.event_location, sp.event_start_date, sp.event_end_date, sp.event_time_label, sp.recurrence_mode, sp.recurrence_day_of_week, sp.archive_at
        ORDER BY CASE WHEN sp.recurrence_mode = "weekly" THEN 0 ELSE 1 END,
                 COALESCE(sp.event_start_date, DATE(sp.published_at)) ASC, sp.created_at DESC';

$stmt = db_prepare($db, $sql, 'is', [$stateId, 'published']);
$stmt->execute();
$rows = db_fetch_all($stmt);

$items = array_map(function ($row) {
    $row['categories'] = $row['categories']
        ? array_values(array_filter(array_map('trim', explode(',', $row['categories']))))
        : [];
    return $row;
}, $rows);

json_ok(['items' => $items]);
