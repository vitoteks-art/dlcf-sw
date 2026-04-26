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

function followup_send_evolution_whatsapp(array $config, string $phone, string $message): array
{
    $wa = $config['evolution_api'] ?? [];
    $baseUrl = rtrim((string) ($wa['base_url'] ?? ''), '/');
    $instance = (string) ($wa['instance'] ?? '');
    $apiKey = (string) ($wa['api_key'] ?? '');
    $defaultCountryCode = (string) ($wa['default_country_code'] ?? '234');
    $number = followup_normalize_phone($phone, $defaultCountryCode);

    if ($number === '') {
        return ['ok' => false, 'status' => 'failed', 'error' => 'Invalid WhatsApp phone number', 'number' => ''];
    }
    if ($baseUrl === '' || $instance === '' || $apiKey === '') {
        return ['ok' => false, 'status' => 'failed', 'error' => 'Evolution API is not configured', 'number' => $number];
    }

    $endpoint = $baseUrl . '/message/sendText/' . rawurlencode($instance);
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
