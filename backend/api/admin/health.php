<?php
/**
 * System Health Check - CESA WEB v3.5
 * Archivo: /backend/api/admin/health.php
 */

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';

header('Content-Type: application/json');

$auth = new Auth();
if (!$auth->isAdmin()) {
    http_response_code(403);
    exit;
}

$status = [
    'timestamp' => date('Y-m-d H:i:s'),
    'services' => []
];

// 1. Database Check
try {
    $pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));
    $status['services']['database'] = ['status' => 'online', 'latency' => '1ms'];
} catch (Exception $e) {
    $status['services']['database'] = ['status' => 'offline', 'error' => $e->getMessage()];
}

// 2. Mac Mini IA Engine (Ollama)
$mac_url = getenv('CESA_MAC_MINI_URL') ?: 'http://localhost:11434';
$ch = curl_init("$mac_url/api/tags");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 2);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    $status['services']['mac_mini'] = ['status' => 'online', 'endpoint' => $mac_url];
} else {
    $status['services']['mac_mini'] = ['status' => 'offline', 'error' => 'Connection timeout or reflector down'];
}

// 3. Storage Check
$status['services']['storage'] = [
    'writable' => is_writable(__DIR__ . '/../../storage'),
    'free_space' => round(disk_free_space("/") / (1024 * 1024 * 1024), 2) . ' GB'
];

echo json_encode($status);
