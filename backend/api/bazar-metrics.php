<?php
/**
 * API: Bazar Metrics - CESA WEB v3.9
 * Dashboard de rendimiento para el emprendedor
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/MetricHelper.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser();

if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sesión no iniciada']);
    exit;
}

$pdo = getDBConnection();

// 1. Obtener el ID del emprendimiento del usuario actual
$stmt = $pdo->prepare("SELECT id FROM emprendimientos WHERE usuario_id = ? LIMIT 1");
$stmt->execute([$user['id']]);
$negocio = $stmt->fetch();

if (!$negocio) {
    echo json_encode(['success' => false, 'has_negocio' => false, 'error' => 'No tienes un negocio registrado']);
    exit;
}

$id = (int)$negocio['id'];
$action = $_GET['action'] ?? 'resumen';

try {
    switch ($action) {
        case 'resumen':
            echo json_encode([
                'success' => true, 
                'has_negocio' => true,
                'summary' => MetricHelper::getSummaryMetrics($pdo, $id),
                'history' => MetricHelper::getHistoricalViews($pdo, $id),
                'topics' => MetricHelper::getTrendingTopics($pdo, $id)
            ]);
            break;

        default:
            throw new Exception("Acción '$action' no reconocida");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
