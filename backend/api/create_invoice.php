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
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $cart_items = $data['cart_items'] ?? [];
    $payment_method = $data['payment_method'] ?? '';
    $courier_data = $data['courier_data'] ?? null;
    
    if (empty($cart_items) || empty($payment_method) || !$courier_data) {
        echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
        exit;
    }
    
    $db->beginTransaction();
    
    // ===== STEP 1: GROUP PRODUCTS BY SELLER =====
    $products_by_seller = [];
    
    foreach ($cart_items as $item) {
        $query = "SELECT p.id, p.price, p.fee, p.seller_id, p.stock, p.name 
                  FROM products p
                  WHERE p.id = :id FOR UPDATE";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $item['product_id']);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => 'Produk tidak ditemukan']);
            exit;
        }
        
        if ($product['stock'] < $item['quantity']) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => 'Stok tidak cukup untuk: ' . $product['name']]);
            exit;
        }
        
        $seller_id = $product['seller_id'];
        
        // Group by seller
        if (!isset($products_by_seller[$seller_id])) {
            $products_by_seller[$seller_id] = [];
        }
        
        $products_by_seller[$seller_id][] = [
            'id' => $product['id'],
            'price' => $product['price'],
            'fee' => $product['fee'],
            'quantity' => $item['quantity'],
            'cart_id' => $item['cart_id'],
            'stock' => $product['stock']
        ];
    }
    
    // ===== STEP 2: CREATE SEPARATE INVOICE FOR EACH SELLER =====
    $created_invoices = [];
    
    // Hitung total price dari semua produk untuk proporsi ongkir
    $all_total_price = 0;
    foreach ($products_by_seller as $products) {
        foreach ($products as $prod) {
            $all_total_price += $prod['price'] * $prod['quantity'];
        }
    }
    
    foreach ($products_by_seller as $seller_id => $products) {
        $total_price = 0;
        $total_fee = 0;
        
        foreach ($products as $prod) {
            $total_price += $prod['price'] * $prod['quantity'];
            $total_fee += $prod['fee'];
        }
        
        // Bagi ongkir secara proporsional berdasarkan total_price
        $shipping_cost = round(($total_price / $all_total_price) * $courier_data['price']);
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
        
        // Insert invoice items & update stock
        foreach ($products as $prod) {
            $subtotal = ($prod['price'] * $prod['quantity']) + $prod['fee'];
            
            // Insert invoice item
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
            
            // Update stock
            $new_stock = $prod['stock'] - $prod['quantity'];
            $update_query = "UPDATE products SET stock = :new_stock WHERE id = :id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':new_stock', $new_stock);
            $update_stmt->bindParam(':id', $prod['id']);
            $update_stmt->execute();
        }
        
        $created_invoices[] = [
            'invoice_id' => $invoice_id,
            'invoice_number' => $invoice_number,
            'seller_id' => $seller_id,
            'grand_total' => $grand_total
        ];
    }
    
    // ===== STEP 3: DELETE CART ITEMS =====
    $cart_ids = array_column($cart_items, 'cart_id');
    $placeholders = implode(',', array_fill(0, count($cart_ids), '?'));
    $query = "DELETE FROM cart WHERE user_id = ? AND id IN ($placeholders)";
    $stmt = $db->prepare($query);
    $stmt->execute(array_merge([$user_id], $cart_ids));
    
    $db->commit();
    
    // Return multiple invoices or single invoice
    echo json_encode([
        'success' => true, 
        'invoices' => $created_invoices,
        'invoice_id' => $created_invoices[0]['invoice_id'], // For backward compatibility
        'invoice_number' => $created_invoices[0]['invoice_number'],
        'message' => count($created_invoices) > 1 
            ? 'Berhasil membuat ' . count($created_invoices) . ' invoice dari ' . count($created_invoices) . ' seller berbeda' 
            : 'Invoice berhasil dibuat'
    ]);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>