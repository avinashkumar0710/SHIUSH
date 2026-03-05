<?php
require_once __DIR__ . '/helpers.php';
require_admin();
$b = body();
if (empty($b['id']))
    json_error('ID required');
$stmt = db()->prepare("UPDATE appointments SET status=:s WHERE id=:id");
$stmt->execute([':s' => $b['status'] ?? 'new', ':id' => $b['id']]);
json_ok(['success' => true]);
