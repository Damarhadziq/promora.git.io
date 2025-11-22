<?php
// api/register.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

try {
    include_once '../config/db.php';

    // Pastikan method POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        exit();
    }

    $json = file_get_contents("php://input");
    $data = json_decode($json);

    // Validasi input
    if (
        empty($data->first_name) || empty($data->email) ||
        empty($data->username) || empty($data->password) ||
        empty($data->role)
    ) {
        http_response_code(400);
        echo json_encode(["message" => "Data tidak lengkap"]);
        exit();
    }

    // Validasi email
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Format email tidak valid"]);
        exit();
    }

    // Validasi password minimal 8 karakter
    if (strlen($data->password) < 8) {
        http_response_code(400);
        echo json_encode(["message" => "Password minimal 8 karakter"]);
        exit();
    }

    // Validasi role → (PASTIKAN database kamu role-nya customer / seller)
    if (!in_array($data->role, ['customer', 'seller'])) {
        http_response_code(400);
        echo json_encode(["message" => "Role tidak valid: " . $data->role]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();

    // Cek email
    $stmt = $db->prepare("SELECT id FROM users WHERE email=:email LIMIT 1");
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email sudah terdaftar"]);
        exit();
    }

    // Cek username
    $stmt = $db->prepare("SELECT id FROM users WHERE username=:username LIMIT 1");
    $stmt->bindParam(":username", $data->username);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Username sudah digunakan"]);
        exit();
    }

    // Insert user
    $query = "INSERT INTO users (first_name, last_name, email, username, phone, password, role)
              VALUES (:first_name, :last_name, :email, :username, :phone, :password, :role)";
    $stmt = $db->prepare($query);

    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $last_name = $data->last_name ?? '';
    $phone = $data->phone ?? '';

    $stmt->bindParam(":first_name", $data->first_name);
    $stmt->bindParam(":last_name", $last_name);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":username", $data->username);
    $stmt->bindParam(":phone", $phone);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":role", $data->role);

    if ($stmt->execute()) {

        session_start();
        $user_id = $db->lastInsertId();

        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $data->username;
        $_SESSION['email'] = $data->email;
        $_SESSION['first_name'] = $data->first_name;
        $_SESSION['last_name'] = $last_name;
        $_SESSION['role'] = $data->role;
        $_SESSION['phone'] = $phone;
        $_SESSION['logged_in'] = true;

        http_response_code(201);
        echo json_encode([
            "message" => "Registrasi berhasil",
            "user" => [
                "id" => $user_id,
                "username" => $data->username,
                "email" => $data->email,
                "first_name" => $data->first_name,
                "last_name" => $last_name,
                "role" => $data->role
            ],
            "session_id" => session_id()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Gagal registrasi"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
