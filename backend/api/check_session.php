<?php
// api/check_session.php
session_start();
require_once '../config/db.php'; // ✅ TAMBAHKAN INI

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    
    // ✅ QUERY DATABASE UNTUK GET PROFILE_PHOTO
    $profile_photo = null;
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT profile_photo FROM users WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_SESSION['user_id']);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $profile_photo = $row['profile_photo'];
        }
    } catch(Exception $e) {
        // Jika error, profile_photo tetap null
        error_log("Error getting profile photo: " . $e->getMessage());
    }
    
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
            "phone" => $_SESSION['phone'] ?? '',
            "profile_photo" => $profile_photo  // ✅ KIRIM KE FRONTEND
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