<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Please login first']);
    exit();
}

// Get seller ID from session
$seller_id = $_SESSION['user_id'];

// koneksi database
$mysqli = new mysqli("localhost", "root", "", "db_promora");

// cek koneksi
if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

// Query to get only products from logged-in seller
$stmt = $mysqli->prepare("
    SELECT 
        p.*,
        u.first_name,
        u.last_name
    FROM products p
    LEFT JOIN users u ON p.seller_id = u.id
    WHERE p.seller_id = ?
    ORDER BY p.id DESC
");

if (!$stmt) {
    echo json_encode(['error' => 'Prepare failed: ' . $mysqli->error]);
    exit;
}

$stmt->bind_param("i", $seller_id);
$stmt->execute();

$result = $stmt->get_result();

if (!$result) {
    echo json_encode(['error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$products = [];
while($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);

$stmt->close();
$mysqli->close();
?>