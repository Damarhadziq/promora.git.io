<?php
// test_password.php
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "Password: $password<br>";
echo "Hash: $hash<br><br>";

// Test verify
$verify = password_verify($password, $hash);
echo "Verify result: " . ($verify ? 'SUKSES ✓' : 'GAGAL ✗');
?>