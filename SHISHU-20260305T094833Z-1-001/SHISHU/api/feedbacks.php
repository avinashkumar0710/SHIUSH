<?php
require_once __DIR__ . '/helpers.php';
require_admin();
$rows = db()->query(
    "SELECT * FROM feedback ORDER BY timestamp DESC"
)->fetchAll();
json_ok($rows);
