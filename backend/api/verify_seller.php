<?php
// api/verify_seller.php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$sellerId = intval($input['seller_id'] ?? 0);
$action = $input['action'] ?? ''; // 'verified' atau 'rejected'
$rejectionReason = trim($input['rejection_reason'] ?? '');

if ($sellerId <= 0 || !in_array($action, ['verified', 'rejected'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
    exit;
}

if ($action === 'rejected' && empty($rejectionReason)) {
    echo json_encode(['success' => false, 'message' => 'Alasan penolakan wajib diisi']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $db->beginTransaction();

    if ($action === 'verified') {
        $stmt = $db->prepare("UPDATE users SET is_verified = 1, verified_at = NOW(), 
                               verified_by = :admin_id, rejection_reason = NULL 
                               WHERE id = :seller_id");
        $stmt->bindParam(':admin_id', $_SESSION['admin_id']);
        $stmt->bindParam(':seller_id', $sellerId);
        $stmt->execute();
        $message = 'Seller berhasil diverifikasi';
    } else {
        $stmt = $db->prepare("UPDATE users SET is_verified = 0, rejection_reason = :reason, 
                               verified_by = :admin_id, verified_at = NOW() 
                               WHERE id = :seller_id");
        $stmt->bindParam(':reason', $rejectionReason);
        $stmt->bindParam(':admin_id', $_SESSION['admin_id']);
        $stmt->bindParam(':seller_id', $sellerId);
        $stmt->execute();
        $message = 'Seller ditolak';
    }

    $db->commit();
    echo json_encode(['success' => true, 'message' => $message]);

} catch(PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan server: ' . $e->getMessage()]);
}
?>