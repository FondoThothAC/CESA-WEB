<?php
/**
 * Site Config API - CESA WEB v7.6
 * Feature flags administrables (ej: bolsa_trabajo_activa)
 * GET público (solo lectura de flags), POST solo admin.
 * Archivo: /backend/api/site_config.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getDBConnection();
    $auth = new Auth();
    $user = $auth->getUser();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? 'get';

    // GET: público (el frontend decide qué ocultar)
    if ($method === 'GET' && $action === 'get') {
        $rows = $pdo->query("SELECT clave, valor FROM site_config")->fetchAll(PDO::FETCH_ASSOC);
        $config = [];
        foreach ($rows as $r) $config[$r['clave']] = $r['valor'];
        echo json_encode(['success' => true, 'config' => $config]);
        exit;
    }

    // POST: actualizar flags (solo admin)
    if ($method === 'POST' && $action === 'set') {
        if (!$user || $user['rol'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $clave = trim($input['clave'] ?? '');
        $valor = trim((string)($input['valor'] ?? ''));

        $permitidas = ['bolsa_trabajo_activa'];
        if (!in_array($clave, $permitidas, true)) {
            echo json_encode(['success' => false, 'error' => 'Clave no permitida.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO site_config (clave, valor) VALUES (?, ?)
                               ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
        $stmt->execute([$clave, $valor]);

        echo json_encode(['success' => true, 'message' => "Configuración actualizada: {$clave} = {$valor}"]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
