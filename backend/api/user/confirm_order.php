<?php
session_start();
require_once '../../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$invoice_id = $data['invoice_id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$invoice_id) {
    echo json_encode(['success' => false, 'message' => 'Invoice ID required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Cek apakah order milik user dan sudah delivered
    $checkQuery = "SELECT id, shipping_status 
                   FROM invoices 
                   WHERE id = :id AND user_id = :user_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute(['id' => $invoice_id, 'user_id' => $user_id]);
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    
    if ($order['shipping_status'] !== 'delivered') {
        echo json_encode(['success' => false, 'message' => 'Order belum dalam status delivered']);
        exit;
    }
    
    // Update ke completed
    $updateQuery = "UPDATE invoices 
                    SET shipping_status = 'completed', 
                        updated_at = NOW() 
                    WHERE id = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute(['id' => $invoice_id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Pesanan berhasil dikonfirmasi!'
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}