<?php
session_start();
header('Content-Type: application/json');

require_once '../config/db.php';

if(!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Silakan login terlebih dahulu']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$user_id = $_SESSION['user_id'];
$product_id = $data['product_id'];
$quantity = $data['quantity'] ?? 1;

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Cek apakah produk sudah ada di cart
    $query = "SELECT id, quantity FROM cart WHERE user_id = :user_id AND product_id = :product_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':product_id', $product_id);
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($existing) {
        // Update quantity jika sudah ada
        $new_qty = $existing['quantity'] + $quantity;
        $query = "UPDATE cart SET quantity = :quantity WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':quantity', $new_qty);
        $stmt->bindParam(':id', $existing['id']);
        $stmt->execute();
    } else {
        // Insert baru jika belum ada
        $query = "INSERT INTO cart (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->execute();
    }
    
    echo json_encode(['success' => true, 'message' => 'Berhasil ditambahkan ke keranjang']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>