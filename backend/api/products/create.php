<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// koneksi database
$mysqli = new mysqli("localhost", "root", "", "db_promora");

if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

$response = [];

try {
    // Handle file upload - UBAH BAGIAN INI
    $imagePaths = [null, null, null, null, null]; // Array untuk 5 gambar
    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        $uploadDir = '../../../assets/img/';
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if ($key >= 5) break; // Maksimal 5 gambar
            
            if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                $fileName = time() . '_' . $key . '_' . basename($_FILES['images']['name'][$key]);
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($tmp_name, $targetPath)) {
                    $imagePaths[$key] = './assets/img/' . $fileName;
                }
            }
        }
    }

    if (!$imagePaths[0]) {
        throw new Exception("Minimal 1 gambar harus diupload.");
    }


    // Ambil data form
    $seller_id      = intval($_POST['seller_id']);
    $name           = $mysqli->real_escape_string($_POST['name']);
    $brand          = $mysqli->real_escape_string($_POST['brand']);
    $category       = $mysqli->real_escape_string($_POST['category']);
    $price          = intval($_POST['price']);
    $original_price = intval($_POST['original_price']);
    $discount       = intval($_POST['discount']);
    $fee            = intval($_POST['fee']);
    $stock          = intval($_POST['stock']);
    $description    = $mysqli->real_escape_string($_POST['description']);
    $location       = $mysqli->real_escape_string($_POST['location']);

    // Insert ke database (TANPA verified, TOTAL 12 kolom)
    // Insert ke database - UBAH BAGIAN INI
    $stmt = $mysqli->prepare("INSERT INTO products 
        (seller_id, name, brand, category, price, original_price, discount, fee, stock, description, location, image, image2, image3, image4, image5)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("isssiiiiisssssss", 
        $seller_id,      // i
        $name,           // s
        $brand,          // s
        $category,       // s
        $price,          // i
        $original_price, // i
        $discount,       // i
        $fee,            // i
        $stock,          // i
        $description,    // s
        $location,       // s
        $imagePaths[0],  // s
        $imagePaths[1],  // s
        $imagePaths[2],  // s
        $imagePaths[3],  // s
        $imagePaths[4]   // s
    );

    
    if ($stmt->execute()) {
        $response["success"] = true;
        $response["message"] = "Produk berhasil dibuat.";
        $response["product_id"] = $stmt->insert_id; // ID produk yang baru dibuat
    } else {
        throw new Exception("Gagal menyimpan ke database: " . $stmt->error);
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    $response["success"] = false;
    $response["message"] = $e->getMessage();
    echo json_encode($response);
}

$mysqli->close();
?>