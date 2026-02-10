<?php
/**
 * One-time script to add authentication columns to the users table.
 * Visit this file in your browser to execute the migration.
 * DELETE this file after running it.
 */

require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/db.php';

$config = require __DIR__ . '/config.php';
$db = db_connect($config);

$alterStatements = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at DATETIME DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at DATETIME DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires_at DATETIME DEFAULT NULL",
];

$results = [];
foreach ($alterStatements as $sql) {
    try {
        if ($db->query($sql)) {
            $results[] = "OK: " . $sql;
        } else {
            $results[] = "FAIL: " . $sql . " - " . $db->error;
        }
    } catch (Throwable $e) {
        // MySQL < 8.0.1 doesn't support IF NOT EXISTS for columns
        // Try a different approach: check if column exists first
        preg_match('/ADD COLUMN IF NOT EXISTS (\w+)/', $sql, $matches);
        $columnName = $matches[1] ?? '';
        if ($columnName) {
            $checkStmt = $db->prepare("SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?");
            $checkStmt->bind_param('ss', $config['db']['name'], $columnName);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result()->fetch_assoc();
            if ($checkResult['cnt'] == 0) {
                $fallbackSql = str_replace(' IF NOT EXISTS', '', $sql);
                if ($db->query($fallbackSql)) {
                    $results[] = "OK (fallback): " . $fallbackSql;
                } else {
                    $results[] = "FAIL (fallback): " . $fallbackSql . " - " . $db->error;
                }
            } else {
                $results[] = "SKIP (exists): " . $columnName;
            }
        } else {
            $results[] = "ERROR: " . $e->getMessage();
        }
    }
}

header('Content-Type: text/plain');
echo "Auth Schema Setup Results:\n";
echo "==========================\n\n";
foreach ($results as $r) {
    echo $r . "\n";
}
echo "\n\nDone. Please DELETE this file (setup_auth_schema.php) after verifying the results above.\n";
