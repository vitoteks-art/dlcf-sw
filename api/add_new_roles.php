<?php
/**
 * One-time script to add new roles to the database.
 * Visit this file in your browser to execute.
 * DELETE this file after running it.
 */

require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/db.php';

$config = require __DIR__ . '/config.php';
$db = db_connect($config);

$newRoles = ['member', 'worker', 'state_admin', 'zonal_admin'];

$results = [];
foreach ($newRoles as $role) {
    // Check if role already exists
    $stmt = db_prepare($db, 'SELECT id FROM roles WHERE name = ? LIMIT 1', 's', [$role]);
    $stmt->execute();
    if (db_fetch_all($stmt)) {
        $results[] = "SKIP (exists): $role";
        continue;
    }
    
    // Insert new role
    $stmt = db_prepare($db, 'INSERT INTO roles (name, created_at, updated_at) VALUES (?, NOW(), NOW())', 's', [$role]);
    try {
        $stmt->execute();
        $results[] = "ADDED: $role";
    } catch (Throwable $e) {
        $results[] = "FAIL: $role - " . $e->getMessage();
    }
}

header('Content-Type: text/plain');
echo "Add New Roles Results:\n";
echo "======================\n\n";
foreach ($results as $r) {
    echo $r . "\n";
}
echo "\n\nDone. Please DELETE this file (add_new_roles.php) after verifying the results above.\n";
