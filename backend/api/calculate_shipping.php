<?php
header('Content-Type: application/json');
session_start();

require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $user_id = $_SESSION['user_id'];

    // Ambil data user/customer (latitude, longitude)
    $query = "SELECT latitude, longitude, username FROM users WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    if (!$user['latitude'] || !$user['longitude']) {
        echo json_encode([
            'success' => false, 
            'message' => 'Lokasi Anda belum diatur. Silakan lengkapi profil Anda.'
        ]);
        exit;
    }

    // Ambil seller_id dari cart items (asumsi products punya kolom seller_id atau user_id)
    // Coba query ini dulu - sesuaikan dengan struktur tabel products Anda
    $query = "SELECT DISTINCT p.seller_id 
              FROM cart c 
              JOIN products p ON c.product_id = p.id 
              WHERE c.user_id = :user_id 
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $cart_product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cart_product) {
        echo json_encode(['success' => false, 'message' => 'Cart is empty']);
        exit;
    }

    // Ambil data seller/store dari tabel stores berdasarkan user_id seller
    $query = "SELECT s.latitude, s.longitude, s.store_name, u.username as seller_name
              FROM stores s
              JOIN users u ON s.user_id = u.id
              WHERE s.user_id = :seller_id
              LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':seller_id', $cart_product['seller_id']);
    $stmt->execute();
    $store = $stmt->fetch(PDO::FETCH_ASSOC);

    // Jika tidak ada di tabel stores, ambil langsung dari users (seller)
    if (!$store) {
        $query = "SELECT latitude, longitude, username as store_name 
                  FROM users 
                  WHERE id = :seller_id AND role = 'seller'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':seller_id', $cart_product['seller_id']);
        $stmt->execute();
        $store = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$store) {
        echo json_encode(['success' => false, 'message' => 'Store/Seller not found']);
        exit;
    }

    if (!$store['latitude'] || !$store['longitude']) {
        echo json_encode([
            'success' => false, 
            'message' => 'Lokasi toko/seller belum tersedia'
        ]);
        exit;
    }

    // Hitung jarak menggunakan Haversine formula
    function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371; // km
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;
        
        return round($distance, 2); // km
    }

    $distance = calculateDistance(
        floatval($store['latitude']), 
        floatval($store['longitude']), 
        floatval($user['latitude']), 
        floatval($user['longitude'])
    );

    // Hitung ongkir: Rp 8.000 per 50km (minimum 8000)
    $ongkir = max(8000, ceil($distance / 50) * 8000);

    // Cek apakah dalam kota yang sama (anggap <= 20km = satu kota)
    $sameCity = $distance <= 20;

    // Available couriers
    $couriers = [
        'jnt' => [
            'name' => 'JNT Express',
            'available' => true,
            'price' => $ongkir,
            'estimate' => '2-3 hari'
        ],
        'gojek' => [
            'name' => 'GoSend',
            'available' => $sameCity,
            'price' => $sameCity ? $ongkir : 0,
            'estimate' => $sameCity ? '1-2 jam' : 'Tidak tersedia (jarak > 20km)'
        ],
        'anjem' => [
            'name' => 'AnterAja',
            'available' => $sameCity,
            'price' => $sameCity ? $ongkir : 0,
            'estimate' => $sameCity ? '3-4 jam' : 'Tidak tersedia (jarak > 20km)'
        ]
    ];

    echo json_encode([
        'success' => true,
        'distance' => $distance,
        'ongkir' => $ongkir,
        'same_city' => $sameCity,
        'store_name' => $store['store_name'] ?? $store['seller_name'] ?? 'Toko',
        'couriers' => $couriers
    ]);

} catch (Exception $e) {
    error_log("Calculate shipping error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
    ]);
}
?>