<?php
/**
 * API Admin - Configuración de Proveedores IA
 * Archivo: /backend/api/admin/config-ia.php
 */

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/JWTHelper.php';
require_once __DIR__ . '/../../lib/SecureConfig.php';

// Solo POST para guardar, GET para listar
$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$token = substr($authHeader, 7);
$payload = JWTHelper::verify($token);

if (!$payload || $payload['rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Permisos insuficientes']);
    exit;
}

$pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, provider, endpoint_url, model_name, is_active, priority, rate_limit_per_min, timeout_seconds FROM api_configs ORDER BY priority ASC");
    $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'configs' => $configs]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $provider = $input['provider'];
    $endpoint = $input['endpoint_url'];
    $api_key = $input['api_key'] ?? null;
    $model = $input['model_name'] ?? null;
    $priority = (int)($input['priority'] ?? 5);
    $rate_limit = (int)($input['rate_limit_per_min'] ?? 60);
    $timeout = (int)($input['timeout_seconds'] ?? 15);
    $is_active = (bool)($input['is_active'] ?? true);

    $encrypted_key = $api_key ? SecureConfig::encrypt($api_key) : null;

    $sql = "INSERT INTO api_configs 
            (provider, api_key_encrypted, endpoint_url, model_name, priority, rate_limit_per_min, timeout_seconds, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            api_key_encrypted = IFNULL(?, api_key_encrypted),
            endpoint_url = VALUES(endpoint_url),
            model_name = VALUES(model_name),
            priority = VALUES(priority),
            rate_limit_per_min = VALUES(rate_limit_per_min),
            timeout_seconds = VALUES(timeout_seconds),
            is_active = VALUES(is_active)";

    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $provider, $encrypted_key, $endpoint, $model, $priority, $rate_limit, $timeout, $is_active,
        $encrypted_key
    ]);

    echo json_encode(['success' => $success]);
    exit;
}
