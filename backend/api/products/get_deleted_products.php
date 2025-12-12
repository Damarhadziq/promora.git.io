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
    $stmt = $conn->prepare("
        SELECT * FROM products 
        WHERE seller_id = :seller_id AND is_deleted = 1
        ORDER BY id DESC
    ");
    
    $stmt->execute(['seller_id' => $seller_id]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($products);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>