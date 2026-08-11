<?php
/**
 * API Configuración IA - CESA WEB v3.5
 * Acceso: Solo Administradores
 * Archivo: /backend/api/admin/config.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/SecureConfig.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$userAdmin = $auth->getUser();

// Seguridad Estricta: Solo ROL ADMIN
if (!$userAdmin || $userAdmin['rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso restringido a administradores globales.']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $method = $_SERVER['REQUEST_METHOD'];

    // 1. GET: Listar configuraciones (ocultando claves cifradas)
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, provider, endpoint_url, model_name, is_active, priority, updated_at FROM api_configs ORDER BY priority ASC");
        $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $configs]);
        exit;
    }

    // 2. POST: Actualizar o Crear configuración
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $provider = $input['provider'] ?? '';
        $endpoint = $input['endpoint_url'] ?? '';
        $model = $input['model_name'] ?? '';
        $apiKey = $input['api_key'] ?? null;
        $isActive = (bool)($input['is_active'] ?? true);
        $priority = (int)($input['priority'] ?? 5);

        if (empty($provider) || empty($endpoint)) throw new Exception('Proveedor y Endpoint son obligatorios');

        // Cifrar la API Key si se proporcionó una nueva
        $apiKeyEncrypted = null;
        if (!empty($apiKey)) {
            $apiKeyEncrypted = SecureConfig::encrypt($apiKey);
        }

        $stmt = $pdo->prepare("
            INSERT INTO api_configs (provider, endpoint_url, model_name, api_key_encrypted, is_active, priority)
            VALUES (:provider, :endpoint, :model, :key, :active, :prio)
            ON DUPLICATE KEY UPDATE 
                endpoint_url = :endpoint,
                model_name = :model,
                api_key_encrypted = IF(:key IS NOT NULL, :key, api_key_encrypted),
                is_active = :active,
                priority = :prio
        ");

        $stmt->execute([
            ':provider' => $provider,
            ':endpoint' => $endpoint,
            ':model'    => $model,
            ':key'      => $apiKeyEncrypted,
            ':active'   => $isActive ? 1 : 0,
            ':prio'     => $priority
        ]);

        echo json_encode(['success' => true, 'message' => "Configuración de $provider actualizada correctamente."]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
