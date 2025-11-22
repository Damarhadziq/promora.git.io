<?php
// backend/api/change_password.php
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../config/db.php';

// Cek login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized"));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// Validasi input
if (empty($data->current_password) || empty($data->new_password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Current password and new password are required"));
    exit();
}

// Validasi password minimal 8 karakter
if (strlen($data->new_password) < 8) {
    http_response_code(400);
    echo json_encode(array("message" => "New password must be at least 8 characters"));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Ambil password lama dari database
    $query = "SELECT password FROM users WHERE id = :user_id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $_SESSION['user_id']);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verifikasi password lama
    if (!password_verify($data->current_password, $user['password'])) {
        http_response_code(401);
        echo json_encode(array("message" => "Current password is incorrect"));
        exit();
    }
    
    // Update password baru
    $new_password_hash = password_hash($data->new_password, PASSWORD_BCRYPT);
    
    $update_query = "UPDATE users SET password = :password WHERE id = :user_id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(":password", $new_password_hash);
    $update_stmt->bindParam(":user_id", $_SESSION['user_id']);
    
    if ($update_stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Password changed successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to change password"));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error: " . $e->getMessage()));
}
?>