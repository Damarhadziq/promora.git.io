<?php
// backend/api/products/list_all.php
// Untuk halaman explore - menampilkan SEMUA produk + store_name + store info

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// koneksi database
$mysqli = new mysqli("localhost", "root", "", "db_promora");

// cek koneksi
if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

// Query dengan tambahan logo, latitude, longitude dari stores
$query = "
    SELECT p.*, 
           s.store_name,
           s.logo as store_logo,
           s.latitude,
           s.longitude
    FROM products p
    LEFT JOIN stores s ON p.seller_id = s.user_id
    ORDER BY p.created_at DESC
";

$result = $mysqli->query($query);

if (!$result) {
    echo json_encode(['error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);
 
$mysqli->close();
?>