<?php
require_once __DIR__ . '/helpers.php';
$data = get_content();
unset($data['admin_password']); // never expose password
json_ok($data);
