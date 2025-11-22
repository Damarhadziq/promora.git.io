<?php
// backend/api/update_profile.php
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT");

include_once '../config/db.php';

// Cek apakah user sudah login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized"));
    exit();
}

// Ambil data POST
$data = json_decode(file_get_contents("php://input"));

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Update data user
    $query = "UPDATE users SET 
              first_name = :first_name,
              last_name = :last_name,
              email = :email,
              phone = :phone
              WHERE id = :user_id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":first_name", $data->first_name);
    $stmt->bindParam(":last_name", $data->last_name);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":phone", $data->phone);
    $stmt->bindParam(":user_id", $_SESSION['user_id']);
    
    if ($stmt->execute()) {
        // Update session dengan data baru
        $_SESSION['first_name'] = $data->first_name;
        $_SESSION['last_name'] = $data->last_name;
        $_SESSION['email'] = $data->email;
        $_SESSION['phone'] = $data->phone;
        
        http_response_code(200);
        echo json_encode(array(
            "message" => "Profile updated successfully",
            "user" => array(
                "first_name" => $data->first_name,
                "last_name" => $data->last_name,
                "email" => $data->email,
                "phone" => $data->phone
            )
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to update profile"));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error: " . $e->getMessage()));
}
?>