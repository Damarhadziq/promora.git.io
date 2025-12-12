<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$seller_id = $_SESSION['user_id'];

require_once __DIR__ . "/../../config/db.php";
$database = new Database();
$conn = $database->getConnection();

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['id'])) {
        throw new Exception('Product ID is required');
    }
    
    $product_id = intval($data['id']);
    
    // Verify ownership
    $checkStmt = $conn->prepare("SELECT seller_id FROM products WHERE id = :id AND is_deleted = 1");
    $checkStmt->execute(['id' => $product_id]);
    $product = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        throw new Exception('Product not found in trash');
    }
    
    if ($product['seller_id'] != $seller_id) {
        throw new Exception('Unauthorized');
    }
    
    // Restore product
    $restoreStmt = $conn->prepare("UPDATE products SET is_deleted = 0 WHERE id = :id");
    $restoreStmt->execute(['id' => $product_id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Product restored successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>