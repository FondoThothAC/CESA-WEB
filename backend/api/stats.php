<?php
/**
 * API Stats & Analytics - CESA WEB v3.5 (Industrialized)
 * Archivo: /backend/api/stats.php
 * Sincronizado con schema.sql (reportes, chatbot_historial, emprendimientos)
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/JWTHelper.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

// 1. VERIFICACIÓN DE ROL
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

if (str_starts_with($authHeader, 'Bearer ')) {
    $token = substr($authHeader, 7);
    $decoded = JWTHelper::verify($token);
    if (!$decoded || !in_array($decoded['rol'], ['admin', 'mesa_directiva'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acceso restringido']);
        exit;
    }
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

try {
    $pdo = getDBConnection();

    // 2. CONSULTAS REALES
    
    // Estadísticas de Reportes (Mood Based on resolution)
    $repStats = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos,
            SUM(CASE WHEN estado = 'nuevo' THEN 1 ELSE 0 END) as nuevos,
            SUM(CASE WHEN prioridad = 'critica' OR prioridad = 'urgente' THEN 1 ELSE 0 END) as urgentes
        FROM reportes
    ")->fetch(PDO::FETCH_ASSOC);

    // Bolsa de Trabajo
    $bolsaStats = $pdo->query("SELECT COUNT(*) as vacantes FROM bolsa_vacantes WHERE activo = 1")->fetch(PDO::FETCH_ASSOC);

    // Bazar
    $bazarStats = $pdo->query("SELECT COUNT(*) as negocios, COALESCE(SUM(views), 0) as total_views FROM emprendimientos WHERE active = 1")->fetch(PDO::FETCH_ASSOC);

    // Comunidad
    $usersCount = $pdo->query("SELECT COUNT(*) as total FROM usuarios")->fetch(PDO::FETCH_ASSOC);
    $activeMuro = $pdo->query("SELECT COUNT(*) as total FROM publicaciones_muro WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetch(PDO::FETCH_ASSOC);

    // 3. IA ACTIVITY FEED (De chatbot_historial)
    $stmt = $pdo->query("
        SELECT 'Chatbot' as accion_tipo, h.created_at, u.nombre_completo as nombre, 
               JSON_OBJECT('mensaje', LEFT(h.mensaje, 30)) as metadata 
        FROM chatbot_historial h
        LEFT JOIN usuarios u ON h.usuario_id = u.id 
        ORDER BY h.created_at DESC LIMIT 5
    ");
    $recent_activity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. LATENCIA MEDIA IA Y SENTIMIENTO GLOBAL
    $latency = $pdo->query("SELECT AVG(latency_ms) FROM chatbot_historial WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)")->fetchColumn();
    $avgMood = $pdo->query("SELECT AVG(score) FROM sentimiento_analisis WHERE item_type = 'muro'")->fetchColumn();
    $mood_score = $avgMood ? round((float)$avgMood) : 100;

    // Conteo de sentimientos granulares
    $granSent = $pdo->query("
        SELECT 
            SUM(CASE WHEN score >= 70 THEN 1 ELSE 0 END) as pos,
            SUM(CASE WHEN score < 70 AND score > 40 THEN 1 ELSE 0 END) as neu,
            SUM(CASE WHEN score <= 40 THEN 1 ELSE 0 END) as neg
        FROM sentimiento_analisis WHERE item_type = 'muro'
    ")->fetch(PDO::FETCH_ASSOC);

    $analytics = [
        'sentiment' => [
            'positivo' => (int)($granSent['pos'] ?? 0),
            'neutro' => (int)($granSent['neu'] ?? 0),
            'negativo' => (int)($granSent['neg'] ?? 0),
            'urgentes_detectados' => (int)($repStats['urgentes'] ?? 0),
            'mood_score' => $mood_score
        ],
        'bolsa_trabajo' => [
            'vacantes_activas' => (int)$bolsaStats['vacantes'],
            'postulaciones_totales' => 0, // Implementar cuando exista la tabla
            'empresas_aliadas' => 0
        ],
        'bazar_emprendedor' => [
            'negocios_activos' => (int)$bazarStats['negocios'],
            'categorias_top' => ['Comunidad'],
            'clic_contacto_total' => (int)$bazarStats['total_views']
        ],
        'comunidad' => [
            'usuarios_registrados' => (int)$usersCount['total'],
            'actividad_muro' => (int)$activeMuro['total'],
            'carreras_activas' => 1 // Implementar conteo real si es necesario
        ],
        'ia_monitoring' => [
            'avg_latency_ms' => round($latency ?: 150),
            'recent_activity' => $recent_activity
        ]
    ];

    echo json_encode([
        'success' => true,
        'analytics' => $analytics,
        'generated_at' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
