<?php
// Matikan output error HTML
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');

try {

    // Koneksi ke database (PDO)
    require_once __DIR__ . "/../../config/db.php";
    $database = new Database();
    $conn = $database->getConnection();

    // Data dari POST
    $data = $_POST;

    if (!isset($data['id']) || empty($data['name'])) {
        throw new Exception('Invalid data: ID or Name missing');
    }

    $id          = intval($data['id']);
    $name        = $data['name'];
    $brand       = $data['brand'] ?? '';
    $price       = intval($data['price'] ?? 0);
    $fee         = intval($data['fee'] ?? 0);
    $stock       = intval($data['stock'] ?? 0);
    $category    = $data['category'] ?? '';
    $description = $data['description'] ?? '';

    // HANDLE GAMBAR (5 slot)
    $imagePaths = [null, null, null, null, null];

    // Step 1: Ambil existing_image0..existing_image4 jika ada
    for ($i = 0; $i < 5; $i++) {
        if (!empty($_POST["existing_image$i"])) {
            $imagePaths[$i] = $_POST["existing_image$i"];
        }
    }

    // Step 2: Upload gambar baru
    if (isset($_FILES['images']) && is_array($_FILES['images']['tmp_name'])) {

        $uploadDir = '../../../assets/img/';

        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK && !empty($tmp_name)) {

                $fileName   = time() . '_' . uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($tmp_name, $targetPath)) {

                    // Cari slot kosong untuk new image
                    for ($i = 0; $i < 5; $i++) {
                        if ($imagePaths[$i] === null || $imagePaths[$i] === "") {
                            $imagePaths[$i] = './assets/img/' . $fileName;
                            break;
                        }
                    }
                }
            }
        }
    }

    // UPDATE QUERY (12 kolom gambar)
    $sql = "
        UPDATE products SET 
            name = :name,
            brand = :brand,
            price = :price,
            fee = :fee,
            stock = :stock,
            category = :category,
            description = :description,
            image = :img1,
            image2 = :img2,
            image3 = :img3,
            image4 = :img4,
            image5 = :img5
        WHERE id = :id
    ";

    $stmt = $conn->prepare($sql);

    $stmt->execute([
        'name'  => $name,
        'brand' => $brand,
        'price' => $price,
        'fee'   => $fee,
        'stock' => $stock,
        'category' => $category,
        'description' => $description,
        'img1' => $imagePaths[0],
        'img2' => $imagePaths[1],
        'img3' => $imagePaths[2],
        'img4' => $imagePaths[3],
        'img5' => $imagePaths[4],
        'id'   => $id
    ]);

    echo json_encode(['success' => true, 'message' => 'Product updated successfully']);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
