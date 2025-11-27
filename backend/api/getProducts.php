<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$db = new Database();
$conn = $db->getConnection();

// Jika ada parameter ID (untuk detail produk)
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $query = $conn->prepare("
        SELECT p.*, s.store_name, s.description as store_description 
        FROM products p
        LEFT JOIN stores s ON p.seller_id = s.user_id
        WHERE p.id = ?
    ");
    $query->execute([$id]);
    $product = $query->fetch(PDO::FETCH_ASSOC);
    echo json_encode($product);
} else {
    // Untuk list semua produk
    $query = $conn->prepare("
        SELECT p.*, s.store_name 
        FROM products p
        LEFT JOIN stores s ON p.seller_id = s.user_id
        ORDER BY p.id DESC
    ");
    $query->execute();
    $products = $query->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($products);
}