<?php
// Monthly DLCF-SW student lifecycle automation.
// Flow: active_student -> graduated -> alumni. Deferred/withdrawn records are skipped.

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require __DIR__ . '/../lib/response.php';
require __DIR__ . '/../lib/db.php';

$config = require __DIR__ . '/../config.php';
$db = db_connect($config);

function lifecycle_history(mysqli $db, int $biodataId, ?string $oldStatus, string $newStatus, string $reason): void
{
    $stmt = db_prepare(
        $db,
        'INSERT INTO biodata_status_history (biodata_id, field_name, old_value, new_value, changed_by_user_id, actor_type, change_reason, changed_at)
         VALUES (?, "student_status", ?, ?, NULL, "system_cron", ?, NOW())',
        'isss',
        [$biodataId, $oldStatus, $newStatus, $reason]
    );
    $stmt->execute();
}

function fetch_rows(mysqli $db, string $sql, string $types = '', array $params = []): array
{
    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    return db_fetch_all($stmt);
}

$currentYear = (int) date('Y');
$summary = [
    'graduated' => 0,
    'promoted_to_alumni' => 0,
    'skipped_deferred_withdrawn' => 0,
    'current_year' => $currentYear,
];

$db->begin_transaction();
try {
    $skipped = fetch_rows(
        $db,
        'SELECT COUNT(*) AS total
         FROM biodata
         WHERE LOWER(category) = "student"
           AND student_status IN ("deferred", "withdrawn")'
    );
    $summary['skipped_deferred_withdrawn'] = (int) ($skipped[0]['total'] ?? 0);

    $eligibleGraduation = fetch_rows(
        $db,
        'SELECT id, student_status
         FROM biodata
         WHERE LOWER(category) = "student"
           AND expected_graduation_year IS NOT NULL
           AND expected_graduation_year < ?
           AND (student_status IS NULL OR student_status = "" OR student_status = "active_student")',
        'i',
        [$currentYear]
    );

    foreach ($eligibleGraduation as $row) {
        $id = (int) $row['id'];
        $oldStatus = $row['student_status'] ?: 'active_student';
        $stmt = db_prepare(
            $db,
            'UPDATE biodata SET student_status = "graduated", updated_at = NOW() WHERE id = ?',
            'i',
            [$id]
        );
        $stmt->execute();
        lifecycle_history($db, $id, $oldStatus, 'graduated', 'Expected graduation year elapsed');
        $summary['graduated']++;
    }

    $eligibleAlumni = fetch_rows(
        $db,
        'SELECT id, student_status
         FROM biodata
         WHERE LOWER(category) = "student"
           AND student_status = "graduated"'
    );

    foreach ($eligibleAlumni as $row) {
        $id = (int) $row['id'];
        $stmt = db_prepare(
            $db,
            'UPDATE biodata SET student_status = "alumni", updated_at = NOW() WHERE id = ?',
            'i',
            [$id]
        );
        $stmt->execute();
        lifecycle_history($db, $id, 'graduated', 'alumni', 'Graduated student auto-promoted to alumni');
        $summary['promoted_to_alumni']++;
    }

    $db->commit();
} catch (Throwable $e) {
    $db->rollback();
    fwrite(STDERR, '[student_lifecycle_automation] failed: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

fwrite(STDOUT, '[student_lifecycle_automation] ' . json_encode($summary) . PHP_EOL);
