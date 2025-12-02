<?php
// backend/api/auto_reject_invoice.php
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

require_once '../config/db.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
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
    
    // Cek ownership dan status
    $query = "SELECT id, status, created_at FROM invoices 
              WHERE id = :invoice_id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':invoice_id', $invoice_id);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$invoice) {
        echo json_encode(['success' => false, 'message' => 'Invoice not found']);
        exit;
    }
    
    // Cek apakah sudah lewat 24 jam
    $created = strtotime($invoice['created_at']);
    $now = time();
    $diff = $now - $created;
    
    if ($diff < 86400) { // Belum 24 jam
        echo json_encode(['success' => false, 'message' => 'Belum lewat 24 jam']);
        exit;
    }
    
    // Update status jadi rejected jika masih pending
    if ($invoice['status'] === 'pending') {
        $updateQuery = "UPDATE invoices 
                       SET status = 'rejected', 
                           admin_note = 'Pembayaran melebihi batas waktu 24 jam',
                           updated_at = NOW()
                       WHERE id = :invoice_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':invoice_id', $invoice_id);
        $updateStmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Invoice auto-rejected due to timeout'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invoice status already changed'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>