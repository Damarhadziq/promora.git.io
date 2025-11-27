<?php
require_once '../config/db.php';
session_start();

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['store_name']) || empty(trim($input['store_name']))) {
    echo json_encode(['success' => false, 'message' => 'Store name is required']);
    exit;
}

$store_name = trim($input['store_name']);
$description = isset($input['description']) ? trim($input['description']) : '';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Check if store exists for this user
    $checkQuery = "SELECT id FROM stores WHERE user_id = :user_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':user_id', $user_id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        // Update existing store
        $query = "UPDATE stores 
                  SET store_name = :store_name, 
                      description = :description,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE user_id = :user_id";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':store_name', $store_name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true, 
                'message' => 'Store updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Failed to update store'
            ]);
        }
    } else {
        // Create new store if not exists
        $query = "INSERT INTO stores (user_id, store_name, description) 
                  VALUES (:user_id, :store_name, :description)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':store_name', $store_name);
        $stmt->bindParam(':description', $description);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true, 
                'message' => 'Store created successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Failed to create store'
            ]);
        }
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>