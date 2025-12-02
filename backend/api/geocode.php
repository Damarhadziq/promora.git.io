<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Reverse geocoding: koordinat → alamat
if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    
    $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat={$lat}&lon={$lon}&addressdetails=1";
    
    $options = [
        'http' => [
            'header' => "User-Agent: PromoraApp/1.0\r\n"
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        http_response_code(500);
        echo json_encode(['error' => 'Gagal mengambil data alamat']);
        exit;
    }
    
    echo $response;
    exit;
}

// Forward geocoding: pencarian alamat → koordinat
if (isset($_GET['q'])) {
    $query = urlencode($_GET['q']);
    
    $url = "https://nominatim.openstreetmap.org/search?format=json&q={$query}&addressdetails=1&limit=5";
    
    $options = [
        'http' => [
            'header' => "User-Agent: PromoraApp/1.0\r\n"
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        http_response_code(500);
        echo json_encode(['error' => 'Gagal mencari lokasi']);
        exit;
    }
    
    echo $response;
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Parameter tidak valid']);
?>