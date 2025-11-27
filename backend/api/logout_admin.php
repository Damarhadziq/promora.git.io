<?php
// api/logout_admin.php
session_start();
session_destroy();
echo json_encode(['success' => true, 'message' => 'Logout berhasil']);
?>