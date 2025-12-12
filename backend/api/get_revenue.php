<?php
header('Content-Type: application/json');
require_once '../config/db.php';

// Inisialisasi koneksi database
$database = new Database();
$conn = $database->getConnection();

// Cek apakah koneksi berhasil
if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal'
    ]);
    exit;
}

$type = $_GET['type'] ?? 'product';
$dateFilter = $_GET['date_filter'] ?? '';

// Fee percentages based on tier and product type
$feeRates = [
    'gold' => ['Lokal' => 2, 'Inter' => 5],
    'silver' => ['Lokal' => 3.5, 'Inter' => 7],
    'bronze' => ['Lokal' => 4, 'Inter' => 8],
    'basic' => ['Lokal' => 5, 'Inter' => 10]
];

// Subscription prices per month
$subscriptionPrices = [
    'gold' => 199000,
    'silver' => 99000,
    'bronze' => 49000
];

try {
    if ($type === 'product') {
        // Query untuk pendapatan dari pembelian produk
        // PERUBAHAN: Ambil tier_at_purchase dari invoice_items, bukan dari stores
        $sql = "SELECT 
                    i.invoice_number,
                    ii.product_id,
                    p.name as product_name,
                    p.product_type,
                    ii.quantity,
                    ii.subtotal,
                    s.store_name,
                    CONCAT(u.first_name, ' ', u.last_name) as seller_name,
                    COALESCE(ii.tier_at_purchase, s.package_tier, 'basic') as tier,
                    i.updated_at as completed_at
                FROM invoices i
                JOIN invoice_items ii ON i.id = ii.invoice_id
                JOIN products p ON ii.product_id = p.id
                JOIN stores s ON p.seller_id = s.user_id
                JOIN users u ON s.user_id = u.id
                WHERE i.shipping_status = 'completed'";
        
        // Date filter
        if ($dateFilter === 'today') {
            $sql .= " AND DATE(i.updated_at) = CURDATE()";
        } elseif ($dateFilter === 'week') {
            $sql .= " AND i.updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        } elseif ($dateFilter === 'month') {
            $sql .= " AND MONTH(i.updated_at) = MONTH(CURDATE()) AND YEAR(i.updated_at) = YEAR(CURDATE())";
        }
        
        $sql .= " ORDER BY i.updated_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate revenue for each transaction
        $totalRevenue = 0;
        foreach ($results as &$row) {
            $tier = $row['tier'];
            $productType = $row['product_type'];
            $feePercentage = $feeRates[$tier][$productType] ?? 5;
            
            $revenue = ($row['subtotal'] * $feePercentage) / 100;
            $row['fee_percentage'] = $feePercentage;
            $row['revenue'] = round($revenue);
            $totalRevenue += $revenue;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $results,
            'total_revenue' => round($totalRevenue)
        ]);
        
    } else if ($type === 'subscription') {
        // Query untuk pendapatan dari subscription
        $sql = "SELECT 
                    sub.id,
                    sub.package_tier,
                    sub.duration_months,
                    sub.total_price,
                    s.store_name,
                    CONCAT(u.first_name, ' ', u.last_name) as seller_name,
                    sub.updated_at as verified_at
                FROM subscriptions sub
                JOIN stores s ON sub.store_id = s.id
                JOIN users u ON sub.user_id = u.id
                WHERE sub.status = 'verified'";
        
        // Date filter
        if ($dateFilter === 'today') {
            $sql .= " AND DATE(sub.updated_at) = CURDATE()";
        } elseif ($dateFilter === 'week') {
            $sql .= " AND sub.updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        } elseif ($dateFilter === 'month') {
            $sql .= " AND MONTH(sub.updated_at) = MONTH(CURDATE()) AND YEAR(sub.updated_at) = YEAR(CURDATE())";
        }
        
        $sql .= " ORDER BY sub.updated_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add price per month info
        $totalRevenue = 0;
        foreach ($results as &$row) {
            $row['price_per_month'] = $subscriptionPrices[$row['package_tier']] ?? 0;
            $totalRevenue += $row['total_price'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $results,
            'total_revenue' => $totalRevenue
        ]);
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid type']);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>