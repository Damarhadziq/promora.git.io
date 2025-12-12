<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// include koneksi PDO
require_once __DIR__ . "/../../config/db.php"; 

// ambil koneksi
$database = new Database();
$conn = $database->getConnection();
$response = [];

try {

    // ---------- HANDLE UPLOAD GAMBAR ----------
    $imagePaths = [null, null, null, null, null];

    if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
        $uploadDir = '../../../assets/img/';

        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if ($key >= 5) break;

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

    // ---------- AMBIL DATA POST ----------
    $seller_id      = intval($_POST['seller_id']);
    $name           = $_POST['name'];
    $brand          = $_POST['brand'];
    $category       = $_POST['category'];
    $product_type   = $_POST['product_type']; // TAMBAHKAN INI
    $price          = intval($_POST['price']);
    $original_price = intval($_POST['original_price']);
    $discount       = intval($_POST['discount']);
    $fee            = intval($_POST['fee']);
    $stock          = intval($_POST['stock']);
    $description    = $_POST['description'];
    $location       = $_POST['location'];

// ---------- PREPARE INSERT QUERY ----------
$query = "INSERT INTO products
    (seller_id, name, brand, category, product_type, price, original_price, discount, fee, stock, description, location, image, image2, image3, image4, image5)
    VALUES
    (:seller_id, :name, :brand, :category, :product_type, :price, :original_price, :discount, :fee, :stock, :description, :location, :image, :image2, :image3, :image4, :image5)";

    $stmt = $conn->prepare($query);

    $stmt->execute([
    ":seller_id"      => $seller_id,
    ":name"           => $name,
    ":brand"          => $brand,
    ":category"       => $category,
    ":product_type"   => $product_type, // TAMBAHKAN INI
    ":price"          => $price,
    ":original_price" => $original_price,
    ":discount"       => $discount,
    ":fee"            => $fee,
    ":stock"          => $stock,
    ":description"    => $description,
    ":location"       => $location,
    ":image"          => $imagePaths[0],
    ":image2"         => $imagePaths[1],
    ":image3"         => $imagePaths[2],
    ":image4"         => $imagePaths[3],
    ":image5"         => $imagePaths[4]
]);
    $response["success"] = true;
    $response["message"] = "Produk berhasil dibuat.";
    $response["product_id"] = $conn->lastInsertId();

    echo json_encode($response);

} catch (Exception $e) {

    $response["success"] = false;
    $response["message"] = $e->getMessage();
    echo json_encode($response);
}
?>
