<?php
require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/db.php';
require __DIR__ . '/lib/auth.php';

$config = require __DIR__ . '/config.php';
// Increase session lifetime to 24 hours
ini_set('session.gc_maxlifetime', 86400);
$config['session']['cookie_lifetime'] = 86400; // Pass this to start_session via config or handle inside start_session
start_session($config);

$corsOrigin = $config['cors']['origin'];
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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
if ($base !== '' && $base !== '/' && strpos($path, $base) === 0) {
    $path = substr($path, strlen($base));
}
$path = '/' . trim($path, '/');

$db = db_connect($config);
const GCK_OVERFLOW_DAYS = 7;

function require_roles(array $roles): array
{
    require_auth();
    $user = current_user();
    if (!in_array($user['role'], $roles, true)) {
        json_error('Forbidden', 403);
    }
    return $user;
}

function user_has_work_unit(array $user, string $unit): bool
{
    $units = json_decode($user['work_units'] ?? '[]', true);
    return is_array($units) && in_array($unit, $units, true);
}

function can_publish_media(array $user): bool
{
    return in_array($user['role'], ['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord'], true);
}

function can_manage_media(array $user): bool
{
    return in_array($user['role'], ['administrator'], true) || user_has_work_unit($user, 'Gospel Production Team');
}

function can_manage_publications(array $user): bool
{
    return in_array($user['role'], ['administrator'], true) || user_has_work_unit($user, 'Publication Team');
}

function attach_biodata_to_user(mysqli $db, array $user): array
{
    $stmt = db_prepare(
        $db,
        'SELECT fellowship_centre_id, state, region, work_units FROM biodata WHERE user_id = ? LIMIT 1',
        'i',
        [$user['id']]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $profile = $rows[0] ?? [];

    return array_merge($user, [
        'state' => $profile['state'] ?? null,
        'region' => $profile['region'] ?? null,
        'fellowship_centre_id' => $profile['fellowship_centre_id'] ?? null,
        'work_units' => $profile['work_units'] ?? '[]',
    ]);
}

function slugify_value(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value ?? '', '-');
}

function find_state_by_selector(mysqli $db, string $selector): ?array
{
    $stmt = db_prepare(
        $db,
        'SELECT id, name, slug FROM states WHERE name = ? OR slug = ? LIMIT 1',
        'ss',
        [$selector, $selector]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    return $rows[0] ?? null;
}

function load_categories(mysqli $db): array
{
    $stmt = db_prepare($db, 'SELECT id, name, slug FROM categories ORDER BY name', '', []);
    $stmt->execute();
    return db_fetch_all($stmt);
}

function sync_state_post_categories(mysqli $db, int $postId, array $categoryIds): void
{
    $ids = array_values(array_filter(array_map('intval', $categoryIds), fn($id) => $id > 0));
    $db->begin_transaction();
    try {
        $stmt = db_prepare($db, 'DELETE FROM state_post_categories WHERE post_id = ?', 'i', [$postId]);
        if (!$stmt->execute()) {
            throw new RuntimeException('Database error: ' . $stmt->error);
        }
        if ($ids) {
            $stmt = db_prepare($db, 'INSERT INTO state_post_categories (post_id, category_id) VALUES (?, ?)', 'ii', []);
            foreach ($ids as $categoryId) {
                $stmt->bind_param('ii', $postId, $categoryId);
                if (!$stmt->execute()) {
                    throw new RuntimeException('Database error: ' . $stmt->error);
                }
            }
        }
        $db->commit();
    } catch (Throwable $e) {
        $db->rollback();
        throw $e;
    }
}

if ($path === '/' || $path === '/health') {
    json_ok(['status' => 'ok']);
}

if ($path === '/csrf') {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
    json_ok(['token' => $_SESSION['csrf']]);
}

if ($path === '/meta/states') {
    require_method('GET');
    $stmt = db_prepare($db, 'SELECT name FROM states ORDER BY name', '', []);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(fn($row) => $row['name'], $rows);
    json_ok(['items' => $items]);
}

if ($path === '/meta/regions') {
    require_method('GET');
    $state = $_GET['state'] ?? '';
    if ($state === '') {
        json_ok(['items' => []]);
    }
    $stmt = db_prepare($db, 'SELECT name FROM regions WHERE state_name = ? ORDER BY name', 's', [$state]);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(fn($row) => $row['name'], $rows);
    json_ok(['items' => $items]);
}

if ($path === '/meta/fellowships') {
    require_method('GET');
    $state = $_GET['state'] ?? '';
    $region = $_GET['region'] ?? '';
    $sql = 'SELECT name FROM fellowship_centres WHERE 1=1';
    $types = '';
    $params = [];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    if ($region !== '') {
        $sql .= ' AND region = ?';
        $types .= 's';
        $params[] = $region;
    }
    $sql .= ' ORDER BY name';
    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(fn($row) => $row['name'], $rows);
    json_ok(['items' => $items]);
}

if ($path === '/meta/work-units') {
    require_method('GET');
    $stmt = db_prepare($db, 'SELECT name FROM work_units ORDER BY name', '', []);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(fn($row) => $row['name'], $rows);
    json_ok(['items' => $items]);
}

if ($path === '/meta/publication-types') {
    require_method('GET');
    $state = trim($_GET['state'] ?? '');
    $scope = trim($_GET['scope'] ?? '');

    $sql = 'SELECT DISTINCT publication_type AS name
            FROM publication_items
            WHERE status = "published" AND publication_type IS NOT NULL AND publication_type <> ""';
    $types = '';
    $params = [];

    if ($state !== '') {
        $sql .= ' AND (scope = "zonal" OR (scope = "state" AND state = ?))';
        $types .= 's';
        $params[] = $state;
    }
    if ($scope !== '' && in_array($scope, ["zonal", "state"], true)) {
        $sql .= ' AND scope = ?';
        $types .= 's';
        $params[] = $scope;
    }

    $sql .= ' ORDER BY publication_type';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_values(array_filter(array_map(fn($row) => $row['name'], $rows)));
    json_ok(['items' => $items]);
}

if ($path === '/meta/clusters') {
    require_method('GET');
    $state = $_GET['state'] ?? '';
    $region = $_GET['region'] ?? '';
    $sql = 'SELECT name FROM clusters WHERE 1=1';
    $types = '';
    $params = [];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    if ($region !== '') {
        $sql .= ' AND region = ?';
        $types .= 's';
        $params[] = $region;
    }
    $sql .= ' ORDER BY name';
    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(fn($row) => $row['name'], $rows);
    json_ok(['items' => $items]);
}

if ($path === '/meta/institutions') {
    require_method('GET');
    $state = $_GET['state'] ?? '';
    if ($state === '') {
        json_ok(['items' => []]);
    }
    $stmt = db_prepare($db, 'SELECT name FROM institutions WHERE state_name = ? ORDER BY name', 's', [$state]);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(fn($row) => $row['name'], $rows);
    json_ok(['items' => $items]);
}

if ($path === '/meta/coverage') {
    require_method('GET');
    $sql = 'SELECT s.name AS state_name,
                   (SELECT COUNT(*) FROM regions r WHERE r.state_name = s.name) AS regions_count,
                   (SELECT COUNT(*) FROM fellowship_centres fc WHERE fc.state = s.name) AS centres_count
            FROM states s
            ORDER BY s.name';
    $stmt = db_prepare($db, $sql, '', []);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows]);
}

if (preg_match('#^/public/states/([^/]+)/home$#', $path, $matches)) {
    require_method('GET');
    $stateSlug = $matches[1];
    $sql = 'SELECT sh.content, s.name, s.slug
            FROM state_homepages sh
            JOIN states s ON s.id = sh.state_id
            WHERE s.slug = ? LIMIT 1';
    $stmt = db_prepare($db, $sql, 's', [$stateSlug]);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_ok(['item' => null]);
    }
    $content = json_decode($rows[0]['content'], true);
    json_ok(['item' => $content ?: null]);
}

if (preg_match('#^/public/states/([^/]+)/posts$#', $path, $matches)) {
    require_method('GET');
    $stateSlug = $matches[1];
    $type = trim($_GET['type'] ?? '');
    $sql = 'SELECT sp.title, sp.slug, sp.type, sp.published_at, sp.feature_image_url,
                   GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ",") AS categories
            FROM state_posts sp
            JOIN states s ON s.id = sp.state_id
            LEFT JOIN state_post_categories spc ON spc.post_id = sp.id
            LEFT JOIN categories c ON c.id = spc.category_id
            WHERE s.slug = ? AND sp.status = ?';
    $types = 'ss';
    $params = [$stateSlug, 'published'];
    if ($type !== '') {
        $sql .= ' AND sp.type = ?';
        $types .= 's';
        $params[] = $type;
    }
    $sql .= ' GROUP BY sp.id, sp.title, sp.slug, sp.type, sp.published_at, sp.feature_image_url
              ORDER BY sp.published_at DESC, sp.created_at DESC';
    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(function ($row) {
        $row['categories'] = $row['categories']
            ? array_values(array_filter(array_map('trim', explode(',', $row['categories']))))
            : [];
        return $row;
    }, $rows);
    json_ok(['items' => $items]);
}

if (preg_match('#^/public/states/([^/]+)/posts/([^/]+)$#', $path, $matches)) {
    require_method('GET');
    $stateSlug = $matches[1];
    $postSlug = $matches[2];
    
    // 1. Fetch Post with Author
    $sql = 'SELECT sp.id, sp.state_id, sp.title, sp.slug, sp.type, sp.content, sp.published_at, sp.feature_image_url,
                   u.name AS author_name,
                   GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ",") AS categories
            FROM state_posts sp
            JOIN states s ON s.id = sp.state_id
            LEFT JOIN users u ON u.id = sp.created_by
            LEFT JOIN state_post_categories spc ON spc.post_id = sp.id
            LEFT JOIN categories c ON c.id = spc.category_id
            WHERE s.slug = ? AND sp.slug = ? AND sp.status = ?
            GROUP BY sp.id, sp.title, sp.slug, sp.type, sp.content, sp.published_at, sp.feature_image_url, u.name
            LIMIT 1';
    $stmt = db_prepare($db, $sql, 'sss', [$stateSlug, $postSlug, 'published']);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Not found', 404);
    }
    $item = $rows[0];
    $item['categories'] = $item['categories']
        ? array_values(array_filter(array_map('trim', explode(',', $item['categories']))))
        : [];

    // 2. Fetch Comments (if table exists)
    $stmt = $db->prepare("SHOW TABLES LIKE 'post_comments'");
    $stmt->execute();
    $hasCommentsTable = $stmt->get_result()->num_rows > 0;
    
    $item['comments'] = [];
    if ($hasCommentsTable) {
        $statsStmt = db_prepare($db, 'SELECT id, name, content, created_at FROM post_comments WHERE post_id = ? ORDER BY created_at DESC', 'i', [$item['id']]);
        $statsStmt->execute();
        $item['comments'] = db_fetch_all($statsStmt);
    }

    // 3. Fetch Related Posts (Same State, Different ID)
    $relatedSql = 'SELECT sp.title, sp.slug, sp.feature_image_url, sp.published_at
                   FROM state_posts sp
                   WHERE sp.state_id = ? AND sp.id != ? AND sp.status = "published"
                   ORDER BY sp.published_at DESC LIMIT 3';
    $relatedStmt = db_prepare($db, $relatedSql, 'ii', [$item['state_id'], $item['id']]);
    $relatedStmt->execute();
    $item['related_posts'] = db_fetch_all($relatedStmt);

    json_ok(['item' => $item]);
}

if (preg_match('#^/public/states/([^/]+)/posts/([^/]+)/comments$#', $path, $matches)) {
    require_method('POST');
    $stateSlug = $matches[1];
    $postSlug = $matches[2];
    $payload = read_json();
    
    // Find Post ID
    $stmt = db_prepare($db, 
        'SELECT sp.id FROM state_posts sp JOIN states s ON s.id = sp.state_id WHERE s.slug = ? AND sp.slug = ? LIMIT 1', 
        'ss', [$stateSlug, $postSlug]);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Post not found', 404);
    }
    $postId = $rows[0]['id'];

    $name = trim($payload['name'] ?? '');
    $email = trim($payload['email'] ?? '');
    $content = trim($payload['content'] ?? '');

    if ($name === '' || $email === '' || $content === '') {
        json_error('Name, email, and comment are required', 422);
    }

    // Ensure table exists (temporary fix until migration runs)
    $db->query("CREATE TABLE IF NOT EXISTS post_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      FOREIGN KEY (post_id) REFERENCES state_posts(id) ON DELETE CASCADE
    )");

    $stmt = db_prepare($db, 
        'INSERT INTO post_comments (post_id, name, email, content, created_at) VALUES (?, ?, ?, ?, NOW())', 
        'isss', [$postId, $name, $email, $content]);
    
    if ($stmt->execute()) {
        json_ok(['message' => 'Comment added']);
    } else {
        json_error('Failed to add comment', 500);
    }
}

if ($path === '/login') {
    require_method('POST');
    require_csrf();
    $payload = read_json();
    $email = trim($payload['email'] ?? '');
    $password = $payload['password'] ?? '';
    if ($email === '' || $password === '') {
        json_error('Email and password are required', 422);
    }

    $stmt = db_prepare($db, 'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1', 's', [$email]);
    $stmt->execute();
    $result = db_fetch_all($stmt);
    if (!$result) {
        json_error('Invalid credentials', 401);
    }
    $user = $result[0];
    if (!password_verify($password, $user['password_hash'])) {
        json_error('Invalid credentials', 401);
    }

    $user = attach_biodata_to_user($db, $user);
    login_user($user);
    json_ok(['user' => current_user()]);
}

if ($path === '/logout') {
    require_method('POST');
    require_csrf();
    logout_user();
    json_ok();
}

if ($path === '/me') {
    require_method('GET');
    require_auth();
    json_ok(['user' => current_user()]);
}

if ($path === '/admin/uploads') {
    require_method('POST');
    require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
    require_csrf();
    if (empty($_FILES['file'])) {
        json_error('No file uploaded', 422);
    }
    $file = $_FILES['file'];
    if (!empty($file['error'])) {
        json_error('Upload failed', 400);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $allowed = [
        // Images
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        // Documents
        'application/pdf' => 'pdf',
        // Audio
        'audio/mpeg' => 'mp3',
        'audio/wav' => 'wav',
        'audio/x-wav' => 'wav',
        'audio/ogg' => 'ogg',
        'audio/webm' => 'weba',
        'audio/aac' => 'aac',
        'audio/mp4' => 'm4a',
        'audio/x-m4a' => 'm4a',
        // Video
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/ogg' => 'ogv',
        'video/quicktime' => 'mov',
    ];
    if (!array_key_exists($mime, $allowed)) {
        json_error('Invalid file type: ' . $mime, 422);
    }
    $uploadDir = $config['uploads']['dir'];
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        json_error('Upload directory not writable', 500);
    }
    $filename = uniqid('img_', true) . '.' . $allowed[$mime];
    $target = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        json_error('Failed to save file', 500);
    }
    $url = rtrim($config['uploads']['url'], '/') . '/' . $filename;
    json_ok(['url' => $url]);
}

// ==================== AUTH: SIGNUP ====================
if ($path === '/signup') {
    require_method('POST');
    require_csrf();
    $payload = read_json();
    $name = trim($payload['name'] ?? '');
    $email = trim($payload['email'] ?? '');
    $password = $payload['password'] ?? '';
    $state = trim($payload['state'] ?? '');
    $region = trim($payload['region'] ?? '');
    $centreName = trim($payload['fellowship_centre'] ?? '');
    if ($name === '' || $email === '' || $password === '') {
        json_error('Name, email, and password are required', 422);
    }
    if ($state === '' || $region === '') {
        json_error('State and region are required', 422);
    }

    // Check if email already exists
    $stmt = db_prepare($db, 'SELECT id FROM users WHERE email = ? LIMIT 1', 's', [$email]);
    $stmt->execute();
    if (db_fetch_all($stmt)) {
        json_error('Email already registered', 409);
    }

    // Generate verification code (6 digits)
    $verificationCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = db_prepare($db, 
        'INSERT INTO users (name, email, password_hash, role, verification_code, verification_expires_at, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', 
        'ssssss', 
        [$name, $email, $hash, 'member', $verificationCode, $expiresAt]
    );
    $stmt->execute();
    $userId = $db->insert_id;

    $centreId = null;
    if ($centreName !== '' && $state !== '' && $region !== '') {
        $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
        $stmt->execute();
        $centreRow = db_fetch_all($stmt);
        if ($centreRow) {
            $centreId = (int) $centreRow[0]['id'];
        }
    }

    $stmt = db_prepare($db, 'INSERT INTO biodata (user_id, fellowship_centre_id, full_name, email, state, region, created_at, updated_at)
                             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', 'iissss', [
        $userId,
        $centreId,
        $name,
        $email,
        $state,
        $region,
    ]);
    $stmt->execute();

    // Send verification email
    $subject = 'DLCF - Verify Your Email';
    $message = "Hello $name,\n\nYour verification code is: $verificationCode\n\nThis code expires in 15 minutes.\n\n- DLCF Team";
    $headers = 'From: noreply@dlcfsw.org.ng';
    @mail($email, $subject, $message, $headers);

    json_ok(['message' => 'Account created. Please check your email for the verification code.'], 201);
}

// ==================== AUTH: VERIFY EMAIL ====================
if ($path === '/verify-email') {
    require_method('POST');
    require_csrf();
    $payload = read_json();
    $email = trim($payload['email'] ?? '');
    $code = trim($payload['code'] ?? '');

    if ($email === '' || $code === '') {
        json_error('Email and code are required', 422);
    }

    $stmt = db_prepare(
        $db,
        'SELECT id, name, email, role, verification_code, verification_expires_at, email_verified_at 
         FROM users WHERE email = ? LIMIT 1',
        's',
        [$email]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Invalid email', 404);
    }
    $user = $rows[0];

    if ($user['email_verified_at']) {
        json_error('Email already verified', 400);
    }

    if ($user['verification_code'] !== $code) {
        json_error('Invalid verification code', 400);
    }

    if (strtotime($user['verification_expires_at']) < time()) {
        json_error('Verification code expired', 400);
    }

    // Mark as verified
    $stmt = db_prepare($db, 
        'UPDATE users SET email_verified_at = NOW(), verification_code = NULL, verification_expires_at = NULL, updated_at = NOW() WHERE id = ?', 
        'i', 
        [$user['id']]
    );
    $stmt->execute();

    // Auto-login
    $user = attach_biodata_to_user($db, $user);
    login_user($user);
    json_ok(['message' => 'Email verified successfully', 'user' => current_user()]);
}

// ==================== AUTH: FORGOT PASSWORD ====================
if ($path === '/forgot-password') {
    require_method('POST');
    require_csrf();
    $payload = read_json();
    $email = trim($payload['email'] ?? '');

    if ($email === '') {
        json_error('Email is required', 422);
    }

    $stmt = db_prepare($db, 'SELECT id, name, email FROM users WHERE email = ? LIMIT 1', 's', [$email]);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        // Don't reveal if email exists
        json_ok(['message' => 'If the email exists, a reset code has been sent.']);
    }
    $user = $rows[0];

    // Generate reset code (6 digits)
    $resetCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    $stmt = db_prepare($db, 
        'UPDATE users SET reset_token = ?, reset_expires_at = ?, updated_at = NOW() WHERE id = ?', 
        'ssi', 
        [$resetCode, $expiresAt, $user['id']]
    );
    $stmt->execute();

    // Send reset email
    $subject = 'DLCF - Password Reset Code';
    $message = "Hello {$user['name']},\n\nYour password reset code is: $resetCode\n\nThis code expires in 15 minutes.\n\nIf you did not request this, please ignore this email.\n\n- DLCF Team";
    $headers = 'From: noreply@dlcfsw.org.ng';
    @mail($email, $subject, $message, $headers);

    json_ok(['message' => 'If the email exists, a reset code has been sent.']);
}

// ==================== AUTH: RESET PASSWORD ====================
if ($path === '/reset-password') {
    require_method('POST');
    require_csrf();
    $payload = read_json();
    $email = trim($payload['email'] ?? '');
    $code = trim($payload['code'] ?? '');
    $newPassword = $payload['password'] ?? '';

    if ($email === '' || $code === '' || $newPassword === '') {
        json_error('Email, code, and new password are required', 422);
    }

    $stmt = db_prepare($db, 
        'SELECT id, reset_token, reset_expires_at FROM users WHERE email = ? LIMIT 1', 
        's', 
        [$email]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Invalid request', 400);
    }
    $user = $rows[0];

    if (!$user['reset_token'] || $user['reset_token'] !== $code) {
        json_error('Invalid reset code', 400);
    }

    if (strtotime($user['reset_expires_at']) < time()) {
        json_error('Reset code expired', 400);
    }

    // Update password
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = db_prepare($db, 
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL, updated_at = NOW() WHERE id = ?', 
        'si', 
        [$hash, $user['id']]
    );
    $stmt->execute();

    json_ok(['message' => 'Password reset successfully. You can now login.']);
}

if ($path === '/admin/states') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_roles(['administrator', 'zonal_cord']);
        $stmt = db_prepare($db, 'SELECT id, name, slug FROM states ORDER BY name', '', []);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_roles(['administrator', 'zonal_cord']);
        require_csrf();
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $slug = slugify_value($name);
        if ($slug === '') {
            json_error('Invalid name', 422);
        }
        $stmt = db_prepare($db, 'SELECT id FROM states WHERE slug = ? LIMIT 1', 's', [$slug]);
        $stmt->execute();
        if (db_fetch_all($stmt)) {
            json_error('State slug already exists', 409);
        }
        $stmt = db_prepare($db, 'INSERT INTO states (name, slug, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', 'ss', [$name, $slug]);
        $stmt->execute();
        json_ok(['message' => 'State added'], 201);
    }
}

if (preg_match('#^/admin/states/(\\d+)$#', $path, $matches)) {
    require_roles(['administrator', 'zonal_cord']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $slug = slugify_value($name);
        if ($slug === '') {
            json_error('Invalid name', 422);
        }
        $stmt = db_prepare($db, 'SELECT name FROM states WHERE id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $stmt = db_prepare($db, 'SELECT id FROM states WHERE slug = ? AND id <> ? LIMIT 1', 'si', [$slug, $id]);
        $stmt->execute();
        if (db_fetch_all($stmt)) {
            json_error('State slug already exists', 409);
        }
        $oldName = $rows[0]['name'];
        $db->begin_transaction();
        try {
            $stmt = db_prepare($db, 'UPDATE states SET name = ?, slug = ?, updated_at = NOW() WHERE id = ?', 'ssi', [$name, $slug, $id]);
            $stmt->execute();
            $stmt = db_prepare($db, 'UPDATE regions SET state_name = ?, updated_at = NOW() WHERE state_name = ?', 'ss', [$name, $oldName]);
            $stmt->execute();
            $stmt = db_prepare($db, 'UPDATE institutions SET state_name = ?, updated_at = NOW() WHERE state_name = ?', 'ss', [$name, $oldName]);
            $stmt->execute();
            $stmt = db_prepare($db, 'UPDATE fellowship_centres SET state = ?, updated_at = NOW() WHERE state = ?', 'ss', [$name, $oldName]);
            $stmt->execute();
            $stmt = db_prepare($db, 'UPDATE users SET state = ?, updated_at = NOW() WHERE state = ?', 'ss', [$name, $oldName]);
            $stmt->execute();
            $db->commit();
            json_ok(['message' => 'State updated']);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('State update failed: ' . $e->getMessage(), $config['log_path']);
            json_error('Failed to update state', 500);
        }
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $stmt = db_prepare($db, 'DELETE FROM states WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'State deleted']);
    }
}

if ($path === '/admin/categories') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        json_ok(['items' => load_categories($db)]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        require_csrf();
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $slug = slugify_value($name);
        if ($slug === '') {
            json_error('Invalid name', 422);
        }
        $stmt = db_prepare($db, 'SELECT id FROM categories WHERE slug = ? LIMIT 1', 's', [$slug]);
        $stmt->execute();
        if (db_fetch_all($stmt)) {
            json_error('Category slug already exists', 409);
        }
        $stmt = db_prepare(
            $db,
            'INSERT INTO categories (name, slug, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            'ss',
            [$name, $slug]
        );
        $stmt->execute();
        json_ok(['message' => 'Category added'], 201);
    }
}

if (preg_match('#^/admin/categories/(\\d+)$#', $path, $matches)) {
    require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $slug = slugify_value($name);
        if ($slug === '') {
            json_error('Invalid name', 422);
        }
        $stmt = db_prepare($db, 'SELECT id FROM categories WHERE id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        if (!db_fetch_all($stmt)) {
            json_error('Not found', 404);
        }
        $stmt = db_prepare($db, 'SELECT id FROM categories WHERE slug = ? AND id <> ? LIMIT 1', 'si', [$slug, $id]);
        $stmt->execute();
        if (db_fetch_all($stmt)) {
            json_error('Category slug already exists', 409);
        }
        $stmt = db_prepare($db, 'UPDATE categories SET name = ?, slug = ?, updated_at = NOW() WHERE id = ?', 'ssi', [$name, $slug, $id]);
        $stmt->execute();
        json_ok(['message' => 'Category updated']);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $stmt = db_prepare($db, 'DELETE FROM categories WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'Category deleted']);
    }
}

if ($path === '/state/posts') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        $state = trim($_GET['state'] ?? '');
        if (($user['role'] === 'state_cord' || $user['role'] === 'state_admin') && $user['state']) {
            $state = $user['state'];
        }
        $stateRow = null;
        if ($state !== '') {
            $stateRow = find_state_by_selector($db, $state);
            if (!$stateRow) {
                json_error('State not found', 404);
            }
        } elseif ($user['role'] === 'state_cord' || $user['role'] === 'state_admin') {
            json_ok(['items' => []]);
        }
        $sql = 'SELECT sp.id, s.name AS state_name, s.slug AS state_slug,
                       sp.title, sp.slug, sp.type, sp.status, sp.published_at,
                       sp.content, sp.feature_image_url,
                       GROUP_CONCAT(c.id ORDER BY c.name SEPARATOR ",") AS category_ids,
                       GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ",") AS categories,
                       sp.created_at, sp.updated_at
                FROM state_posts sp
                JOIN states s ON s.id = sp.state_id
                LEFT JOIN state_post_categories spc ON spc.post_id = sp.id
                LEFT JOIN categories c ON c.id = spc.category_id';
        $types = '';
        $params = [];
        if ($stateRow) {
            $sql .= ' WHERE sp.state_id = ?';
            $types = 'i';
            $params[] = $stateRow['id'];
        }
        $sql .= ' GROUP BY sp.id, s.name, s.slug, sp.title, sp.slug, sp.type, sp.status, sp.published_at,
                          sp.content, sp.feature_image_url, sp.created_at, sp.updated_at
                  ORDER BY sp.updated_at DESC';
        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        $items = array_map(function ($row) {
            $row['category_ids'] = $row['category_ids']
                ? array_values(array_filter(array_map('intval', explode(',', $row['category_ids']))))
                : [];
            $row['categories'] = $row['categories']
                ? array_values(array_filter(array_map('trim', explode(',', $row['categories']))))
                : [];
            return $row;
        }, $rows);
        json_ok(['items' => $items]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        require_csrf();
        $payload = read_json();
        $state = trim($payload['state'] ?? '');
        $title = trim($payload['title'] ?? '');
        $content = $payload['content'] ?? '';
        $type = trim($payload['type'] ?? '');
        $status = trim($payload['status'] ?? 'draft');
        $featureImageUrl = trim($payload['feature_image_url'] ?? '');
        $categoryIds = $payload['category_ids'] ?? [];
        if (($user['role'] === 'state_cord' || $user['role'] === 'state_admin') && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '' || $title === '' || $content === '' || $type === '') {
            json_error('State, title, content, and type are required', 422);
        }
        if (!in_array($status, ['draft', 'published'], true)) {
            json_error('Invalid status', 422);
        }
        $stateRow = find_state_by_selector($db, $state);
        if (!$stateRow) {
            json_error('State not found', 404);
        }
        $slug = slugify_value($title);
        if ($slug === '') {
            json_error('Invalid title', 422);
        }
        $stmt = db_prepare($db, 'SELECT id FROM state_posts WHERE state_id = ? AND slug = ? LIMIT 1', 'is', [$stateRow['id'], $slug]);
        $stmt->execute();
        if (db_fetch_all($stmt)) {
            json_error('Post slug already exists', 409);
        }
        $publishedAt = null;
        if ($status === 'published') {
            $publishedAt = trim($payload['published_at'] ?? '');
            if ($publishedAt === '') {
                $publishedAt = date('Y-m-d H:i:s');
            }
        }
        $stmt = db_prepare(
            $db,
            'INSERT INTO state_posts (state_id, title, slug, feature_image_url, content, type, status, published_at, created_by, updated_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            'isssssssii',
            [$stateRow['id'], $title, $slug, $featureImageUrl ?: null, $content, $type, $status, $publishedAt, $user['id'], $user['id']]
        );
        if (!$stmt->execute()) {
            json_error('Database error: ' . $stmt->error, 500);
        }
        $postId = (int) $db->insert_id;
        if ($categoryIds) {
            try {
                sync_state_post_categories($db, (int) $postId, $categoryIds);
            } catch (Throwable $e) {
                json_error($e->getMessage(), 500);
            }
        }
        json_ok(['message' => 'Post created'], 201);
    }
}

if (preg_match('#^/state/posts/(\\d+)$#', $path, $matches)) {
    $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
    require_csrf();
    $postId = (int) $matches[1];
    $stmt = db_prepare(
        $db,
        'SELECT sp.id, sp.state_id, sp.title, sp.slug, sp.type, sp.status, sp.published_at, sp.content, sp.feature_image_url,
                s.name AS state_name
         FROM state_posts sp
         JOIN states s ON s.id = sp.state_id
         WHERE sp.id = ? LIMIT 1',
        'i',
        [$postId]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Not found', 404);
    }
    $post = $rows[0];
    if (($user['role'] === 'state_cord' || $user['role'] === 'state_admin') && $user['state'] && $user['state'] !== $post['state_name']) {
        json_error('Forbidden', 403);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $title = trim($payload['title'] ?? $post['title']);
        $content = $payload['content'] ?? $post['content'];
        $type = trim($payload['type'] ?? $post['type']);
        $status = trim($payload['status'] ?? $post['status']);
        $featureImageUrl = trim($payload['feature_image_url'] ?? $post['feature_image_url'] ?? '');
        $categoryIds = $payload['category_ids'] ?? [];
        if ($title === '' || $content === '' || $type === '') {
            json_error('Title, content, and type are required', 422);
        }
        if (!in_array($status, ['draft', 'published'], true)) {
            json_error('Invalid status', 422);
        }
        $slug = $post['slug'];
        if ($title !== $post['title']) {
            $slug = slugify_value($title);
            if ($slug === '') {
                json_error('Invalid title', 422);
            }
            $stmt = db_prepare($db, 'SELECT id FROM state_posts WHERE state_id = ? AND slug = ? AND id <> ? LIMIT 1', 'isi', [$post['state_id'], $slug, $postId]);
            $stmt->execute();
            if (db_fetch_all($stmt)) {
                json_error('Post slug already exists', 409);
            }
        }
        $publishedAt = $post['published_at'];
        if ($status === 'published') {
            $publishedAt = trim($payload['published_at'] ?? $publishedAt);
            if ($publishedAt === '') {
                $publishedAt = date('Y-m-d H:i:s');
            }
        } else {
            $publishedAt = null;
        }
        $stmt = db_prepare(
            $db,
            'UPDATE state_posts SET title = ?, slug = ?, feature_image_url = ?, content = ?, type = ?, status = ?, published_at = ?, updated_by = ?, updated_at = NOW()
             WHERE id = ?',
            'sssssssii',
            [$title, $slug, $featureImageUrl ?: null, $content, $type, $status, $publishedAt, $user['id'], $postId]
        );
        if (!$stmt->execute()) {
            json_error('Database error: ' . $stmt->error, 500);
        }
        try {
            sync_state_post_categories($db, $postId, is_array($categoryIds) ? $categoryIds : []);
        } catch (Throwable $e) {
            json_error($e->getMessage(), 500);
        }
        json_ok(['message' => 'Post updated']);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $stmt = db_prepare($db, 'DELETE FROM state_posts WHERE id = ?', 'i', [$postId]);
        $stmt->execute();
        json_ok(['message' => 'Post deleted']);
    }
}

if ($path === '/state/home') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        $state = trim($_GET['state'] ?? '');
        if (($user['role'] === 'state_cord' || $user['role'] === 'state_admin') && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '') {
            json_ok(['item' => null]);
        }
        $stateRow = find_state_by_selector($db, $state);
        if (!$stateRow) {
            json_error('State not found', 404);
        }
        $stmt = db_prepare(
            $db,
            'SELECT content FROM state_homepages WHERE state_id = ? LIMIT 1',
            'i',
            [$stateRow['id']]
        );
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        $content = $rows ? json_decode($rows[0]['content'], true) : null;
        json_ok(['item' => $content ?: null]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        require_csrf();
        $payload = read_json();
        $state = trim($payload['state'] ?? '');
        $content = $payload['content'] ?? null;
        if (($user['role'] === 'state_cord' || $user['role'] === 'state_admin') && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '' || $content === null) {
            json_error('State and content are required', 422);
        }
        $stateRow = find_state_by_selector($db, $state);
        if (!$stateRow) {
            json_error('State not found', 404);
        }
        $json = json_encode($content);
        if ($json === false) {
            json_error('Invalid content', 422);
        }
        $stmt = db_prepare(
            $db,
            'SELECT id FROM state_homepages WHERE state_id = ? LIMIT 1',
            'i',
            [$stateRow['id']]
        );
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if ($rows) {
            $stmt = db_prepare(
                $db,
                'UPDATE state_homepages SET content = ?, updated_by = ?, updated_at = NOW() WHERE state_id = ?',
                'sii',
                [$json, $user['id'], $stateRow['id']]
            );
            $stmt->execute();
        } else {
            $stmt = db_prepare(
                $db,
                'INSERT INTO state_homepages (state_id, content, updated_by, created_at, updated_at)
                 VALUES (?, ?, ?, NOW(), NOW())',
                'isi',
                [$stateRow['id'], $json, $user['id']]
            );
            $stmt->execute();
        }
        json_ok(['message' => 'State homepage updated']);
    }
}

if ($path === '/state-congress/settings') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_auth();
        $stmt = db_prepare(
            $db,
            'SELECT start_date, end_date FROM state_congress_settings ORDER BY id DESC LIMIT 1',
            '',
            []
        );
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_ok(['item' => null]);
        }
        json_ok(['item' => $rows[0]]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        require_csrf();
        $payload = read_json();
        $startDate = $payload['start_date'] ?? '';
        $endDate = $payload['end_date'] ?? '';
        if ($startDate === '' || $endDate === '') {
            json_error('start_date and end_date are required', 422);
        }
        if ($startDate > $endDate) {
            json_error('start_date must be before end_date', 422);
        }

        $stmt = db_prepare(
            $db,
            'SELECT id FROM state_congress_settings ORDER BY id DESC LIMIT 1',
            '',
            []
        );
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if ($rows) {
            $stmt = db_prepare(
                $db,
                'UPDATE state_congress_settings SET start_date = ?, end_date = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
                'ssii',
                [$startDate, $endDate, $user['id'], (int) $rows[0]['id']]
            );
            $stmt->execute();
        } else {
            $stmt = db_prepare(
                $db,
                'INSERT INTO state_congress_settings (start_date, end_date, updated_by, created_at, updated_at)
                 VALUES (?, ?, ?, NOW(), NOW())',
                'ssi',
                [$startDate, $endDate, $user['id']]
            );
            $stmt->execute();
        }
        json_ok(['message' => 'State congress dates saved']);
    }
}

if ($path === '/zonal-congress/settings') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_auth();
        $stmt = db_prepare(
            $db,
            'SELECT start_date, end_date FROM zonal_congress_settings ORDER BY id DESC LIMIT 1',
            '',
            []
        );
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_ok(['item' => null]);
        }
        json_ok(['item' => $rows[0]]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin']);
        require_csrf();
        $payload = read_json();
        $startDate = $payload['start_date'] ?? '';
        $endDate = $payload['end_date'] ?? '';
        if ($startDate === '' || $endDate === '') {
            json_error('start_date and end_date are required', 422);
        }
        if ($startDate > $endDate) {
            json_error('start_date must be before end_date', 422);
        }

        $stmt = db_prepare(
            $db,
            'SELECT id FROM zonal_congress_settings ORDER BY id DESC LIMIT 1',
            '',
            []
        );
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if ($rows) {
            $stmt = db_prepare(
                $db,
                'UPDATE zonal_congress_settings SET start_date = ?, end_date = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
                'ssii',
                [$startDate, $endDate, $user['id'], (int) $rows[0]['id']]
            );
            $stmt->execute();
        } else {
            $stmt = db_prepare(
                $db,
                'INSERT INTO zonal_congress_settings (start_date, end_date, updated_by, created_at, updated_at)
                 VALUES (?, ?, ?, NOW(), NOW())',
                'ssi',
                [$startDate, $endDate, $user['id']]
            );
            $stmt->execute();
        }
        json_ok(['message' => 'Zonal congress dates saved']);
    }
}

if ($path === '/media-items') {
    require_method('GET');
    $state = trim($_GET['state'] ?? '');
    $scope = trim($_GET['scope'] ?? '');
    $sql = 'SELECT id, title, description, speaker, series, media_type, source_url, thumbnail_url,
                   duration_seconds, event_date, tags, scope, state, status, published_at
            FROM media_items WHERE status = "published"';
    $types = '';
    $params = [];
    if ($state !== '') {
        $sql .= ' AND (scope = "zonal" OR (scope = "state" AND state = ?))';
        $types .= 's';
        $params[] = $state;
    }
    if ($scope !== '' && in_array($scope, ['zonal', 'state'], true)) {
        $sql .= ' AND scope = ?';
        $types .= 's';
        $params[] = $scope;
    }
    $sql .= ' ORDER BY event_date DESC, id DESC';
    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows]);
}

if ($path === '/publication-items') {
    require_method('GET');
    $state = trim($_GET['state'] ?? '');
    $scope = trim($_GET['scope'] ?? '');
    $sql = 'SELECT id, title, description, content_html, publication_type, file_url, cover_image_url,
                   publish_date, tags, scope, state, status, published_at, created_at
            FROM publication_items WHERE status = "published"';
    $types = '';
    $params = [];
    if ($state !== '') {
        $sql .= ' AND (scope = "zonal" OR (scope = "state" AND state = ?))';
        $types .= 's';
        $params[] = $state;
    }
    if ($scope !== '' && in_array($scope, ['zonal', 'state'], true)) {
        $sql .= ' AND scope = ?';
        $types .= 's';
        $params[] = $scope;
    }
    $sql .= ' ORDER BY publish_date DESC, id DESC';
    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows]);
}

if (preg_match('#^/media-items/(\\d+)$#', $path, $matches)) {
    require_method('GET');
    $id = (int) $matches[1];
    $stmt = db_prepare(
        $db,
        'SELECT id, title, description, speaker, series, media_type, source_url, thumbnail_url,
                duration_seconds, event_date, tags, scope, state, status, published_at
         FROM media_items WHERE id = ? AND status = "published" LIMIT 1',
        'i',
        [$id]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (empty($rows)) {
        json_error('Not found', 404);
    }
    json_ok(['item' => $rows[0]]);
}

if (preg_match('#^/publication-items/(\\d+)$#', $path, $matches)) {
    require_method('GET');
    $id = (int) $matches[1];
    $stmt = db_prepare(
        $db,
        'SELECT id, title, description, content_html, publication_type, file_url, cover_image_url,
                publish_date, tags, scope, state, status, published_at
         FROM publication_items WHERE id = ? AND status = "published" LIMIT 1',
        'i',
        [$id]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (empty($rows)) {
        json_error('Not found', 404);
    }
    json_ok(['item' => $rows[0]]);
}

if ($path === '/admin/media-items') {
    $user = require_auth();
    $user = current_user();
    if (!can_manage_media($user) && !can_publish_media($user)) {
        json_error('Forbidden', 403);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $state = trim($_GET['state'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $sql = 'SELECT id, title, description, speaker, series, media_type, source_url, thumbnail_url,
                       duration_seconds, event_date, tags, scope, state, status, published_at, created_at, updated_at
                FROM media_items WHERE 1=1';
        $types = '';
        $params = [];
        if ($state !== '') {
            $sql .= ' AND state = ?';
            $types .= 's';
            $params[] = $state;
        }
        if ($status !== '') {
            $sql .= ' AND status = ?';
            $types .= 's';
            $params[] = $status;
        }
        $sql .= ' ORDER BY event_date DESC, id DESC';
        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!can_manage_media($user)) {
            json_error('Forbidden', 403);
        }
        require_csrf();
        $payload = read_json();
        $title = trim($payload['title'] ?? '');
        $description = trim($payload['description'] ?? '');
        $speaker = trim($payload['speaker'] ?? '');
        $series = trim($payload['series'] ?? '');
        $mediaType = trim($payload['media_type'] ?? '');
        $sourceUrl = trim($payload['source_url'] ?? '');
        $thumbnailUrl = trim($payload['thumbnail_url'] ?? '');
        $durationSeconds = $payload['duration_seconds'] ?? null;
        $eventDate = $payload['event_date'] ?? null;
        $tags = trim($payload['tags'] ?? '');
        $scope = trim($payload['scope'] ?? 'zonal');
        $state = trim($payload['state'] ?? '');
        $status = trim($payload['status'] ?? 'draft');

        if ($title === '' || $mediaType === '' || $sourceUrl === '') {
            json_error('title, media_type, and source_url are required', 422);
        }
        if (!in_array($scope, ['zonal', 'state'], true)) {
            json_error('Invalid scope', 422);
        }
        if ($scope === 'state' && $state === '') {
            json_error('State is required for state scope', 422);
        }
        if (!in_array($status, ['draft', 'published'], true)) {
            json_error('Invalid status', 422);
        }
        if ($status === 'published' && !can_publish_media($user)) {
            json_error('Forbidden', 403);
        }
        $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;

        $stmt = db_prepare(
            $db,
            'INSERT INTO media_items
             (title, description, speaker, series, media_type, source_url, thumbnail_url, duration_seconds, event_date,
              tags, scope, state, status, published_at, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            'sssssssissssssi',
            [
                $title,
                $description !== '' ? $description : null,
                $speaker !== '' ? $speaker : null,
                $series !== '' ? $series : null,
                $mediaType,
                $sourceUrl,
                $thumbnailUrl !== '' ? $thumbnailUrl : null,
                $durationSeconds !== '' ? (int) $durationSeconds : null,
                $eventDate !== '' ? $eventDate : null,
                $tags !== '' ? $tags : null,
                $scope,
                $state !== '' ? $state : null,
                $status,
                $publishedAt,
                $user['id'],
            ]
        );
        $stmt->execute();
        json_ok(['id' => $db->insert_id], 201);
    }
}

if (preg_match('#^/admin/media-items/(\\d+)$#', $path, $matches)) {
    $user = require_auth();
    $user = current_user();
    if (!can_manage_media($user) && !can_publish_media($user)) {
        json_error('Forbidden', 403);
    }
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        if (!can_manage_media($user)) {
            json_error('Forbidden', 403);
        }
        require_csrf();
        $payload = read_json();
        $title = trim($payload['title'] ?? '');
        $description = trim($payload['description'] ?? '');
        $speaker = trim($payload['speaker'] ?? '');
        $series = trim($payload['series'] ?? '');
        $mediaType = trim($payload['media_type'] ?? '');
        $sourceUrl = trim($payload['source_url'] ?? '');
        $thumbnailUrl = trim($payload['thumbnail_url'] ?? '');
        $durationSeconds = $payload['duration_seconds'] ?? null;
        $eventDate = $payload['event_date'] ?? null;
        $tags = trim($payload['tags'] ?? '');
        $scope = trim($payload['scope'] ?? 'zonal');
        $state = trim($payload['state'] ?? '');
        $status = trim($payload['status'] ?? 'draft');

        if ($title === '' || $mediaType === '' || $sourceUrl === '') {
            json_error('title, media_type, and source_url are required', 422);
        }
        if (!in_array($scope, ['zonal', 'state'], true)) {
            json_error('Invalid scope', 422);
        }
        if ($scope === 'state' && $state === '') {
            json_error('State is required for state scope', 422);
        }
        if (!in_array($status, ['draft', 'published'], true)) {
            json_error('Invalid status', 422);
        }
        if ($status === 'published' && !can_publish_media($user)) {
            json_error('Forbidden', 403);
        }
        $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;

        $stmt = db_prepare(
            $db,
            'UPDATE media_items
             SET title = ?, description = ?, speaker = ?, series = ?, media_type = ?, source_url = ?, thumbnail_url = ?,
                 duration_seconds = ?, event_date = ?, tags = ?, scope = ?, state = ?, status = ?, published_at = ?,
                 updated_by = ?, updated_at = NOW()
             WHERE id = ?',
            'sssssssissssssii',
            [
                $title,
                $description !== '' ? $description : null,
                $speaker !== '' ? $speaker : null,
                $series !== '' ? $series : null,
                $mediaType,
                $sourceUrl,
                $thumbnailUrl !== '' ? $thumbnailUrl : null,
                $durationSeconds !== '' ? (int) $durationSeconds : null,
                $eventDate !== '' ? $eventDate : null,
                $tags !== '' ? $tags : null,
                $scope,
                $state !== '' ? $state : null,
                $status,
                $publishedAt,
                $user['id'],
                $id,
            ]
        );
        $stmt->execute();
        json_ok(['message' => 'Media item updated']);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!can_manage_media($user)) {
            json_error('Forbidden', 403);
        }
        require_csrf();
        $stmt = db_prepare($db, 'DELETE FROM media_items WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'Media item deleted']);
    }
}

if ($path === '/admin/publication-items') {
    $user = require_auth();
    $user = current_user();
    if (!can_manage_publications($user) && !can_publish_media($user)) {
        json_error('Forbidden', 403);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $state = trim($_GET['state'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $sql = 'SELECT id, title, description, content_html, publication_type, file_url, cover_image_url, publish_date,
                       tags, scope, state, status, published_at, created_at, updated_at
                FROM publication_items WHERE 1=1';
        $types = '';
        $params = [];
        if ($state !== '') {
            $sql .= ' AND state = ?';
            $types .= 's';
            $params[] = $state;
        }
        if ($status !== '') {
            $sql .= ' AND status = ?';
            $types .= 's';
            $params[] = $status;
        }
        $sql .= ' ORDER BY publish_date DESC, id DESC';
        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!can_manage_publications($user)) {
            json_error('Forbidden', 403);
        }
        require_csrf();
        $payload = read_json();
        $title = trim($payload['title'] ?? '');
        $description = trim($payload['description'] ?? '');
        $contentHtml = trim($payload['content_html'] ?? '');
        $publicationType = trim($payload['publication_type'] ?? '');
        $fileUrl = trim($payload['file_url'] ?? '');
        $coverImageUrl = trim($payload['cover_image_url'] ?? '');
        $publishDate = $payload['publish_date'] ?? null;
        $tags = trim($payload['tags'] ?? '');
        $scope = trim($payload['scope'] ?? 'zonal');
        $state = trim($payload['state'] ?? '');
        $status = trim($payload['status'] ?? 'draft');

        if ($title === '' || $publicationType === '') {
            json_error('title and publication_type are required', 422);
        }
        if (!in_array($scope, ['zonal', 'state'], true)) {
            json_error('Invalid scope', 422);
        }
        if ($scope === 'state' && $state === '') {
            json_error('State is required for state scope', 422);
        }
        if (!in_array($status, ['draft', 'published'], true)) {
            json_error('Invalid status', 422);
        }
        if ($status === 'published' && !can_publish_media($user)) {
            json_error('Forbidden', 403);
        }
        $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;

        $stmt = db_prepare(
            $db,
            'INSERT INTO publication_items
             (title, description, content_html, publication_type, file_url, cover_image_url, publish_date, tags, scope, state,
              status, published_at, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            'ssssssssssssi',
            [
                $title,
                $description !== '' ? $description : null,
                $contentHtml !== '' ? $contentHtml : null,
                $publicationType,
                $fileUrl,
                $coverImageUrl !== '' ? $coverImageUrl : null,
                $publishDate !== '' ? $publishDate : null,
                $tags !== '' ? $tags : null,
                $scope,
                $state !== '' ? $state : null,
                $status,
                $publishedAt,
                $user['id'],
            ]
        );
        $stmt->execute();
        json_ok(['id' => $db->insert_id], 201);
    }
}

if (preg_match('#^/admin/publication-items/(\\d+)$#', $path, $matches)) {
    $user = require_auth();
    $user = current_user();
    if (!can_manage_publications($user) && !can_publish_media($user)) {
        json_error('Forbidden', 403);
    }
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        if (!can_manage_publications($user)) {
            json_error('Forbidden', 403);
        }
        require_csrf();
        $payload = read_json();
        $title = trim($payload['title'] ?? '');
        $description = trim($payload['description'] ?? '');
        $contentHtml = trim($payload['content_html'] ?? '');
        $publicationType = trim($payload['publication_type'] ?? '');
        $fileUrl = trim($payload['file_url'] ?? '');
        $coverImageUrl = trim($payload['cover_image_url'] ?? '');
        $publishDate = $payload['publish_date'] ?? null;
        $tags = trim($payload['tags'] ?? '');
        $scope = trim($payload['scope'] ?? 'zonal');
        $state = trim($payload['state'] ?? '');
        $status = trim($payload['status'] ?? 'draft');

        if ($title === '' || $publicationType === '') {
            json_error('title and publication_type are required', 422);
        }
        if (!in_array($scope, ['zonal', 'state'], true)) {
            json_error('Invalid scope', 422);
        }
        if ($scope === 'state' && $state === '') {
            json_error('State is required for state scope', 422);
        }
        if (!in_array($status, ['draft', 'published'], true)) {
            json_error('Invalid status', 422);
        }
        if ($status === 'published' && !can_publish_media($user)) {
            json_error('Forbidden', 403);
        }
        $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;

        $stmt = db_prepare(
            $db,
            'UPDATE publication_items
             SET title = ?, description = ?, content_html = ?, publication_type = ?, file_url = ?, cover_image_url = ?, publish_date = ?,
                 tags = ?, scope = ?, state = ?, status = ?, published_at = ?, updated_by = ?, updated_at = NOW()
             WHERE id = ?',
            'ssssssssssssii',
            [
                $title,
                $description !== '' ? $description : null,
                $contentHtml !== '' ? $contentHtml : null,
                $publicationType,
                $fileUrl,
                $coverImageUrl !== '' ? $coverImageUrl : null,
                $publishDate !== '' ? $publishDate : null,
                $tags !== '' ? $tags : null,
                $scope,
                $state !== '' ? $state : null,
                $status,
                $publishedAt,
                $user['id'],
                $id,
            ]
        );
        $stmt->execute();
        json_ok(['message' => 'Publication updated']);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!can_manage_publications($user)) {
            json_error('Forbidden', 403);
        }
        require_csrf();
        $stmt = db_prepare($db, 'DELETE FROM publication_items WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'Publication deleted']);
    }
}

if ($path === '/admin/regions') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = require_roles(['administrator', 'zonal_cord', 'state_cord']);
        $state = $_GET['state'] ?? '';
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '') {
            json_ok(['items' => []]);
        }
        $stmt = db_prepare($db, 'SELECT id, state_name, name FROM regions WHERE state_name = ? ORDER BY name', 's', [$state]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user = require_roles(['administrator', 'zonal_cord', 'state_cord']);
        require_csrf();
        $payload = read_json();
        $state = trim($payload['state'] ?? '');
        $name = trim($payload['name'] ?? '');
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '' || $name === '') {
            json_error('State and name are required', 422);
        }
        $stmt = db_prepare($db, 'INSERT INTO regions (state_name, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', 'ss', [$state, $name]);
        $stmt->execute();
        json_ok(['message' => 'Region added'], 201);
    }
}

if (preg_match('#^/admin/regions/(\\d+)$#', $path, $matches)) {
    $user = require_roles(['administrator', 'zonal_cord', 'state_cord']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        $state = trim($payload['state'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $stmt = db_prepare($db, 'SELECT state_name, name FROM regions WHERE id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $oldState = $rows[0]['state_name'];
        $oldName = $rows[0]['name'];
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '') {
            $state = $oldState;
        }
        $db->begin_transaction();
        try {
            $stmt = db_prepare($db, 'UPDATE regions SET state_name = ?, name = ?, updated_at = NOW() WHERE id = ?', 'ssi', [$state, $name, $id]);
            $stmt->execute();
            $stmt = db_prepare($db, 'UPDATE fellowship_centres SET state = ?, region = ?, updated_at = NOW() WHERE state = ? AND region = ?', 'ssss', [$state, $name, $oldState, $oldName]);
            $stmt->execute();
            $stmt = db_prepare($db, 'UPDATE users SET state = ?, region = ?, updated_at = NOW() WHERE state = ? AND region = ?', 'ssss', [$state, $name, $oldState, $oldName]);
            $stmt->execute();
            $db->commit();
            json_ok(['message' => 'Region updated']);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('Region update failed: ' . $e->getMessage(), $config['log_path']);
            json_error('Failed to update region', 500);
        }
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if ($user['role'] === 'state_cord' && $user['state']) {
            $stmt = db_prepare($db, 'DELETE FROM regions WHERE id = ? AND state_name = ?', 'is', [$id, $user['state']]);
        } else {
            $stmt = db_prepare($db, 'DELETE FROM regions WHERE id = ?', 'i', [$id]);
        }
        $stmt->execute();
        json_ok(['message' => 'Region deleted']);
    }
}

if ($path === '/admin/institutions') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = require_roles(['administrator', 'zonal_cord', 'state_cord']);
        $state = $_GET['state'] ?? '';
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '') {
            json_ok(['items' => []]);
        }
        $stmt = db_prepare($db, 'SELECT id, state_name, name FROM institutions WHERE state_name = ? ORDER BY name', 's', [$state]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user = require_roles(['administrator', 'zonal_cord', 'state_cord']);
        require_csrf();
        $payload = read_json();
        $state = trim($payload['state'] ?? '');
        $name = trim($payload['name'] ?? '');
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '' || $name === '') {
            json_error('State and name are required', 422);
        }
        $stmt = db_prepare($db, 'INSERT INTO institutions (state_name, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())', 'ss', [$state, $name]);
        $stmt->execute();
        json_ok(['message' => 'Institution added'], 201);
    }
}

if (preg_match('#^/admin/institutions/(\\d+)$#', $path, $matches)) {
    $user = require_roles(['administrator', 'zonal_cord', 'state_cord']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        $state = trim($payload['state'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $stmt = db_prepare($db, 'SELECT state_name FROM institutions WHERE id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $oldState = $rows[0]['state_name'];
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '') {
            $state = $oldState;
        }
        $stmt = db_prepare($db, 'UPDATE institutions SET state_name = ?, name = ?, updated_at = NOW() WHERE id = ?', 'ssi', [$state, $name, $id]);
        $stmt->execute();
        json_ok(['message' => 'Institution updated']);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if ($user['role'] === 'state_cord' && $user['state']) {
            $stmt = db_prepare($db, 'DELETE FROM institutions WHERE id = ? AND state_name = ?', 'is', [$id, $user['state']]);
        } else {
            $stmt = db_prepare($db, 'DELETE FROM institutions WHERE id = ?', 'i', [$id]);
        }
        $stmt->execute();
        json_ok(['message' => 'Institution deleted']);
    }
}

if ($path === '/admin/fellowships/bulk') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_error('Method not allowed', 405);
    }
    $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
    require_csrf();
    $payload = read_json();
    $items = $payload['items'] ?? null;
    if (!is_array($items) || empty($items)) {
        json_error('Items are required', 422);
    }

    $inserted = 0;
    $skipped = 0;
    $errors = [];

    try {
        $db->begin_transaction();
        foreach ($items as $index => $item) {
            $name = trim($item['name'] ?? '');
            $state = trim($item['state'] ?? '');
            $region = trim($item['region'] ?? '');

            if ($user['role'] === 'region_cord' && $user['region']) {
                $region = $user['region'];
                $state = $user['state'] ?? $state;
            }
            if ($user['role'] === 'state_cord' && $user['state']) {
                $state = $user['state'];
            }

            if ($name === '' || $state === '' || $region === '') {
                $errors[] = ['row' => $index + 2, 'message' => 'Missing name, state, or region'];
                continue;
            }

            $stmt = db_prepare(
                $db,
                'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1',
                'sss',
                [$name, $state, $region]
            );
            $stmt->execute();
            $existing = db_fetch_all($stmt);
            if ($existing) {
                $skipped++;
                continue;
            }

            $stmt = db_prepare(
                $db,
                'INSERT INTO fellowship_centres (name, state, region, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                'sss',
                [$name, $state, $region]
            );
            $stmt->execute();
            $inserted++;
        }
        $db->commit();
    } catch (Throwable $e) {
        $db->rollback();
        log_error('Fellowship bulk upload failed: ' . $e->getMessage(), $config['log_path']);
        json_error('Bulk upload failed', 500);
    }

    json_ok([
        'inserted' => $inserted,
        'skipped' => $skipped,
        'errors' => $errors,
    ]);
}

if ($path === '/admin/fellowships') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
        $state = $_GET['state'] ?? '';
        $region = $_GET['region'] ?? '';
        if ($user['role'] === 'region_cord' && $user['region']) {
            $region = $user['region'];
            $state = $user['state'] ?? $state;
        }
        if ($user['role'] === 'associate_cord' && $user['fellowship_centre_id']) {
            $sql = 'SELECT id, name, state, region FROM fellowship_centres WHERE id = ? LIMIT 1';
            $stmt = db_prepare($db, $sql, 'i', [(int) $user['fellowship_centre_id']]);
            $stmt->execute();
            $rows = db_fetch_all($stmt);
            json_ok(['items' => $rows]);
        }
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        $sql = 'SELECT id, name, state, region FROM fellowship_centres WHERE 1=1';
        $types = '';
        $params = [];
        if ($state !== '') {
            $sql .= ' AND state = ?';
            $types .= 's';
            $params[] = $state;
        }
        if ($region !== '') {
            $sql .= ' AND region = ?';
            $types .= 's';
            $params[] = $region;
        }
        $sql .= ' ORDER BY name';
        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
        require_csrf();
        $payload = read_json();
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $name = trim($payload['name'] ?? '');
        if ($user['role'] === 'associate_cord' && $user['fellowship_centre_id']) {
            json_error('Not allowed', 403);
        }
        if ($user['role'] === 'region_cord' && $user['region']) {
            $region = $user['region'];
            $state = $user['state'] ?? $state;
        }
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '' || $region === '' || $name === '') {
            json_error('State, region, and name are required', 422);
        }
        $stmt = db_prepare($db, 'INSERT INTO fellowship_centres (name, state, region, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'sss', [$name, $state, $region]);
        $stmt->execute();
        json_ok(['message' => 'Fellowship added'], 201);
    }
}

if (preg_match('#^/admin/fellowships/(\\d+)$#', $path, $matches)) {
    $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        if ($user['role'] === 'associate_cord' && $user['fellowship_centre_id']) {
            json_error('Not allowed', 403);
        }
        $stmt = db_prepare($db, 'SELECT state, region FROM fellowship_centres WHERE id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $oldState = $rows[0]['state'];
        $oldRegion = $rows[0]['region'];
        if ($user['role'] === 'region_cord' && $user['region']) {
            $region = $user['region'];
            $state = $user['state'] ?? $state;
        }
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        if ($state === '') {
            $state = $oldState;
        }
        if ($region === '') {
            $region = $oldRegion;
        }
        $stmt = db_prepare($db, 'UPDATE fellowship_centres SET name = ?, state = ?, region = ?, updated_at = NOW() WHERE id = ?', 'sssi', [$name, $state, $region, $id]);
        $stmt->execute();
        json_ok(['message' => 'Fellowship updated']);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if ($user['role'] === 'associate_cord') {
            json_error('Not allowed', 403);
        }
        if ($user['role'] === 'region_cord' && $user['region']) {
            $stmt = db_prepare($db, 'DELETE FROM fellowship_centres WHERE id = ? AND region = ?', 'is', [$id, $user['region']]);
        } elseif ($user['role'] === 'state_cord' && $user['state']) {
            $stmt = db_prepare($db, 'DELETE FROM fellowship_centres WHERE id = ? AND state = ?', 'is', [$id, $user['state']]);
        } else {
            $stmt = db_prepare($db, 'DELETE FROM fellowship_centres WHERE id = ?', 'i', [$id]);
        }
        $stmt->execute();
        json_ok(['message' => 'Fellowship deleted']);
    }
}

if ($path === '/admin/work-units') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_roles(['administrator']);
        $stmt = db_prepare($db, 'SELECT id, name FROM work_units ORDER BY name', '', []);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_roles(['administrator']);
        require_csrf();
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $stmt = db_prepare($db, 'INSERT INTO work_units (name, created_at, updated_at) VALUES (?, NOW(), NOW())', 's', [$name]);
        $stmt->execute();
        json_ok(['message' => 'Work unit added'], 201);
    }
}

if (preg_match('#^/admin/work-units/(\\d+)$#', $path, $matches)) {
    require_roles(['administrator']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $stmt = db_prepare($db, 'SELECT name FROM work_units WHERE id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $oldName = $rows[0]['name'];
        $db->begin_transaction();
        try {
            $stmt = db_prepare($db, 'UPDATE work_units SET name = ?, updated_at = NOW() WHERE id = ?', 'si', [$name, $id]);
            $stmt->execute();

            $stmt = db_prepare($db, 'SELECT id, work_units FROM users', '', []);
            $stmt->execute();
            $users = db_fetch_all($stmt);
            foreach ($users as $userRow) {
                $units = json_decode($userRow['work_units'] ?? '[]', true);
                if (!is_array($units)) {
                    $units = [];
                }
                if (in_array($oldName, $units, true)) {
                    $units = array_map(function ($unit) use ($oldName, $name) {
                        return $unit === $oldName ? $name : $unit;
                    }, $units);
                    $stmt = db_prepare($db, 'UPDATE users SET work_units = ?, updated_at = NOW() WHERE id = ?', 'si', [
                        json_encode(array_values($units)),
                        (int) $userRow['id'],
                    ]);
                    $stmt->execute();
                }
            }

            $stmt = db_prepare($db, 'SELECT id, work_units FROM biodata', '', []);
            $stmt->execute();
            $records = db_fetch_all($stmt);
            foreach ($records as $record) {
                $units = json_decode($record['work_units'] ?? '[]', true);
                if (!is_array($units)) {
                    $units = [];
                }
                if (in_array($oldName, $units, true)) {
                    $units = array_map(function ($unit) use ($oldName, $name) {
                        return $unit === $oldName ? $name : $unit;
                    }, $units);
                    $stmt = db_prepare($db, 'UPDATE biodata SET work_units = ?, updated_at = NOW() WHERE id = ?', 'si', [
                        json_encode(array_values($units)),
                        (int) $record['id'],
                    ]);
                    $stmt->execute();
                }
            }

            $db->commit();
            json_ok(['message' => 'Work unit updated']);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('Work unit update failed: ' . $e->getMessage(), $config['log_path']);
            json_error('Failed to update work unit', 500);
        }
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $stmt = db_prepare($db, 'DELETE FROM work_units WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'Work unit deleted']);
    }
}

if ($path === '/admin/roles') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
        $stmt = db_prepare($db, 'SELECT id, name FROM roles ORDER BY name', '', []);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_roles(['administrator']);
        require_csrf();
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $stmt = db_prepare($db, 'INSERT INTO roles (name, created_at, updated_at) VALUES (?, NOW(), NOW())', 's', [$name]);
        $stmt->execute();
        json_ok(['message' => 'Role added'], 201);
    }
}

if (preg_match('#^/admin/roles/(\\d+)$#', $path, $matches)) {
    require_roles(['administrator']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        if ($name === '') {
            json_error('Name is required', 422);
        }
        $stmt = db_prepare($db, 'SELECT name FROM roles WHERE id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $oldName = $rows[0]['name'];
        $db->begin_transaction();
        try {
            $stmt = db_prepare($db, 'UPDATE roles SET name = ?, updated_at = NOW() WHERE id = ?', 'si', [$name, $id]);
            $stmt->execute();
            $stmt = db_prepare($db, 'UPDATE users SET role = ?, updated_at = NOW() WHERE role = ?', 'ss', [$name, $oldName]);
            $stmt->execute();
            $db->commit();
            json_ok(['message' => 'Role updated']);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('Role update failed: ' . $e->getMessage(), $config['log_path']);
            json_error('Failed to update role', 500);
        }
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $stmt = db_prepare($db, 'DELETE FROM roles WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'Role deleted']);
    }
}

if ($path === '/admin/users') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
        $sql = 'SELECT u.id, u.name, u.email, u.role, b.state, b.region, b.fellowship_centre_id, b.work_units, fc.name AS fellowship_centre
                FROM users u
                LEFT JOIN biodata b ON b.user_id = u.id
                LEFT JOIN fellowship_centres fc ON fc.id = b.fellowship_centre_id
                WHERE 1=1';
        $types = '';
        $params = [];
        if ($user['role'] === 'associate_cord' && $user['fellowship_centre_id']) {
            $sql .= ' AND b.fellowship_centre_id = ?';
            $types .= 'i';
            $params[] = (int) $user['fellowship_centre_id'];
        } elseif ($user['role'] === 'region_cord' && $user['region']) {
            $sql .= ' AND b.region = ?';
            $types .= 's';
            $params[] = $user['region'];
        } elseif ($user['role'] === 'state_cord' && $user['state']) {
            $sql .= ' AND b.state = ?';
            $types .= 's';
            $params[] = $user['state'];
        }
        $sql .= ' ORDER BY u.name';
        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        foreach ($rows as &$row) {
            $row['work_units'] = json_decode($row['work_units'] ?? '[]', true) ?: [];
        }
        json_ok(['items' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user = require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
        require_csrf();
        $payload = read_json();
        $name = trim($payload['name'] ?? '');
        $email = trim($payload['email'] ?? '');
        $password = $payload['password'] ?? '';
        $role = trim($payload['role'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $cluster = trim($payload['cluster'] ?? '');
        $centreName = trim($payload['fellowship_centre'] ?? '');
        $workUnits = $payload['work_units'] ?? [];

        if ($user['role'] === 'associate_cord' && $user['fellowship_centre_id']) {
            $centreId = (int) $user['fellowship_centre_id'];
            $stmt = db_prepare($db, 'SELECT name, state, region FROM fellowship_centres WHERE id = ? LIMIT 1', 'i', [$centreId]);
            $stmt->execute();
            $centreRow = db_fetch_all($stmt);
            if ($centreRow) {
                $centreName = $centreRow[0]['name'];
                $state = $centreRow[0]['state'];
                $region = $centreRow[0]['region'];
            }
        } elseif ($user['role'] === 'region_cord' && $user['region']) {
            $region = $user['region'];
            $state = $user['state'] ?? $state;
        } elseif ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }

        if ($name === '' || $email === '' || $password === '' || $role === '') {
            json_error('Name, email, password, and role are required', 422);
        }
        if (!is_array($workUnits)) {
            json_error('Work units must be an array', 422);
        }

        $centreId = null;
        if ($centreName !== '' && $state !== '' && $region !== '') {
            $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
            $stmt->execute();
            $centreRow = db_fetch_all($stmt);
            if ($centreRow) {
                $centreId = (int) $centreRow[0]['id'];
            }
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = db_prepare($db, 'INSERT INTO users (name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', 'ssss', [
            $name,
            $email,
            $hash,
            $role,
        ]);
        $stmt->execute();
        $userId = $db->insert_id;

        $cluster = $cluster === '' ? null : $cluster;
        $stmt = db_prepare(
            $db,
            'INSERT INTO biodata (user_id, fellowship_centre_id, full_name, email, state, region, cluster, work_units, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            'iissssss',
            [
                $userId,
                $centreId,
                $name,
                $email,
                $state ?: null,
                $region ?: null,
                $cluster,
                json_encode(array_values($workUnits)),
            ]
        );
        $stmt->execute();
        json_ok(['message' => 'User created'], 201);
    }
}

if (preg_match('#^/admin/users/(\\d+)$#', $path, $matches)) {
    require_roles(['administrator', 'zonal_cord', 'zonal_admin', 'state_cord', 'state_admin', 'region_cord', 'associate_cord']);
    require_csrf();
    $id = (int) $matches[1];
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $stmt = db_prepare($db, 'DELETE FROM users WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'User deleted']);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $payload = read_json();
        $stmt = db_prepare($db, 'SELECT u.id, u.name, u.email, u.role, b.user_id AS biodata_user_id, b.state, b.region,
                                       b.fellowship_centre_id, b.work_units, b.cluster
                                FROM users u
                                LEFT JOIN biodata b ON b.user_id = u.id
                                WHERE u.id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $current = $rows[0];

        $name = trim($payload['name'] ?? $current['name']);
        $email = trim($payload['email'] ?? $current['email']);
        $role = trim($payload['role'] ?? $current['role']);
        $state = array_key_exists('state', $payload) ? trim($payload['state'] ?? '') : ($current['state'] ?? '');
        $region = array_key_exists('region', $payload) ? trim($payload['region'] ?? '') : ($current['region'] ?? '');
        $cluster = array_key_exists('cluster', $payload) ? trim($payload['cluster'] ?? '') : ($current['cluster'] ?? '');
        $password = $payload['password'] ?? '';
        $workUnits = $payload['work_units'] ?? json_decode($current['work_units'] ?? '[]', true);

        if ($name === '' || $email === '' || $role === '') {
            json_error('Name, email, and role are required', 422);
        }
        if (!is_array($workUnits)) {
            json_error('Work units must be an array', 422);
        }

        $centreId = $current['fellowship_centre_id'];
        if (array_key_exists('fellowship_centre', $payload)) {
            $centreName = trim($payload['fellowship_centre'] ?? '');
            if ($centreName === '' || $state === '' || $region === '') {
                $centreId = null;
            } else {
                $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
                $stmt->execute();
                $centreRow = db_fetch_all($stmt);
                if ($centreRow) {
                    $centreId = (int) $centreRow[0]['id'];
                } else {
                    $centreId = null;
                }
            }
        }

        $fields = 'name = ?, email = ?, role = ?, updated_at = NOW()';
        $types = 'sss';
        $params = [$name, $email, $role];
        if ($password !== '') {
            $fields .= ', password_hash = ?';
            $types .= 's';
            $params[] = password_hash($password, PASSWORD_DEFAULT);
        }
        $params[] = $id;
        $types .= 'i';

        $stmt = db_prepare($db, "UPDATE users SET {$fields} WHERE id = ?", $types, $params);
        $stmt->execute();

        $cluster = $cluster === '' ? null : $cluster;
        if ($current['biodata_user_id']) {
            $stmt = db_prepare(
                $db,
                'UPDATE biodata SET full_name = ?, email = ?, state = ?, region = ?, cluster = ?, fellowship_centre_id = ?, work_units = ?, updated_at = NOW()
                 WHERE user_id = ?',
                'sssssisi',
                [
                    $name,
                    $email,
                    $state ?: null,
                    $region ?: null,
                    $cluster,
                    $centreId,
                    json_encode(array_values($workUnits)),
                    $id,
                ]
            );
            $stmt->execute();
        } else {
            $stmt = db_prepare(
                $db,
                'INSERT INTO biodata (user_id, fellowship_centre_id, full_name, email, state, region, cluster, work_units, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                'iissssss',
                [
                    $id,
                    $centreId,
                    $name,
                    $email,
                    $state ?: null,
                    $region ?: null,
                    $cluster,
                    json_encode(array_values($workUnits)),
                ]
            );
            $stmt->execute();
        }
        json_ok(['message' => 'User updated']);
    }
}

if ($path === '/attendance/details') {
    require_method('GET');
    require_auth();
    $user = current_user();
    $entryDate = $_GET['entry_date'] ?? '';
    $serviceDay = $_GET['service_day'] ?? '';
    $centreName = trim($_GET['fellowship_centre'] ?? '');
    $state = trim($_GET['state'] ?? '');
    $region = trim($_GET['region'] ?? '');

    if ($entryDate === '' || $serviceDay === '') {
        json_error('entry_date and service_day are required', 422);
    }

    $centreId = null;
    if ($user['role'] === 'associate_cord') {
        if (empty($user['fellowship_centre_id'])) {
            json_error('No fellowship centre assigned to this user', 403);
        }
        $centreId = (int) $user['fellowship_centre_id'];
    } else {
        if ($centreName === '' || $state === '' || $region === '') {
            json_error('fellowship_centre, state, and region are required', 422);
        }
        if ($user['role'] === 'region_cord' && $user['region']) {
            $region = $user['region'];
        }
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
        $stmt->execute();
        $centreRow = db_fetch_all($stmt);
        if ($centreRow) {
            $centreId = (int) $centreRow[0]['id'];
        }
    }

    if (empty($centreId)) {
        json_error('Fellowship centre not found', 404);
    }

    $stmt = db_prepare(
        $db,
        'SELECT ae.id, ae.entry_date, ae.service_day, fc.name AS fellowship_centre, fc.state, fc.region
         FROM attendance_entries ae
         JOIN fellowship_centres fc ON fc.id = ae.fellowship_centre_id
         WHERE ae.fellowship_centre_id = ? AND ae.service_day = ? AND ae.entry_date = ? LIMIT 1',
        'iss',
        [$centreId, $serviceDay, $entryDate]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Attendance entry not found', 404);
    }
    $entry = $rows[0];

    $stmt = db_prepare(
        $db,
        'SELECT category, gender, count FROM attendance_counts WHERE attendance_entry_id = ?',
        'i',
        [(int) $entry['id']]
    );
    $stmt->execute();
    $countRows = db_fetch_all($stmt);
    $counts = [
        'adult' => ['male' => 0, 'female' => 0],
        'youth' => ['male' => 0, 'female' => 0],
        'children' => ['male' => 0, 'female' => 0],
    ];
    foreach ($countRows as $row) {
        $category = $row['category'];
        $gender = $row['gender'];
        if (isset($counts[$category][$gender])) {
            $counts[$category][$gender] = (int) $row['count'];
        }
    }

    json_ok([
        'id' => (int) $entry['id'],
        'entry_date' => $entry['entry_date'],
        'service_day' => $entry['service_day'],
        'fellowship_centre' => $entry['fellowship_centre'],
        'state' => $entry['state'],
        'region' => $entry['region'],
        'counts' => $counts,
    ]);
}

if ($path === '/attendance') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_auth();
        $user = current_user();
        $filters = [
            'start' => $_GET['start'] ?? null,
            'end' => $_GET['end'] ?? null,
            'state' => $_GET['state'] ?? null,
            'region' => $_GET['region'] ?? null,
            'service_day' => $_GET['service_day'] ?? null,
        ];

        $sql = 'SELECT ae.id, ae.entry_date, ae.service_day, fc.name AS fellowship_centre, fc.state, fc.region
                FROM attendance_entries ae
                JOIN fellowship_centres fc ON fc.id = ae.fellowship_centre_id
                WHERE 1=1';
        $types = '';
        $params = [];
        if ($filters['start']) {
            $sql .= ' AND ae.entry_date >= ?';
            $types .= 's';
            $params[] = $filters['start'];
        }
        if ($filters['end']) {
            $sql .= ' AND ae.entry_date <= ?';
            $types .= 's';
            $params[] = $filters['end'];
        }
        if ($user['role'] === 'region_cord' && $user['region']) {
            $filters['region'] = $user['region'];
        }
        if ($user['role'] === 'state_cord' && $user['state']) {
            $filters['state'] = $user['state'];
        }
        if ($filters['state']) {
            $sql .= ' AND fc.state = ?';
            $types .= 's';
            $params[] = $filters['state'];
        }
        if ($filters['region']) {
            $sql .= ' AND fc.region = ?';
            $types .= 's';
            $params[] = $filters['region'];
        }
        if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
            $sql .= ' AND fc.id = ?';
            $types .= 'i';
            $params[] = (int) $user['fellowship_centre_id'];
        }
        if ($filters['service_day']) {
            $sql .= ' AND ae.service_day = ?';
            $types .= 's';
            $params[] = $filters['service_day'];
        }
        $sql .= ' ORDER BY ae.entry_date DESC';

        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_auth();
        require_csrf();
        $user = current_user();
        $payload = read_json();
        $user = current_user();

        $entryDate = $payload['entry_date'] ?? '';
        $serviceDay = $payload['service_day'] ?? '';
        $centreName = trim($payload['fellowship_centre'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $counts = $payload['counts'] ?? [];

        if ($entryDate === '' || $serviceDay === '' || $centreName === '' || $state === '' || $region === '') {
            json_error('Missing required fields', 422);
        }

        $db->begin_transaction();
        try {
            if ($user['role'] === 'associate_cord') {
                if (empty($user['fellowship_centre_id'])) {
                    json_error('No fellowship centre assigned to this user', 403);
                }
                $stmt = db_prepare($db, 'SELECT id, name, state, region FROM fellowship_centres WHERE id = ? LIMIT 1', 'i', [(int) $user['fellowship_centre_id']]);
                $stmt->execute();
                $centreRow = db_fetch_all($stmt);
                if (!$centreRow) {
                    json_error('Assigned fellowship centre not found', 403);
                }
                $centre = $centreRow[0];
                $centreId = (int) $centre['id'];
                $centreName = $centre['name'];
                $state = $centre['state'];
                $region = $centre['region'];
            } else {
                if ($user['role'] === 'region_cord' && $user['region']) {
                    $region = $user['region'];
                }
                if ($user['role'] === 'state_cord' && $user['state']) {
                    $state = $user['state'];
                }
            }

            if (empty($centreId)) {
                $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
                $stmt->execute();
                $centreRow = db_fetch_all($stmt);
                if ($centreRow) {
                    $centreId = (int) $centreRow[0]['id'];
                } else {
                    $stmt = db_prepare($db, 'INSERT INTO fellowship_centres (name, state, region, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'sss', [$centreName, $state, $region]);
                    $stmt->execute();
                    $centreId = $db->insert_id;
                }
            }

            $stmt = db_prepare(
                $db,
                'SELECT id FROM attendance_entries WHERE fellowship_centre_id = ? AND service_day = ? AND entry_date = ? LIMIT 1',
                'iss',
                [$centreId, $serviceDay, $entryDate]
            );
            $stmt->execute();
            $existing = db_fetch_all($stmt);
            if ($existing) {
                $db->rollback();
                json_error('Attendance already submitted for this date and service', 409);
            }

            $stmt = db_prepare($db, 'INSERT INTO attendance_entries (fellowship_centre_id, service_day, entry_date, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', 'issi', [
                $centreId,
                $serviceDay,
                $entryDate,
                current_user()['id'],
            ]);
            $stmt->execute();
            $entryId = $db->insert_id;

            $allowedCategories = ['adult', 'youth', 'children'];
            $allowedGenders = ['male', 'female'];
            foreach ($allowedCategories as $category) {
                foreach ($allowedGenders as $gender) {
                    $value = (int) ($counts[$category][$gender] ?? 0);
                    $stmt = db_prepare($db, 'INSERT INTO attendance_counts (attendance_entry_id, category, gender, count) VALUES (?, ?, ?, ?)', 'issi', [
                        $entryId,
                        $category,
                        $gender,
                        $value,
                    ]);
                    $stmt->execute();
                }
            }

            $db->commit();
            json_ok(['id' => $entryId], 201);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('Attendance insert failed: ' . $e->getMessage(), $config['log_path']);
            json_error('Failed to save attendance', 500);
        }
    }
}

if (preg_match('#^/attendance/(\\d+)$#', $path, $matches)) {
    require_method('PUT');
    require_auth();
    require_csrf();
    $user = current_user();
    $id = (int) $matches[1];
    $payload = read_json();
    $counts = $payload['counts'] ?? [];

    $stmt = db_prepare(
        $db,
        'SELECT ae.id, fc.id AS fellowship_centre_id, fc.state, fc.region
         FROM attendance_entries ae
         JOIN fellowship_centres fc ON fc.id = ae.fellowship_centre_id
         WHERE ae.id = ? LIMIT 1',
        'i',
        [$id]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Attendance entry not found', 404);
    }
    $entry = $rows[0];

    if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
        if ((int) $user['fellowship_centre_id'] !== (int) $entry['fellowship_centre_id']) {
            json_error('Forbidden', 403);
        }
    } elseif ($user['role'] === 'region_cord' && $user['region']) {
        if ($user['region'] !== $entry['region']) {
            json_error('Forbidden', 403);
        }
    } elseif ($user['role'] === 'state_cord' && $user['state']) {
        if ($user['state'] !== $entry['state']) {
            json_error('Forbidden', 403);
        }
    }

    $db->begin_transaction();
    try {
        $stmt = db_prepare($db, 'DELETE FROM attendance_counts WHERE attendance_entry_id = ?', 'i', [$id]);
        $stmt->execute();

        $allowedCategories = ['adult', 'youth', 'children'];
        $allowedGenders = ['male', 'female'];
        foreach ($allowedCategories as $category) {
            foreach ($allowedGenders as $gender) {
                $value = (int) ($counts[$category][$gender] ?? 0);
                $stmt = db_prepare($db, 'INSERT INTO attendance_counts (attendance_entry_id, category, gender, count) VALUES (?, ?, ?, ?)', 'issi', [
                    $id,
                    $category,
                    $gender,
                    $value,
                ]);
                $stmt->execute();
            }
        }

        $stmt = db_prepare($db, 'UPDATE attendance_entries SET updated_at = NOW() WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        $db->commit();
        json_ok(['message' => 'Attendance updated']);
    } catch (Throwable $e) {
        $db->rollback();
        log_error('Attendance update failed: ' . $e->getMessage(), $config['log_path']);
        json_error('Failed to update attendance', 500);
    }
}

if ($path === '/stmc-registrations') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_auth();
        require_csrf();
        $user = current_user();
        $payload = read_json();
        $user = current_user();

        $level = trim($payload['level'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $matric = trim($payload['matric_number'] ?? '');
        $institution = trim($payload['institution_name'] ?? '');
        $payment = $payload['payment_amount'] ?? '';
        $gender = trim($payload['gender'] ?? '');

        if (!in_array($level, ['100', '200', '300'], true)) {
            json_error('Invalid level', 422);
        }
        if ($state === '' || $region === '' || $institution === '' || $gender === '') {
            json_error('State, region, institution, and gender are required', 422);
        }
        if (($level === '200' || $level === '300') && $matric === '') {
            json_error('Matric number is required for 200 and 300 level', 422);
        }
        if ($level === '100') {
            $matric = '';
        }
        if (!is_numeric($payment) || (float) $payment < 0) {
            json_error('Payment amount must be a valid number', 422);
        }

        $stmt = db_prepare(
            $db,
            'INSERT INTO stmc_registrations (level, state, region, matric_number, institution_name, payment_amount, gender, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            'sssssdsi',
            [$level, $state, $region, $matric, $institution, (float) $payment, $gender, $user['id']]
        );
        $stmt->execute();
        json_ok(['message' => 'STMC registration submitted'], 201);
    }
}

if ($path === '/stmc-reports') {
    require_method('GET');
    require_auth();
    $start = $_GET['start'] ?? null;
    $end = $_GET['end'] ?? null;
    $state = $_GET['state'] ?? null;

    $sql = 'SELECT state, level, gender, COUNT(*) AS total
            FROM stmc_registrations
            WHERE 1=1';
    $types = '';
    $params = [];
    if ($start) {
        $sql .= ' AND DATE(created_at) >= ?';
        $types .= 's';
        $params[] = $start;
    }
    if ($end) {
        $sql .= ' AND DATE(created_at) <= ?';
        $types .= 's';
        $params[] = $end;
    }
    if ($state) {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY state, level, gender ORDER BY state';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows]);
}

if ($path === '/gck') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_auth();
        require_csrf();
        $payload = read_json();
        $user = current_user();

        $reportMonth = trim($payload['report_month'] ?? '');
        $centreName = trim($payload['fellowship_centre'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $sessions = $payload['sessions'] ?? [];

        if ($reportMonth === '' || !is_array($sessions) || empty($sessions)) {
            json_error('Report month and sessions are required', 422);
        }
        $sessionDates = [];
        $reportMonthDate = DateTime::createFromFormat('Y-m-d', $reportMonth . '-01');
        if (!$reportMonthDate) {
            json_error('Invalid report month', 422);
        }
        $nextMonthKey = (clone $reportMonthDate)->modify('first day of next month')->format('Y-m');
        foreach ($sessions as $session) {
            $date = trim($session['date'] ?? '');
            $period = trim($session['period'] ?? '');
            if ($date === '') {
                continue;
            }
            $sessionDate = DateTime::createFromFormat('Y-m-d', $date);
            if (!$sessionDate) {
                json_error('Invalid session date', 422);
            }
            $sessionMonth = substr($date, 0, 7);
            $sessionDay = (int) substr($date, 8, 2);
            if (
                $sessionMonth !== $reportMonth &&
                !($sessionMonth === $nextMonthKey && $sessionDay <= GCK_OVERFLOW_DAYS)
            ) {
                json_error('Session dates must be within the report month or the first week of the next month', 422);
            }
            $dateKey = $date . '|' . strtolower($period ?: 'none');
            if (isset($sessionDates[$dateKey])) {
                json_error('Duplicate session date and period are not allowed', 422);
            }
            $sessionDates[$dateKey] = true;
        }

        $centreId = null;
        if ($user['role'] === 'associate_cord') {
            if (empty($user['fellowship_centre_id'])) {
                json_error('No fellowship centre assigned to this user', 403);
            }
            $stmt = db_prepare($db, 'SELECT id, name, state, region FROM fellowship_centres WHERE id = ? LIMIT 1', 'i', [(int) $user['fellowship_centre_id']]);
            $stmt->execute();
            $centreRow = db_fetch_all($stmt);
            if (!$centreRow) {
                json_error('Assigned fellowship centre not found', 403);
            }
            $centre = $centreRow[0];
            $centreId = (int) $centre['id'];
            $centreName = $centre['name'];
            $state = $centre['state'];
            $region = $centre['region'];
        } else {
            if ($user['role'] === 'region_cord' && $user['region']) {
                $region = $user['region'];
            }
            if ($user['role'] === 'state_cord' && $user['state']) {
                $state = $user['state'];
            }
        }

        if ($centreName === '' || $state === '' || $region === '') {
            json_error('Fellowship centre, state, and region are required', 422);
        }

        if (empty($centreId)) {
            $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
            $stmt->execute();
            $centreRow = db_fetch_all($stmt);
            if ($centreRow) {
                $centreId = (int) $centreRow[0]['id'];
            } else {
                $stmt = db_prepare($db, 'INSERT INTO fellowship_centres (name, state, region, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'sss', [$centreName, $state, $region]);
                $stmt->execute();
                $centreId = $db->insert_id;
            }
        }

        $stmt = db_prepare($db, 'SELECT id FROM gck_reports WHERE fellowship_centre_id = ? AND report_month = ? LIMIT 1', 'is', [$centreId, $reportMonth]);
        $stmt->execute();
        $existing = db_fetch_all($stmt);
        if ($existing) {
            json_error('GCK report already submitted for this month', 409);
        }

        $allowedCategories = ['adult', 'youth', 'children'];
        $allowedGenders = ['male', 'female'];

        $db->begin_transaction();
        try {
            $stmt = db_prepare($db, 'INSERT INTO gck_reports (fellowship_centre_id, report_month, created_by, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'isi', [
                $centreId,
                $reportMonth,
                $user['id'],
            ]);
            $stmt->execute();
            $reportId = $db->insert_id;

            foreach ($sessions as $session) {
                $label = trim($session['label'] ?? '');
                $period = trim($session['period'] ?? '');
                $date = trim($session['date'] ?? '');
                $counts = $session['counts'] ?? [];
                if ($label === '' || $date === '') {
                    continue;
                }
                $labelForSave = $label;
                if ($period !== '') {
                    $labelForSave = $label . ' - ' . $period;
                }

                $stmt = db_prepare($db, 'INSERT INTO gck_sessions (report_id, session_label, session_date, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'iss', [
                    $reportId,
                    $labelForSave,
                    $date,
                ]);
                $stmt->execute();
                $sessionId = $db->insert_id;

                foreach ($allowedCategories as $category) {
                    foreach ($allowedGenders as $gender) {
                        $value = (int) ($counts[$category][$gender] ?? 0);
                        $stmt = db_prepare($db, 'INSERT INTO gck_counts (session_id, category, gender, count) VALUES (?, ?, ?, ?)', 'issi', [
                            $sessionId,
                            $category,
                            $gender,
                            $value,
                        ]);
                        $stmt->execute();
                    }
                }
            }

            $db->commit();
            json_ok(['id' => $reportId], 201);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('GCK report insert failed: ' . $e->getMessage(), $config['log_path']);
            json_error('Failed to save GCK report', 500);
        }
    }
}

if ($path === '/gck/details') {
    require_method('GET');
    require_auth();
    $user = current_user();

    $reportMonth = trim($_GET['report_month'] ?? '');
    $centreName = trim($_GET['fellowship_centre'] ?? '');
    $state = trim($_GET['state'] ?? '');
    $region = trim($_GET['region'] ?? '');

    if ($reportMonth === '') {
        json_error('report_month is required', 422);
    }

    $centreId = null;
    if ($user['role'] === 'associate_cord') {
        if (empty($user['fellowship_centre_id'])) {
            json_error('No fellowship centre assigned to this user', 403);
        }
        $centreId = (int) $user['fellowship_centre_id'];
    } else {
        if ($centreName === '' || $state === '' || $region === '') {
            json_error('fellowship_centre, state, and region are required', 422);
        }
        if ($user['role'] === 'region_cord' && $user['region']) {
            $region = $user['region'];
        }
        if ($user['role'] === 'state_cord' && $user['state']) {
            $state = $user['state'];
        }
        $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
        $stmt->execute();
        $centreRow = db_fetch_all($stmt);
        if ($centreRow) {
            $centreId = (int) $centreRow[0]['id'];
        }
    }

    if (empty($centreId)) {
        json_error('Fellowship centre not found', 404);
    }

    $stmt = db_prepare(
        $db,
        'SELECT gr.id, gr.report_month, fc.name AS fellowship_centre, fc.state, fc.region
         FROM gck_reports gr
         JOIN fellowship_centres fc ON fc.id = gr.fellowship_centre_id
         WHERE gr.fellowship_centre_id = ? AND gr.report_month = ? LIMIT 1',
        'is',
        [$centreId, $reportMonth]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('GCK report not found', 404);
    }
    $report = $rows[0];

    $stmt = db_prepare(
        $db,
        'SELECT gs.id AS session_id, gs.session_label, gs.session_date, gc.category, gc.gender, gc.count
         FROM gck_sessions gs
         LEFT JOIN gck_counts gc ON gc.session_id = gs.id
         WHERE gs.report_id = ?',
        'i',
        [(int) $report['id']]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);

    $sessions = [];
    foreach ($rows as $row) {
        $sessionId = (int) $row['session_id'];
        $label = $row['session_label'];
        $period = '';
        if (preg_match('/\\s-\\s(Morning|Evening)$/i', $label, $matches)) {
            $period = ucfirst(strtolower($matches[1]));
            $label = trim(substr($label, 0, -strlen($matches[0])));
        }
        if (!isset($sessions[$sessionId])) {
            $sessions[$sessionId] = [
                'label' => $label,
                'period' => $period,
                'date' => $row['session_date'],
                'counts' => [
                    'adult' => ['male' => 0, 'female' => 0],
                    'youth' => ['male' => 0, 'female' => 0],
                    'children' => ['male' => 0, 'female' => 0],
                ],
            ];
        }
        if ($row['category'] && $row['gender']) {
            $sessions[$sessionId]['counts'][$row['category']][$row['gender']] = (int) $row['count'];
        }
    }

    json_ok([
        'id' => (int) $report['id'],
        'report_month' => $report['report_month'],
        'fellowship_centre' => $report['fellowship_centre'],
        'state' => $report['state'],
        'region' => $report['region'],
        'sessions' => array_values($sessions),
    ]);
}

if (preg_match('#^/gck/(\\d+)$#', $path, $matches)) {
    require_method('PUT');
    require_auth();
    require_csrf();
    $user = current_user();
    $id = (int) $matches[1];
    $payload = read_json();
    $sessions = $payload['sessions'] ?? [];
    if (!is_array($sessions)) {
        json_error('Sessions are required', 422);
    }
    $sessionDates = [];
    $stmt = db_prepare($db, 'SELECT report_month FROM gck_reports WHERE id = ? LIMIT 1', 'i', [$id]);
    $stmt->execute();
    $reportRows = db_fetch_all($stmt);
    if (!$reportRows) {
        json_error('GCK report not found', 404);
    }
    $reportMonth = $reportRows[0]['report_month'];
    $reportMonthDate = DateTime::createFromFormat('Y-m-d', $reportMonth . '-01');
    if (!$reportMonthDate) {
        json_error('Invalid report month', 422);
    }
    $nextMonthKey = (clone $reportMonthDate)->modify('first day of next month')->format('Y-m');
    foreach ($sessions as $session) {
        $date = trim($session['date'] ?? '');
        $period = trim($session['period'] ?? '');
        if ($date === '') {
            continue;
        }
        $sessionDate = DateTime::createFromFormat('Y-m-d', $date);
        if (!$sessionDate) {
            json_error('Invalid session date', 422);
        }
        $sessionMonth = substr($date, 0, 7);
        $sessionDay = (int) substr($date, 8, 2);
        if (
            $sessionMonth !== $reportMonth &&
            !($sessionMonth === $nextMonthKey && $sessionDay <= GCK_OVERFLOW_DAYS)
        ) {
            json_error('Session dates must be within the report month or the first week of the next month', 422);
        }
        $dateKey = $date . '|' . strtolower($period ?: 'none');
        if (isset($sessionDates[$dateKey])) {
            json_error('Duplicate session date and period are not allowed', 422);
        }
        $sessionDates[$dateKey] = true;
    }

    $stmt = db_prepare(
        $db,
        'SELECT gr.id, fc.id AS fellowship_centre_id, fc.state, fc.region
         FROM gck_reports gr
         JOIN fellowship_centres fc ON fc.id = gr.fellowship_centre_id
         WHERE gr.id = ? LIMIT 1',
        'i',
        [$id]
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('GCK report not found', 404);
    }
    $report = $rows[0];

    if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
        if ((int) $user['fellowship_centre_id'] !== (int) $report['fellowship_centre_id']) {
            json_error('Forbidden', 403);
        }
    } elseif ($user['role'] === 'region_cord' && $user['region']) {
        if ($user['region'] !== $report['region']) {
            json_error('Forbidden', 403);
        }
    } elseif ($user['role'] === 'state_cord' && $user['state']) {
        if ($user['state'] !== $report['state']) {
            json_error('Forbidden', 403);
        }
    }

    $allowedCategories = ['adult', 'youth', 'children'];
    $allowedGenders = ['male', 'female'];

    $db->begin_transaction();
    try {
        $stmt = db_prepare($db, 'DELETE FROM gck_counts WHERE session_id IN (SELECT id FROM gck_sessions WHERE report_id = ?)', 'i', [$id]);
        $stmt->execute();
        $stmt = db_prepare($db, 'DELETE FROM gck_sessions WHERE report_id = ?', 'i', [$id]);
        $stmt->execute();

            foreach ($sessions as $session) {
                $label = trim($session['label'] ?? '');
                $period = trim($session['period'] ?? '');
                $date = trim($session['date'] ?? '');
                $counts = $session['counts'] ?? [];
                if ($label === '' || $date === '') {
                    continue;
                }
                $labelForSave = $label;
                if ($period !== '') {
                    $labelForSave = $label . ' - ' . $period;
                }
                $stmt = db_prepare($db, 'INSERT INTO gck_sessions (report_id, session_label, session_date, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'iss', [
                    $id,
                    $labelForSave,
                    $date,
                ]);
            $stmt->execute();
            $sessionId = $db->insert_id;

            foreach ($allowedCategories as $category) {
                foreach ($allowedGenders as $gender) {
                    $value = (int) ($counts[$category][$gender] ?? 0);
                    $stmt = db_prepare($db, 'INSERT INTO gck_counts (session_id, category, gender, count) VALUES (?, ?, ?, ?)', 'issi', [
                        $sessionId,
                        $category,
                        $gender,
                        $value,
                    ]);
                    $stmt->execute();
                }
            }
        }

        $stmt = db_prepare($db, 'UPDATE gck_reports SET updated_at = NOW() WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        $db->commit();
        json_ok(['message' => 'GCK report updated']);
    } catch (Throwable $e) {
        $db->rollback();
        log_error('GCK report update failed: ' . $e->getMessage(), $config['log_path']);
        json_error('Failed to update GCK report', 500);
    }
}

if ($path === '/gck/summary') {
    require_method('GET');
    require_auth();
    $user = current_user();
    $reportMonth = $_GET['report_month'] ?? null;
    $state = $_GET['state'] ?? null;
    $region = $_GET['region'] ?? null;

    if ($user['role'] === 'region_cord' && $user['region']) {
        $region = $user['region'];
    }
    if ($user['role'] === 'state_cord' && $user['state']) {
        $state = $user['state'];
    }

    $sql = 'SELECT fc.name AS fellowship_centre, fc.state, fc.region,
                   gr.report_month, gs.session_label, gs.session_date,
                   gc.category, gc.gender, SUM(gc.count) AS total
            FROM gck_reports gr
            JOIN fellowship_centres fc ON fc.id = gr.fellowship_centre_id
            JOIN gck_sessions gs ON gs.report_id = gr.id
            JOIN gck_counts gc ON gc.session_id = gs.id
            WHERE 1=1';
    $types = '';
    $params = [];
    if ($reportMonth) {
        $sql .= ' AND gr.report_month = ?';
        $types .= 's';
        $params[] = $reportMonth;
    }
    if ($state) {
        $sql .= ' AND fc.state = ?';
        $types .= 's';
        $params[] = $state;
    }
    if ($region) {
        $sql .= ' AND fc.region = ?';
        $types .= 's';
        $params[] = $region;
    }
    if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
        $sql .= ' AND fc.id = ?';
        $types .= 'i';
        $params[] = (int) $user['fellowship_centre_id'];
    }
    $sql .= ' GROUP BY fc.name, fc.state, fc.region, gr.report_month, gs.session_label, gs.session_date, gc.category, gc.gender
              ORDER BY fc.name, gs.session_date';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $coordinator = '';
    if ($state) {
        $stmt = db_prepare($db, 'SELECT name FROM users WHERE role = ? AND state = ? ORDER BY id DESC LIMIT 1', 'ss', ['state_cord', $state]);
        $stmt->execute();
        $coordRows = db_fetch_all($stmt);
        if ($coordRows) {
            $coordinator = $coordRows[0]['name'];
        }
    }
    json_ok([
        'items' => $rows,
        'meta' => [
            'group_name' => 'DLCF',
            'coordinator_name' => $coordinator,
            'report_month' => $reportMonth,
            'state' => $state,
        ],
    ]);
}

if ($path === '/reports/summary') {
    require_method('GET');
    require_auth();
    $user = current_user();
    $start = $_GET['start'] ?? null;
    $end = $_GET['end'] ?? null;
    $state = $_GET['state'] ?? null;
    $region = $_GET['region'] ?? null;

    if ($user['role'] === 'region_cord' && $user['region']) {
        $region = $user['region'];
    }
    if ($user['role'] === 'state_cord' && $user['state']) {
        $state = $user['state'];
    }

    $sql = 'SELECT fc.name AS fellowship_centre, fc.state, fc.region,
                   ae.service_day, ac.category, ac.gender, SUM(ac.count) AS total
            FROM attendance_entries ae
            JOIN fellowship_centres fc ON fc.id = ae.fellowship_centre_id
            JOIN attendance_counts ac ON ac.attendance_entry_id = ae.id
            WHERE 1=1';
    $types = '';
    $params = [];
    if ($start) {
        $sql .= ' AND ae.entry_date >= ?';
        $types .= 's';
        $params[] = $start;
    }
    if ($end) {
        $sql .= ' AND ae.entry_date <= ?';
        $types .= 's';
        $params[] = $end;
    }
    if ($state) {
        $sql .= ' AND fc.state = ?';
        $types .= 's';
        $params[] = $state;
    }
    if ($region) {
        $sql .= ' AND fc.region = ?';
        $types .= 's';
        $params[] = $region;
    }
    if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
        $sql .= ' AND fc.id = ?';
        $types .= 'i';
        $params[] = (int) $user['fellowship_centre_id'];
    }
    $sql .= ' GROUP BY fc.name, fc.state, fc.region, ae.service_day, ac.category, ac.gender ORDER BY fc.name';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows]);
}

if ($path === '/biodata/lookup') {
    require_method('GET');
    require_auth();
    $search = trim($_GET['search'] ?? '');
    if ($search === '') {
        json_ok(['items' => []]);
    }
    $like = '%' . $search . '%';
    $sql = 'SELECT b.id, b.full_name, b.gender, b.phone, b.email, b.worker_status,
                   b.cluster, fc.name AS fellowship_centre, b.state, b.region
            FROM biodata b
            JOIN fellowship_centres fc ON fc.id = b.fellowship_centre_id
            WHERE b.full_name LIKE ? OR b.phone LIKE ? OR b.email LIKE ?
            ORDER BY b.full_name LIMIT 10';
    $stmt = db_prepare($db, $sql, 'sss', [$like, $like, $like]);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(function ($row) {
        return [
            'id' => $row['id'],
            'full_name' => $row['full_name'],
            'gender' => $row['gender'],
            'phone' => $row['phone'],
            'email' => $row['email'],
            'state' => $row['state'],
            'region' => $row['region'],
            'fellowship_centre' => $row['fellowship_centre'],
            'category' => $row['worker_status'] ?? '',
            'cluster' => $row['cluster'] ?? '',
        ];
    }, $rows);
    json_ok(['items' => $items]);
}

if ($path === '/biodata/me') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_auth();
        $user = current_user();
        if (empty($user['email'])) {
            json_error('User email not found', 400);
        }
        $sql = 'SELECT b.id, b.full_name, b.gender, b.age, b.phone, b.email, b.profile_photo, b.school, b.category,
                       b.worker_status, b.membership_status, b.work_units, b.address, b.next_of_kin_name, b.next_of_kin_phone,
                       b.next_of_kin_relationship, b.state, b.region, b.cluster, fc.name AS fellowship_centre, b.created_at
                FROM biodata b
                JOIN fellowship_centres fc ON fc.id = b.fellowship_centre_id
                WHERE b.user_id = ? LIMIT 1';
        $stmt = db_prepare($db, $sql, 'i', [$user['id']]);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            $fallbackSql = str_replace('b.user_id = ?', 'b.email = ?', $sql);
            $stmt = db_prepare($db, $fallbackSql, 's', [$user['email']]);
            $stmt->execute();
            $rows = db_fetch_all($stmt);
            if ($rows) {
                $update = db_prepare($db, 'UPDATE biodata SET user_id = ?, updated_at = NOW() WHERE id = ?', 'ii', [
                    $user['id'],
                    $rows[0]['id'],
                ]);
                $update->execute();
            }
        }
        if (!$rows) {
            json_error('Not found', 404);
        }
        $rows[0]['work_units'] = json_decode($rows[0]['work_units'], true) ?: [];
        json_ok(['item' => $rows[0]]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        require_auth();
        require_csrf();
        $user = current_user();
        $payload = read_json();

        $fullName = trim($payload['full_name'] ?? '');
        $gender = $payload['gender'] ?? '';
        $age = (int) ($payload['age'] ?? 0);
        $phone = trim($payload['phone'] ?? '');
        $email = trim($payload['email'] ?? '');
        $profilePhoto = trim($payload['profile_photo'] ?? '');
        $school = trim($payload['school'] ?? '');
        $category = trim($payload['category'] ?? '');
        $workerStatus = trim($payload['worker_status'] ?? '');
        $membershipStatus = trim($payload['membership_status'] ?? '');
        $workUnits = $payload['work_units'] ?? [];
        $address = trim($payload['address'] ?? '');
        $nextOfKinName = trim($payload['next_of_kin_name'] ?? '');
        $nextOfKinPhone = trim($payload['next_of_kin_phone'] ?? '');
        $nextOfKinRelationship = trim($payload['next_of_kin_relationship'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $cluster = trim($payload['cluster'] ?? '');
        $centreName = trim($payload['fellowship_centre'] ?? '');

        if ($user['email'] && strcasecmp($email, $user['email']) !== 0) {
            json_error('Email must match your account email', 422);
        }
        if ($profilePhoto !== '') {
            if (strncmp($profilePhoto, 'data:image/', 11) !== 0) {
                json_error('Invalid profile photo format', 422);
            }
            if (strlen($profilePhoto) > 2000000) {
                json_error('Profile photo must be 2MB or smaller', 422);
            }
        }

        if (
            $fullName === '' || $gender === '' || $age <= 0 || $phone === '' || $email === '' ||
            $school === '' || $category === '' || $workerStatus === '' || $membershipStatus === '' ||
            !is_array($workUnits) || count($workUnits) === 0 ||
            $address === '' || $nextOfKinName === '' || $nextOfKinPhone === '' || $nextOfKinRelationship === '' ||
            $state === '' || $region === '' || $centreName === ''
        ) {
            json_error('Missing required fields', 422);
        }

        $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
        $stmt->execute();
        $centreRow = db_fetch_all($stmt);
        if ($centreRow) {
            $centreId = (int) $centreRow[0]['id'];
        } else {
            $stmt = db_prepare($db, 'INSERT INTO fellowship_centres (name, state, region, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'sss', [$centreName, $state, $region]);
            $stmt->execute();
            $centreId = $db->insert_id;
        }

        $cluster = $cluster === '' ? null : $cluster;

        $stmt = db_prepare($db, 'SELECT id FROM biodata WHERE user_id = ? LIMIT 1', 'i', [$user['id']]);
        $stmt->execute();
        $existing = db_fetch_all($stmt);
        if ($existing) {
            $sql = 'UPDATE biodata SET fellowship_centre_id = ?, full_name = ?, gender = ?, age = ?, phone = ?, email = ?, state = ?, region = ?, cluster = ?, profile_photo = ?,
                           school = ?, category = ?, worker_status = ?, membership_status = ?, work_units = ?, address = ?,
                           next_of_kin_name = ?, next_of_kin_phone = ?, next_of_kin_relationship = ?, updated_at = NOW()
                    WHERE id = ?';
            $stmt = db_prepare($db, $sql, 'ississsssssssssssssi', [
                $centreId,
                $fullName,
                $gender,
                $age,
                $phone,
                $email,
                $state,
                $region,
                $cluster,
                $profilePhoto,
                $school,
                $category,
                $workerStatus,
                $membershipStatus,
                json_encode(array_values($workUnits)),
                $address,
                $nextOfKinName,
                $nextOfKinPhone,
                $nextOfKinRelationship,
                (int) $existing[0]['id'],
            ]);
            $stmt->execute();
            json_ok(['message' => 'Profile updated']);
        }

        $sql = 'INSERT INTO biodata
            (user_id, fellowship_centre_id, full_name, gender, age, phone, email, state, region, cluster, profile_photo, school, category, worker_status, membership_status, work_units, address,
             next_of_kin_name, next_of_kin_phone, next_of_kin_relationship, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        $stmt = db_prepare($db, $sql, 'iississssssssssssss', [
            $user['id'],
            $centreId,
            $fullName,
            $gender,
            $age,
            $phone,
            $email,
            $state,
            $region,
            $cluster,
            $profilePhoto,
            $school,
            $category,
            $workerStatus,
            $membershipStatus,
            json_encode(array_values($workUnits)),
            $address,
            $nextOfKinName,
            $nextOfKinPhone,
            $nextOfKinRelationship,
        ]);
        $stmt->execute();
        json_ok(['message' => 'Profile created'], 201);
    }
}

if ($path === '/retreat-registrations') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_csrf();
        $payload = read_json();

        $retreatType = $payload['retreat_type'] ?? '';
        $title = $payload['title'] ?? '';
        $fullName = trim($payload['full_name'] ?? '');
        $gender = $payload['gender'] ?? '';
        $email = trim($payload['email'] ?? '');
        $phone = trim($payload['phone'] ?? '');
        $category = $payload['category'] ?? '';
        $membershipStatus = $payload['membership_status'] ?? '';
        $cluster = $payload['cluster'] ?? '';
        $dlcfCenter = $payload['dlcf_center'] ?? '';
        $fellowshipCentre = trim($payload['fellowship_centre'] ?? '');
        $registrationDate = $payload['registration_date'] ?? '';
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');

        if ($dlcfCenter === '' && $fellowshipCentre !== '') {
            $dlcfCenter = $fellowshipCentre;
        }

        if (
            $retreatType === '' || $title === '' || $fullName === '' || $gender === '' ||
            $email === '' || $phone === '' || $category === '' || $membershipStatus === '' ||
            $dlcfCenter === '' || $registrationDate === '' || $state === '' || $region === ''
        ) {
            json_error('Missing required fields', 422);
        }

        $checkSql = 'SELECT COUNT(*) AS total FROM retreat_registrations
                     WHERE (email = ? OR phone = ?) AND retreat_type = ?
                     AND YEAR(registration_date) = YEAR(?) AND MONTH(registration_date) = MONTH(?)';
        $stmt = db_prepare($db, $checkSql, 'sssss', [$email, $phone, $retreatType, $registrationDate, $registrationDate]);
        $stmt->execute();
        $existing = db_fetch_all($stmt);
        if (!empty($existing) && (int) $existing[0]['total'] > 0) {
            json_error('You have already registered with this email or phone this month.', 409);
        }

        $insertSql = 'INSERT INTO retreat_registrations
            (retreat_type, title, full_name, gender, email, phone, category, membership_status, cluster, dlcf_center, registration_date, state, region, registration_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        $stmt = db_prepare($db, $insertSql, 'ssssssssssssss', [
            $retreatType,
            $title,
            $fullName,
            $gender,
            $email,
            $phone,
            $category,
            $membershipStatus,
            $cluster,
            $dlcfCenter,
            $registrationDate,
            $state,
            $region,
            'Pending',
        ]);
        $stmt->execute();
        json_ok(['message' => 'Registration successful'], 201);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_auth();
        $start = $_GET['start'] ?? null;
        $end = $_GET['end'] ?? null;
        $retreatType = $_GET['retreat_type'] ?? null;
        $cluster = $_GET['cluster'] ?? null;
        $dlcfCenter = $_GET['dlcf_center'] ?? null;
        $state = $_GET['state'] ?? null;
        $region = $_GET['region'] ?? null;

        $sql = 'SELECT id, retreat_type, full_name, gender, email, phone, category, membership_status,
                       cluster, dlcf_center, registration_date, registration_status, state, region,
                       dlcf_center AS fellowship_centre
                FROM retreat_registrations
                WHERE 1=1';
        $types = '';
        $params = [];
        if ($start) {
            $sql .= ' AND registration_date >= ?';
            $types .= 's';
            $params[] = $start;
        }
        if ($end) {
            $sql .= ' AND registration_date <= ?';
            $types .= 's';
            $params[] = $end;
        }
        if ($retreatType) {
            $sql .= ' AND retreat_type = ?';
            $types .= 's';
            $params[] = $retreatType;
        }
        if ($cluster) {
            $sql .= ' AND cluster = ?';
            $types .= 's';
            $params[] = $cluster;
        }
        if ($dlcfCenter) {
            $sql .= ' AND dlcf_center = ?';
            $types .= 's';
            $params[] = $dlcfCenter;
        }
        if ($state) {
            $sql .= ' AND state = ?';
            $types .= 's';
            $params[] = $state;
        }
        if ($region) {
            $sql .= ' AND region = ?';
            $types .= 's';
            $params[] = $region;
        }
        $sql .= ' ORDER BY registration_date DESC';

        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        json_ok(['items' => $rows]);
    }
}

if ($path === '/retreat-registrations/lookup') {
    require_method('GET');
    require_auth();
    $user = current_user();
    if (!user_has_work_unit($user, 'Registration Officers Committee') && !in_array($user['role'], ['administrator'], true)) {
        json_error('Forbidden', 403);
    }
    $retreatType = $_GET['retreat_type'] ?? '';
    $registrationMonth = $_GET['registration_month'] ?? '';
    $email = trim($_GET['email'] ?? '');
    $phone = trim($_GET['phone'] ?? '');
    if ($retreatType === '' || $registrationMonth === '' || ($email === '' && $phone === '')) {
        json_error('retreat_type, registration_month, and email or phone are required', 422);
    }
    $sql = 'SELECT id, retreat_type, title, full_name, gender, email, phone, category, membership_status,
                   cluster, dlcf_center, registration_date, registration_status, state, region, fellowship_centre
            FROM retreat_registrations
            WHERE retreat_type = ? AND DATE_FORMAT(registration_date, "%Y-%m") = ?';
    $types = 'ss';
    $params = [$retreatType, $registrationMonth];
    if ($email !== '') {
        $sql .= ' AND email = ?';
        $types .= 's';
        $params[] = $email;
    } else {
        $sql .= ' AND phone = ?';
        $types .= 's';
        $params[] = $phone;
    }
    $sql .= ' ORDER BY registration_date DESC LIMIT 1';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Registration not found', 404);
    }
    json_ok($rows[0]);
}

if (preg_match('#^/retreat-registrations/(\\d+)$#', $path, $matches)) {
    require_method('PUT');
    require_auth();
    require_csrf();
    $user = current_user();
    if (!user_has_work_unit($user, 'Registration Officers Committee') && !in_array($user['role'], ['administrator'], true)) {
        json_error('Forbidden', 403);
    }
    $id = (int) $matches[1];
    $payload = read_json();

    $retreatType = $payload['retreat_type'] ?? '';
    $title = $payload['title'] ?? '';
    $fullName = trim($payload['full_name'] ?? '');
    $gender = $payload['gender'] ?? '';
    $email = trim($payload['email'] ?? '');
    $phone = trim($payload['phone'] ?? '');
    $category = $payload['category'] ?? '';
    $membershipStatus = $payload['membership_status'] ?? '';
    $cluster = $payload['cluster'] ?? '';
    $dlcfCenter = $payload['dlcf_center'] ?? '';
    $registrationDate = $payload['registration_date'] ?? '';
    $state = trim($payload['state'] ?? '');
    $region = trim($payload['region'] ?? '');
    $fellowshipCentre = trim($payload['fellowship_centre'] ?? '');
    if ($dlcfCenter === '' && $fellowshipCentre !== '') {
        $dlcfCenter = $fellowshipCentre;
    }

    if (
        $retreatType === '' || $title === '' || $fullName === '' || $gender === '' ||
        $email === '' || $phone === '' || $category === '' || $membershipStatus === '' ||
        $dlcfCenter === '' || $registrationDate === '' || $state === '' || $region === ''
    ) {
        json_error('Missing required fields', 422);
    }

    $sql = 'UPDATE retreat_registrations
            SET retreat_type = ?, title = ?, full_name = ?, gender = ?, email = ?, phone = ?, category = ?,
                membership_status = ?, cluster = ?, dlcf_center = ?, registration_date = ?, state = ?, region = ?,
                updated_at = NOW()
            WHERE id = ?';
    $stmt = db_prepare($db, $sql, 'sssssssssssssi', [
        $retreatType,
        $title,
        $fullName,
        $gender,
        $email,
        $phone,
        $category,
        $membershipStatus,
        $cluster,
        $dlcfCenter,
        $registrationDate,
        $state,
        $region,
        $id,
    ]);
    $stmt->execute();
    json_ok(['message' => 'Registration updated']);
}

if ($path === '/state-congress-registrations') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_csrf();
        $payload = read_json();

        $title = $payload['title'] ?? '';
        $fullName = trim($payload['full_name'] ?? '');
        $gender = $payload['gender'] ?? '';
        $email = trim($payload['email'] ?? '');
        $phone = trim($payload['phone'] ?? '');
        $category = $payload['category'] ?? '';
        $membershipStatus = $payload['membership_status'] ?? '';
        $cluster = $payload['cluster'] ?? '';
        $registrationDate = $payload['registration_date'] ?? '';
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $fellowshipCentre = trim($payload['fellowship_centre'] ?? '');

        if (
            $title === '' || $fullName === '' || $gender === '' || $email === '' || $phone === '' ||
            $category === '' || $membershipStatus === '' || $registrationDate === '' ||
            $state === '' || $region === '' || $fellowshipCentre === ''
        ) {
            json_error('Missing required fields', 422);
        }

        $checkSql = 'SELECT COUNT(*) AS total FROM state_congress_registrations
                     WHERE (email = ? OR phone = ?) AND YEAR(registration_date) = YEAR(?) AND MONTH(registration_date) = MONTH(?)';
        $stmt = db_prepare($db, $checkSql, 'ssss', [$email, $phone, $registrationDate, $registrationDate]);
        $stmt->execute();
        $existing = db_fetch_all($stmt);
        if (!empty($existing) && (int) $existing[0]['total'] > 0) {
            json_error('You have already registered with this email or phone this month.', 409);
        }

        $insertSql = 'INSERT INTO state_congress_registrations
            (title, full_name, gender, email, phone, category, membership_status, cluster, registration_date, state, region, fellowship_centre, registration_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        $stmt = db_prepare($db, $insertSql, 'sssssssssssss', [
            $title,
            $fullName,
            $gender,
            $email,
            $phone,
            $category,
            $membershipStatus,
            $cluster,
            $registrationDate,
            $state,
            $region,
            $fellowshipCentre,
            'Pending',
        ]);
        $stmt->execute();
        json_ok(['message' => 'Registration successful'], 201);
    }
}

if ($path === '/state-congress-registrations/lookup') {
    require_method('GET');
    require_auth();
    $user = current_user();
    if (!user_has_work_unit($user, 'Registration Officers Committee') && !in_array($user['role'], ['administrator'], true)) {
        json_error('Forbidden', 403);
    }
    $registrationMonth = $_GET['registration_month'] ?? '';
    $email = trim($_GET['email'] ?? '');
    $phone = trim($_GET['phone'] ?? '');
    if ($registrationMonth === '' || ($email === '' && $phone === '')) {
        json_error('registration_month and email or phone are required', 422);
    }
    $sql = 'SELECT id, title, full_name, gender, email, phone, category, membership_status,
                   cluster, registration_date, registration_status, state, region, fellowship_centre
            FROM state_congress_registrations
            WHERE DATE_FORMAT(registration_date, "%Y-%m") = ?';
    $types = 's';
    $params = [$registrationMonth];
    if ($email !== '') {
        $sql .= ' AND email = ?';
        $types .= 's';
        $params[] = $email;
    } else {
        $sql .= ' AND phone = ?';
        $types .= 's';
        $params[] = $phone;
    }
    $sql .= ' ORDER BY registration_date DESC LIMIT 1';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Registration not found', 404);
    }
    json_ok($rows[0]);
}

if (preg_match('#^/state-congress-registrations/(\\d+)$#', $path, $matches)) {
    require_method('PUT');
    require_auth();
    require_csrf();
    $user = current_user();
    if (!user_has_work_unit($user, 'Registration Officers Committee') && !in_array($user['role'], ['administrator'], true)) {
        json_error('Forbidden', 403);
    }
    $id = (int) $matches[1];
    $payload = read_json();

    $title = $payload['title'] ?? '';
    $fullName = trim($payload['full_name'] ?? '');
    $gender = $payload['gender'] ?? '';
    $email = trim($payload['email'] ?? '');
    $phone = trim($payload['phone'] ?? '');
    $category = $payload['category'] ?? '';
    $membershipStatus = $payload['membership_status'] ?? '';
    $cluster = $payload['cluster'] ?? '';
    $registrationDate = $payload['registration_date'] ?? '';
    $state = trim($payload['state'] ?? '');
    $region = trim($payload['region'] ?? '');
    $fellowshipCentre = trim($payload['fellowship_centre'] ?? '');

    if (
        $title === '' || $fullName === '' || $gender === '' || $email === '' || $phone === '' ||
        $category === '' || $membershipStatus === '' || $registrationDate === '' ||
        $state === '' || $region === '' || $fellowshipCentre === ''
    ) {
        json_error('Missing required fields', 422);
    }

    $sql = 'UPDATE state_congress_registrations
            SET title = ?, full_name = ?, gender = ?, email = ?, phone = ?, category = ?,
                membership_status = ?, cluster = ?, registration_date = ?, state = ?, region = ?,
                fellowship_centre = ?, updated_at = NOW()
            WHERE id = ?';
    $stmt = db_prepare($db, $sql, 'ssssssssssssi', [
        $title,
        $fullName,
        $gender,
        $email,
        $phone,
        $category,
        $membershipStatus,
        $cluster,
        $registrationDate,
        $state,
        $region,
        $fellowshipCentre,
        $id,
    ]);
    $stmt->execute();
    json_ok(['message' => 'Registration updated']);
}

if ($path === '/state-congress-reports/regions-by-day') {
    require_method('GET');
    require_auth();
    $state = trim($_GET['state'] ?? '');

    $stmt = db_prepare(
        $db,
        'SELECT start_date, end_date FROM state_congress_settings ORDER BY id DESC LIMIT 1',
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows || !$rows[0]['start_date'] || !$rows[0]['end_date']) {
        json_error('State congress dates are not set', 422);
    }
    $startDate = $rows[0]['start_date'];
    $endDate = $rows[0]['end_date'];

    $sql = 'SELECT region, gender, DATE(registration_date) AS registration_date,
                   CONCAT("day", DATEDIFF(registration_date, ?) + 1) AS day_key,
                   COUNT(*) AS total
            FROM state_congress_registrations
            WHERE registration_date BETWEEN ? AND ?';
    $types = 'sss';
    $params = [$startDate, $startDate, $endDate];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY region, gender, registration_date
              ORDER BY region, registration_date';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows, 'meta' => ['start_date' => $startDate, 'end_date' => $endDate]]);
}

if ($path === '/state-congress-reports/categories-by-region') {
    require_method('GET');
    require_auth();
    $state = trim($_GET['state'] ?? '');

    $stmt = db_prepare(
        $db,
        'SELECT start_date, end_date FROM state_congress_settings ORDER BY id DESC LIMIT 1',
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows || !$rows[0]['start_date'] || !$rows[0]['end_date']) {
        json_error('State congress dates are not set', 422);
    }
    $startDate = $rows[0]['start_date'];
    $endDate = $rows[0]['end_date'];

    $sql = 'SELECT region, category, gender, COUNT(*) AS total
            FROM state_congress_registrations
            WHERE registration_date BETWEEN ? AND ?';
    $types = 'ss';
    $params = [$startDate, $endDate];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY region, category, gender
              ORDER BY region, category';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows, 'meta' => ['start_date' => $startDate, 'end_date' => $endDate]]);
}

if ($path === '/state-congress-reports/membership-by-region') {
    require_method('GET');
    require_auth();
    $state = trim($_GET['state'] ?? '');

    $stmt = db_prepare(
        $db,
        'SELECT start_date, end_date FROM state_congress_settings ORDER BY id DESC LIMIT 1',
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows || !$rows[0]['start_date'] || !$rows[0]['end_date']) {
        json_error('State congress dates are not set', 422);
    }
    $startDate = $rows[0]['start_date'];
    $endDate = $rows[0]['end_date'];

    $sql = 'SELECT region, membership_status, gender, COUNT(*) AS total
            FROM state_congress_registrations
            WHERE registration_date BETWEEN ? AND ?';
    $types = 'ss';
    $params = [$startDate, $endDate];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY region, membership_status, gender
              ORDER BY region, membership_status';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows, 'meta' => ['start_date' => $startDate, 'end_date' => $endDate]]);
}

if ($path === '/state-congress-reports/membership-by-institution') {
    require_method('GET');
    require_auth();
    $state = trim($_GET['state'] ?? '');

    $stmt = db_prepare(
        $db,
        'SELECT start_date, end_date FROM state_congress_settings ORDER BY id DESC LIMIT 1',
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows || !$rows[0]['start_date'] || !$rows[0]['end_date']) {
        json_error('State congress dates are not set', 422);
    }
    $startDate = $rows[0]['start_date'];
    $endDate = $rows[0]['end_date'];

    $sql = 'SELECT fellowship_centre, membership_status, gender, COUNT(*) AS total
            FROM state_congress_registrations
            WHERE registration_date BETWEEN ? AND ?';
    $types = 'ss';
    $params = [$startDate, $endDate];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY fellowship_centre, membership_status, gender
              ORDER BY fellowship_centre, membership_status';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows, 'meta' => ['start_date' => $startDate, 'end_date' => $endDate]]);
}

if ($path === '/state-congress-reports/membership-by-cluster') {
    require_method('GET');
    require_auth();
    $state = trim($_GET['state'] ?? '');

    $stmt = db_prepare(
        $db,
        'SELECT start_date, end_date FROM state_congress_settings ORDER BY id DESC LIMIT 1',
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows || !$rows[0]['start_date'] || !$rows[0]['end_date']) {
        json_error('State congress dates are not set', 422);
    }
    $startDate = $rows[0]['start_date'];
    $endDate = $rows[0]['end_date'];

    $sql = 'SELECT cluster, membership_status, gender, COUNT(*) AS total
            FROM state_congress_registrations
            WHERE registration_date BETWEEN ? AND ?';
    $types = 'ss';
    $params = [$startDate, $endDate];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY cluster, membership_status, gender
              ORDER BY cluster, membership_status';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows, 'meta' => ['start_date' => $startDate, 'end_date' => $endDate]]);
}

if ($path === '/retreat-reports/cluster-days') {
    require_method('GET');
    require_auth();
    $retreatType = $_GET['retreat_type'] ?? '';
    $state = $_GET['state'] ?? '';
    $region = $_GET['region'] ?? '';
    $days = [
        'day1' => $_GET['day1'] ?? '',
        'day2' => $_GET['day2'] ?? '',
        'day3' => $_GET['day3'] ?? '',
        'day4' => $_GET['day4'] ?? '',
    ];
    $dateMap = [];
    foreach ($days as $key => $value) {
        if ($value !== '') {
            $dateMap[$value] = $key;
        }
    }
    if (empty($dateMap)) {
        json_error('Provide at least one day date', 422);
    }
    $placeholders = implode(',', array_fill(0, count($dateMap), '?'));
    $sql = 'SELECT cluster, gender, DATE(registration_date) AS day_date, COUNT(*) AS total
            FROM retreat_registrations
            WHERE DATE(registration_date) IN (' . $placeholders . ')';
    $types = str_repeat('s', count($dateMap));
    $params = array_keys($dateMap);
    if ($retreatType !== '') {
        $sql .= ' AND retreat_type = ?';
        $types .= 's';
        $params[] = $retreatType;
    }
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    if ($region !== '') {
        $sql .= ' AND region = ?';
        $types .= 's';
        $params[] = $region;
    }
    $sql .= ' GROUP BY cluster, gender, day_date ORDER BY cluster';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    $items = array_map(function ($row) use ($dateMap) {
        $dayDate = $row['day_date'];
        return [
            'cluster' => $row['cluster'],
            'gender' => $row['gender'],
            'total' => (int) $row['total'],
            'day_key' => $dateMap[$dayDate] ?? '',
        ];
    }, $rows);
    json_ok(['items' => $items]);
}

if ($path === '/retreat-reports/centres') {
    require_method('GET');
    require_auth();
    $retreatType = $_GET['retreat_type'] ?? '';
    $start = $_GET['start'] ?? '';
    $end = $_GET['end'] ?? '';

    $state = $_GET['state'] ?? '';
    $region = $_GET['region'] ?? '';

    $sql = 'SELECT dlcf_center, category, gender, COUNT(*) AS total
            FROM retreat_registrations
            WHERE 1=1';
    $types = '';
    $params = [];
    if ($start !== '') {
        $sql .= ' AND DATE(registration_date) >= ?';
        $types .= 's';
        $params[] = $start;
    }
    if ($end !== '') {
        $sql .= ' AND DATE(registration_date) <= ?';
        $types .= 's';
        $params[] = $end;
    }
    if ($retreatType !== '') {
        $sql .= ' AND retreat_type = ?';
        $types .= 's';
        $params[] = $retreatType;
    }
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    if ($region !== '') {
        $sql .= ' AND region = ?';
        $types .= 's';
        $params[] = $region;
    }
    $sql .= ' GROUP BY dlcf_center, category, gender ORDER BY dlcf_center';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows]);
}

if ($path === '/zonal-registrations') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_auth();
        require_csrf();
        $payload = read_json();
        $user = current_user();

        $title = $payload['title'] ?? '';
        $fullName = trim($payload['full_name'] ?? '');
        $gender = $payload['gender'] ?? '';
        $email = trim($payload['email'] ?? '');
        $phone = trim($payload['phone'] ?? '');
        $registrationDate = $payload['registration_date'] ?? '';
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $cluster = trim($payload['cluster'] ?? '');
        $institution = trim($payload['institution'] ?? '');
        $centreName = trim($payload['fellowship_centre'] ?? '');
        $category = trim($payload['category'] ?? '');
        $membershipStatus = trim($payload['membership_status'] ?? '');

        if (
            $title === '' || $fullName === '' || $gender === '' || $email === '' || $phone === '' ||
            $registrationDate === '' || $state === '' || $region === '' ||
            $institution === '' || $centreName === '' || $category === '' || $membershipStatus === ''
        ) {
            json_error('Missing required fields', 422);
        }

        $stmt = db_prepare($db, 'INSERT INTO zonal_congress_registrations
            (title, full_name, gender, email, phone, category, membership_status, cluster, registration_date, state, region, institution, fellowship_centre, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', 'sssssssssssss', [
            $title,
            $fullName,
            $gender,
            $email,
            $phone,
            $category,
            $membershipStatus,
            $cluster,
            $registrationDate,
            $state,
            $region,
            $institution,
            $centreName,
        ]);
        $stmt->execute();
        json_ok(['id' => $db->insert_id], 201);
    }
}

if ($path === '/zonal-registrations/lookup') {
    require_method('GET');
    require_auth();
    $user = current_user();
    if (!user_has_work_unit($user, 'Registration Officers Committee') && !in_array($user['role'], ['administrator'], true)) {
        json_error('Forbidden', 403);
    }
    $email = trim($_GET['email'] ?? '');
    $phone = trim($_GET['phone'] ?? '');
    if ($email === '' && $phone === '') {
        json_error('email or phone is required', 422);
    }
    $sql = 'SELECT id, title, full_name, gender, email, phone, category, membership_status, cluster, registration_date,
                   state, region, institution, fellowship_centre
            FROM zonal_congress_registrations WHERE 1=1';
    $types = '';
    $params = [];
    if ($email !== '') {
        $sql .= ' AND email = ?';
        $types .= 's';
        $params[] = $email;
    } else {
        $sql .= ' AND phone = ?';
        $types .= 's';
        $params[] = $phone;
    }
    $sql .= ' ORDER BY created_at DESC LIMIT 1';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows) {
        json_error('Registration not found', 404);
    }
    json_ok($rows[0]);
}

if (preg_match('#^/zonal-registrations/(\\d+)$#', $path, $matches)) {
    require_method('PUT');
    require_auth();
    require_csrf();
    $user = current_user();
    if (!user_has_work_unit($user, 'Registration Officers Committee') && !in_array($user['role'], ['administrator'], true)) {
        json_error('Forbidden', 403);
    }
    $id = (int) $matches[1];
    $payload = read_json();

    $title = $payload['title'] ?? '';
    $fullName = trim($payload['full_name'] ?? '');
    $gender = $payload['gender'] ?? '';
    $email = trim($payload['email'] ?? '');
    $phone = trim($payload['phone'] ?? '');
    $category = trim($payload['category'] ?? '');
    $membershipStatus = trim($payload['membership_status'] ?? '');
    $cluster = trim($payload['cluster'] ?? '');
    $registrationDate = $payload['registration_date'] ?? '';
    $state = trim($payload['state'] ?? '');
    $region = trim($payload['region'] ?? '');
    $institution = trim($payload['institution'] ?? '');
    $centreName = trim($payload['fellowship_centre'] ?? '');

    if (
        $title === '' || $fullName === '' || $gender === '' || $email === '' || $phone === '' ||
        $registrationDate === '' || $state === '' || $region === '' ||
        $institution === '' || $centreName === '' || $category === '' || $membershipStatus === ''
    ) {
        json_error('Missing required fields', 422);
    }

    $stmt = db_prepare($db, 'UPDATE zonal_congress_registrations
        SET title = ?, full_name = ?, gender = ?, email = ?, phone = ?, category = ?, membership_status = ?,
            cluster = ?, registration_date = ?, state = ?, region = ?, institution = ?, fellowship_centre = ?,
            updated_at = NOW()
        WHERE id = ?', 'sssssssssssssi', [
        $title,
        $fullName,
        $gender,
        $email,
        $phone,
        $category,
        $membershipStatus,
        $cluster,
        $registrationDate,
        $state,
        $region,
        $institution,
        $centreName,
        $id,
    ]);
    $stmt->execute();
    json_ok(['message' => 'Registration updated']);
}

if ($path === '/zonal-congress-reports/states-by-day') {
    require_method('GET');
    require_auth();
    $state = trim($_GET['state'] ?? '');

    $stmt = db_prepare(
        $db,
        'SELECT start_date, end_date FROM zonal_congress_settings ORDER BY id DESC LIMIT 1',
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows || !$rows[0]['start_date'] || !$rows[0]['end_date']) {
        json_error('Zonal congress dates are not set', 422);
    }
    $startDate = $rows[0]['start_date'];
    $endDate = $rows[0]['end_date'];

    $sql = 'SELECT state, gender, DATE(registration_date) AS registration_date,
                   CONCAT("day", DATEDIFF(registration_date, ?) + 1) AS day_key,
                   COUNT(*) AS total
            FROM zonal_congress_registrations
            WHERE registration_date BETWEEN ? AND ?';
    $types = 'sss';
    $params = [$startDate, $startDate, $endDate];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY state, gender, registration_date
              ORDER BY state, registration_date';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows, 'meta' => ['start_date' => $startDate, 'end_date' => $endDate]]);
}

if ($path === '/zonal-congress-reports/membership-by-state') {
    require_method('GET');
    require_auth();
    $state = trim($_GET['state'] ?? '');

    $stmt = db_prepare(
        $db,
        'SELECT start_date, end_date FROM zonal_congress_settings ORDER BY id DESC LIMIT 1',
        '',
        []
    );
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    if (!$rows || !$rows[0]['start_date'] || !$rows[0]['end_date']) {
        json_error('Zonal congress dates are not set', 422);
    }
    $startDate = $rows[0]['start_date'];
    $endDate = $rows[0]['end_date'];

    $sql = 'SELECT state, membership_status, gender, COUNT(*) AS total
            FROM zonal_congress_registrations
            WHERE registration_date BETWEEN ? AND ?';
    $types = 'ss';
    $params = [$startDate, $endDate];
    if ($state !== '') {
        $sql .= ' AND state = ?';
        $types .= 's';
        $params[] = $state;
    }
    $sql .= ' GROUP BY state, membership_status, gender
              ORDER BY state, membership_status';

    $stmt = db_prepare($db, $sql, $types, $params);
    $stmt->execute();
    $rows = db_fetch_all($stmt);
    json_ok(['items' => $rows, 'meta' => ['start_date' => $startDate, 'end_date' => $endDate]]);
}

if ($path === '/biodata') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        require_auth();
        require_csrf();
        $payload = read_json();

        $fullName = trim($payload['full_name'] ?? '');
        $gender = $payload['gender'] ?? '';
        $age = (int) ($payload['age'] ?? 0);
        $phone = trim($payload['phone'] ?? '');
        $email = trim($payload['email'] ?? '');
        $profilePhoto = trim($payload['profile_photo'] ?? '');
        $school = trim($payload['school'] ?? '');
        $category = trim($payload['category'] ?? '');
        $workerStatus = trim($payload['worker_status'] ?? '');
        $membershipStatus = trim($payload['membership_status'] ?? '');
        $workUnits = $payload['work_units'] ?? [];
        $address = trim($payload['address'] ?? '');
        $nextOfKinName = trim($payload['next_of_kin_name'] ?? '');
        $nextOfKinPhone = trim($payload['next_of_kin_phone'] ?? '');
        $nextOfKinRelationship = trim($payload['next_of_kin_relationship'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $centreName = trim($payload['fellowship_centre'] ?? '');

        if ($user['email'] && strcasecmp($email, $user['email']) !== 0) {
            json_error('Email must match your account email', 422);
        }

        if ($profilePhoto !== '') {
            if (strncmp($profilePhoto, 'data:image/', 11) !== 0) {
                json_error('Invalid profile photo format', 422);
            }
            if (strlen($profilePhoto) > 2000000) {
                json_error('Profile photo must be 2MB or smaller', 422);
            }
        }

        if (
            $fullName === '' || $gender === '' || $age <= 0 || $phone === '' || $email === '' ||
            $school === '' || $category === '' || $workerStatus === '' || $membershipStatus === '' ||
            !is_array($workUnits) || count($workUnits) === 0 ||
            $address === '' || $nextOfKinName === '' || $nextOfKinPhone === '' || $nextOfKinRelationship === '' ||
            $state === '' || $region === '' || $centreName === ''
        ) {
            json_error('Missing required fields', 422);
        }

        $db->begin_transaction();
        try {
            $cluster = $cluster === '' ? null : $cluster;
            $stmt = db_prepare($db, 'SELECT id FROM fellowship_centres WHERE name = ? AND state = ? AND region = ? LIMIT 1', 'sss', [$centreName, $state, $region]);
            $stmt->execute();
            $centreRow = db_fetch_all($stmt);
            if ($centreRow) {
                $centreId = (int) $centreRow[0]['id'];
            } else {
                $stmt = db_prepare($db, 'INSERT INTO fellowship_centres (name, state, region, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 'sss', [$centreName, $state, $region]);
                $stmt->execute();
                $centreId = $db->insert_id;
            }

            $stmt = db_prepare($db, 'SELECT id FROM biodata WHERE user_id = ? LIMIT 1', 'i', [$user['id']]);
            $stmt->execute();
            $existing = db_fetch_all($stmt);
            if ($existing) {
                json_error('Biodata already exists. Please update your profile.', 409);
            }

            $sql = 'INSERT INTO biodata
                (user_id, fellowship_centre_id, full_name, gender, age, phone, email, state, region, cluster, profile_photo, school, category, worker_status, membership_status, work_units, address,
                 next_of_kin_name, next_of_kin_phone, next_of_kin_relationship, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
            $stmt = db_prepare($db, $sql, 'iississssssssssssss', [
                $user['id'],
                $centreId,
                $fullName,
                $gender,
                $age,
                $phone,
                $email,
                $state,
                $region,
                $cluster,
                $profilePhoto,
                $school,
                $category,
                $workerStatus,
                $membershipStatus,
                json_encode(array_values($workUnits)),
                $address,
                $nextOfKinName,
                $nextOfKinPhone,
                $nextOfKinRelationship,
            ]);
            $stmt->execute();

            $db->commit();
            json_ok(['message' => 'Biodata submitted'], 201);
        } catch (Throwable $e) {
            $db->rollback();
            log_error('Biodata insert failed: ' . $e->getMessage(), $config['log_path']);
            json_error('Failed to submit biodata', 500);
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_auth();
        $user = current_user();
        $filters = [
            'state' => $_GET['state'] ?? null,
            'region' => $_GET['region'] ?? null,
            'centre' => $_GET['fellowship_centre'] ?? null,
            'search' => $_GET['search'] ?? null,
        ];

        if ($user['role'] === 'region_cord' && $user['region']) {
            $filters['region'] = $user['region'];
        }
        if ($user['role'] === 'state_cord' && $user['state']) {
            $filters['state'] = $user['state'];
        }

        $sql = 'SELECT b.id, b.full_name, b.gender, b.age, b.phone, b.email, b.profile_photo, b.school, b.category,
                       b.worker_status, b.membership_status, b.work_units, b.address, b.next_of_kin_name, b.next_of_kin_phone,
                       b.next_of_kin_relationship, b.state, b.region, b.cluster, fc.name AS fellowship_centre, b.created_at
                FROM biodata b
                JOIN fellowship_centres fc ON fc.id = b.fellowship_centre_id
                WHERE 1=1';
        $types = '';
        $params = [];
        if ($filters['state']) {
            $sql .= ' AND fc.state = ?';
            $types .= 's';
            $params[] = $filters['state'];
        }
        if ($filters['region']) {
            $sql .= ' AND fc.region = ?';
            $types .= 's';
            $params[] = $filters['region'];
        }
        if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
            $sql .= ' AND fc.id = ?';
            $types .= 'i';
            $params[] = (int) $user['fellowship_centre_id'];
        }
        if ($filters['centre']) {
            $sql .= ' AND fc.name = ?';
            $types .= 's';
            $params[] = $filters['centre'];
        }
        if ($filters['search']) {
            $sql .= ' AND (b.full_name LIKE ? OR b.email LIKE ? OR b.phone LIKE ?)';
            $types .= 'sss';
            $term = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }
        $sql .= ' ORDER BY b.created_at DESC';

        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        foreach ($rows as &$row) {
            $row['work_units'] = json_decode($row['work_units'], true) ?: [];
        }
        json_ok(['items' => $rows]);
    }
}

if (preg_match('#^/biodata/(\\d+)$#', $path, $matches)) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        require_auth();
        $user = current_user();
        $id = (int) $matches[1];

        $sql = 'SELECT b.id, b.full_name, b.gender, b.age, b.phone, b.email, b.profile_photo, b.school, b.category,
                       b.worker_status, b.membership_status, b.work_units, b.address, b.next_of_kin_name, b.next_of_kin_phone,
                       b.next_of_kin_relationship, b.state, b.region, b.cluster, fc.name AS fellowship_centre, b.created_at
                FROM biodata b
                JOIN fellowship_centres fc ON fc.id = b.fellowship_centre_id
                WHERE b.id = ?';
        $types = 'i';
        $params = [$id];

        if ($user['role'] === 'associate_cord' && !empty($user['fellowship_centre_id'])) {
            $sql .= ' AND fc.id = ?';
            $types .= 'i';
            $params[] = (int) $user['fellowship_centre_id'];
        } elseif ($user['role'] === 'region_cord' && $user['region']) {
            $sql .= ' AND fc.region = ?';
            $types .= 's';
            $params[] = $user['region'];
        } elseif ($user['role'] === 'state_cord' && $user['state']) {
            $sql .= ' AND fc.state = ?';
            $types .= 's';
            $params[] = $user['state'];
        }

        $stmt = db_prepare($db, $sql, $types, $params);
        $stmt->execute();
        $rows = db_fetch_all($stmt);
        if (!$rows) {
            json_error('Not found', 404);
        }
        $rows[0]['work_units'] = json_decode($rows[0]['work_units'], true) ?: [];
        json_ok(['item' => $rows[0]]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        require_auth();
        require_csrf();
        $user = current_user();

        $allowedRoles = ['administrator', 'state_cord', 'associate_cord', 'region_cord'];
        if (!in_array($user['role'], $allowedRoles, true)) {
            json_error('Forbidden', 403);
        }

        $payload = read_json();
        $id = (int) $matches[1];

        $stmt = db_prepare($db, 'SELECT b.id, fc.id AS centre_id, fc.state, fc.region
                                 FROM biodata b
                                 JOIN fellowship_centres fc ON fc.id = b.fellowship_centre_id
                                 WHERE b.id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $targetRows = db_fetch_all($stmt);
        if (!$targetRows) {
            json_error('Not found', 404);
        }
        $target = $targetRows[0];
        if ($user['role'] === 'associate_cord') {
            if (empty($user['fellowship_centre_id']) || (int) $target['centre_id'] !== (int) $user['fellowship_centre_id']) {
                json_error('Forbidden', 403);
            }
        }
        if ($user['role'] === 'region_cord') {
            if (empty($user['region']) || $target['region'] !== $user['region']) {
                json_error('Forbidden', 403);
            }
        }
        if ($user['role'] === 'state_cord') {
            if (empty($user['state']) || $target['state'] !== $user['state']) {
                json_error('Forbidden', 403);
            }
        }

        $fullName = trim($payload['full_name'] ?? '');
        $gender = $payload['gender'] ?? '';
        $age = (int) ($payload['age'] ?? 0);
        $phone = trim($payload['phone'] ?? '');
        $email = trim($payload['email'] ?? '');
        $profilePhoto = trim($payload['profile_photo'] ?? '');
        $school = trim($payload['school'] ?? '');
        $category = trim($payload['category'] ?? '');
        $workerStatus = trim($payload['worker_status'] ?? '');
        $membershipStatus = trim($payload['membership_status'] ?? '');
        $updateWorkUnits = $payload['work_units'] ?? [];
        $address = trim($payload['address'] ?? '');
        $nextOfKinName = trim($payload['next_of_kin_name'] ?? '');
        $nextOfKinPhone = trim($payload['next_of_kin_phone'] ?? '');
        $nextOfKinRelationship = trim($payload['next_of_kin_relationship'] ?? '');
        $state = trim($payload['state'] ?? '');
        $region = trim($payload['region'] ?? '');
        $cluster = trim($payload['cluster'] ?? '');

        if ($user['email'] && strcasecmp($email, $user['email']) !== 0) {
            json_error('Email must match your account email', 422);
        }

        if ($profilePhoto !== '') {
            if (strncmp($profilePhoto, 'data:image/', 11) !== 0) {
                json_error('Invalid profile photo format', 422);
            }
            if (strlen($profilePhoto) > 2000000) {
                json_error('Profile photo must be 2MB or smaller', 422);
            }
        }

        if (
            $fullName === '' || $gender === '' || $age <= 0 || $phone === '' || $email === '' ||
            $school === '' || $category === '' || $workerStatus === '' || $membershipStatus === '' ||
            !is_array($updateWorkUnits) || count($updateWorkUnits) === 0 ||
            $address === '' || $nextOfKinName === '' || $nextOfKinPhone === '' || $nextOfKinRelationship === '' ||
            $state === '' || $region === ''
        ) {
            json_error('Missing required fields', 422);
        }

        $cluster = $cluster === '' ? null : $cluster;

        $sql = 'UPDATE biodata SET full_name = ?, gender = ?, age = ?, phone = ?, email = ?, state = ?, region = ?, cluster = ?, profile_photo = ?, school = ?,
                       category = ?, worker_status = ?, membership_status = ?, work_units = ?, address = ?,
                       next_of_kin_name = ?, next_of_kin_phone = ?, next_of_kin_relationship = ?, updated_at = NOW()
                WHERE id = ?';
        $stmt = db_prepare($db, $sql, 'ssisssssssssssssssi', [
            $fullName,
            $gender,
            $age,
            $phone,
            $email,
            $state,
            $region,
            $cluster,
            $profilePhoto,
            $school,
            $category,
            $workerStatus,
            $membershipStatus,
            json_encode(array_values($updateWorkUnits)),
            $address,
            $nextOfKinName,
            $nextOfKinPhone,
            $nextOfKinRelationship,
            $id,
        ]);
        $stmt->execute();
        json_ok(['message' => 'Biodata updated']);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        require_auth();
        require_csrf();
        $user = current_user();
        $allowedRoles = ['administrator', 'state_cord', 'associate_cord', 'region_cord'];
        if (!in_array($user['role'], $allowedRoles, true)) {
            json_error('Forbidden', 403);
        }

        $id = (int) $matches[1];
        $stmt = db_prepare($db, 'SELECT b.id, fc.id AS centre_id, fc.state, fc.region
                                 FROM biodata b
                                 JOIN fellowship_centres fc ON fc.id = b.fellowship_centre_id
                                 WHERE b.id = ? LIMIT 1', 'i', [$id]);
        $stmt->execute();
        $targetRows = db_fetch_all($stmt);
        if (!$targetRows) {
            json_error('Not found', 404);
        }
        $target = $targetRows[0];
        if ($user['role'] === 'associate_cord') {
            if (empty($user['fellowship_centre_id']) || (int) $target['centre_id'] !== (int) $user['fellowship_centre_id']) {
                json_error('Forbidden', 403);
            }
        }
        if ($user['role'] === 'region_cord') {
            if (empty($user['region']) || $target['region'] !== $user['region']) {
                json_error('Forbidden', 403);
            }
        }
        if ($user['role'] === 'state_cord') {
            if (empty($user['state']) || $target['state'] !== $user['state']) {
                json_error('Forbidden', 403);
            }
        }

        $stmt = db_prepare($db, 'DELETE FROM biodata WHERE id = ?', 'i', [$id]);
        $stmt->execute();
        json_ok(['message' => 'Biodata deleted']);
    }
}

json_error('Not found', 404);
