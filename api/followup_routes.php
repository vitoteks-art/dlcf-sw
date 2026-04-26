<?php
require_once __DIR__ . '/lib/notification_service.php';

const FOLLOWUP_STATUSES = ['new', 'assigned', 'contacted', 'no_response', 'unreachable', 'interested', 'needs_visit', 'joined_fellowship', 'converted_to_member', 'closed'];
const FOLLOWUP_CLOSED_STATUSES = ['converted_to_member', 'closed'];

function can_view_followups(array $user): bool
{
    return in_array($user['role'], ['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'region_admin', 'associate_cord'], true)
        || user_has_work_unit($user, 'Follow-up Worker')
        || user_has_work_unit($user, 'Counseling Team');
}

function can_manage_followups(array $user): bool
{
    return in_array($user['role'], ['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'region_admin', 'associate_cord'], true);
}

function can_manage_followup_templates(array $user): bool
{
    return in_array($user['role'], ['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin'], true);
}

function can_manage_integration_settings(array $user): bool
{
    return ($user['role'] ?? '') === 'administrator';
}

if ($path === '/admin/integration-settings/evolution-api') {
    require_auth();
    $user = current_user();
    if (!can_manage_integration_settings($user)) {
        json_error('Forbidden', 403);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        json_ok(['settings' => followup_public_evolution_settings(followup_get_evolution_settings($db, $config))]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        require_csrf();
        $payload = read_json();
        $existing = followup_get_evolution_settings($db, $config);
        $enabled = isset($payload['enabled']) ? ((int) !!$payload['enabled']) : ((int) !!($existing['enabled'] ?? false));
        $baseUrl = rtrim(trim($payload['base_url'] ?? ($existing['base_url'] ?? '')), '/');
        $instanceName = trim($payload['instance_name'] ?? ($existing['instance_name'] ?? ''));
        $instanceKey = trim($payload['instance_key'] ?? ($existing['instance_key'] ?? ''));
        $sendEndpointPath = trim($payload['send_endpoint_path'] ?? ($existing['send_endpoint_path'] ?? '/message/sendText/{instance_name}')) ?: '/message/sendText/{instance_name}';
        $defaultCountryCode = preg_replace('/\D+/', '', (string) ($payload['default_country_code'] ?? ($existing['default_country_code'] ?? '234'))) ?: '234';
        $apiToken = (string) ($existing['api_token'] ?? '');
        if (array_key_exists('api_token', $payload) && trim((string) $payload['api_token']) !== '') {
            $apiToken = trim((string) $payload['api_token']);
        }
        if (!empty($payload['clear_api_token'])) {
            $apiToken = '';
        }

        if ($enabled && ($baseUrl === '' || $instanceName === '' || $apiToken === '')) {
            json_error('Base URL, instance name, and API token are required when Evolution API is enabled', 422);
        }

        $stmt = db_prepare(
            $db,
            'INSERT INTO integration_evolution_api_settings (id, enabled, base_url, instance_name, instance_key, api_token, send_endpoint_path, default_country_code, updated_by, created_at, updated_at)
             VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), base_url = VALUES(base_url), instance_name = VALUES(instance_name), instance_key = VALUES(instance_key), api_token = VALUES(api_token), send_endpoint_path = VALUES(send_endpoint_path), default_country_code = VALUES(default_country_code), updated_by = VALUES(updated_by), updated_at = NOW()',
            'issssssi',
            [$enabled, $baseUrl, $instanceName, $instanceKey, $apiToken, $sendEndpointPath, $defaultCountryCode, (int) $user['id']]
        );
        $stmt->execute();
        json_ok(['message' => 'Evolution API settings saved', 'settings' => followup_public_evolution_settings(followup_get_evolution_settings($db, $config))]);
    }
}

if ($path === '/admin/integration-settings/evolution-api/test-whatsapp') {
    require_method('POST');
    require_auth();
    require_csrf();
    $user = current_user();
    if (!can_manage_integration_settings($user)) {
        json_error('Forbidden', 403);
    }
    $payload = read_json();
    $phone = trim($payload['phone'] ?? '');
    $message = trim($payload['message'] ?? 'DLCF South West Evolution API test message.');
    if ($phone === '') {
        json_error('Phone number is required', 422);
    }
    $result = followup_send_evolution_whatsapp($config, $phone, $message, $db);
    json_ok(['message' => ($result['ok'] ?? false) ? 'Test WhatsApp sent' : 'Test WhatsApp failed', 'result' => $result]);
}

function followup_scope_sql(array $user, string $contactAlias = 'fc', string $taskAlias = 'ft'): array
{
    $sql = '';
    $types = '';
    $params = [];
    if (in_array($user['role'], ['administrator', 'zonal_cord', 'zonal_admin'], true)) {
        return [$sql, $types, $params];
    }
    if (in_array($user['role'], ['state_cord', 'state_admin'], true) && !empty($user['state'])) {
        $sql .= " AND {$contactAlias}.state = ?";
        $types .= 's';
        $params[] = $user['state'];
        return [$sql, $types, $params];
    }
    if (in_array($user['role'], ['region_cord', 'region_admin'], true)) {
        if (!empty($user['state'])) {
            $sql .= " AND {$contactAlias}.state = ?";
            $types .= 's';
            $params[] = $user['state'];
        }
        if (!empty($user['region'])) {
            $sql .= " AND {$contactAlias}.region = ?";
            $types .= 's';
            $params[] = $user['region'];
        }
        return [$sql, $types, $params];
    }
    if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
        $sql .= " AND {$contactAlias}.fellowship_centre_id = ?";
        $types .= 'i';
        $params[] = (int) $user['fellowship_centre_id'];
        return [$sql, $types, $params];
    }
    $sql .= " AND {$taskAlias}.assigned_to_user_id = ?";
    $types .= 'i';
    $params[] = (int) $user['id'];
    return [$sql, $types, $params];
}

function followup_validate_status(string $status): string
{
    $status = trim($status);
    if ($status === '') {
        return 'new';
    }
    if (!in_array($status, FOLLOWUP_STATUSES, true)) {
        json_error('Invalid follow-up status', 422);
    }
    return $status;
}

function followup_fetch_task(mysqli $db, int $taskId, array $user): array
{
    [$scopeSql, $scopeTypes, $scopeParams] = followup_scope_sql($user, 'fc', 'ft');
    $stmt = db_prepare(
        $db,
        "SELECT ft.*, fc.full_name, fc.phone, fc.email, fc.state, fc.region, fc.fellowship_centre_id, fc.decision_type, fc.consent_to_contact,
                c.name AS fellowship_centre, u.name AS assigned_to_name
         FROM followup_tasks ft
         JOIN followup_contacts fc ON fc.id = ft.contact_id
         LEFT JOIN fellowship_centres c ON c.id = fc.fellowship_centre_id
         LEFT JOIN users u ON u.id = ft.assigned_to_user_id
         WHERE ft.id = ? {$scopeSql} LIMIT 1",
        'i' . $scopeTypes,
        array_merge([$taskId], $scopeParams)
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Follow-up task not found', 404);
    }
    return $rows[0];
}

function followup_template_vars(array $task, array $user): array
{
    return [
        'name' => $task['full_name'] ?? '',
        'fellowship_centre' => $task['fellowship_centre'] ?? '',
        'state' => $task['state'] ?? '',
        'region' => $task['region'] ?? '',
        'worker_name' => $user['name'] ?? '',
        'contact_phone' => $task['phone'] ?? '',
    ];
}

function followup_insert_contact_task(mysqli $db, array $payload, array $user, ?int $sourceAttendanceId = null): int
{
    $fullName = trim($payload['full_name'] ?? '');
    if ($fullName === '') {
        json_error('Full name is required', 422);
    }
    $sourceType = trim($payload['source_type'] ?? 'manual') ?: 'manual';
    $sourceId = isset($payload['source_id']) && $payload['source_id'] !== '' ? (int) $payload['source_id'] : null;
    $attendanceEntryId = $sourceAttendanceId ?: (isset($payload['attendance_entry_id']) && $payload['attendance_entry_id'] !== '' ? (int) $payload['attendance_entry_id'] : null);
    $centreId = isset($payload['fellowship_centre_id']) && $payload['fellowship_centre_id'] !== '' ? (int) $payload['fellowship_centre_id'] : null;
    $state = trim($payload['state'] ?? '');
    $region = trim($payload['region'] ?? '');

    if (!$centreId && !empty($payload['fellowship_centre'])) {
        $centreName = trim($payload['fellowship_centre']);
        if ($centreName !== '' && $state !== '' && $region !== '') {
            $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
            $stmt->execute();
            $centreRows = db_fetch_all($stmt);
            if ($centreRows) {
                $centreId = (int) $centreRows[0]['id'];
            }
        }
    }

    if ($attendanceEntryId) {
        $stmt = db_prepare($db, 'SELECT ae.id, fc.id AS centre_id, fc.name, fc.state, fc.region FROM attendance_entries ae JOIN fellowship_centres fc ON fc.id = ae.fellowship_centre_id WHERE ae.id = ? LIMIT 1', 'i', [$attendanceEntryId]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if ($rows) {
            $centreId = (int) $rows[0]['centre_id'];
            $state = $rows[0]['state'];
            $region = $rows[0]['region'];
            $sourceId = $sourceId ?: $attendanceEntryId;
        }
    }

    $scopeState = $state !== '' ? $state : null;
    $scopeRegion = $region !== '' ? $region : null;
    $scopeCentre = $centreId;
    apply_state_region_centre_scope($user, $scopeState, $scopeRegion, $scopeCentre);
    if ($state !== '' && $scopeState !== null && $state !== $scopeState) {
        json_error('Forbidden', 403);
    }
    if ($region !== '' && $scopeRegion !== null && $region !== $scopeRegion) {
        json_error('Forbidden', 403);
    }
    if ($centreId && $scopeCentre !== null && (int) $centreId !== (int) $scopeCentre) {
        json_error('Forbidden', 403);
    }

    $decisionType = trim($payload['decision_type'] ?? 'visitor') ?: 'visitor';
    $consent = isset($payload['consent_to_contact']) ? ((int) !!$payload['consent_to_contact']) : 1;
    $stmt = db_prepare(
        $db,
        'INSERT INTO followup_contacts (source_type, source_id, attendance_entry_id, fellowship_centre_id, state, region, full_name, gender, phone, email, decision_type, category, address, notes, consent_to_contact, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        'siiissssssssssii',
        [
            $sourceType,
            $sourceId,
            $attendanceEntryId,
            $centreId,
            $state ?: null,
            $region ?: null,
            $fullName,
            trim($payload['gender'] ?? '') ?: null,
            trim($payload['phone'] ?? '') ?: null,
            trim($payload['email'] ?? '') ?: null,
            $decisionType,
            trim($payload['category'] ?? '') ?: null,
            trim($payload['address'] ?? '') ?: null,
            trim($payload['notes'] ?? '') ?: null,
            $consent,
            (int) $user['id'],
        ]
    );
    $stmt->execute();
    $contactId = (int) $db->insert_id;

    $dueDate = trim($payload['due_date'] ?? '') ?: null;
    $stmt = db_prepare(
        $db,
        'INSERT INTO followup_tasks (contact_id, status, priority, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        'isss',
        [$contactId, 'new', trim($payload['priority'] ?? 'normal') ?: 'normal', $dueDate]
    );
    $stmt->execute();
    return $contactId;
}

if ($path === '/followups/contacts' || $path === '/followups/tasks') {
    require_auth();
    $user = current_user();
    if (!can_view_followups($user)) {
        json_error('Forbidden', 403);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        [$scopeSql, $scopeTypes, $scopeParams] = followup_scope_sql($user, 'fc', 'ft');
        $sql = "SELECT fc.*, ft.id AS task_id, ft.assigned_to_user_id, ft.status, ft.priority, ft.due_date, ft.next_followup_at, ft.last_contacted_at, ft.closed_at,
                       c.name AS fellowship_centre, u.name AS assigned_to_name
                FROM followup_contacts fc
                JOIN followup_tasks ft ON ft.contact_id = fc.id
                LEFT JOIN fellowship_centres c ON c.id = fc.fellowship_centre_id
                LEFT JOIN users u ON u.id = ft.assigned_to_user_id
                WHERE 1=1 {$scopeSql}";
        $types = $scopeTypes;
        $params = $scopeParams;
        $filters = ['state', 'region', 'source_type', 'decision_type', 'status'];
        foreach ($filters as $filter) {
            $value = trim($_GET[$filter] ?? '');
            if ($value !== '') {
                $column = in_array($filter, ['status'], true) ? 'ft.' . $filter : 'fc.' . $filter;
                $sql .= " AND {$column} = ?";
                $types .= 's';
                $params[] = $value;
            }
        }
        if (!empty($_GET['fellowship_centre_id'])) {
            $sql .= ' AND fc.fellowship_centre_id = ?';
            $types .= 'i';
            $params[] = (int) $_GET['fellowship_centre_id'];
        }
        if (!empty($_GET['assigned_to'])) {
            $sql .= ' AND ft.assigned_to_user_id = ?';
            $types .= 'i';
            $params[] = (int) $_GET['assigned_to'];
        }
        if (!empty($_GET['start'])) {
            $sql .= ' AND DATE(fc.created_at) >= ?';
            $types .= 's';
            $params[] = $_GET['start'];
        }
        if (!empty($_GET['end'])) {
            $sql .= ' AND DATE(fc.created_at) <= ?';
            $types .= 's';
            $params[] = $_GET['end'];
        }
        if (!empty($_GET['search'])) {
            $sql .= ' AND (fc.full_name LIKE ? OR fc.phone LIKE ? OR fc.email LIKE ?)';
            $types .= 'sss';
            $term = '%' . trim($_GET['search']) . '%';
            array_push($params, $term, $term, $term);
        }
        $sql .= ' ORDER BY COALESCE(ft.due_date, DATE(fc.created_at)) ASC, fc.created_at DESC LIMIT 300';
        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        json_ok(['items' => db_fetch_all($stmt)]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $path === '/followups/contacts') {
        require_csrf();
        if (!can_manage_followups($user)) {
            json_error('Forbidden', 403);
        }
        $payload = read_json();
        $db->begin_transaction();
        try {
            $contactId = followup_insert_contact_task($db, $payload, $user);
            $db->commit();
            json_ok(['id' => $contactId], 201);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('Follow-up contact create failed: ' . $e->getMessage(), $config['log_path'] ?? __DIR__ . '/storage/app.log');
            json_error('Failed to create follow-up contact', 500);
        }
    }
}

if ($path === '/followups/contacts/bulk') {
    require_method('POST');
    require_auth();
    require_csrf();
    $user = current_user();
    if (!can_manage_followups($user)) {
        json_error('Forbidden', 403);
    }
    $payload = read_json();
    $contacts = $payload['contacts'] ?? [];
    if (!is_array($contacts)) {
        json_error('contacts must be an array', 422);
    }
    $db->begin_transaction();
    try {
        $ids = [];
        foreach ($contacts as $contact) {
            if (!is_array($contact) || trim($contact['full_name'] ?? '') === '') {
                continue;
            }
            $contact['source_type'] = $contact['source_type'] ?? ($payload['source_type'] ?? 'manual');
            $contact['source_id'] = $contact['source_id'] ?? ($payload['source_id'] ?? null);
            $contact['attendance_entry_id'] = $contact['attendance_entry_id'] ?? ($payload['attendance_entry_id'] ?? null);
            $contact['fellowship_centre_id'] = $contact['fellowship_centre_id'] ?? ($payload['fellowship_centre_id'] ?? null);
            $contact['fellowship_centre'] = $contact['fellowship_centre'] ?? ($payload['fellowship_centre'] ?? '');
            $contact['state'] = $contact['state'] ?? ($payload['state'] ?? '');
            $contact['region'] = $contact['region'] ?? ($payload['region'] ?? '');
            $ids[] = followup_insert_contact_task($db, $contact, $user);
        }
        $db->commit();
        json_ok(['ids' => $ids, 'created' => count($ids)], 201);
    } catch (Throwable $e) {
        $db->rollback();
        log_error('Follow-up bulk create failed: ' . $e->getMessage(), $config['log_path'] ?? __DIR__ . '/storage/app.log');
        json_error('Failed to save follow-up contacts', 500);
    }
}

if (preg_match('#^/followups/contacts/(\d+)$#', $path, $matches)) {
    require_auth();
    $user = current_user();
    if (!can_view_followups($user)) {
        json_error('Forbidden', 403);
    }
    $contactId = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        [$scopeSql, $scopeTypes, $scopeParams] = followup_scope_sql($user, 'fc', 'ft');
        $stmt = db_prepare(
            $db,
            "SELECT fc.*, ft.id AS task_id, ft.assigned_to_user_id, ft.status, ft.priority, ft.due_date, ft.next_followup_at, ft.last_contacted_at, ft.closed_at,
                    c.name AS fellowship_centre, u.name AS assigned_to_name
             FROM followup_contacts fc
             JOIN followup_tasks ft ON ft.contact_id = fc.id
             LEFT JOIN fellowship_centres c ON c.id = fc.fellowship_centre_id
             LEFT JOIN users u ON u.id = ft.assigned_to_user_id
             WHERE fc.id = ? {$scopeSql} LIMIT 1",
            'i' . $scopeTypes,
            array_merge([$contactId], $scopeParams)
        );
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Follow-up contact not found', 404);
        }
        $contact = $rows[0];
        $taskId = (int) $contact['task_id'];
        $stmt = db_prepare($db, 'SELECT fn.*, u.name AS user_name FROM followup_notes fn LEFT JOIN users u ON u.id = fn.user_id WHERE fn.task_id = ? ORDER BY fn.created_at DESC, fn.id DESC', 'i', [$taskId]);
        $stmt->execute();
        $notes = db_fetch_all($stmt);
        $stmt = db_prepare($db, 'SELECT ml.*, mt.name AS template_name FROM followup_message_logs ml LEFT JOIN message_templates mt ON mt.id = ml.template_id WHERE ml.task_id = ? ORDER BY ml.created_at DESC, ml.id DESC', 'i', [$taskId]);
        $stmt->execute();
        $logs = db_fetch_all($stmt);
        json_ok(['contact' => $contact, 'notes' => $notes, 'message_logs' => $logs]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        require_csrf();
        if (!can_manage_followups($user)) {
            json_error('Forbidden', 403);
        }
        $payload = read_json();
        $stmt = db_prepare($db, 'UPDATE followup_contacts SET full_name = ?, gender = ?, phone = ?, email = ?, decision_type = ?, category = ?, address = ?, notes = ?, consent_to_contact = ?, updated_at = NOW() WHERE id = ?', 'ssssssssii', [
            trim($payload['full_name'] ?? ''),
            trim($payload['gender'] ?? '') ?: null,
            trim($payload['phone'] ?? '') ?: null,
            trim($payload['email'] ?? '') ?: null,
            trim($payload['decision_type'] ?? 'visitor') ?: 'visitor',
            trim($payload['category'] ?? '') ?: null,
            trim($payload['address'] ?? '') ?: null,
            trim($payload['notes'] ?? '') ?: null,
            isset($payload['consent_to_contact']) ? ((int) !!$payload['consent_to_contact']) : 1,
            $contactId,
        ]);
        $stmt->execute();
        json_ok(['message' => 'Follow-up contact updated']);
    }
}

if (preg_match('#^/followups/tasks/(\d+)/(assign|status|schedule|notes|email|whatsapp|whatsapp-log)$#', $path, $matches)) {
    require_auth();
    require_csrf();
    $user = current_user();
    if (!can_view_followups($user)) {
        json_error('Forbidden', 403);
    }
    $taskId = (int) $matches[1];
    $action = $matches[2];
    $task = followup_fetch_task($db, $taskId, $user);
    $payload = read_json();

    if ($action === 'assign') {
        require_method('PUT');
        if (!can_manage_followups($user)) {
            json_error('Forbidden', 403);
        }
        $assignedTo = isset($payload['assigned_to_user_id']) && $payload['assigned_to_user_id'] !== '' ? (int) $payload['assigned_to_user_id'] : null;
        $status = $assignedTo ? 'assigned' : 'new';
        $stmt = db_prepare($db, 'UPDATE followup_tasks SET assigned_to_user_id = ?, assigned_by_user_id = ?, status = ?, due_date = COALESCE(?, due_date), updated_at = NOW() WHERE id = ?', 'iissi', [$assignedTo, (int) $user['id'], $status, trim($payload['due_date'] ?? '') ?: null, $taskId]);
        $stmt->execute();
        json_ok(['message' => 'Assignment updated']);
    }

    if ($action === 'status' || $action === 'schedule') {
        require_method('PUT');
        $status = $action === 'status' ? followup_validate_status($payload['status'] ?? $task['status']) : $task['status'];
        $priority = trim($payload['priority'] ?? $task['priority']) ?: 'normal';
        $dueDate = trim($payload['due_date'] ?? '') ?: null;
        $nextFollowupAt = trim($payload['next_followup_at'] ?? '') ?: null;
        $lastContactedAt = in_array($status, ['contacted', 'interested', 'needs_visit', 'joined_fellowship', 'converted_to_member'], true) ? date('Y-m-d H:i:s') : ($task['last_contacted_at'] ?? null);
        $closedAt = in_array($status, FOLLOWUP_CLOSED_STATUSES, true) ? date('Y-m-d H:i:s') : null;
        $stmt = db_prepare($db, 'UPDATE followup_tasks SET status = ?, priority = ?, due_date = ?, next_followup_at = ?, last_contacted_at = ?, closed_at = ?, updated_at = NOW() WHERE id = ?', 'ssssssi', [$status, $priority, $dueDate, $nextFollowupAt, $lastContactedAt, $closedAt, $taskId]);
        $stmt->execute();
        json_ok(['message' => 'Follow-up task updated']);
    }

    if ($action === 'notes') {
        require_method('POST');
        $content = trim($payload['content'] ?? '');
        if ($content === '') {
            json_error('Note content is required', 422);
        }
        $stmt = db_prepare($db, 'INSERT INTO followup_notes (task_id, user_id, note_type, content, created_at) VALUES (?, ?, ?, ?, NOW())', 'iiss', [$taskId, (int) $user['id'], trim($payload['note_type'] ?? 'note') ?: 'note', $content]);
        $stmt->execute();
        json_ok(['message' => 'Note added'], 201);
    }

    if ($action === 'email' || $action === 'whatsapp') {
        require_method('POST');
        if ((int) $task['consent_to_contact'] !== 1) {
            json_error('Contact has not consented to follow-up messages', 422);
        }
        $channel = $action === 'email' ? 'email' : 'whatsapp';
        $templateId = isset($payload['template_id']) && $payload['template_id'] !== '' ? (int) $payload['template_id'] : 0;
        if ($templateId) {
            $stmt = db_prepare($db, 'SELECT * FROM message_templates WHERE id = ? AND channel = ? AND is_active = 1 LIMIT 1', 'is', [$templateId, $channel]);
        } else {
            $stmt = db_prepare($db, 'SELECT * FROM message_templates WHERE channel = ? AND is_active = 1 ORDER BY id ASC LIMIT 1', 's', [$channel]);
        }
        $stmt->execute();
        $templates = db_fetch_all($stmt);
        if (!$templates) {
            json_error('No active message template found', 422);
        }
        $template = $templates[0];
        $body = followup_render_template($template['body'], followup_template_vars($task, $user));
        $subject = $template['subject'] ? followup_render_template($template['subject'], followup_template_vars($task, $user)) : null;
        if ($channel === 'email') {
            $recipient = trim($task['email'] ?? '');
            $result = followup_send_email($config, $recipient, $subject ?: 'DLCF South West Follow-up', $body);
        } else {
            $recipient = trim($task['phone'] ?? '');
            $result = followup_send_evolution_whatsapp($config, $recipient, $body, $db);
            $recipient = $result['number'] ?: $recipient;
        }
        $status = $result['status'] ?? 'failed';
        $providerId = $result['provider_message_id'] ?? null;
        $error = $result['error'] ?? null;
        $sentAt = ($result['ok'] ?? false) ? date('Y-m-d H:i:s') : null;
        $stmt = db_prepare($db, 'INSERT INTO followup_message_logs (task_id, contact_id, template_id, channel, recipient, subject, body_snapshot, send_mode, provider_message_id, status, error_message, sent_by_user_id, sent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', 'iiissssssssis', [
            $taskId,
            (int) $task['contact_id'],
            (int) $template['id'],
            $channel,
            $recipient,
            $subject,
            $body,
            $channel === 'whatsapp' ? 'evolution_api' : 'email',
            $providerId,
            $status,
            $error,
            (int) $user['id'],
            $sentAt,
        ]);
        $stmt->execute();
        if (($result['ok'] ?? false) && !in_array($task['status'], FOLLOWUP_CLOSED_STATUSES, true)) {
            $stmt = db_prepare($db, 'UPDATE followup_tasks SET status = IF(status IN ("new", "assigned", "no_response"), "contacted", status), last_contacted_at = NOW(), updated_at = NOW() WHERE id = ?', 'i', [$taskId]);
            $stmt->execute();
        }
        json_ok(['message' => ($result['ok'] ?? false) ? 'Message sent' : 'Message logged as failed', 'result' => $result]);
    }

    if ($action === 'whatsapp-log') {
        require_method('POST');
        $waSettings = followup_get_evolution_settings($db, $config);
        $recipient = followup_normalize_phone($task['phone'] ?? '', $waSettings['default_country_code'] ?? '234');
        $body = trim($payload['body'] ?? 'Manual WhatsApp follow-up attempt');
        $stmt = db_prepare($db, 'INSERT INTO followup_message_logs (task_id, contact_id, channel, recipient, body_snapshot, send_mode, status, sent_by_user_id, sent_at, created_at) VALUES (?, ?, "whatsapp", ?, ?, "manual", ?, ?, NOW(), NOW())', 'iisssi', [$taskId, (int) $task['contact_id'], $recipient, $body, trim($payload['status'] ?? 'sent') ?: 'sent', (int) $user['id']]);
        $stmt->execute();
        json_ok(['message' => 'Manual WhatsApp attempt logged'], 201);
    }
}

if (preg_match('#^/followups/tasks/(\d+)/whatsapp-link$#', $path, $matches)) {
    require_method('GET');
    require_auth();
    $user = current_user();
    if (!can_view_followups($user)) {
        json_error('Forbidden', 403);
    }
    $task = followup_fetch_task($db, (int) $matches[1], $user);
    $templateId = isset($_GET['template_id']) ? (int) $_GET['template_id'] : 0;
    if ($templateId) {
        $stmt = db_prepare($db, 'SELECT * FROM message_templates WHERE id = ? AND channel = "whatsapp" LIMIT 1', 'i', [$templateId]);
    } else {
        $stmt = db_prepare($db, 'SELECT * FROM message_templates WHERE channel = "whatsapp" AND is_active = 1 ORDER BY id ASC LIMIT 1', '', []);
    }
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('No WhatsApp template found', 422);
    }
    $body = followup_render_template($rows[0]['body'], followup_template_vars($task, $user));
    $waSettings = followup_get_evolution_settings($db, $config);
    $number = followup_normalize_phone($task['phone'] ?? '', $waSettings['default_country_code'] ?? '234');
    json_ok(['url' => 'https://wa.me/' . $number . '?text=' . rawurlencode($body), 'body' => $body, 'number' => $number]);
}

if ($path === '/followups/templates') {
    require_auth();
    $user = current_user();
    if (!can_view_followups($user)) {
        json_error('Forbidden', 403);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $channel = trim($_GET['channel'] ?? '');
        $sql = 'SELECT * FROM message_templates WHERE 1=1';
        $types = '';
        $params = [];
        if ($channel !== '') {
            $sql .= ' AND channel = ?';
            $types .= 's';
            $params[] = $channel;
        }
        $sql .= ' ORDER BY channel, name';
        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        json_ok(['items' => db_fetch_all($stmt)]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_csrf();
        if (!can_manage_followup_templates($user)) {
            json_error('Forbidden', 403);
        }
        $payload = read_json();
        $channel = trim($payload['channel'] ?? '');
        $name = trim($payload['name'] ?? '');
        $body = trim($payload['body'] ?? '');
        if (!in_array($channel, ['email', 'whatsapp'], true) || $name === '' || $body === '') {
            json_error('channel, name, and body are required', 422);
        }
        $stmt = db_prepare($db, 'INSERT INTO message_templates (channel, name, subject, body, is_active, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', 'ssssii', [$channel, $name, trim($payload['subject'] ?? '') ?: null, $body, isset($payload['is_active']) ? ((int) !!$payload['is_active']) : 1, (int) $user['id']]);
        $stmt->execute();
        json_ok(['id' => $db->insert_id], 201);
    }
}

if (preg_match('#^/followups/templates/(\d+)$#', $path, $matches)) {
    require_method('PUT');
    require_auth();
    require_csrf();
    $user = current_user();
    if (!can_manage_followup_templates($user)) {
        json_error('Forbidden', 403);
    }
    $payload = read_json();
    $stmt = db_prepare($db, 'UPDATE message_templates SET name = ?, subject = ?, body = ?, is_active = ?, updated_at = NOW() WHERE id = ?', 'sssii', [trim($payload['name'] ?? ''), trim($payload['subject'] ?? '') ?: null, trim($payload['body'] ?? ''), isset($payload['is_active']) ? ((int) !!$payload['is_active']) : 1, (int) $matches[1]]);
    $stmt->execute();
    json_ok(['message' => 'Template updated']);
}

if ($path === '/followups/summary' || $path === '/followups/overdue') {
    require_method('GET');
    require_auth();
    $user = current_user();
    if (!can_view_followups($user)) {
        json_error('Forbidden', 403);
    }
    [$scopeSql, $scopeTypes, $scopeParams] = followup_scope_sql($user, 'fc', 'ft');
    if ($path === '/followups/overdue') {
        $stmt = db_prepare($db, "SELECT fc.full_name, fc.phone, fc.email, ft.* FROM followup_tasks ft JOIN followup_contacts fc ON fc.id = ft.contact_id WHERE ft.due_date < CURDATE() AND ft.status NOT IN ('converted_to_member', 'closed') {$scopeSql} ORDER BY ft.due_date ASC", $scopeTypes, $scopeParams);
        $stmt->execute();
        json_ok(['items' => db_fetch_all($stmt)]);
    }
    $stmt = db_prepare(
        $db,
        "SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN ft.assigned_to_user_id IS NULL THEN 1 ELSE 0 END) AS unassigned,
            SUM(CASE WHEN ft.assigned_to_user_id IS NOT NULL AND ft.status NOT IN ('converted_to_member', 'closed') THEN 1 ELSE 0 END) AS assigned_pending,
            SUM(CASE WHEN ft.due_date < CURDATE() AND ft.status NOT IN ('converted_to_member', 'closed') THEN 1 ELSE 0 END) AS overdue,
            SUM(CASE WHEN ft.last_contacted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS contacted_this_week,
            SUM(CASE WHEN ft.status = 'converted_to_member' THEN 1 ELSE 0 END) AS converted_to_member
         FROM followup_tasks ft JOIN followup_contacts fc ON fc.id = ft.contact_id WHERE 1=1 {$scopeSql}",
        $scopeTypes,
        $scopeParams
    );
    $stmt->execute();
    $summary = db_fetch_all($stmt)[0] ?? [];
    $stmt = db_prepare($db, "SELECT ft.status, COUNT(*) AS count FROM followup_tasks ft JOIN followup_contacts fc ON fc.id = ft.contact_id WHERE 1=1 {$scopeSql} GROUP BY ft.status ORDER BY ft.status", $scopeTypes, $scopeParams);
    $stmt->execute();
    json_ok(['summary' => $summary, 'by_status' => db_fetch_all($stmt)]);
}

if ($path === '/followups/assignable-users') {
    require_method('GET');
    require_auth();
    $user = current_user();
    if (!can_view_followups($user)) {
        json_error('Forbidden', 403);
    }
    $sql = 'SELECT u.id, u.name, u.email, u.role, b.state, b.region, b.fellowship_centre_id FROM users u LEFT JOIN biodata b ON b.user_id = u.id WHERE 1=1';
    $types = '';
    $params = [];
    $state = $user['state'] ?? null;
    $region = $user['region'] ?? null;
    $centreId = $user['fellowship_centre_id'] ?? null;
    apply_state_region_centre_scope($user, $state, $region, $centreId);
    if ($state) { $sql .= ' AND (b.state = ? OR b.state IS NULL)'; $types .= 's'; $params[] = $state; }
    if ($region) { $sql .= ' AND (b.region = ? OR b.region IS NULL)'; $types .= 's'; $params[] = $region; }
    if ($centreId) { $sql .= ' AND (b.fellowship_centre_id = ? OR b.fellowship_centre_id IS NULL)'; $types .= 'i'; $params[] = (int) $centreId; }
    $sql .= ' ORDER BY u.name LIMIT 300';
    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    json_ok(['items' => db_fetch_all($stmt)]);
}
