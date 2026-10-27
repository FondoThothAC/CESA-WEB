<?php
/**
 * API: Sentiment Analysis Statistics & Student Profiling - CESA WEB
 * Archivo: /backend/api/admin/sentiment_stats.php
 * Proporciona telemetría colectiva e individual del sentimiento estudiantil.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/JWTHelper.php';
require_once __DIR__ . '/../../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar JWT de Administrador
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$payload = JWTHelper::verify($token);

$isMaster = Auth::isMasterEmail($payload['email'] ?? null);
$hasIaPerm = !empty($payload['permiso_ia']);

if (!$payload || (!$isMaster && !$hasIaPerm)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso restringido al Admin Supremo o delegados con permiso de IA.']);
    exit;
}

try {
    $pdo = getDBConnection();
    $studentId = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : null;

    if ($studentId) {
        // === 1. SENTIMIENTO PERSONAL DEL ESTUDIANTE (MODELO OCEAN & 7 EMOCIONES) ===
        $stmtUser = $pdo->prepare("SELECT id, nombre_completo, email, matricula, rol FROM usuarios WHERE id = ?");
        $stmtUser->execute([$studentId]);
        $userObj = $stmtUser->fetch(PDO::FETCH_ASSOC);

        if (!$userObj) {
            throw new Exception("Estudiante no encontrado.");
        }

        // Historial de sentimiento del estudiante
        $stmtMsgs = $pdo->prepare("
            SELECT contenido, sentimiento_score, sentimiento_categoria, 
                   ocean_openness, ocean_conscientiousness, ocean_extraversion, ocean_agreeableness, ocean_neuroticism, emocion_primaria, created_at 
            FROM ia_chat_mensajes 
            WHERE usuario_id = ? AND emisor = 'usuario' 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmtMsgs->execute([$studentId]);
        $history = $stmtMsgs->fetchAll(PDO::FETCH_ASSOC);

        // Promedios OCEAN personales
        $stmtAvg = $pdo->prepare("
            SELECT 
                COUNT(*) as total,
                COALESCE(AVG(sentimiento_score), 50) as score_promedio,
                COALESCE(AVG(ocean_openness), 50) as avg_openness,
                COALESCE(AVG(ocean_conscientiousness), 50) as avg_conscientiousness,
                COALESCE(AVG(ocean_extraversion), 50) as avg_extraversion,
                COALESCE(AVG(ocean_agreeableness), 50) as avg_agreeableness,
                COALESCE(AVG(ocean_neuroticism), 30) as avg_neuroticism
            FROM ia_chat_mensajes 
            WHERE usuario_id = ? AND emisor = 'usuario'
        ");
        $stmtAvg->execute([$studentId]);
        $stats = $stmtAvg->fetch(PDO::FETCH_ASSOC);

        $total = (int)($stats['total'] ?? 0);
        $neuroticism = round((float)$stats['avg_neuroticism'], 1);

        echo json_encode([
            'success' => true,
            'type' => 'personal',
            'estudiante' => $userObj,
            'metricas' => [
                'total_interacciones' => $total,
                'score_promedio' => round((float)$stats['score_promedio'], 1),
                'ocean' => [
                    'openness' => round((float)$stats['avg_openness'], 1),
                    'conscientiousness' => round((float)$stats['avg_conscientiousness'], 1),
                    'extraversion' => round((float)$stats['avg_extraversion'], 1),
                    'agreeableness' => round((float)$stats['avg_agreeableness'], 1),
                    'neuroticism' => $neuroticism
                ],
                'diagnostico' => $neuroticism > 60 ? '⚠️ Elevada Tensión Académica (Atención CESA)' : '🟢 Estado Emocional Estable'
            ],
            'historial' => $history
        ]);
        exit;
    }

    // === 2. METRICAS GENERALES COLECTIVAS (MODELO OCEAN & 7 EMOCIONES) ===
    $stmtGlobal = $pdo->query("
        SELECT 
            COUNT(*) as total_interacciones,
            COALESCE(AVG(sentimiento_score), 50) as mood_score_global,
            COALESCE(AVG(ocean_openness), 50) as avg_openness,
            COALESCE(AVG(ocean_conscientiousness), 50) as avg_conscientiousness,
            COALESCE(AVG(ocean_extraversion), 50) as avg_extraversion,
            COALESCE(AVG(ocean_agreeableness), 50) as avg_agreeableness,
            COALESCE(AVG(ocean_neuroticism), 30) as avg_neuroticism
        FROM ia_chat_mensajes 
        WHERE emisor = 'usuario'
    ");
    $globalStats = $stmtGlobal->fetch(PDO::FETCH_ASSOC);

    // Desglose de 7 Emociones Basales
    $stmtEmociones = $pdo->query("
        SELECT 
            COALESCE(emocion_primaria, 'Neutral') as emocion, 
            COUNT(*) as cantidad 
        FROM ia_chat_mensajes 
        WHERE emisor = 'usuario'
        GROUP BY emocion_primaria
        ORDER BY cantidad DESC
    ");
    $emocionesDesglose = $stmtEmociones->fetchAll(PDO::FETCH_ASSOC);

    // Alumnos con mayor nivel de tensión / neuroticismo acumulado
    $stmtAttention = $pdo->query("
        SELECT u.id, u.nombre_completo, u.email, u.matricula, 
               COUNT(m.id) as total_consultas,
               ROUND(AVG(m.ocean_neuroticism), 1) as score_estres,
               SUM(CASE WHEN m.ocean_neuroticism > 60 THEN 1 ELSE 0 END) as mensajes_estres
        FROM usuarios u
        JOIN ia_chat_mensajes m ON u.id = m.usuario_id
        WHERE m.emisor = 'usuario'
        GROUP BY u.id
        HAVING mensajes_estres > 0
        ORDER BY score_estres DESC
        LIMIT 10
    ");
    $attentionStudents = $stmtAttention->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'type' => 'colectivo',
        'metricas_globales' => [
            'total_analizados' => (int)($globalStats['total_interacciones'] ?? 0),
            'mood_score_global' => round((float)$globalStats['mood_score_global'], 1),
            'ocean_global' => [
                'openness' => round((float)$globalStats['avg_openness'], 1),
                'conscientiousness' => round((float)$globalStats['avg_conscientiousness'], 1),
                'extraversion' => round((float)$globalStats['avg_extraversion'], 1),
                'agreeableness' => round((float)$globalStats['avg_agreeableness'], 1),
                'neuroticism' => round((float)$globalStats['avg_neuroticism'], 1)
            ],
            'emociones' => $emocionesDesglose
        ],
        'alumnos_atencion' => $attentionStudents
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
