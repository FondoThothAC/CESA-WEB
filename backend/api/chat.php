<?php
/**
 * API Chatbot Híbrido - CESA WEB v3.5 (FULL LOGIC)
 * Funcionalidad: Chat IA con Contexto Institucional (Créditos, Bazar, Carreras).
 * Archivo: /backend/api/chat.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/SecureConfig.php';
require_once __DIR__ . '/../lib/RateLimiter.php';
require_once __DIR__ . '/../lib/AcademicProgressManager.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser(); 
$limiter = new RateLimiter();

if (!$limiter->check(($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1') . '_chat', 20, 60)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Calma, asistente procesando...']);
    exit;
}

try {
    $pdo = getDBConnection();
    $input = json_decode(file_get_contents('php://input'), true);
    $message = trim(strip_tags($input['message'] ?? ''));

    if (empty($message)) throw new Exception('Mensaje vacío');

    // --- ENRIQUECIMIENTO DE CONTEXTO ---
    $context = "Eres el asistente oficial del CESA UNISON (Consejo Estudiantil). ";
    
    if ($user) {
        $manager = new AcademicProgressManager($pdo);
        $progress = $manager->calcularSemestreReal((int)$user['id']);
        
        // Obtener expediente directamente desde la base de datos
        $stmtU = $pdo->prepare("SELECT expediente FROM usuarios WHERE id = ?");
        $stmtU->execute([$user['id']]);
        $expediente = $stmtU->fetchColumn() ?: 'N/A';

        $context .= "Estás hablando con {$user['nombre']} (Exp: {$expediente}). ";
        if ($progress) {
            $context .= "Su progreso: Semestre Real: {$progress['semestre_real']}, Créditos: {$progress['creditos_acumulados']}, Faltan {$progress['creditos_faltantes_siguiente_sem']} para el siguiente semestre. ";
        }
    }

    $context .= "Responde de forma amable, breve y profesional. Si te preguntan por créditos o semestre, usa los datos proporcionados. ";

    // 1. Obtener Motores de IA
    $stmt = $pdo->prepare("SELECT * FROM api_configs WHERE is_active = 1 ORDER BY priority ASC");
    $stmt->execute();
    $providers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($providers)) throw new Exception('No hay motores de IA activos');

    $aiResponse = "";
    $chosenProvider = "";
    $latency = 0;

    // 2. Inferencia Híbrida
    foreach ($providers as $config) {
        $start = microtime(true);
        $provider = $config['provider'];
        $endpoint = $config['endpoint_url'];
        $model = $config['model_name'];
        $key = SecureConfig::decrypt($config['api_key_encrypted'] ?? '');

        try {
            if ($provider === 'groq') {
                $aiResponse = callGroq($message, $context, $endpoint, $key, $model);
            } elseif ($provider === 'gemini') {
                $aiResponse = callGemini($message, $context, $endpoint, $key);
            }

            if ($aiResponse) {
                $chosenProvider = $provider;
                $latency = (int)((microtime(true) - $start) * 1000);
                break;
            }
        } catch (Exception $e) { continue; }
    }

    if (!$aiResponse) $aiResponse = "Lo siento, mis sistemas de IA están saturados. Por favor intenta de nuevo en unos momentos o contacta a tu coordinación directamente. 🦉";

    // 3. Detección de Intenciones
    $intent = 'ninguna';
    $url = null;
    $msgLower = strtolower($message);
    
    if (strpos($msgLower, 'reportar') !== false || strpos($msgLower, 'queja') !== false) {
        $intent = 'redirect';
        $url = '/reportes';
    } elseif (strpos($msgLower, 'bazar') !== false || strpos($msgLower, 'mapa') !== false || strpos($msgLower, 'comprar') !== false) {
        $intent = 'redirect';
        $url = '/bazar';
    } elseif (strpos($msgLower, 'crédito') !== false || strpos($msgLower, 'semestre') !== false || strpos($msgLower, 'perfil') !== false) {
        $intent = 'redirect';
        $url = '/perfil';
    }

    // 4. Registro Historial
    $stmtH = $pdo->prepare("INSERT INTO chatbot_historial (usuario_id, mensaje, respuesta, provider, latency_ms, accion_detectada) VALUES (?, ?, ?, ?, ?, ?)");
    $stmtH->execute([
        $user ? $user['id'] : null,
        $message,
        $aiResponse,
        $chosenProvider,
        $latency,
        $intent
    ]);

    echo json_encode([
        'success' => true,
        'response' => $aiResponse,
        'action' => $intent,
        'url' => $url
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// --- LLM Adapters ---

function callGroq($prompt, $context, $url, $key, $model) {
    $ch = curl_init($url);
    $data = [
        "model" => $model ?: "llama3-8b-8192",
        "messages" => [
            ["role" => "system", "content" => $context],
            ["role" => "user", "content" => $prompt]
        ]
    ];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $key", "Content-Type: application/json"]);
    $response = curl_exec($ch);
    $decoded = json_decode($response, true);
    return $decoded['choices'][0]['message']['content'] ?? null;
}

function callGemini($prompt, $context, $url, $key) {
    $fullUrl = $url . "?key=" . $key;
    $ch = curl_init($fullUrl);
    $data = ["contents" => [["parts" => [["text" => $context . "\n\nUsuario pregunta: " . $prompt]]]]];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    $response = curl_exec($ch);
    $decoded = json_decode($response, true);
    return $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
}
