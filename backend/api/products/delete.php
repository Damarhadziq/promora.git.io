<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Check login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Please login first']);
    exit();
}

// Get seller ID
$seller_id = $_SESSION['user_id'];

// Koneksi dengan db.php (PDO)
require_once __DIR__ . "/../../config/db.php";
$database = new Database();
$conn = $database->getConnection();

try {

    // Query: ambil produk milik seller yang login
    $stmt = $conn->prepare("
        SELECT 
            p.*,
            u.first_name,
            u.last_name
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE p.seller_id = :seller_id
        ORDER BY p.id DESC
    ");

    $stmt->execute(['seller_id' => $seller_id]);

    // Ambil hasil
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);

} catch (Exception $e) {
    echo json_encode([
        'error' => 'Query failed: ' . $e->getMessage()
    ]);
}
?>
