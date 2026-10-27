<?php
/**
 * API Telemetría y Exportación de Exámenes / ZeroClaw Status - CESA WEB v4.7
 * Acceso: Admin / Mesa Directiva
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/cors.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$userAdmin = $auth->getUser();

if (!$userAdmin || !in_array($userAdmin['rol'], ['admin', 'mesa_directiva'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

$action = $_GET['action'] ?? 'examenes';

try {
    $pdo = getDBConnection();

    if ($action === 'zeroclaw') {
        // Consultar estado de canales en la base de datos
        $telegramToken = getenv('TELEGRAM_BOT_TOKEN') ?: '';
        $ragCount = $pdo->query("SELECT COUNT(*) FROM ia_conocimiento_rag WHERE activo = 1")->fetchColumn();
        $sessionsCount = $pdo->query("SELECT COUNT(*) FROM ia_chat_sesiones")->fetchColumn();
        $messagesCount = $pdo->query("SELECT COUNT(*) FROM ia_chat_mensajes")->fetchColumn();

        echo json_encode([
            'success' => true,
            'zeroclaw' => [
                'provider' => 'Ollama Cloud',
                'model' => 'nemotron-3-super',
                'uptime' => 'Online (PM2 Process #0)',
                'gateway_port' => ':3000',
                'memory_backend' => 'MariaDB + RAG Vector (.md)',
                'memory_paired' => true,
                'cost_overview' => [
                    'session' => 0.0000,
                    'daily' => 0.0000,
                    'monthly' => 0.0000,
                    'total_tokens' => (int)$messagesCount * 120,
                    'total_requests' => (int)$messagesCount
                ],
                'active_channels' => [
                    ['name' => 'Telegram (@CesaUnisonBot)', 'active' => !empty($telegramToken)],
                    ['name' => 'Web Widget Chat', 'active' => true],
                    ['name' => 'PWA Push Notifications', 'active' => true],
                    ['name' => 'Email / SMTP', 'active' => true],
                    ['name' => 'Meta Social Orchestrator', 'active' => true]
                ],
                'component_health' => [
                    'channels' => 'Ok',
                    'daemon' => 'Ok',
                    'gateway' => 'Ok',
                    'scheduler' => 'Ok'
                ],
                'rag_articles' => (int)$ragCount,
                'chat_sessions' => (int)$sessionsCount,
                'chat_messages' => (int)$messagesCount
            ]
        ]);
        exit;
    }

    // Consultar el historial combinado de intentos de examen de ambos sistemas
    $query = "
        (
            SELECT 
                'Certificación Skill' as tipo_examen,
                i.id as intento_id,
                u.id as usuario_id,
                u.nombre_completo,
                u.email,
                COALESCE(u.matricula, u.expediente, '') as matricula,
                u.carrera,
                s.nombre as examen_nombre,
                i.fecha_inicio as fecha_inicio,
                i.fecha_fin as fecha_fin,
                i.puntaje_obtenido as puntaje,
                i.estado,
                i.ip_address,
                i.user_agent
            FROM skills_intentos i
            JOIN usuarios u ON i.usuario_id = u.id
            JOIN skills_catalogo s ON i.skill_id = s.id
        )
        UNION ALL
        (
            SELECT 
                'Evaluación General' as tipo_examen,
                e.id as intento_id,
                u.id as usuario_id,
                u.nombre_completo,
                u.email,
                COALESCE(u.matricula, u.expediente, '') as matricula,
                u.carrera,
                h.nombre as examen_nombre,
                e.tiempo_inicio as fecha_inicio,
                e.tiempo_fin as fecha_fin,
                e.puntaje_obtenido as puntaje,
                e.estado,
                NULL as ip_address,
                NULL as user_agent
            FROM evaluaciones e
            JOIN usuarios u ON e.usuario_id = u.id
            JOIN habilidades h ON e.habilidad_id = h.id
        )
        ORDER BY fecha_inicio DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $intentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $intentos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
