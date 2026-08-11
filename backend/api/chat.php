<?php
/**
 * API Chatbot Híbrido - CESA WEB v4.0 (FULL LOGIC)
 * Funcionalidad: Chat IA con Contexto Institucional, Auditoría de Geolocalización y Acciones Inteligentes (BOB).
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

    // --- GEOLOCALIZACIÓN Y AUDITORÍA ---
    $lat = isset($input['lat']) && $input['lat'] !== '' ? (float)$input['lat'] : null;
    $lon = isset($input['lon']) && $input['lon'] !== '' ? (float)$input['lon'] : null;
    
    $clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (strpos($clientIp, ',') !== false) {
        $parts = explode(',', $clientIp);
        $clientIp = trim($parts[0]);
    }
    
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    // Fallback de geolocalización por IP
    $geo = getIpGeolocation($clientIp);
    if ($lat === null || $lon === null) {
        $lat = $geo['lat'];
        $lon = $geo['lon'];
    }
    $city = $geo['city'];
    $country = $geo['country'];

    // --- ENRIQUECIMIENTO DE CONTEXTO & RAG ---
    $context = "Eres Bob, el asistente inteligente oficial del CESA UNISON (Consejo Estudiantil). Tu personalidad es de un nerd coqueto, muy amable y sumamente comprensivo con los estudiantes. Usa un tono inteligente pero juguetón, utiliza algunos halagos intelectuales sutiles y siempre busca ayudar de manera empática. ";
    
    // --- BÚSQUEDA Y CONSULTA RAG EN DOCUMENTOS MARKDOWN (.md) ---
    try {
        $cleanSearch = preg_replace('/[^\w\s]/u', ' ', $message);
        $likeTerm = '%' . trim($cleanSearch) . '%';
        $ragQuery = $pdo->prepare("
            SELECT titulo, contenido_md 
            FROM ia_conocimiento_rag 
            WHERE activo = 1 
            AND (titulo LIKE ? OR contenido_md LIKE ?)
            LIMIT 2
        ");
        $ragQuery->execute([$likeTerm, $likeTerm]);
        $ragDocs = $ragQuery->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($ragDocs)) {
            $context .= "\n\n--- BASE DE CONOCIMIENTO INSTITUCIONAL (RAG MARKDOWN) ---\n";
            foreach ($ragDocs as $doc) {
                $context .= "### " . $doc['titulo'] . "\n" . $doc['contenido_md'] . "\n\n";
            }
            $context .= "--- FIN CONOCIMIENTO RAG ---\nPor favor responde al estudiante basándote fielmente en los datos anteriores si son aplicables.";
        }
    } catch (Exception $e) {
        error_log("Error RAG Chat: " . $e->getMessage());
    }
    
    // --- ACCIÓN: HISTORIAL DEL CHAT (Para Inbox y Botón Flotante) ---
    $action = $_GET['action'] ?? 'chat';
    if ($action === 'history' && $user) {
        $stmtSesion = $pdo->prepare("SELECT id, resumen_contexto_md, mensajes_count FROM ia_chat_sesiones WHERE usuario_id = ? AND activo = 1 LIMIT 1");
        $stmtSesion->execute([$user['id']]);
        $sesion = $stmtSesion->fetch(PDO::FETCH_ASSOC);

        if (!$sesion) {
            echo json_encode(['success' => true, 'messages' => []]);
            exit;
        }

        $stmtMsgs = $pdo->prepare("SELECT emisor, contenido, created_at FROM ia_chat_mensajes WHERE sesion_id = ? ORDER BY id ASC LIMIT 50");
        $stmtMsgs->execute([$sesion['id']]);
        $msgs = $stmtMsgs->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'messages' => $msgs, 'context_md' => $sesion['resumen_contexto_md']]);
        exit;
    }

    // --- RECURAR O CREAR SESIÓN ACTIVA DEL ESTUDIANTE ---
    $sesionId = null;
    $resumenMd = null;
    $mensajesCount = 0;

    if ($user) {
        $stmtS = $pdo->prepare("SELECT id, resumen_contexto_md, mensajes_count FROM ia_chat_sesiones WHERE usuario_id = ? AND activo = 1 LIMIT 1");
        $stmtS->execute([$user['id']]);
        $sesionObj = $stmtS->fetch(PDO::FETCH_ASSOC);

        if ($sesionObj) {
            $sesionId = (int)$sesionObj['id'];
            $resumenMd = $sesionObj['resumen_contexto_md'];
            $mensajesCount = (int)$sesionObj['mensajes_count'];
        } else {
            $stmtNewS = $pdo->prepare("INSERT INTO ia_chat_sesiones (usuario_id, titulo) VALUES (?, ?)");
            $stmtNewS->execute([$user['id'], 'Conversación con Asistente BOB']);
            $sesionId = (int)$pdo->lastInsertId();
        }
    }

    // Inyectar contexto comprimido en Markdown si existe
    if ($resumenMd) {
        $context .= "\n\n--- MEMORIA PREVIA COMPRIMIDA DEL HILO (.MD) ---\n" . $resumenMd . "\n--- FIN MEMORIA PREVIA ---\n";
    }

    if ($user) {
        $manager = new AcademicProgressManager($pdo);
        $progress = $manager->calcularSemestreReal((int)$user['id']);
        
        $stmtU = $pdo->prepare("SELECT expediente FROM usuarios WHERE id = ?");
        $stmtU->execute([$user['id']]);
        $expediente = $stmtU->fetchColumn() ?: 'N/A';

        $context .= "Estás hablando con {$user['nombre']} (Exp: {$expediente}). ";
        if ($progress) {
            $context .= "Su progreso: Semestre Real: {$progress['semestre_real']}, Créditos: {$progress['creditos_acumulados']}, Faltan {$progress['creditos_faltantes_siguiente_sem']} para el siguiente semestre. ";
        }
    }

    $context .= "Responde de forma amable, breve y profesional. Si te preguntan por créditos o semestre, usa los datos proporcionados. ";
    
    // Instrucciones de Acciones Inteligentes para BOB
    $context .= "Si el usuario te pide enviar un mensaje privado a otro usuario o empresa (ej: 'envíale un mensaje a Coordinación Integral de que llegaré tarde'), debes confirmar la acción de forma servicial en tu respuesta textual y adjuntar EXACTAMENTE al final la siguiente etiqueta: [ACTION: enviar_mensaje|nombre_destinatario|contenido]. Reemplaza 'nombre_destinatario' por el nombre del destinatario o coordinación, y 'contenido' por el mensaje exacto a enviar. ";
    $context .= "Si el usuario te pide delegar una tarea o reportar una incidencia (ej: 'delega a infraestructura la reparación de las canchas'), debes clasificar la coordinación asignada entre ('integral', 'la_red', 'librx', 'raices', 'impulso', 'humano', 'mesa_directiva') e indicar la acción al final de tu respuesta textual EXACTAMENTE así: [ACTION: delegar_tarea|coordinacion|asunto|descripcion]. Reemplaza 'coordinacion' por el comité correcto, 'asunto' por un título corto y 'descripcion' por el detalle. ";

    // 1. Obtener Motores de IA
    $stmt = $pdo->prepare("SELECT * FROM api_configs WHERE is_active = 1 ORDER BY priority ASC");
    $stmt->execute();
    $providers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($providers)) throw new Exception('No hay motores de IA activos');

    $aiResponse = "";
    $chosenProvider = "";
    $latency = 0;

    // 2. Inferencia Híbrida (Con Failover automático tipo OpenRouter)
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
            } elseif ($provider === 'openrouter') {
                $aiResponse = callOpenRouter($message, $context, $endpoint, $key, $model);
            } elseif ($provider === 'mistral') {
                $aiResponse = callMistral($message, $context, $endpoint, $key, $model);
            } elseif ($provider === 'ollama_cloud') {
                $aiResponse = callOllamaCloud($message, $context, $endpoint, $key, $model);
            }

            if ($aiResponse) {
                $chosenProvider = $provider;
                $latency = (int)((microtime(true) - $start) * 1000);
                break;
            }
        } catch (Exception $e) { 
            continue; 
        }
    }

    if (!$aiResponse) {
        $aiResponse = "Lo siento, mis sistemas de IA están saturados. Por favor intenta de nuevo en unos momentos o contacta a tu coordinación directamente. 🦉";
    }

    // 3. Procesar Acciones Inteligentes de BOB
    $intent = 'ninguna';
    $url = null;
    $actionPattern = '/\[ACTION:\s*([^|\]]+)(?:\|([^|\]]+))?(?:\|([^|\]]+))?(?:\|([^\]]+))?\]/';
    
    if (preg_match($actionPattern, $aiResponse, $matches)) {
        // Limpiar etiqueta del mensaje que verá el estudiante
        $aiResponse = trim(preg_replace($actionPattern, '', $aiResponse));
        $actionType = trim($matches[1] ?? '');

        if ($actionType === 'enviar_mensaje' && $user) {
            $destinatarioName = trim($matches[2] ?? '');
            $mensajeContent = trim($matches[3] ?? '');

            if ($destinatarioName && $mensajeContent) {
                // Buscar destinatario
                $stmtDest = $pdo->prepare("
                    SELECT id, nombre_completo 
                    FROM usuarios 
                    WHERE nombre_completo LIKE ? 
                       OR rol LIKE ? 
                       OR email LIKE ? 
                    LIMIT 1
                ");
                $stmtDest->execute(["%$destinatarioName%", "%$destinatarioName%", "%$destinatarioName%"]);
                $dest = $stmtDest->fetch(PDO::FETCH_ASSOC);

                if ($dest) {
                    $stmtMsg = $pdo->prepare("
                        INSERT INTO mensajes_privados (emisor_id, receptor_id, contenido, ip_address, user_agent, geoloc_lat, geoloc_lon, geoloc_city, geoloc_country) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    $stmtMsg->execute([
                        $user['id'], 
                        $dest['id'], 
                        $mensajeContent,
                        $clientIp,
                        $userAgent,
                        $lat,
                        $lon,
                        $city,
                        $country
                    ]);
                    $aiResponse .= "\n\n*(Mensaje enviado automáticamente a {$dest['nombre_completo']} vía BOB)*";
                    $intent = 'enviar_mensaje';
                } else {
                    $aiResponse .= "\n\n*(Nota de BOB: No logré encontrar al destinatario '{$destinatarioName}' en el directorio estudiantil)*";
                }
            }
        } elseif ($actionType === 'delegar_tarea' && $user) {
            $coordinacion = trim($matches[2] ?? 'mesa_directiva');
            $asunto = trim($matches[3] ?? 'Tarea delegada por Asistente');
            $descripcion = trim($matches[4] ?? '');

            $validCoords = ['integral', 'la_red', 'librx', 'raices', 'impulso', 'humano', 'mesa_directiva'];
            if (!in_array($coordinacion, $validCoords)) {
                $coordinacion = 'mesa_directiva';
            }

            $stmtRep = $pdo->prepare("
                INSERT INTO reportes (tipo, categoria, coordinacion_asignada, asunto, descripcion, usuario_id, estado, prioridad, requiere_atencion_humana, analisis_ia) 
                VALUES ('queja', 'otro', ?, ?, ?, ?, 'asignado', 'media', 0, 'Asignado automáticamente por el Asistente de IA (BOB).')
            ");
            $stmtRep->execute([
                $coordinacion,
                $asunto,
                $descripcion ?: $message,
                $user['id']
            ]);
            $aiResponse .= "\n\n*(Tarea delegada y registrada con éxito en '{$coordinacion}' vía BOB)*";
            $intent = 'delegar_tarea';
        }
    }

    // 4. Detección de Intenciones de Navegación Tradicional (Fallback)
    if ($intent === 'ninguna') {
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
    }

    // 5. ANÁLISIS DE SENTIMIENTO ESTUDIANTIL & MODELO OCEAN (BIG FIVE)
    $msgLower = strtolower($message);

    // Valores OCEAN base (0-100)
    $oceanOpenness = 50;        // Curiosidad intelectual
    $oceanConscientiousness = 50; // Enfoque académico / Organización
    $oceanExtraversion = 50;     // Sociabilidad
    $oceanAgreeableness = 50;    // Empatía / Amabilidad
    $oceanNeuroticism = 30;      // Estrés / Tensión emocional
    $emocionPrimaria = 'neutral';

    // Inferencia léxica psicométrica
    if (preg_match('/(interesante|aprender|como funciona|investigar|proyecto|futuro|idea|crear)/u', $msgLower)) {
        $oceanOpenness = 85;
        $emocionPrimaria = 'Curiosidad';
    }
    if (preg_match('/(examen|tarea|calificacion|promedio|materia|horario|creditos|tramite|kardex)/u', $msgLower)) {
        $oceanConscientiousness = 80;
    }
    if (preg_match('/(gracias|amable|saludos|excelente|gran trabajo|por favor|ayuda)/u', $msgLower)) {
        $oceanAgreeableness = 90;
        $oceanExtraversion = 75;
        $emocionPrimaria = 'Confianza';
    }
    if (preg_match('/(feliz|contento|genial|logre|pase|aprobe|ganamos)/u', $msgLower)) {
        $oceanExtraversion = 85;
        $emocionPrimaria = 'Alegría';
    }
    if (preg_match('/(estres|ansiedad|miedo|presion|cansado|agobiado|reprobe|fallo)/u', $msgLower)) {
        $oceanNeuroticism = 85;
        $emocionPrimaria = 'Ansiedad/Estrés';
    }
    if (preg_match('/(injusto|molesto|no sirve|horrible|queja|pesimo|huelga)/u', $msgLower)) {
        $oceanNeuroticism = 75;
        $oceanAgreeableness = 25;
        $emocionPrimaria = 'Frustración';
    }
    if (preg_match('/(sueño|agotado|sin tiempo|desvelo|rendirme)/u', $msgLower)) {
        $oceanNeuroticism = 70;
        $emocionPrimaria = 'Agotamiento';
    }

    $sentimientoScore = (int)(100 - $oceanNeuroticism + ($oceanAgreeableness / 2));
    $sentimientoCat = $emocionPrimaria;

    if ($user && $sesionId) {
        // Insertar mensaje de usuario y respuesta de asistente
        $stmtM1 = $pdo->prepare("
            INSERT INTO ia_chat_mensajes 
            (sesion_id, usuario_id, emisor, contenido, sentimiento_score, sentimiento_categoria, ocean_openness, ocean_conscientiousness, ocean_extraversion, ocean_agreeableness, ocean_neuroticism, emocion_primaria) 
            VALUES (?, ?, 'usuario', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmtM1->execute([
            $sesionId, $user['id'], $message, $sentimientoScore, $sentimientoCat,
            $oceanOpenness, $oceanConscientiousness, $oceanExtraversion, $oceanAgreeableness, $oceanNeuroticism, $emocionPrimaria
        ]);

        $stmtM2 = $pdo->prepare("INSERT INTO ia_chat_mensajes (sesion_id, usuario_id, emisor, contenido) VALUES (?, ?, 'asistente', ?)");
        $stmtM2->execute([$sesionId, $user['id'], $aiResponse]);

        $newMsgCount = $mensajesCount + 2;

        // COMPRESIÓN AUTOMÁTICA EN MARKDOWN (.md) SI EXCEDE 10 MENSAJES
        if ($newMsgCount >= 10) {
            $stmtAllMsgs = $pdo->prepare("SELECT emisor, contenido FROM ia_chat_mensajes WHERE sesion_id = ? ORDER BY id ASC");
            $stmtAllMsgs->execute([$sesionId]);
            $allMsgs = $stmtAllMsgs->fetchAll(PDO::FETCH_ASSOC);

            $summaryMd = "# 📝 SÍNTESIS CONTEXTUAL COMPRIMIDA DEL CHAT\n\n";
            $summaryMd .= "> **Estudiante**: " . $user['nombre'] . "\n";
            $summaryMd .= "> **Fecha de Compresión**: " . date('Y-m-d H:i:s') . "\n\n";
            $summaryMd .= "### Temas Tratados Anteriormente:\n";
            foreach ($allMsgs as $m) {
                $summaryMd .= "- **" . ucfirst($m['emisor']) . "**: " . mb_substr($m['contenido'], 0, 150) . "...\n";
            }

            // Actualizar sesión con el resumen Markdown y resetear contador
            $stmtComp = $pdo->prepare("UPDATE ia_chat_sesiones SET resumen_contexto_md = ?, mensajes_count = 0, ultimo_sentimiento = ?, ultimo_score = ? WHERE id = ?");
            $stmtComp->execute([$summaryMd, $sentimientoCat, $sentimientoScore, $sesionId]);
        } else {
            $stmtUpdS = $pdo->prepare("UPDATE ia_chat_sesiones SET mensajes_count = ?, ultimo_sentimiento = ?, ultimo_score = ? WHERE id = ?");
            $stmtUpdS->execute([$newMsgCount, $sentimientoCat, $sentimientoScore, $sesionId]);
        }
    }

    // 6. Registro en el Historial con Auditoría de Geolocalización
    $stmtH = $pdo->prepare("
        INSERT INTO chatbot_historial 
        (usuario_id, mensaje, respuesta, provider, latency_ms, accion_detectada, sentimiento_score, sentimiento_categoria, ip_address, user_agent, geoloc_lat, geoloc_lon, geoloc_city, geoloc_country) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmtH->execute([
        $user ? $user['id'] : null,
        $message,
        $aiResponse,
        $chosenProvider,
        $latency,
        $intent,
        $sentimientoScore,
        $sentimientoCat,
        $clientIp,
        $userAgent,
        $lat,
        $lon,
        $city,
        $country
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
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
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
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $decoded = json_decode($response, true);
    return $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
}

function callOpenRouter($prompt, $context, $url, $key, $model) {
    $ch = curl_init($url ?: "https://openrouter.ai/api/v1/chat/completions");
    $data = [
        "model" => $model ?: "google/gemini-2.5-flash",
        "messages" => [
            ["role" => "system", "content" => $context],
            ["role" => "user", "content" => $prompt]
        ]
    ];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $key",
        "Content-Type: application/json",
        "HTTP-Referer: https://cesaunison.fondothoth.com",
        "X-Title: CESA UNISON"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $decoded = json_decode($response, true);
    return $decoded['choices'][0]['message']['content'] ?? null;
}

function callMistral($prompt, $context, $url, $key, $model) {
    $ch = curl_init($url ?: "https://api.mistral.ai/v1/chat/completions");
    $data = [
        "model" => $model ?: "mistral-tiny",
        "messages" => [
            ["role" => "system", "content" => $context],
            ["role" => "user", "content" => $prompt]
        ]
    ];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $key", "Content-Type: application/json"]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $decoded = json_decode($response, true);
    return $decoded['choices'][0]['message']['content'] ?? null;
}

function callOllamaCloud($prompt, $context, $url, $key, $model) {
    $endpoint = $url ?: "https://ollama.com/api/chat";

    // Extraer pool de claves desde env (OLLAMA_API_KEYS o OLLAMA_API_KEY)
    $envKeysRaw = getenv('OLLAMA_API_KEYS') ?: getenv('OLLAMA_API_KEY') ?: $key;
    $keysPool = array_filter(array_map('trim', explode(',', $envKeysRaw)));

    if (empty($keysPool)) {
        $keysPool = [$key];
    }

    // Intentar secuencialmente cada clave del pool
    foreach ($keysPool as $index => $currentKey) {
        if (empty($currentKey)) continue;

        $ch = curl_init($endpoint);
        $data = [
            "model" => $model ?: "nemotron-3-super",
            "messages" => [
                ["role" => "system", "content" => $context],
                ["role" => "user", "content" => $prompt]
            ],
            "stream" => false
        ];
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$currentKey}", "Content-Type: application/json"]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $decoded = json_decode($response, true);
            $content = $decoded['message']['content'] ?? null;
            if ($content) {
                return $content;
            }
        }
        error_log("Ollama Cloud Key #" . ($index + 1) . " agotada o falló (HTTP $httpCode). Rotando a la siguiente clave...");
    }

    return null;
}

function getIpGeolocation($ip) {
    if ($ip === '127.0.0.1' || $ip === '::1' || empty($ip)) {
        return [
            'city' => 'Hermosillo',
            'country' => 'Mexico',
            'lat' => 29.0883,
            'lon' => -110.9614
        ];
    }
    try {
        $ch = curl_init("http://ip-api.com/json/" . $ip);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);
        $res = curl_exec($ch);
        if ($res) {
            $data = json_decode($res, true);
            if (($data['status'] ?? '') === 'success') {
                return [
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                    'lat' => $data['lat'] ?? null,
                    'lon' => $data['lon'] ?? null
                ];
            }
        }
    } catch (Exception $e) {}
    return [
        'city' => null,
        'country' => null,
        'lat' => null,
        'lon' => null
    ];
}

