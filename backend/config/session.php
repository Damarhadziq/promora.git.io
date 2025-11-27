<?php
// config/session.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class Session {
    
    public static function start() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    public static function set($key, $value) {
        self::start();
        $_SESSION[$key] = $value;
    }
    
    public static function get($key) {
        self::start();
        return isset($_SESSION[$key]) ? $_SESSION[$key] : null;
    }
    
    public static function exists($key) {
        self::start();
        return isset($_SESSION[$key]);
    }
    
    public static function delete($key) {
        self::start();
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
        }
    }
    
    public static function destroy() {
        self::start();
        session_unset();
        session_destroy();
    }
    
    public static function isLoggedIn() {
        self::start();
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    public static function getUser() {
        self::start();
        if (self::isLoggedIn()) {
            return array(
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'email' => $_SESSION['email'],
                'first_name' => $_SESSION['first_name'],
                'last_name' => $_SESSION['last_name'] ?? '',
                'role' => $_SESSION['role'],
                'phone' => $_SESSION['phone'] ?? ''
            );
        }
        return null;
    }
}
?>