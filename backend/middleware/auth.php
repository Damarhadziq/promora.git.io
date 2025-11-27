<?php
// middleware/auth.php
session_start();

function requireLogin() {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(array("message" => "Unauthorized. Please login."));
        exit();
    }
}

function requireRole($role) {
    requireLogin();
    if ($_SESSION['role'] !== $role) {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden. Insufficient permissions."));
        exit();
    }
}
?>