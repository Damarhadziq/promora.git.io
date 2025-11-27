<?php
header('Content-Type: application/json');
include '../config/db.php';

$result = $conn->query("SELECT * FROM products ORDER BY created_at DESC");
$products = [];

while($row = $result->fetch_assoc()){
    $row['image'] = json_decode($row['image']); // konversi JSON array menjadi array PHP
    $products[] = $row;
}

echo json_encode($products);
?>
