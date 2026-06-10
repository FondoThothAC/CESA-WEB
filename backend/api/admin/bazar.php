<?php
/**
 * Bazar Emprendedor - Módulo Administrativo
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

if ($action === 'verificar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    $estado = (int)($input['verificado'] ?? 1);

    $stmt = $pdo->prepare("UPDATE emprendimientos SET verificado = ?, verificado_por = ?, fecha_verificacion = NOW() WHERE id = ?");
    $stmt->execute([$estado, $auth->getUserId(), $id]);

    echo json_encode(['success' => true]);
    exit;
}

// --- VISTAS ---

if ($action === 'listar') {
    $stmt = $pdo->query("
        SELECT e.*, u.nombre_completo as emprendedor,
               e.upvotes_count, e.downvotes_count, e.score as karma_score,
               (SELECT COUNT(*) FROM interacciones_negocio WHERE negocio_id = e.id AND tipo = 'contacto_whatsapp') as contactos,
               (SELECT score FROM sentimiento_analisis WHERE item_type = 'muro' AND item_id = e.id) as reputation_score
        FROM emprendimientos e
        JOIN usuarios u ON e.usuario_id = u.id
        ORDER BY e.verificado ASC, e.score DESC, e.created_at DESC
    ");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}
