<?php
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

// Get ID dari parameter
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['error' => 'Invalid product ID']);
    exit;
}

// Query untuk get product by ID
$stmt = $mysqli->prepare("SELECT * FROM products WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Product not found']);
    exit;
}

$product = $result->fetch_assoc();
echo json_encode($product);

$stmt->close();
$mysqli->close();
?>