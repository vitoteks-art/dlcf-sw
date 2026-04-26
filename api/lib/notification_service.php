<?php

function followup_render_template(string $body, array $vars): string
{
    foreach ($vars as $key => $value) {
        $body = str_replace('{{' . $key . '}}', (string) $value, $body);
    }
    return $body;
}

function followup_normalize_phone(string $phone, string $defaultCountryCode = '234'): string
{
    $digits = preg_replace('/\D+/', '', $phone);
    if ($digits === '') {
        return '';
    }
    if (strpos($digits, '00') === 0) {
        $digits = substr($digits, 2);
    }
    if (strpos($digits, '0') === 0) {
        $digits = $defaultCountryCode . substr($digits, 1);
    }
    return $digits;
}

function followup_mask_secret(?string $secret): ?string
{
    $secret = (string) ($secret ?? '');
    if ($secret === '') {
        return null;
    }
    $len = strlen($secret);
    if ($len <= 8) {
        return str_repeat('•', max(4, $len));
    }
    return substr($secret, 0, 4) . str_repeat('•', max(4, $len - 8)) . substr($secret, -4);
}

function followup_config_evolution_settings(array $config): array
{
    $wa = $config['evolution_api'] ?? [];
    return [
        'enabled' => (bool) ($wa['enabled'] ?? (($wa['base_url'] ?? '') !== '' && ($wa['api_key'] ?? '') !== '')),
        'base_url' => (string) ($wa['base_url'] ?? ''),
        'instance_name' => (string) ($wa['instance_name'] ?? ($wa['instance'] ?? '')),
        'instance_key' => (string) ($wa['instance_key'] ?? ''),
        'api_token' => (string) ($wa['api_token'] ?? ($wa['api_key'] ?? '')),
        'send_endpoint_path' => (string) ($wa['send_endpoint_path'] ?? '/message/sendText/{instance_name}'),
        'default_country_code' => (string) ($wa['default_country_code'] ?? '234'),
        'source' => 'config',
        'updated_at' => null,
    ];
}

function followup_ensure_evolution_settings_table(?mysqli $db): bool
{
    if (!$db) {
        return false;
    }

    $sql = "CREATE TABLE IF NOT EXISTS integration_evolution_api_settings (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        enabled TINYINT(1) NOT NULL DEFAULT 0,
        base_url VARCHAR(255) DEFAULT NULL,
        instance_name VARCHAR(190) DEFAULT NULL,
        instance_key VARCHAR(190) DEFAULT NULL,
        api_token TEXT DEFAULT NULL,
        send_endpoint_path VARCHAR(255) NOT NULL DEFAULT '/message/sendText/{instance_name}',
        default_country_code VARCHAR(10) NOT NULL DEFAULT '234',
        updated_by BIGINT UNSIGNED DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    try {
        return (bool) $db->query($sql);
    } catch (Throwable $e) {
        return false;
    }
}

function followup_get_evolution_settings(?mysqli $db, array $config): array
{
    $fallback = followup_config_evolution_settings($config);
    if (!$db || !followup_ensure_evolution_settings_table($db)) {
        return $fallback;
    }

    try {
        $result = $db->query('SELECT * FROM integration_evolution_api_settings WHERE id = 1 LIMIT 1');
        if (!$result) {
            return $fallback;
        }
        $rows = $result->fetch_all(MYSQLI_ASSOC);
    } catch (Throwable $e) {
        return $fallback;
    }

    if (!$rows) {
        return $fallback;
    }

    $row = $rows[0];
    return [
        'enabled' => (int) ($row['enabled'] ?? 0) === 1,
        'base_url' => (string) ($row['base_url'] ?? ''),
        'instance_name' => (string) ($row['instance_name'] ?? ''),
        'instance_key' => (string) ($row['instance_key'] ?? ''),
        'api_token' => (string) ($row['api_token'] ?? ''),
        'send_endpoint_path' => (string) ($row['send_endpoint_path'] ?? '/message/sendText/{instance_name}'),
        'default_country_code' => (string) ($row['default_country_code'] ?? '234'),
        'source' => 'database',
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

function followup_public_evolution_settings(array $settings): array
{
    $token = (string) ($settings['api_token'] ?? '');
    unset($settings['api_token']);
    $settings['has_api_token'] = $token !== '';
    $settings['api_token_masked'] = followup_mask_secret($token);
    return $settings;
}

function followup_send_email(array $config, string $to, string $subject, string $body): array
{
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'status' => 'failed', 'error' => 'Invalid recipient email'];
    }

    $mail = $config['mail'] ?? [];
    $fromEmail = $mail['from_email'] ?? 'no-reply@dlcfsw.org.ng';
    $fromName = $mail['from_name'] ?? 'DLCF South West';
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'From: ' . sprintf('%s <%s>', $fromName, $fromEmail);

    // SMTP placeholders are exposed in config for production wiring; PHP mail() remains the no-secret MVP fallback.
    $sent = @mail($to, $subject, $body, implode("\r\n", $headers));
    return [
        'ok' => (bool) $sent,
        'status' => $sent ? 'sent' : 'failed',
        'error' => $sent ? null : 'PHP mail() returned false. Configure server mail/SMTP relay.',
    ];
}

function followup_send_evolution_whatsapp(array $config, string $phone, string $message, ?mysqli $db = null): array
{
    $wa = followup_get_evolution_settings($db, $config);
    $baseUrl = rtrim((string) ($wa['base_url'] ?? ''), '/');
    $instanceName = (string) ($wa['instance_name'] ?? '');
    $instanceKey = (string) ($wa['instance_key'] ?? '');
    $apiKey = (string) ($wa['api_token'] ?? '');
    $sendPath = (string) ($wa['send_endpoint_path'] ?? '/message/sendText/{instance_name}');
    $defaultCountryCode = (string) ($wa['default_country_code'] ?? '234');
    $number = followup_normalize_phone($phone, $defaultCountryCode);

    if ($number === '') {
        return ['ok' => false, 'status' => 'failed', 'error' => 'Invalid WhatsApp phone number', 'number' => ''];
    }
    if (!($wa['enabled'] ?? false)) {
        return ['ok' => false, 'status' => 'failed', 'error' => 'Evolution API is disabled', 'number' => $number];
    }
    if ($baseUrl === '' || $instanceName === '' || $apiKey === '') {
        return ['ok' => false, 'status' => 'failed', 'error' => 'Evolution API is not configured', 'number' => $number];
    }

    $path = str_replace(
        ['{instance}', '{instance_name}', '{instance_key}'],
        [rawurlencode($instanceName), rawurlencode($instanceName), rawurlencode($instanceKey)],
        $sendPath
    );
    if (strpos($path, '{') !== false || strpos($path, '}') !== false) {
        return ['ok' => false, 'status' => 'failed', 'error' => 'Evolution API send endpoint path contains an unknown placeholder', 'number' => $number];
    }
    $endpoint = $baseUrl . '/' . ltrim($path, '/');
    $payload = json_encode(['number' => $number, 'text' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $headers = [
        'Content-Type: application/json',
        'apikey: ' . $apiKey,
    ];

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    $raw = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        return ['ok' => false, 'status' => 'failed', 'error' => $error ?: 'Evolution API request failed', 'number' => $number];
    }

    $decoded = json_decode((string) $raw, true);
    $providerId = $decoded['key']['id'] ?? $decoded['id'] ?? $decoded['messageId'] ?? null;
    $ok = $statusCode >= 200 && $statusCode < 300;

    return [
        'ok' => $ok,
        'status' => $ok ? 'sent' : 'failed',
        'error' => $ok ? null : ('Evolution API HTTP ' . $statusCode),
        'provider_message_id' => $providerId,
        'number' => $number,
        'response' => $decoded ?: $raw,
    ];
}
