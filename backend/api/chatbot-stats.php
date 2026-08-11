<?php
/**
 * API: Chatbot Metrics & Stats
 * CESA UNISON v3.9
 * Provee datos analíticos para el Mando Directivo.
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

// Verificación de Autenticación y Rol
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$user = $auth->getUser();
if (!in_array($user['rol'], ['admin', 'mesa_directiva'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado. Se requiere nivel de Mando Directivo.']);
    exit;
}

// Inicialización silenciosa del esquema si falta alguna columna para evitar fallas
try {
    $pdo->exec("ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS latencia_ms INT DEFAULT 0");
    $pdo->exec("ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS is_error BOOLEAN DEFAULT FALSE");
    $pdo->exec("ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local'");
} catch (Exception $e) { /* Columnas ya existen o DB distinta, ignorar */ }

$action = $_GET['action'] ?? 'overview';

switch ($action) {
    case 'overview':
        try {
            $totalMessages = (int)$pdo->query("SELECT COUNT(*) FROM chatbot_historial")->fetchColumn();
            
            // Calculo seguro de latencia
            $avgLatency = (float)$pdo->query("SELECT AVG(latencia_ms) FROM chatbot_historial WHERE latencia_ms > 0")->fetchColumn();
            
            // Providers distribution
            $providersData = $pdo->query("
                SELECT provider, COUNT(*) as total 
                FROM chatbot_historial 
                WHERE provider IS NOT NULL 
                GROUP BY provider 
                ORDER BY total DESC
            ")->fetchAll(PDO::FETCH_ASSOC);
            
            // Daily activity (last 7 days for better UI)
            $dailyMessages = $pdo->query("
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM chatbot_historial 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                GROUP BY DATE(created_at) 
                ORDER BY date ASC
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Error Rate Check
            $errors = (int)$pdo->query("SELECT COUNT(*) FROM chatbot_historial WHERE is_error = 1 OR respuesta LIKE '%Lo siento%'")->fetchColumn();
            $successRate = $totalMessages > 0 ? round((($totalMessages - $errors) / $totalMessages) * 100, 1) : 100;

            echo json_encode([
                'success' => true,
                'metrics' => [
                    'total_messages' => $totalMessages,
                    'avg_latency_ms' => round($avgLatency, 0),
                    'success_rate' => $successRate,
                    'error_count' => $errors
                ],
                'providers' => $providersData,
                'daily_messages' => $dailyMessages
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'intentions':
        try {
            $recentMsgs = $pdo->query("
                SELECT LOWER(TRIM(mensaje)) as msg 
                FROM chatbot_historial 
                WHERE LENGTH(mensaje) > 3 AND LENGTH(mensaje) < 100 
                ORDER BY created_at DESC LIMIT 500
            ")->fetchAll(PDO::FETCH_COLUMN);

            $patterns = [
                'bazar' => 0, 'vacante' => 0, 'certificado' => 0,
                'tutoria' => 0, 'beca' => 0, 'horario' => 0,
                'profesor' => 0, 'ayuda' => 0, 'credito' => 0
            ];

            foreach ($recentMsgs as $m) {
                foreach ($patterns as $pattern => $count) {
                    if (strpos($m, $pattern) !== false) {
                        $patterns[$pattern]++;
                    }
                }
            }
            arsort($patterns);
            
            // Filtrar los que no tienen matches
            $patterns = array_filter($patterns, function($v) { return $v > 0; });

            echo json_encode([
                'success' => true,
                'intent_categories' => $patterns
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'peak_hours':
        try {
            $peakHours = $pdo->query("
                SELECT HOUR(created_at) as hour, COUNT(*) as count 
                FROM chatbot_historial 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                GROUP BY HOUR(created_at) 
                ORDER BY hour ASC
            ")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'peak_hours' => $peakHours
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'export':
        try {
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="cesa_chatbot_logs_' . date('Y-m-d') . '.csv"');
            
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Fecha', 'Usuario_ID', 'Mensaje_In', 'Respuesta', 'Latencia_MS', 'Provider']);
            
            $stmt = $pdo->query("
                SELECT created_at, usuario_id, mensaje, respuesta, latencia_ms, provider 
                FROM chatbot_historial 
                ORDER BY created_at DESC LIMIT 1000
            ");
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row['respuesta'] = substr($row['respuesta'], 0, 150) . '...'; // Truncar para csv
                fputcsv($output, $row);
            }
            fclose($output);
            exit;
        } catch (Exception $e) {
            echo "Error generating CSV.";
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Acción inválida']);
}
