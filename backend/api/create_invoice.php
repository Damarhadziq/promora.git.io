<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $user_id = $_SESSION['user_id'];
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    $cart_items = $data['cart_items'] ?? [];
    $payment_method = $data['payment_method'] ?? '';
    $courier_data = $data['courier_data'] ?? null;
    
    if (empty($cart_items) || empty($payment_method) || !$courier_data) {
        echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
        exit;
    }
    
    // Start transaction
    $db->beginTransaction();
    
    // PERBAIKAN: Cek stok dan kurangi dalam 1 loop
    $total_price = 0;
    $total_fee = 0;
    $seller_id = null;
    $products_data = []; // Simpan data produk untuk digunakan nanti
    
    foreach ($cart_items as $item) {
        // Lock row dan ambil data produk
        $query = "SELECT id, price, fee, seller_id, stock FROM products WHERE id = :id FOR UPDATE";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $item['product_id']);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => 'Produk tidak ditemukan']);
            exit;
        }
        
        // Cek apakah stok cukup
        if ($product['stock'] < $item['quantity']) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => 'Stok tidak cukup untuk produk: ' . $product['id']]);
            exit;
        }
        
        // Set seller_id (ambil dari produk pertama)
        if ($seller_id === null) {
            $seller_id = $product['seller_id'];
        }
        
        // Hitung total
        $total_price += $product['price'] * $item['quantity'];
        $total_fee += $product['fee'];
        
        // Simpan data produk untuk nanti
        $products_data[] = [
            'id' => $product['id'],
            'price' => $product['price'],
            'fee' => $product['fee'],
            'quantity' => $item['quantity'],
            'new_stock' => $product['stock'] - $item['quantity']
        ];
    }
    
    // Sekarang kurangi stok semua produk setelah validasi selesai
    foreach ($products_data as $prod) {
        $update_query = "UPDATE products SET stock = :new_stock WHERE id = :id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':new_stock', $prod['new_stock']);
        $update_stmt->bindParam(':id', $prod['id']);
        $update_stmt->execute();
    }
    
    $shipping_cost = $courier_data['price'];
    $grand_total = $total_price + $total_fee + $shipping_cost;
    
    // Generate invoice number
    $invoice_number = 'INV-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
    
    // Insert invoice
    $query = "INSERT INTO invoices (invoice_number, user_id, seller_id, total_price, total_fee, 
              shipping_cost, grand_total, payment_method, courier_method, courier_estimate, status) 
              VALUES (:invoice_number, :user_id, :seller_id, :total_price, :total_fee, 
              :shipping_cost, :grand_total, :payment_method, :courier_method, :courier_estimate, 'pending')";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':invoice_number', $invoice_number);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':seller_id', $seller_id);
    $stmt->bindParam(':total_price', $total_price);
    $stmt->bindParam(':total_fee', $total_fee);
    $stmt->bindParam(':shipping_cost', $shipping_cost);
    $stmt->bindParam(':grand_total', $grand_total);
    $stmt->bindParam(':payment_method', $payment_method);
    $stmt->bindParam(':courier_method', $courier_data['type']);
    $stmt->bindParam(':courier_estimate', $courier_data['estimate']);
    $stmt->execute();
    
    $invoice_id = $db->lastInsertId();
    
    // Insert invoice items (gunakan data yang sudah disimpan)
    foreach ($products_data as $prod) {
        $subtotal = ($prod['price'] * $prod['quantity']) + $prod['fee'];
        
        $query = "INSERT INTO invoice_items (invoice_id, product_id, quantity, price, fee, subtotal) 
                  VALUES (:invoice_id, :product_id, :quantity, :price, :fee, :subtotal)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':invoice_id', $invoice_id);
        $stmt->bindParam(':product_id', $prod['id']);
        $stmt->bindParam(':quantity', $prod['quantity']);
        $stmt->bindParam(':price', $prod['price']);
        $stmt->bindParam(':fee', $prod['fee']);
        $stmt->bindParam(':subtotal', $subtotal);
        $stmt->execute();
    }
    
    // Delete cart items
    $cart_ids = array_column($cart_items, 'cart_id');
    $placeholders = implode(',', array_fill(0, count($cart_ids), '?'));
    $query = "DELETE FROM cart WHERE user_id = ? AND id IN ($placeholders)";
    $stmt = $db->prepare($query);
    $stmt->execute(array_merge([$user_id], $cart_ids));
    
    $db->commit();
    
    echo json_encode([
        'success' => true, 
        'invoice_id' => $invoice_id,
        'invoice_number' => $invoice_number
    ]);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>