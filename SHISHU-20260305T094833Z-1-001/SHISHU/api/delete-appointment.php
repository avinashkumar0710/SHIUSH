<?php
require_once __DIR__ . '/helpers.php';
require_admin();
$b = body();
if (empty($b['id']))
    json_error('ID required');
$stmt = db()->prepare("DELETE FROM appointments WHERE id=:id");
$stmt->execute([':id' => $b['id']]);
json_ok(['success' => true]);
