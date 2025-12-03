<?php
// api/login.php
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email_or_username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Email/Username dan password harus diisi"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

// ✅ TAMBAHKAN profile_photo di SELECT
$query = "SELECT id, first_name, last_name, email, username, password, role, phone, profile_photo, is_verified, created_at 
          FROM users 
          WHERE email = :identifier OR username = :identifier 
          LIMIT 1";

$stmt = $db->prepare($query);
$stmt->bindParam(":identifier", $data->email_or_username);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (isset($data->role) && $data->role !== $row['role']) {
        http_response_code(401);
        echo json_encode(array("message" => "Role yang dipilih tidak sesuai dengan akun Anda"));
        exit();
    }
    
    if (password_verify($data->password, $row['password'])) {
        
        if ($row['role'] === 'seller' && isset($row['is_verified']) && $row['is_verified'] == 0) {
            http_response_code(403);
            echo json_encode(array(
                "message" => "Akun Anda masih menunggu verifikasi dari admin. Harap bersabar."
            ));
            exit();
        }
        
        // ✅ SIMPAN profile_photo KE SESSION
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['email'] = $row['email'];
        $_SESSION['first_name'] = $row['first_name'];
        $_SESSION['last_name'] = $row['last_name'];
        $_SESSION['role'] = $row['role'];
        $_SESSION['phone'] = $row['phone'];
        $_SESSION['profile_photo'] = $row['profile_photo']; // ✅ TAMBAHKAN INI
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        
        http_response_code(200);
        echo json_encode(array(
            "message" => "Login berhasil",
            "user" => array(
                "id" => $row['id'],
                "username" => $row['username'],
                "email" => $row['email'],
                "first_name" => $row['first_name'],
                "last_name" => $row['last_name'],
                "role" => $row['role'],
                "phone" => $row['phone'],
                "profile_photo" => $row['profile_photo'], // ✅ KIRIM KE FRONTEND
                "created_at" => $row['created_at']
            ),
            "session_id" => session_id()
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Password salah"));
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "User tidak ditemukan"));
}
?>