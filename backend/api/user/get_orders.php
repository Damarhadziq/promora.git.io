<?php
session_start();
require_once '../../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT 
                i.id,
                i.invoice_number,
                i.grand_total,
                i.status,
                i.shipping_status,
                i.payment_method,
                i.courier_method,
                i.created_at,
                i.updated_at
            FROM invoices i
            WHERE i.user_id = :user_id
            ORDER BY i.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute(['user_id' => $user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get items for each order
    foreach ($orders as &$order) {
        $itemStmt = $db->prepare("
            SELECT 
                p.name as product_name,
                p.image as product_image,
                ii.quantity,
                ii.subtotal
            FROM invoice_items ii
            JOIN products p ON ii.product_id = p.id
            WHERE ii.invoice_id = :invoice_id
        ");
        $itemStmt->execute(['invoice_id' => $order['id']]);
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode(['success' => true, 'orders' => $orders]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}