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
$new_shipping_status = $data['shipping_status'] ?? null;

// Validasi status yang diizinkan untuk seller
$allowed_statuses = ['processing', 'shipped', 'delivered'];

if (!$invoice_id || !$new_shipping_status || !in_array($new_shipping_status, $allowed_statuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $seller_id = $_SESSION['user_id'];
    
    // Cek apakah order milik seller ini dan sudah diapprove admin
    $checkQuery = "SELECT id, status, shipping_status 
                   FROM invoices 
                   WHERE id = :id AND seller_id = :seller_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $invoice_id);
    $checkStmt->bindParam(':seller_id', $seller_id);
    $checkStmt->execute();
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    
    // Cek apakah pembayaran sudah diverifikasi admin
    if ($order['status'] !== 'verified') {
        echo json_encode(['success' => false, 'message' => 'Order belum diverifikasi admin']);
        exit;
    }
    
    // Validasi flow status
    $current = $order['shipping_status'];
    
    if ($current === 'pending' && $new_shipping_status !== 'processing') {
        echo json_encode(['success' => false, 'message' => 'Order harus diproses terlebih dahulu']);
        exit;
    }
    
    if ($current === 'processing' && $new_shipping_status === 'delivered') {
        echo json_encode(['success' => false, 'message' => 'Order harus dikirim terlebih dahulu']);
        exit;
    }
    
    if ($current === 'delivered') {
        echo json_encode(['success' => false, 'message' => 'Order sudah dalam status delivered, menunggu konfirmasi buyer']);
        exit;
    }
    
    // Update shipping_status
    $updateQuery = "UPDATE invoices 
                    SET shipping_status = :shipping_status, 
                        updated_at = NOW() 
                    WHERE id = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':shipping_status', $new_shipping_status);
    $updateStmt->bindParam(':id', $invoice_id);
    $updateStmt->execute();
    
    $statusText = [
        'processing' => 'Order sedang diproses/dibungkus',
        'shipped' => 'Order sudah dikirim',
        'delivered' => 'Order sudah sampai di tujuan'
    ];
    
    echo json_encode([
        'success' => true,
        'message' => $statusText[$new_shipping_status]
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>