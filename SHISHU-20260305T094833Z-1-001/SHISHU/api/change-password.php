<?php
require_once __DIR__ . '/helpers.php';
require_admin();
$b = body();
$new = trim($b['new_password'] ?? '');
if (strlen($new) < 6)
    json_error('Password must be at least 6 characters');
$content = get_content();
$content['admin_password'] = $new;
save_content($content);
json_ok(['success' => true, 'token' => $new]);
