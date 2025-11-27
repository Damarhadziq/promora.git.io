<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

try {
    include_once '../config/db.php';

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        exit();
    }

    // Ambil data dari FormData
    $first_name = $_POST['first_name'] ?? '';
    $last_name = $_POST['last_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $username = $_POST['username'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? '';

    // Validasi input
    if (empty($first_name) || empty($email) || empty($username) || empty($password) || empty($role)) {
        http_response_code(400);
        echo json_encode(["message" => "Data tidak lengkap"]);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Format email tidak valid"]);
        exit();
    }

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(["message" => "Password minimal 8 karakter"]);
        exit();
    }

    if (!in_array($role, ['customer', 'seller'])) {
        http_response_code(400);
        echo json_encode(["message" => "Role tidak valid"]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();

    // Cek email
    $stmt = $db->prepare("SELECT id FROM users WHERE email=:email LIMIT 1");
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email sudah terdaftar"]);
        exit();
    }

    // Cek username
    $stmt = $db->prepare("SELECT id FROM users WHERE username=:username LIMIT 1");
    $stmt->bindParam(":username", $username);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Username sudah digunakan"]);
        exit();
    }

    // HANDLE UPLOAD KTP (hanya untuk seller)
    $ktp_photo = null;
    
    if ($role === 'seller') {
        if (!isset($_FILES['ktp']) || $_FILES['ktp']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["message" => "KTP wajib diupload untuk seller"]);
            exit();
        }

        $file = $_FILES['ktp'];
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png'];
        $max_size = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowed_types)) {
            http_response_code(400);
            echo json_encode(["message" => "Format KTP harus JPG atau PNG"]);
            exit();
        }

        if ($file['size'] > $max_size) {
            http_response_code(400);
            echo json_encode(["message" => "Ukuran KTP maksimal 5MB"]);
            exit();
        }

        // Buat folder jika belum ada
        $upload_dir = '../uploads/ktp/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // Generate nama file unik
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $new_filename = 'KTP_' . uniqid() . '_' . time() . '.' . $file_extension;
        $upload_path = $upload_dir . $new_filename;

        if (move_uploaded_file($file['tmp_name'], $upload_path)) {
            $ktp_photo = 'uploads/ktp/' . $new_filename;
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Gagal upload KTP"]);
            exit();
        }
    }

    // Customer auto-verified, Seller butuh verifikasi admin
    $is_verified = ($role === 'customer') ? 1 : 0;

    // Insert user
    $query = "INSERT INTO users (first_name, last_name, email, username, phone, password, role, ktp_photo, is_verified, created_at)
              VALUES (:first_name, :last_name, :email, :username, :phone, :password, :role, :ktp_photo, :is_verified, NOW())";
    
    $stmt = $db->prepare($query);
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt->bindParam(":first_name", $first_name);
    $stmt->bindParam(":last_name", $last_name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":phone", $phone);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":role", $role);
    $stmt->bindParam(":ktp_photo", $ktp_photo);
    $stmt->bindParam(":is_verified", $is_verified);

    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => $role === 'seller' ? 'Registrasi berhasil! Akun Anda menunggu verifikasi admin.' : 'Registrasi berhasil!',
            "user" => [
                "id" => $user_id,
                "username" => $username,
                "email" => $email,
                "first_name" => $first_name,
                "role" => $role,
                "is_verified" => $is_verified
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Gagal registrasi"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>