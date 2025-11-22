<?php
// api/logout.php
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Hancurkan semua session
session_unset();
session_destroy();

http_response_code(200);
echo json_encode(array(
    "message" => "Logout berhasil"
));
?>