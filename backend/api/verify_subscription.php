<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once '../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $subscription_id = $input['subscription_id'];
    $action = $input['action']; // 'verified' atau 'rejected'
    $rejection_reason = $input['rejection_reason'] ?? '';
    
    $db->beginTransaction();
    
    if ($action === 'verified') {
        // Ambil data subscription
        $query = "SELECT duration_months, store_id, package_tier FROM subscriptions WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $subscription_id);
        $stmt->execute();
        $sub = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Hitung start & expire date
        $starts_at = date('Y-m-d H:i:s');
        $expires_at = date('Y-m-d H:i:s', strtotime("+{$sub['duration_months']} months"));
        
        // Update subscription
        $query = "UPDATE subscriptions 
                  SET status = 'verified', 
                      starts_at = :starts_at,
                      expires_at = :expires_at,
                      admin_note = 'Pembayaran terverifikasi',
                      updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':starts_at', $starts_at);
        $stmt->bindParam(':expires_at', $expires_at);
        $stmt->bindParam(':id', $subscription_id);
        $stmt->execute();
        
        // Update store package tier dan expires
        $query = "UPDATE stores 
                  SET package_tier = :package_tier,
                      package_expires_at = :expires_at,
                      updated_at = NOW()
                  WHERE id = :store_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':package_tier', $sub['package_tier']);
        $stmt->bindParam(':expires_at', $expires_at);
        $stmt->bindParam(':store_id', $sub['store_id']);
        $stmt->execute();
        
        $message = 'Subscription berhasil diverifikasi!';
        
    } else {
        // Reject
        $query = "UPDATE subscriptions 
                  SET status = 'rejected', 
                      admin_note = :note,
                      updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':note', $rejection_reason);
        $stmt->bindParam(':id', $subscription_id);
        $stmt->execute();
        
        $message = 'Subscription berhasil ditolak!';
    }
    
    $db->commit();
    echo json_encode(['success' => true, 'message' => $message]);
    
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>