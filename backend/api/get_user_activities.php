<?php
// backend/api/get_user_activities.php
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

require_once '../config/db.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Query untuk mendapatkan semua invoice user beserta detail items
    $query = "SELECT 
                i.id,
                i.invoice_number,
                i.total_price,
                i.total_fee,
                i.shipping_cost,
                i.grand_total,
                i.payment_method,
                i.courier_method,
                i.courier_estimate,
                i.payment_proof,
                i.status,
                i.admin_note,
                i.created_at,
                i.updated_at,
                COUNT(ii.id) as total_items,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', ii.id,
                        'product_id', ii.product_id,
                        'quantity', ii.quantity,
                        'price', ii.price,
                        'fee', ii.fee,
                        'subtotal', ii.subtotal,
                        'product_name', p.name,
                        'product_image', p.image,
                        'product_brand', p.brand
                    )
                ) as items
              FROM invoices i
              LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
              LEFT JOIN products p ON ii.product_id = p.id
              WHERE i.user_id = :user_id
              GROUP BY i.id
              ORDER BY i.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $activities = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Parse items JSON
        $items = [];
        if ($row['items']) {
            $items = json_decode('[' . $row['items'] . ']', true);
        }
        
        // Map status database ke status display
        $statusMap = [
            'pending' => 'pending',      // Belum upload bukti
            'verified' => 'waiting',     // Sudah upload, menunggu verifikasi
            'rejected' => 'rejected',    // Ditolak admin
            'completed' => 'success'     // Sudah diverifikasi & selesai
        ];
        
        $displayStatus = $statusMap[$row['status']] ?? 'pending';
        
        // Jika sudah upload bukti tapi masih pending, ubah jadi waiting
        if ($row['status'] === 'pending' && $row['payment_proof']) {
            $displayStatus = 'waiting';
        }
        
        $activities[] = [
            'id' => $row['id'],
            'invoice_number' => $row['invoice_number'],
            'grand_total' => $row['grand_total'],
            'status' => $row['status'], // Status database asli
            'display_status' => $displayStatus, // Status untuk tampilan
            'payment_proof' => $row['payment_proof'],
            'admin_note' => $row['admin_note'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'total_items' => $row['total_items'],
            'items' => $items,
            'payment_method' => $row['payment_method'],
            'courier_method' => $row['courier_method'],
            'total_price' => $row['total_price'],
            'total_fee' => $row['total_fee'],
            'shipping_cost' => $row['shipping_cost']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'activities' => $activities
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>