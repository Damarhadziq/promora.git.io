<?php
// api/check_session.php
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    http_response_code(200);
    echo json_encode(array(
        "logged_in" => true,
        "user" => array(
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'],
            "email" => $_SESSION['email'],
            "first_name" => $_SESSION['first_name'],
            "last_name" => $_SESSION['last_name'] ?? '',
            "role" => $_SESSION['role'],
            "phone" => $_SESSION['phone'] ?? ''
        )
    ));
} else {
    http_response_code(401);
    echo json_encode(array(
        "logged_in" => false,
        "message" => "Not logged in"
    ));
}
?>