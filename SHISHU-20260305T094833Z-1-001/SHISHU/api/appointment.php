<?php
require_once __DIR__ . '/helpers.php';
$b = body();
if (empty($b['name']) || empty($b['phone']))
    json_error('Name and phone required');
$stmt = db()->prepare(
    "INSERT INTO appointments (id, name, phone, service, date, time, message, status)
     VALUES (:id,:name,:phone,:service,:date,:time,:message,'new')"
);
$id = short_id();
$stmt->execute([
    ':id' => $id,
    ':name' => trim($b['name']),
    ':phone' => trim($b['phone']),
    ':service' => $b['service'] ?? '',
    ':date' => $b['date'] ?? '',
    ':time' => $b['time'] ?? '',
    ':message' => $b['message'] ?? '',
]);
json_ok(['success' => true, 'id' => $id]);
