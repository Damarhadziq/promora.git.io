<?php
// ============================================
// FIXED - create_subscription.php
// ============================================

// Matikan error display, log saja
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/subscription_errors.log');

// Bersihkan semua output buffer
while (ob_get_level()) {
    ob_end_clean();
}
ob_start();

// Start session dengan error handling
try {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
} catch (Exception $e) {
    error_log("Session start failed: " . $e->getMessage());
}

// Set header JSON
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

// Function untuk kirim response
function sendResponse($data) {
    while (ob_get_level()) {
        ob_end_clean();
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Log semua request
error_log("=== NEW SUBSCRIPTION REQUEST ===");
error_log("SESSION: " . json_encode($_SESSION));
error_log("POST: " . json_encode($_POST));
error_log("FILES: " . json_encode(array_map(function($file) {
    return [
        'name' => $file['name'],
        'size' => $file['size'],
        'error' => $file['error']
    ];
}, $_FILES)));

// Cek session
if (!isset($_SESSION['user_id'])) {
    error_log("No user_id in session");
    sendResponse([
        'success' => false, 
        'message' => 'Silakan login terlebih dahulu!',
        'redirect' => 'lamanLogin.html'
    ]);
}

try {
    // Load database
    $db_path = __DIR__ . '/../config/db.php';
    if (!file_exists($db_path)) {
        throw new Exception("Database config not found at: $db_path");
    }
    
    require_once $db_path;
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    error_log("Database connected successfully");
    
    // ============================================
    // GET STORE
    // ============================================
    $query = "SELECT id, store_name FROM stores WHERE user_id = :user_id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();
    $store = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$store) {
        error_log("Store not found for user_id: " . $_SESSION['user_id']);
        sendResponse([
            'success' => false, 
            'message' => 'Toko tidak ditemukan. Silakan buat toko terlebih dahulu.'
        ]);
    }
    
    error_log("Store found: " . $store['store_name'] . " (ID: " . $store['id'] . ")");
    
    // ============================================
    // VALIDATE INPUT
    // ============================================
    $required = ['package_tier', 'price', 'duration_months', 'total_price', 'payment_method'];
    $missing = [];
    
    foreach ($required as $field) {
        if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        error_log("Missing fields: " . implode(', ', $missing));
        sendResponse([
            'success' => false, 
            'message' => 'Data tidak lengkap: ' . implode(', ', $missing),
            'received' => array_keys($_POST)
        ]);
    }
    
    $package_tier = strtolower(trim($_POST['package_tier']));
    $price = intval($_POST['price']);
    $duration_months = intval($_POST['duration_months']);
    $total_price = intval($_POST['total_price']);
    $payment_method = trim($_POST['payment_method']);
    
    // Validate package
    if (!in_array($package_tier, ['gold', 'silver', 'bronze'])) {
        sendResponse([
            'success' => false, 
            'message' => 'Paket tidak valid: ' . $package_tier
        ]);
    }
    
    // Validate numbers
    if ($price <= 0 || $duration_months <= 0 || $total_price <= 0) {
        sendResponse([
            'success' => false, 
            'message' => 'Harga atau durasi tidak valid'
        ]);
    }
    
    error_log("Input validated: $package_tier, $duration_months months, Rp $total_price");
    
    // ============================================
    // VALIDATE FILE UPLOAD
    // ============================================
    if (!isset($_FILES['payment_proof'])) {
        sendResponse([
            'success' => false, 
            'message' => 'Bukti pembayaran belum dipilih'
        ]);
    }
    
    $file = $_FILES['payment_proof'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File terlalu besar (melebihi batas server)',
            UPLOAD_ERR_FORM_SIZE => 'File terlalu besar (melebihi batas form)',
            UPLOAD_ERR_PARTIAL => 'File hanya terupload sebagian',
            UPLOAD_ERR_NO_FILE => 'Tidak ada file yang dipilih',
            UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ditemukan',
            UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk',
            UPLOAD_ERR_EXTENSION => 'Upload diblokir oleh extension'
        ];
        
        $errorMsg = $errors[$file['error']] ?? 'Upload error: ' . $file['error'];
        error_log("Upload error: $errorMsg");
        
        sendResponse([
            'success' => false, 
            'message' => $errorMsg
        ]);
    }
    
    error_log("File received: " . $file['name'] . " (" . $file['size'] . " bytes)");
    
    // Validate MIME
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!in_array($mime, $allowed_types)) {
        sendResponse([
            'success' => false, 
            'message' => 'Format file tidak valid. Hanya JPG/PNG yang diperbolehkan.',
            'received_type' => $mime
        ]);
    }
    
    // Validate size (5MB)
    if ($file['size'] > 5242880) {
        sendResponse([
            'success' => false, 
            'message' => 'File terlalu besar. Maksimal 5MB.',
            'file_size' => round($file['size'] / 1024 / 1024, 2) . ' MB'
        ]);
    }
    
    // ============================================
    // SAVE FILE
    // ============================================
    $upload_dir = __DIR__ . '/../../uploads/subscription_payments/';
    
    if (!is_dir($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            error_log("Failed to create directory: $upload_dir");
            sendResponse([
                'success' => false, 
                'message' => 'Gagal membuat folder upload'
            ]);
        }
    }
    
    if (!is_writable($upload_dir)) {
        error_log("Directory not writable: $upload_dir");
        sendResponse([
            'success' => false, 
            'message' => 'Folder upload tidak bisa ditulis'
        ]);
    }
    
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = 'payment_' . $store['id'] . '_' . time() . '_' . uniqid() . '.' . $ext;
    $filepath = $upload_dir . $filename;
    
    error_log("Saving file to: $filepath");
    
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        error_log("Failed to move uploaded file");
        sendResponse([
            'success' => false, 
            'message' => 'Gagal menyimpan file'
        ]);
    }
    
    error_log("File saved: $filename");
    
    // ============================================
    // INSERT DATABASE
    // ============================================
    $query = "INSERT INTO subscriptions 
              (user_id, store_id, package_tier, duration_months, price, total_price, 
               payment_method, payment_proof, status, created_at) 
              VALUES 
              (:user_id, :store_id, :package_tier, :duration_months, :price, :total_price, 
               :payment_method, :payment_proof, 'waiting', NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->bindParam(':store_id', $store['id'], PDO::PARAM_INT);
    $stmt->bindParam(':package_tier', $package_tier, PDO::PARAM_STR);
    $stmt->bindParam(':duration_months', $duration_months, PDO::PARAM_INT);
    $stmt->bindParam(':price', $price, PDO::PARAM_INT);
    $stmt->bindParam(':total_price', $total_price, PDO::PARAM_INT);
    $stmt->bindParam(':payment_method', $payment_method, PDO::PARAM_STR);
    $stmt->bindParam(':payment_proof', $filename, PDO::PARAM_STR);
    
    if (!$stmt->execute()) {
        // Rollback file
        if (file_exists($filepath)) {
            unlink($filepath);
        }
        
        error_log("Database insert failed: " . json_encode($stmt->errorInfo()));
        sendResponse([
            'success' => false, 
            'message' => 'Gagal menyimpan ke database'
        ]);
    }
    
    $subscription_id = $db->lastInsertId();
    error_log("Subscription created: ID=$subscription_id");
    
    sendResponse([
        'success' => true, 
        'message' => 'Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin.',
        'subscription_id' => $subscription_id,
        'package' => ucfirst($package_tier),
        'duration' => $duration_months . ' bulan'
    ]);
    
} catch (PDOException $e) {
    if (isset($filepath) && file_exists($filepath)) {
        unlink($filepath);
    }
    
    error_log("PDO Exception: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    sendResponse([
        'success' => false, 
        'message' => 'Terjadi kesalahan database. Silakan coba lagi.'
    ]);
    
} catch (Exception $e) {
    if (isset($filepath) && file_exists($filepath)) {
        unlink($filepath);
    }
    
    error_log("General Exception: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    sendResponse([
        'success' => false, 'message' => 'Terjadi kesalahan server. Silakan coba lagi.'
    ]);
}
?>