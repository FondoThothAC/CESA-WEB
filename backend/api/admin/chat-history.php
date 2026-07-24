<?php
/**
 * API Admin - Chatbot History Audit Logs
 * Archivo: /backend/api/admin/chat-history.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();

// Requiere rol admin o mesa_directiva, o ser software@fondothoth.com
if (!$auth->isLoggedIn() || (!$auth->hasRole('admin') && !$auth->hasRole('mesa_directiva'))) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado. Se requieren permisos administrativos.']);
    exit;
}

try {
    $pdo = getDBConnection();

    $search = $_GET['search'] ?? '';
    $startDate = $_GET['start_date'] ?? '';
    $endDate = $_GET['end_date'] ?? '';
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);

    $whereClauses = [];
    $params = [];

    if (!empty($search)) {
        $whereClauses[] = "(h.mensaje LIKE :search OR h.respuesta LIKE :search OR h.ip_address LIKE :search OR u.nombre_completo LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    if (!empty($startDate)) {
        $whereClauses[] = "h.created_at >= :start_date";
        $params[':start_date'] = $startDate . ' 00:00:00';
    }

    if (!empty($endDate)) {
        $whereClauses[] = "h.created_at <= :end_date";
        $params[':end_date'] = $endDate . ' 23:59:59';
    }

    $whereSql = '';
    if (!empty($whereClauses)) {
        $whereSql = 'WHERE ' . implode(' AND ', $whereClauses);
    }

    // 1. Obtener Total
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM chatbot_historial h
        LEFT JOIN usuarios u ON h.usuario_id = u.id
        $whereSql
    ");
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetchColumn();

    // 2. Obtener Filas
    $query = "
        SELECT h.id, h.usuario_id, u.nombre_completo as usuario_nombre, u.email as usuario_email, 
               h.mensaje, h.respuesta, h.provider, h.latency_ms, h.accion_detectada, 
               h.ip_address, h.user_agent, h.geoloc_lat, h.geoloc_lon, h.geoloc_city, h.geoloc_country, h.created_at
        FROM chatbot_historial h
        LEFT JOIN usuarios u ON h.usuario_id = u.id
        $whereSql
        ORDER BY h.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($query);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data,
        'totalCount' => $totalCount
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
