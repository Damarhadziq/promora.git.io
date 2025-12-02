<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT");

include_once '../config/db.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized"));
    exit();
}

// Handle FormData
$first_name = $_POST['first_name'] ?? '';
$last_name = $_POST['last_name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';
$latitude = $_POST['latitude'] ?? null;
$longitude = $_POST['longitude'] ?? null;

// Convert empty strings to null
$latitude = ($latitude === '' || $latitude === 'undefined') ? null : $latitude;
$longitude = ($longitude === '' || $longitude === 'undefined') ? null : $longitude;

$photo_filename = null;

// Handle profile photo upload
if (isset($_FILES['profile_photo']) && $_FILES['profile_photo']['error'] === UPLOAD_ERR_OK) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
    $max_size = 2 * 1024 * 1024; // 2MB
    
    if (!in_array($_FILES['profile_photo']['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid file type. Only JPG, PNG allowed"));
        exit();
    }
    
    if ($_FILES['profile_photo']['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(array("message" => "File too large. Max 2MB"));
        exit();
    }
    
    $upload_dir = '../uploads/profile_photos/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $ext = pathinfo($_FILES['profile_photo']['name'], PATHINFO_EXTENSION);
    $photo_filename = 'profile_' . $_SESSION['user_id'] . '_' . time() . '.' . $ext;
    $upload_path = $upload_dir . $photo_filename;
    
    if (!move_uploaded_file($_FILES['profile_photo']['tmp_name'], $upload_path)) {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to upload photo"));
        exit();
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get old photo untuk dihapus jika ada upload baru
    if ($photo_filename) {
        $checkQuery = "SELECT profile_photo FROM users WHERE id = :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $_SESSION['user_id']);
        $checkStmt->execute();
        $oldData = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($oldData && $oldData['profile_photo']) {
            $old_photo = '../uploads/profile_photos/' . $oldData['profile_photo'];
            if (file_exists($old_photo)) {
                unlink($old_photo);
            }
        }
    }
    
    // Update query
    $query = "UPDATE users SET 
              first_name = :first_name,
              last_name = :last_name,
              email = :email,
              phone = :phone,
              address = :address,
              latitude = :latitude,
              longitude = :longitude" . 
              ($photo_filename ? ", profile_photo = :profile_photo" : "") . "
              WHERE id = :user_id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":first_name", $first_name);
    $stmt->bindParam(":last_name", $last_name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":phone", $phone);
    $stmt->bindParam(":address", $address);
    $stmt->bindParam(":latitude", $latitude);
    $stmt->bindParam(":longitude", $longitude);
    if ($photo_filename) {
        $stmt->bindParam(":profile_photo", $photo_filename);
    }
    $stmt->bindParam(":user_id", $_SESSION['user_id']);
    
    if ($stmt->execute()) {
        // Update session
        $_SESSION['first_name'] = $first_name;
        $_SESSION['last_name'] = $last_name;
        $_SESSION['email'] = $email;
        http_response_code(200);
        echo json_encode(array(
            "message" => "Profile updated successfully",
            "data" => array(
                "first_name" => $first_name,
                "last_name" => $last_name,
                "full_name" => $first_name . ' ' . $last_name,
                "email" => $email,
                "phone" => $phone,
                "address" => $address,
                "latitude" => $latitude,
                "longitude" => $longitude,
                "profile_photo" => $photo_filename
            )
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to update profile"));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error: " . $e->getMessage()
    ));
}
?>