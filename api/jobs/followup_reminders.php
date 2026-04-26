<?php
require __DIR__ . '/../lib/response.php';
require __DIR__ . '/../lib/db.php';
require __DIR__ . '/../lib/notification_service.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$config = require __DIR__ . '/../config.php';
$db = db_connect($config);

$logPath = $config['log_path'] ?? (__DIR__ . '/../storage/app.log');

try {
    $stmt = db_prepare(
        $db,
        "SELECT ft.id, ft.due_date, ft.status, fc.full_name, fc.phone, fc.email, u.email AS worker_email, u.name AS worker_name
         FROM followup_tasks ft
         JOIN followup_contacts fc ON fc.id = ft.contact_id
         LEFT JOIN users u ON u.id = ft.assigned_to_user_id
         WHERE ft.due_date IS NOT NULL
           AND ft.due_date <= CURDATE()
           AND ft.status NOT IN ('converted_to_member', 'closed')
         ORDER BY ft.due_date ASC",
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);

    $emailsAttempted = 0;
    $emailsSent = 0;
    foreach ($rows as $row) {
        if (empty($row['worker_email'])) {
            continue;
        }
        $emailsAttempted++;
        $subject = 'DLCF follow-up reminder: ' . $row['full_name'];
        $body = "Hello " . ($row['worker_name'] ?: 'Worker') . ",\n\nThis follow-up is due or overdue:\nName: {$row['full_name']}\nDue date: {$row['due_date']}\nStatus: {$row['status']}\n\nPlease open the DLCF follow-up dashboard to update it.";
        $result = followup_send_email($config, $row['worker_email'], $subject, $body);
        if ($result['ok'] ?? false) {
            $emailsSent++;
        }
    }

    log_error('Follow-up reminders run: due_or_overdue=' . count($rows) . ', emails_attempted=' . $emailsAttempted . ', emails_sent=' . $emailsSent, $logPath);
    echo 'Follow-up reminders complete. Due/overdue: ' . count($rows) . PHP_EOL;
} catch (Throwable $e) {
    log_error('Follow-up reminders failed: ' . $e->getMessage(), $logPath);
    fwrite(STDERR, 'Follow-up reminders failed' . PHP_EOL);
    exit(1);
}
