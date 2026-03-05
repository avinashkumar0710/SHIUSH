<?php
require_once __DIR__ . '/config.php';

// ── CORS headers (allows admin panel to call the API) ──────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Database connection ────────────────────────────────────────────────────
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

// ── JSON response helpers ───────────────────────────────────────────────────
function json_ok(mixed $data): never
{
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $msg, int $code = 400): never
{
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

// ── Read JSON request body ──────────────────────────────────────────────────
function body(): array
{
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ── Get site content from DB ────────────────────────────────────────────────
function get_content(): array
{
    $row = db()->query("SELECT value FROM settings WHERE `key`='site_content'")->fetch();
    return $row ? (json_decode($row['value'], true) ?? []) : [];
}

// ── Save site content to DB ─────────────────────────────────────────────────
function save_content(array $data): void
{
    $stmt = db()->prepare(
        "INSERT INTO settings (`key`, value) VALUES ('site_content', :v)
         ON DUPLICATE KEY UPDATE value = :v"
    );
    $stmt->execute([':v' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
}

// ── Admin auth check ────────────────────────────────────────────────────────
function require_admin(): void
{
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    $content = get_content();
    $pwd = $content['admin_password'] ?? 'admin@shiush';
    if ($token !== $pwd) {
        json_error('Unauthorized', 401);
    }
}

// ── Short UUID ──────────────────────────────────────────────────────────────
function short_id(): string
{
    return substr(md5(uniqid('', true)), 0, 8);
}
