<?php
// Matikan semua output HTML error
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');

try {
    // koneksi database
    $mysqli = new mysqli("localhost", "root", "", "db_promora");

    // cek koneksi
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed');
    }

    // Ambil data dari POST (FormData)
    $data = $_POST;

    // Validasi data
    if (!isset($data['id']) || empty($data['name'])) {
        throw new Exception('Invalid data: ID or Name missing');
    }

    $id = intval($data['id']);
    $name = $mysqli->real_escape_string($data['name']);
    $brand = $mysqli->real_escape_string($data['brand'] ?? '');
    $price = intval($data['price'] ?? 0);
    $fee = intval($data['fee'] ?? 0);
    $stock = intval($data['stock'] ?? 0);
    $category = $mysqli->real_escape_string($data['category'] ?? '');
    $description = $mysqli->real_escape_string($data['description'] ?? '');

    // Handle file upload - PERBAIKAN
$imagePaths = [null, null, null, null, null];

// Step 1: Load existing images yang TIDAK null/empty
for ($i = 0; $i < 5; $i++) {
    if (isset($_POST["existing_image$i"]) && !empty($_POST["existing_image$i"])) {
        $imagePaths[$i] = $mysqli->real_escape_string($_POST["existing_image$i"]);
    }
}

// Step 2: Upload gambar baru
if (isset($_FILES['images']) && is_array($_FILES['images']['tmp_name'])) {
    $uploadDir = '../../../assets/img/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $uploadedIndex = 0;
    
    foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
        if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK && !empty($tmp_name)) {
            $fileName = time() . '_' . uniqid() . '_' . basename($_FILES['images']['name'][$key]);
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($tmp_name, $targetPath)) {
                // Cari slot kosong atau replace gambar lama
                for ($i = 0; $i < 5; $i++) {
                    if ($imagePaths[$i] === null) {
                        $imagePaths[$i] = './assets/img/' . $fileName;
                        break;
                    }
                }
            }
        }
    }
}
    // Update query - SELALU UPDATE GAMBAR
    $stmt = $mysqli->prepare("UPDATE products SET 
        name=?, brand=?, price=?, fee=?, stock=?, category=?, description=?, 
        image=?, image2=?, image3=?, image4=?, image5=? 
        WHERE id=?");

    $stmt->bind_param("ssiissssssssi", 
        $name, $brand, $price, $fee, $stock, $category, $description, 
        $imagePaths[0], $imagePaths[1], $imagePaths[2], $imagePaths[3], $imagePaths[4], 
        $id
    );

    if (!$stmt->execute()) {
        throw new Exception('Failed to update: ' . $stmt->error);
    }

    echo json_encode(['success' => true, 'message' => 'Product updated successfully']);

    $stmt->close();
    $mysqli->close();

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>