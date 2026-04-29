<?php

require __DIR__ . '/../lib/response.php';
require __DIR__ . '/../lib/db.php';

$config = require __DIR__ . '/../config.php';
$db = db_connect($config);

function slugify_public_value(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function find_public_state_by_selector(mysqli $db, string $selector): ?array
{
    $stmt = $db->prepare('SELECT id, name, slug FROM states WHERE name = ? OR slug = ? LIMIT 1');
    $stmt->bind_param('ss', $selector, $selector);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    if ($rows) {
        return $rows[0];
    }

    $normalized = slugify_public_value($selector);
    if ($normalized === '') {
        return null;
    }

    $result = $db->query('SELECT id, name, slug FROM states');
    if (!$result) {
        return null;
    }
    while ($row = $result->fetch_assoc()) {
        $nameSlug = slugify_public_value((string) ($row['name'] ?? ''));
        $rowSlug = slugify_public_value((string) ($row['slug'] ?? ''));
        if ($normalized === $nameSlug || $normalized === $rowSlug) {
            return $row;
        }
    }

    return null;
}

require_method('GET');

$selector = trim($_GET['slug'] ?? $_GET['state'] ?? '');
if ($selector === '') {
    json_ok(['item' => null]);
}

$state = find_public_state_by_selector($db, $selector);
if (!$state) {
    json_ok(['item' => null]);
}

$stmt = $db->prepare('SELECT content FROM state_homepages WHERE state_id = ? LIMIT 1');
$stateId = (int) $state['id'];
$stmt->bind_param('i', $stateId);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
if (!$rows) {
    json_ok(['item' => null]);
}

$content = json_decode($rows[0]['content'] ?? '{}', true) ?: null;
json_ok(['item' => $content]);
