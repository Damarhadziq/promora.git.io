<?php
require_once '../config/db.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Handle FormData
$store_name = $_POST['store_name'] ?? '';
$description = $_POST['description'] ?? '';
$address = $_POST['address'] ?? '';
$phone = $_POST['phone'] ?? '';
$latitude = $_POST['latitude'] ?? null;
$longitude = $_POST['longitude'] ?? null;

// Convert empty strings to null
$latitude = ($latitude === '' || $latitude === 'undefined') ? null : $latitude;
$longitude = ($longitude === '' || $longitude === 'undefined') ? null : $longitude;

if (empty(trim($store_name))) {
    echo json_encode(['success' => false, 'message' => 'Store name is required']);
    exit;
}

$logo_filename = null;

// Handle logo upload
if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
    $max_size = 2 * 1024 * 1024; // 2MB
    
    if (!in_array($_FILES['logo']['type'], $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG allowed']);
        exit;
    }
    
    if ($_FILES['logo']['size'] > $max_size) {
        echo json_encode(['success' => false, 'message' => 'File too large. Max 2MB']);
        exit;
    }
    
    $upload_dir = '../uploads/store_logos/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $ext = pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
    $logo_filename = 'logo_' . $user_id . '_' . time() . '.' . $ext;
    $upload_path = $upload_dir . $logo_filename;
    
    if (!move_uploaded_file($_FILES['logo']['tmp_name'], $upload_path)) {
        echo json_encode(['success' => false, 'message' => 'Failed to upload logo']);
        exit;
    }
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Check if store exists
    $checkQuery = "SELECT id, logo FROM stores WHERE user_id = :user_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $user_id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        $existingStore = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        // Delete old logo if new one uploaded
        if ($logo_filename && $existingStore['logo']) {
            $old_logo = '../uploads/store_logos/' . $existingStore['logo'];
            if (file_exists($old_logo)) {
                unlink($old_logo);
            }
        }
        
        // Update store
        $query = "UPDATE stores 
                  SET store_name = :store_name, 
                      description = :description,
                      address = :address,
                      latitude = :latitude,
                      longitude = :longitude" . 
                      ($logo_filename ? ", logo = :logo" : "") . ",
                      updated_at = CURRENT_TIMESTAMP
                  WHERE user_id = :user_id";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':store_name', $store_name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':latitude', $latitude);
        $stmt->bindParam(':longitude', $longitude);
        if ($logo_filename) {
            $stmt->bindParam(':logo', $logo_filename);
        }
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            // Update phone di tabel users
            $updatePhoneQuery = "UPDATE users SET phone = :phone WHERE id = :user_id";
            $updatePhoneStmt = $conn->prepare($updatePhoneQuery);
            $updatePhoneStmt->bindParam(':phone', $phone);
            $updatePhoneStmt->bindParam(':user_id', $user_id);
            $updatePhoneStmt->execute();
            
            echo json_encode(['success' => true, 'message' => 'Store updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update store']);
        }
    } else {
        // Create new store
        $query = "INSERT INTO stores (user_id, store_name, description, address, latitude, longitude, logo) 
                  VALUES (:user_id, :store_name, :description, :address, :latitude, :longitude, :logo)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':store_name', $store_name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':latitude', $latitude);
        $stmt->bindParam(':longitude', $longitude);
        $stmt->bindParam(':logo', $logo_filename);
        
        if ($stmt->execute()) {
            // Update phone di tabel users
            $updatePhoneQuery = "UPDATE users SET phone = :phone WHERE id = :user_id";
            $updatePhoneStmt = $conn->prepare($updatePhoneQuery);
            $updatePhoneStmt->bindParam(':phone', $phone);
            $updatePhoneStmt->bindParam(':user_id', $user_id);
            $updatePhoneStmt->execute();
            
            echo json_encode(['success' => true, 'message' => 'Store created successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create store']);
        }
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>