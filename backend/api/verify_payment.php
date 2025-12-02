<?php
session_start();
header('Content-Type: application/json');

// Cek apakah admin sudah login
if (!isset($_SESSION['admin_id']) || empty($_SESSION['admin_id'])) {
    echo json_encode([
        'success' => false, 
        'message' => 'Unauthorized - Please login as admin first'
    ]);
    exit;
}

require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$invoiceId = $input['invoice_id'] ?? null;
$action = $input['action'] ?? null;
$rejectionReason = $input['rejection_reason'] ?? '';

if (!$invoiceId || !$action) {
    echo json_encode(['success' => false, 'message' => 'Invoice ID dan action wajib diisi']);
    exit;
}

if (!in_array($action, ['verified', 'rejected'])) {
    echo json_encode(['success' => false, 'message' => 'Action tidak valid']);
    exit;
}

if ($action === 'rejected' && empty(trim($rejectionReason))) {
    echo json_encode(['success' => false, 'message' => 'Alasan penolakan wajib diisi']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Cek apakah invoice ada
    $checkStmt = $db->prepare("SELECT id, status FROM invoices WHERE id = :id");
    $checkStmt->execute(['id' => $invoiceId]);
    $invoice = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$invoice) {
        echo json_encode(['success' => false, 'message' => 'Invoice tidak ditemukan']);
        exit;
    }
    
if ($invoice['status'] !== 'waiting') {
    echo json_encode(['success' => false, 'message' => 'Invoice tidak dalam status menunggu verifikasi']);
    exit;
}
    
    // Update status invoice
    if ($action === 'verified') {
        // PERBAIKAN: Hapus verified_at karena kolom tidak ada
        $updateStmt = $db->prepare("
            UPDATE invoices 
            SET status = 'verified', 
                updated_at = NOW()
            WHERE id = :id
        ");
        $updateStmt->execute(['id' => $invoiceId]);
        
        $message = 'Pembayaran berhasil diverifikasi';
    } else {
        $updateStmt = $db->prepare("
            UPDATE invoices 
            SET status = 'rejected', 
                admin_note = :reason,
                updated_at = NOW()
            WHERE id = :id
        ");
        $updateStmt->execute([
            'id' => $invoiceId,
            'reason' => $rejectionReason
        ]);
        
        $message = 'Pembayaran ditolak';
    }
    
    echo json_encode([
        'success' => true,
        'message' => $message
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>