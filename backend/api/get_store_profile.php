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

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Get store data with counts
    $query = "SELECT s.*, u.phone,
            (SELECT COUNT(*) 
            FROM products p 
            WHERE p.seller_id = s.user_id 
            AND p.is_deleted = 0) as total_products,
            (SELECT COUNT(DISTINCT i.id) 
            FROM invoices i 
            WHERE i.seller_id = s.user_id 
            AND i.status = 'verified') as total_orders
            FROM stores s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.user_id = :user_id";
          
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $store = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Tambahkan data dummy
        $store['is_verified'] = true;
        
        echo json_encode([
            'success' => true, 
            'store' => $store
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Store not found'
        ]);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>