<?php
/**
 * API Publicidad / AdMob Config - CESA WEB v4.0
 * Acceso: Solo God Mode (software@fondothoth.com) o administrador autorizado (publicar_anuncios)
 * Archivo: /backend/api/admin/publicidad.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$method = $_SERVER['REQUEST_METHOD'];

// For GET requests, we allow public access so the frontend can load ads config.
// For mutating methods (POST, PUT, DELETE, etc.) we require authentication and specific permission.
if ($method !== 'GET') {
    if (!$auth->isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'No autenticado']);
        exit;
    }
    if (!$auth->hasPermission('publicar_anuncios')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acceso denegado. Se requieren permisos de publicidad.']);
        exit;
    }
}

try {
    $pdo = getDBConnection();

    // 1. GET: Obtener configuración
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM publicidad_config WHERE id = 1");
        $config = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$config) {
            $config = [
                'id' => 1,
                'activo' => 0,
                'publisher_id' => '',
                'banner_slot_id' => '',
                'interstitial_slot_id' => '',
                'frecuencia_diaria' => 2
            ];
        }
        // Castear tipos
        $config['activo'] = (int)$config['activo'];
        $config['frecuencia_diaria'] = (int)$config['frecuencia_diaria'];

        echo json_encode(['success' => true, 'data' => $config]);
        exit;
    }

    // 2. POST: Guardar configuración
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $activo = (bool)($input['activo'] ?? false);
        $publisher_id = trim($input['publisher_id'] ?? '');
        $banner_slot_id = trim($input['banner_slot_id'] ?? '');
        $interstitial_slot_id = trim($input['interstitial_slot_id'] ?? '');
        $frecuencia_diaria = (int)($input['frecuencia_diaria'] ?? 2);

        $stmt = $pdo->prepare("
            INSERT INTO publicidad_config (id, activo, publisher_id, banner_slot_id, interstitial_slot_id, frecuencia_diaria)
            VALUES (1, :activo, :pub_id, :banner_id, :inter_id, :freq)
            ON DUPLICATE KEY UPDATE 
                activo = VALUES(activo),
                publisher_id = VALUES(publisher_id),
                banner_slot_id = VALUES(banner_slot_id),
                interstitial_slot_id = VALUES(interstitial_slot_id),
                frecuencia_diaria = VALUES(frecuencia_diaria)
        ");

        $stmt->execute([
            ':activo' => $activo ? 1 : 0,
            ':pub_id' => $publisher_id,
            ':banner_id' => $banner_slot_id,
            ':inter_id' => $interstitial_slot_id,
            ':freq' => $frecuencia_diaria
        ]);

        echo json_encode(['success' => true, 'message' => 'Configuración de publicidad actualizada con éxito.']);
        exit;
    }

    // If method is not GET or POST, return 405
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
