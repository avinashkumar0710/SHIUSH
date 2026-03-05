<?php
require_once __DIR__ . '/helpers.php';
$b = body();
if (empty($b['name']) || empty($b['message']))
    json_error('Name and message required');
$stmt = db()->prepare(
    "INSERT INTO feedback (id, name, message) VALUES (:id,:name,:message)"
);
$stmt->execute([
    ':id' => short_id(),
    ':name' => trim($b['name']),
    ':message' => trim($b['message']),
]);
json_ok(['success' => true]);
