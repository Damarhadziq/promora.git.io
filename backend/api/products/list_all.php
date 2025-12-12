<?php
// backend/api/products/list_all.php
// Untuk halaman explore - menampilkan SEMUA produk + store info

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Koneksi dengan db.php (PDO)
require_once __DIR__ . "/../../config/db.php";
$database = new Database();
$conn = $database->getConnection();

try {
    // Query lengkap dengan store info - FILTER is_deleted
    $query = "
        SELECT 
            p.*, 
            s.store_name,
            s.logo AS store_logo,
            s.latitude,
            s.longitude
        FROM products p
        LEFT JOIN stores s ON p.seller_id = s.user_id
        WHERE p.is_deleted = 0
        ORDER BY p.created_at DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);

} catch (Exception $e) {
    echo json_encode([
        'error' => 'Query failed: ' . $e->getMessage()
    ]);
}
?>
