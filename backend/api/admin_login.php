<?php
// api/admin_login.php
session_start();
require_once '../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username dan password wajib diisi']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->prepare("SELECT * FROM admins WHERE username = :username LIMIT 1");
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin && password_verify($password, $admin['password'])) {
        // Update last login
        $updateStmt = $db->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id");
        $updateStmt->bindParam(':id', $admin['id']);
        $updateStmt->execute();

        // Set session
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['admin_name'] = $admin['full_name'];

        echo json_encode([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'full_name' => $admin['full_name']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan server: ' . $e->getMessage()]);
}
?>