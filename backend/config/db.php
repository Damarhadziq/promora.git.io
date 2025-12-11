<?php
// config/db.php
class Database {
    private $host = "localhost";      // Host lokal XAMPP
    private $db_name = "db_promora";  // Nama database kamu di phpMyAdmin
    private $username = "root";       // Default username XAMPP
    private $password = "";           // Password default XAMPP = kosong
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
