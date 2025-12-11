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
    
    $status = $_GET['status'] ?? 'waiting';
    $search = $_GET['search'] ?? '';
    $date_filter = $_GET['date_filter'] ?? '';
    
    $query = "SELECT s.*, 
              CONCAT(u.first_name, ' ', u.last_name) as seller_name,
              u.email as seller_email,
              st.store_name,
              st.logo
              FROM subscriptions s
              JOIN users u ON s.user_id = u.id
              JOIN stores st ON s.store_id = st.id
              WHERE 1=1";
    
    if ($status !== 'all') {
        $query .= " AND s.status = :status";
    }
    
    if ($search) {
        $query .= " AND (u.first_name LIKE :search OR u.last_name LIKE :search 
                    OR u.email LIKE :search OR st.store_name LIKE :search)";
    }
    
    switch ($date_filter) {
        case 'today':
            $query .= " AND DATE(s.created_at) = CURDATE()";
            break;
        case 'week':
            $query .= " AND s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            break;
        case 'month':
            $query .= " AND MONTH(s.created_at) = MONTH(NOW())";
            break;
    }
    
    $query .= " ORDER BY s.created_at DESC";
    
    $stmt = $db->prepare($query);
    
    if ($status !== 'all') {
        $stmt->bindParam(':status', $status);
    }
    
    if ($search) {
        $search_param = "%$search%";
        $stmt->bindParam(':search', $search_param);
    }
    
    $stmt->execute();
    $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $subscriptions]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>