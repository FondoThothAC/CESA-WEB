<?php
/**
 * API Admin - Private Messages History Audit Logs
 * Archivo: /backend/api/admin/mensajes-history.php
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
        $whereClauses[] = "(m.contenido LIKE :search OR m.ip_address LIKE :search OR ue.nombre_completo LIKE :search OR ur.nombre_completo LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    if (!empty($startDate)) {
        $whereClauses[] = "m.created_at >= :start_date";
        $params[':start_date'] = $startDate . ' 00:00:00';
    }

    if (!empty($endDate)) {
        $whereClauses[] = "m.created_at <= :end_date";
        $params[':end_date'] = $endDate . ' 23:59:59';
    }

    $whereSql = '';
    if (!empty($whereClauses)) {
        $whereSql = 'WHERE ' . implode(' AND ', $whereClauses);
    }

    // 1. Obtener Total
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM mensajes_privados m
        LEFT JOIN usuarios ue ON m.emisor_id = ue.id
        LEFT JOIN usuarios ur ON m.receptor_id = ur.id
        $whereSql
    ");
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetchColumn();

    // 2. Obtener Filas
    $query = "
        SELECT m.id, m.emisor_id, ue.nombre_completo as emisor_nombre, ue.email as emisor_email,
               m.receptor_id, ur.nombre_completo as receptor_nombre, ur.email as receptor_email,
               m.contenido, m.leido, m.created_at, m.ip_address, m.user_agent, 
               m.geoloc_lat, m.geoloc_lon, m.geoloc_city, m.geoloc_country
        FROM mensajes_privados m
        LEFT JOIN usuarios ue ON m.emisor_id = ue.id
        LEFT JOIN usuarios ur ON m.receptor_id = ur.id
        $whereSql
        ORDER BY m.created_at DESC
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
