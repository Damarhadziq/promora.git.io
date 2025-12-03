<?php
session_start();
require_once '../../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$seller_id = $_SESSION['user_id'];
$status = $_GET['status'] ?? 'all';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Query untuk mendapatkan orders berdasarkan seller_id
    $query = "SELECT 
                i.id,
                i.invoice_number,
                i.grand_total,
                i.payment_method,
                i.courier_method,
                i.courier_estimate,
                i.status,
                i.shipping_status,
                i.payment_proof,
                i.created_at,
                i.updated_at,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email,
                u.phone as customer_phone
            FROM invoices i
            JOIN users u ON i.user_id = u.id
            WHERE i.seller_id = :seller_id 
            AND i.status = 'verified'";
    
    $query .= " ORDER BY i.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':seller_id', $seller_id);
    
    if ($status !== 'all') {
        $stmt->bindParam(':status', $status);
    }
    
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Ambil items untuk setiap order
    foreach ($orders as &$order) {
        $itemStmt = $db->prepare("
            SELECT 
                p.name as product_name,
                p.image as product_image,
                p.brand,
                ii.quantity,
                ii.price,
                ii.fee,
                ii.subtotal
            FROM invoice_items ii
            JOIN products p ON ii.product_id = p.id
            WHERE ii.invoice_id = :invoice_id
        ");
        $itemStmt->execute(['invoice_id' => $order['id']]);
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>