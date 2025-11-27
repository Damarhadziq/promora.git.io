<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Hancurkan semua session
session_unset();
session_destroy();

// Hapus cookie session
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time()-3600, '/');
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Logout berhasil"
]);
?>