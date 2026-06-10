<?php
/**
 * Muro Social - Módulo Administrativo de Moderación
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
if (!$auth->hasRole('admin') && !$auth->hasRole('mesa_directiva')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$pdo = getDBConnection();
$action = $_GET['action'] ?? 'listar';

// --- ACCIONES ---

if ($action === 'moderar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    $estado = (int)($input['activo'] ?? 1); // 0 = Ocultar, 1 = Mostrar

    $stmt = $pdo->prepare("UPDATE publicaciones_muro SET activa = ?, moderado_por = ?, fecha_moderacion = NOW() WHERE id = ?");
    $stmt->execute([$estado, $auth->getUserId(), $id]);

    echo json_encode(['success' => true]);
    exit;
}

// --- VISTAS ---

if ($action === 'listar') {
    $stmt = $pdo->query("
        SELECT p.*, u.nombre_completo as autor, u.rol as autor_rol,
               (SELECT score FROM sentimiento_analisis WHERE item_type = 'muro' AND item_id = p.id) as sentiment_score
        FROM publicaciones_muro p
        JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.reportes_count DESC, p.created_at DESC
        LIMIT 50
    ");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}
