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

$db = db_connect($config);

require_method('GET');

$db->query("CREATE TABLE IF NOT EXISTS site_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_key VARCHAR(100) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  updated_by INT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_site_pages_key (page_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$stmt = $db->prepare('SELECT content FROM site_pages WHERE page_key = ? LIMIT 1');
$pageKey = 'main_home';
$stmt->bind_param('s', $pageKey);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
if (!$rows) {
    json_ok(['item' => null]);
}

$content = json_decode($rows[0]['content'] ?? '{}', true) ?: null;
json_ok(['item' => $content]);
