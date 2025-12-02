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

$status = $_GET['status'] ?? 'pending';
$search = $_GET['search'] ?? '';
$dateFilter = $_GET['date_filter'] ?? '';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Query utama untuk invoices
    $query = "SELECT 
                i.id,
                i.invoice_number,
                i.grand_total,
                i.payment_method,
                i.payment_proof,
                i.status,
                i.admin_note,
                i.created_at,
                i.updated_at,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email
              FROM invoices i
              JOIN users u ON i.user_id = u.id
              WHERE 1=1";
    
    // Filter by status
    if ($status !== 'all') {
        $query .= " AND i.status = :status";
    }
    
    // Search filter
    if (!empty($search)) {
        $query .= " AND (i.invoice_number LIKE :search 
                    OR u.first_name LIKE :search 
                    OR u.last_name LIKE :search
                    OR u.email LIKE :search)";
    }
    
    // Date filter
    if ($dateFilter === 'today') {
        $query .= " AND DATE(i.updated_at) = CURDATE()";
    } elseif ($dateFilter === 'week') {
        $query .= " AND i.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } elseif ($dateFilter === 'month') {
        $query .= " AND MONTH(i.updated_at) = MONTH(NOW()) AND YEAR(i.updated_at) = YEAR(NOW())";
    }
    
    $query .= " ORDER BY i.updated_at DESC";
    
    $stmt = $db->prepare($query);
    
    if ($status !== 'all') {
        $stmt->bindParam(':status', $status);
    }
    
    if (!empty($search)) {
        $searchTerm = "%$search%";
        $stmt->bindParam(':search', $searchTerm);
    }
    
    $stmt->execute();
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Ambil items untuk setiap invoice secara terpisah
    foreach ($payments as &$payment) {
        // PERBAIKAN: Payment proof ada di uploads/payments (TIDAK di dalam folder backend)
        if (!empty($payment['payment_proof'])) {
            // Jika hanya nama file, tambahkan folder uploads/payments/
            if (strpos($payment['payment_proof'], '/') === false) {
                $payment['payment_proof'] = 'uploads/payments/' . $payment['payment_proof'];
            }
            // Jika sudah ada path tapi tidak ada uploads/, tambahkan
            else if (strpos($payment['payment_proof'], 'uploads/') === false) {
                $payment['payment_proof'] = 'uploads/payments/' . basename($payment['payment_proof']);
            }
        }
        
        $itemStmt = $db->prepare("
            SELECT 
                p.name as product_name,
                p.image as product_image,
                ii.quantity,
                ii.price,
                ii.subtotal
            FROM invoice_items ii
            JOIN products p ON ii.product_id = p.id
            WHERE ii.invoice_id = :invoice_id
        ");
        $itemStmt->execute(['invoice_id' => $payment['id']]);
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // PERBAIKAN: Product image ada di assets/img
        foreach ($items as &$item) {
            if (!empty($item['product_image'])) {
                // Hapus prefix yang tidak perlu
                $cleanPath = str_replace(['./backend/', './'], '', $item['product_image']);
                
                // Foto produk ada di assets/img
                $item['product_image'] = $cleanPath;
            }
        }
        unset($item); // Break reference
        
        // Convert items to JSON string
        $payment['items'] = json_encode($items);
        $payment['total_items'] = count($items);
    }
    unset($payment); // Break reference
    
    echo json_encode([
        'success' => true,
        'data' => $payments,
        'count' => count($payments)
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