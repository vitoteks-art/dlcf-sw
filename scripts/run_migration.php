<?php
require __DIR__ . '/../api/config.php';
require __DIR__ . '/../api/lib/db.php';

function json_error($msg, $code = 500) {
    die("Error ($code): $msg\n");
}

$config = require __DIR__ . '/../api/config.php';
$db = db_connect($config);

$sql = file_get_contents(__DIR__ . '/migrations/001_create_post_comments.sql');
if (!$sql) {
    die("Could not read migration file\n");
}

if ($db->multi_query($sql)) {
    do {
        if ($res = $db->store_result()) {
            $res->free();
        }
    } while ($db->more_results() && $db->next_result());
    echo "Migration executed successfully.\n";
} else {
    echo "Migration failed: " . $db->error . "\n";
}
