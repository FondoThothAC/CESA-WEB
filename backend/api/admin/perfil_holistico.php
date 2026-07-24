<?php
/**
 * API Perfil Holístico del Alumno - CESA UNISON v3.6
 * Reúne evaluaciones, chats, geolocalización y datos de actividad para auditoría administrativa.
 */
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

if (!$auth->isLoggedIn() || !in_array($auth->getUser()['rol'], ['admin', 'mesa_directiva'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$action = $_GET['action'] ?? '';
$usuario_id = $_GET['id'] ?? null;

if (!$usuario_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de usuario requerido']);
    exit;
}

try {
    // 1. Datos base del usuario
    $stmtUser = $pdo->prepare("SELECT id, nombre_completo, email, matricula, rol, activo, created_at FROM usuarios WHERE id = ?");
    $stmtUser->execute([$usuario_id]);
    $perfil = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$perfil) {
        throw new Exception('Usuario no encontrado');
    }

    // 2. Evaluaciones (Resultados de exámenes e intentos)
    $stmtEvals = $pdo->prepare("
        SELECT e.id, e.puntaje_obtenido, e.porcentaje, e.estado, e.tiempo_inicio, e.tiempo_fin, e.tiempo_usado_segundos, h.nombre as habilidad_nombre
        FROM evaluaciones e
        JOIN habilidades h ON e.habilidad_id = h.id
        WHERE e.usuario_id = ?
        ORDER BY e.created_at DESC
    ");
    $stmtEvals->execute([$usuario_id]);
    $perfil['evaluaciones'] = $stmtEvals->fetchAll(PDO::FETCH_ASSOC);

    // 3. Certificados Obtenidos
    $stmtCerts = $pdo->prepare("SELECT habilidad_nombre, nivel, fecha_emision FROM certificados_digitales WHERE usuario_id = ? ORDER BY fecha_emision DESC");
    $stmtCerts->execute([$usuario_id]);
    $perfil['certificados'] = $stmtCerts->fetchAll(PDO::FETCH_ASSOC);

    // 4. Auditoría de Chatbot (BOB Assistant)
    $stmtChat = $pdo->prepare("
        SELECT mensaje, respuesta, accion_detectada, provider, created_at
        FROM chatbot_historial
        WHERE usuario_id = ?
        ORDER BY created_at DESC
        LIMIT 20
    ");
    $stmtChat->execute([$usuario_id]);
    $perfil['historial_ia'] = $stmtChat->fetchAll(PDO::FETCH_ASSOC);

    // 5. Metadatos de Red (Sacados de mensajes_privados para geoloc)
    $stmtRed = $pdo->prepare("
        SELECT ip_address, geoloc_lat, geoloc_lon, geoloc_city, geoloc_country, created_at
        FROM mensajes_privados
        WHERE emisor_id = ? AND ip_address IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $stmtRed->execute([$usuario_id]);
    $perfil['metadatos_red'] = $stmtRed->fetchAll(PDO::FETCH_ASSOC);

    // 6. Participación Social (Reportes y Publicaciones)
    $perfil['estadisticas_sociales'] = [
        'publicaciones_muro' => $pdo->query("SELECT COUNT(*) FROM publicaciones_muro WHERE usuario_id = " . (int)$usuario_id)->fetchColumn(),
        'reportes_creados' => $pdo->query("SELECT COUNT(*) FROM reportes WHERE usuario_id = " . (int)$usuario_id)->fetchColumn(),
        'votos_emitidos' => 'Oculto por Ley de Privacidad Electoral' // Mantener la transparencia sin romper el secreto
    ];

    echo json_encode(['success' => true, 'perfil' => $perfil]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
