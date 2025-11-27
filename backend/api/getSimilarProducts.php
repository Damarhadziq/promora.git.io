<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$db = new Database();
$conn = $db->getConnection();

$product_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$category = isset($_GET['category']) ? $_GET['category'] : '';

if ($product_id > 0 && $category) {
    $query = $conn->prepare("
        SELECT p.*, s.store_name 
        FROM products p
        LEFT JOIN stores s ON p.seller_id = s.user_id
        WHERE p.category = ? AND p.id != ?
        LIMIT 3
    ");
    $query->execute([$category, $product_id]);
    $products = $query->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($products);
} else {
    echo json_encode([]);
}