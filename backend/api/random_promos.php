<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "../config/db.php";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Ambil 6 produk random yang memiliki diskon
    $query = $conn->prepare("
        SELECT p.*, s.store_name 
        FROM products p
        LEFT JOIN stores s ON p.seller_id = s.user_id
        WHERE p.discount > 0 AND p.stock > 0
        ORDER BY RAND()
        LIMIT 3
    ");
    
    $query->execute();
    $products = $query->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($products);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}