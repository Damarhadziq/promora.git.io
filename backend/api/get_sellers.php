<?php
// api/get_sellers.php
session_start();
require_once '../config/db.php';

// Cek apakah admin sudah login
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');

$status = $_GET['status'] ?? 'pending';
$search = $_GET['search'] ?? '';
$dateFilter = $_GET['date_filter'] ?? '';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // PENTING: Tambahkan filter role = 'seller'
    $query = "SELECT id, first_name, last_name, username, email, phone, ktp_photo, 
              is_verified, created_at, verified_at, rejection_reason, role
              FROM users 
              WHERE role = 'seller'"; // <<<< FILTER ROLE SELLER
    
    $params = [];

    // Filter berdasarkan status verifikasi
    if ($status === 'pending') {
        $query .= " AND is_verified = 0 AND (rejection_reason IS NULL OR rejection_reason = '')";
    } elseif ($status === 'verified') {
        $query .= " AND is_verified = 1";
    } elseif ($status === 'rejected') {
        $query .= " AND is_verified = 0 AND rejection_reason IS NOT NULL AND rejection_reason != ''";
    }

    // Filter pencarian
    if (!empty($search)) {
        $query .= " AND (first_name LIKE :search OR last_name LIKE :search 
                    OR username LIKE :search OR email LIKE :search)";
        $params[':search'] = "%$search%";
    }

    // Filter tanggal
    if ($dateFilter === 'today') {
        $query .= " AND DATE(created_at) = CURDATE()";
    } elseif ($dateFilter === 'week') {
        $query .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } elseif ($dateFilter === 'month') {
        $query .= " AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())";
    }

    $query .= " ORDER BY created_at DESC";

    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $sellers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Tambahkan status field untuk kemudahan frontend
    foreach ($sellers as &$seller) {
        if ($seller['is_verified'] == 1) {
            $seller['status'] = 'verified';
        } elseif (!empty($seller['rejection_reason'])) {
            $seller['status'] = 'rejected';
        } else {
            $seller['status'] = 'pending';
        }
    }

    echo json_encode(['success' => true, 'data' => $sellers]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan server: ' . $e->getMessage()]);
}
?>