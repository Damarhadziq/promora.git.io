<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$invoice_id = $_POST['invoice_id'] ?? null;

if (!$invoice_id || !isset($_FILES['payment_proof'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Upload file
    $file = $_FILES['payment_proof'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'payment_' . $invoice_id . '_' . time() . '.' . $ext;
    $upload_dir = '../../uploads/payments/';
    
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $filepath = $upload_dir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Update invoice
        $query = "UPDATE invoices SET payment_proof = :proof, status = 'pending' 
                  WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':proof', $filename);
        $stmt->bindParam(':id', $invoice_id);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Upload failed']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>