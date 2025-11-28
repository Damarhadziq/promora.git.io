<?php
session_start();
header('Content-Type: application/json');

require_once '../config/db.php';

if(!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$cart_id = $data['cart_id'];
$quantity = $data['quantity'];
$user_id = $_SESSION['user_id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "UPDATE cart SET quantity = :quantity WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':quantity', $quantity);
    $stmt->bindParam(':id', $cart_id);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>