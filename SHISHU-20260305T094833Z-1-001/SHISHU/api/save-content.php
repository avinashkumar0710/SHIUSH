<?php
require_once __DIR__ . '/helpers.php';
require_admin();
$update = body();
if (!$update)
    json_error('No data');
$existing = get_content();
$pwd = $existing['admin_password'] ?? 'admin@shiush';
foreach ($update as $k => $v) {
    $existing[$k] = $v;
}
$existing['admin_password'] = $pwd; // never overwrite via this endpoint
save_content($existing);
json_ok(['success' => true]);
