<?php
require_once __DIR__ . '/helpers.php';
$b = body();
$content = get_content();
$pwd = $content['admin_password'] ?? 'admin@shiush';
if (($b['password'] ?? '') === $pwd) {
    json_ok(['success' => true, 'token' => $pwd]);
}
json_error('Invalid password', 401);
