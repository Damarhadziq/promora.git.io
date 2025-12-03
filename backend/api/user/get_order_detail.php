<?php
session_start();
require_once '../../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$invoice_id = $_GET['id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$invoice_id) {
    echo json_encode(['success' => false, 'message' => 'Invoice ID required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT * FROM invoices WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->execute(['id' => $invoice_id, 'user_id' => $user_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    
    // Get items
    $itemStmt = $db->prepare("
        SELECT 
            p.name as product_name,
            p.image as product_image,
            p.brand as product_brand,
            ii.quantity,
            ii.price,
            ii.fee,
            ii.subtotal
        FROM invoice_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.invoice_id = :invoice_id
    ");
    $itemStmt->execute(['invoice_id' => $invoice_id]);
    $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format untuk compatibility dengan showActivityDetail
    $order['display_status'] = $order['shipping_status'] ?: 'pending';
    $order['total_items'] = count($order['items']);
    
    echo json_encode(['success' => true, 'order' => $order]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}