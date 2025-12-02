<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/db.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(array(
        "logged_in" => false,
        "message" => "Not logged in. Please login first."
    ));
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT id, first_name, last_name, email, username, phone, role, 
              profile_photo, address, latitude, longitude, created_at 
              FROM users 
              WHERE id = :user_id 
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $_SESSION['user_id']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(array(
            "logged_in" => true,
            "user" => array(
                "id" => $user['id'],
                "first_name" => $user['first_name'],
                "last_name" => $user['last_name'],
                "full_name" => $user['first_name'] . ' ' . $user['last_name'],
                "email" => $user['email'],
                "username" => $user['username'],
                "phone" => $user['phone'],
                "role" => $user['role'],
                "profile_photo" => $user['profile_photo'],
                "address" => $user['address'],
                "latitude" => $user['latitude'],
                "longitude" => $user['longitude'],
                "created_at" => $user['created_at'],
                "member_since" => date('F Y', strtotime($user['created_at']))
            )
        ));
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "User not found"));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error: " . $e->getMessage()
    ));
}
?>