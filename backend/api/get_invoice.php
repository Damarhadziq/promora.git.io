<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$invoice_id = $_GET['invoice_id'] ?? null;

if (!$invoice_id) {
    echo json_encode(['success' => false, 'message' => 'Invoice ID required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get invoice
    $query = "SELECT * FROM invoices WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $invoice_id);
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$invoice) {
        echo json_encode(['success' => false, 'message' => 'Invoice not found']);
        exit;
    }
    
    // Get invoice items
    $query = "SELECT ii.*, p.name, p.brand, p.image 
              FROM invoice_items ii 
              JOIN products p ON ii.product_id = p.id 
              WHERE ii.invoice_id = :invoice_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':invoice_id', $invoice_id);
    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $invoice['items'] = $items;
    
    echo json_encode(['success' => true, 'invoice' => $invoice]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>