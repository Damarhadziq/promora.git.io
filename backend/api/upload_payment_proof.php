<?php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    // Cek apakah ada file
    if (!isset($_FILES['payment_proof']) || $_FILES['payment_proof']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'File tidak valid']);
        exit;
    }
    
    // Ambil invoice IDs dari POST (array)
    $invoice_ids_json = $_POST['invoice_ids'] ?? '[]';
    $invoice_ids = json_decode($invoice_ids_json, true);
    
    if (empty($invoice_ids) || !is_array($invoice_ids)) {
        echo json_encode(['success' => false, 'message' => 'Invoice IDs tidak ditemukan']);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    $user_id = $_SESSION['user_id'];
    
    // Validasi file
    $file = $_FILES['payment_proof'];
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png'];
    $max_size = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'Format file harus JPG atau PNG']);
        exit;
    }
    
    if ($file['size'] > $max_size) {
        echo json_encode(['success' => false, 'message' => 'Ukuran file maksimal 5MB']);
        exit;
    }
    
    // Upload file
    $upload_dir = '../../uploads/payments/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = 'payment_' . time() . '_' . uniqid() . '.' . $file_extension;
    $upload_path = $upload_dir . $new_filename;
    
    if (!move_uploaded_file($file['tmp_name'], $upload_path)) {
        echo json_encode(['success' => false, 'message' => 'Gagal upload file']);
        exit;
    }
    
    // Update SEMUA invoice dengan bukti bayar yang sama
    $db->beginTransaction();
    
    $placeholders = implode(',', array_fill(0, count($invoice_ids), '?'));
    $query = "UPDATE invoices 
              SET payment_proof = ?, 
                  status = 'waiting',
                  updated_at = CURRENT_TIMESTAMP
              WHERE id IN ($placeholders) 
              AND user_id = ?";
    
    $stmt = $db->prepare($query);
    $params = array_merge([$new_filename], $invoice_ids, [$user_id]);
    $stmt->execute($params);
    
    $affected_rows = $stmt->rowCount();
    
    if ($affected_rows > 0) {
        $db->commit();
        echo json_encode([
            'success' => true, 
            'message' => $affected_rows > 1 
                ? "Bukti pembayaran berhasil dikirim untuk $affected_rows invoice" 
                : "Bukti pembayaran berhasil dikirim",
            'affected_invoices' => $affected_rows,
            'filename' => $new_filename
        ]);
    } else {
        $db->rollBack();
        // Hapus file yang sudah diupload jika gagal update database
        if (file_exists($upload_path)) {
            unlink($upload_path);
        }
        echo json_encode(['success' => false, 'message' => 'Tidak ada invoice yang diupdate']);
    }
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    // Hapus file jika ada error
    if (isset($upload_path) && file_exists($upload_path)) {
        unlink($upload_path);
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>