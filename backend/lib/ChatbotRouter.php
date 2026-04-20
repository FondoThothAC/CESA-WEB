<?php
/**
 * ChatbotRouter - Motor de Inferencia Híbrido CESA v3.5
 * Archivo: /backend/lib/ChatbotRouter.php
 */

class ChatbotRouter {
    private $providers;
    private $timeout_local = 15;
    private $timeout_cloud = 10;
    private $directory_context = "";
    
    public function __construct(?PDO $pdo = null) {
        // Cargar contexto del directorio para alimentar a la IA
        $this->loadDirectoryContext();

        // Providers por defecto (.env)
        $this->providers = [
            'local' => [
                'url' => getenv('CESA_MAC_MINI_URL') ?: 'http://localhost:11434',
                'model' => 'cesa-assistant',
                'timeout' => $this->timeout_local,
                'enabled' => true
            ],
            'groq' => [
                'url' => 'https://api.groq.com/openai/v1/chat/completions',
                'api_key' => getenv('GROQ_API_KEY'),
                'model' => 'llama-3.1-8b-instant',
                'timeout' => $this->timeout_cloud,
                'enabled' => !empty(getenv('GROQ_API_KEY'))
            ],
            'gemini' => [
                'url' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
                'api_key' => getenv('GEMINI_API_KEY'),
                'timeout' => $this->timeout_cloud,
                'enabled' => !empty(getenv('GEMINI_API_KEY'))
            ]
        ];

        // Intentar sobreescribir con configs de la DB si el PDO está disponible
        if ($pdo) {
            $this->loadDbConfigs($pdo);
        }
    }

    private function loadDbConfigs(PDO $pdo) {
        try {
            require_once __DIR__ . '/SecureConfig.php';
            $stmt = $pdo->query("SELECT * FROM api_configs WHERE is_active = 1 ORDER BY priority ASC");
            $db_configs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($db_configs as $db_cfg) {
                $name = $db_cfg['provider'];
                $key = $db_cfg['api_key_encrypted'] ? SecureConfig::decrypt($db_cfg['api_key_encrypted']) : null;
                
                $this->providers[$name] = [
                    'url' => $db_cfg['endpoint_url'],
                    'api_key' => $key ?: ($this->providers[$name]['api_key'] ?? null),
                    'model' => $db_cfg['model_name'] ?: ($this->providers[$name]['model'] ?? 'cesa-assistant'),
                    'timeout' => $db_cfg['timeout_seconds'],
                    'enabled' => true
                ];
            }
        } catch (Exception $e) {
            error_log("Dynamic IA Config Load Failed: " . $e->getMessage());
        }
    }

    private function loadDirectoryContext() {
        $path = __DIR__ . '/../../frontend/src/lib/directorio.json';
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            // Tomamos una muestra para dar contexto institucional
            $context = "INFORMACIÓN DE SOCIEDADES DE ALUMNOS:\n";
            $count = 0;
            foreach ($data as $item) {
                if ($count > 10) break; // Límite de tokens para el prompt inicial
                $context .= "- {$item['Carrera']} ({$item['Siglas']}): Presidida por {$item['Presidencia Contacto']}\n";
                $count++;
            }
            $this->directory_context = $context;
        }
    }

    private function getSystemPrompt() {
        return "Eres CESA Bot, el asistente oficial del Consejo Estudiantil de Sociedades de Alumnos de la UNISON (2026-2028).\n" .
               "Tu objetivo es ayudar a los estudiantes con dudas académicas, bolsa de trabajo y servicios del CESA.\n" .
               "CONTEXTO ACTUAL DEL DIRECTORIO:\n" . $this->directory_context . "\n" .
               "REGLAS:\n" .
               "1. Responde de forma breve (máximo 3 oraciones).\n" .
               "2. Si no sabes algo, sugiere contactar a admin@cesa.unison.mx.\n" .
               "3. Mantén un tono profesional y cercano.";
    }
    
    public function process(string $message, ?int $user_id = null, ?PDO $pdo = null): array {
        $start_time = microtime(true);
        $attempts = [];
        
        // 1. Detectar intenciones avanzadas (Acciones Estructuradas)
        if ($pdo && $user_id) {
            require_once __DIR__ . '/AdvancedFunctions.php';
            $advanced = new AdvancedFunctions($pdo);
            $action = $advanced->processIntent($message, $user_id, []);
            if ($action['action'] !== 'none') {
                return [
                    'success' => true,
                    'response' => $action['response'],
                    'action' => $action['action'],
                    'url' => $action['url'] ?? null,
                    'provider' => 'action_dispatcher',
                    'latency_ms' => round((microtime(true) - $start_time) * 1000),
                    'timestamp' => date('Y-m-d H:i:s')
                ];
            }
        }

        $prompt = $this->getSystemPrompt() . "\n\nUSUARIO: " . $message . "\nASISTENTE:";
        
        foreach ($this->providers as $name => $config) {
            if (!$config['enabled']) continue;
            
            try {
                $response = $this->callProvider($name, $config, $prompt);
                $latency = round((microtime(true) - $start_time) * 1000);
                
                // Logging de auditoría si el PDO está disponible
                if ($pdo) {
                    $this->logUsage($pdo, $name, $user_id, 'chat', $latency, 200);
                }

                return [
                    'success' => true,
                    'response' => $response,
                    'provider' => $name,
                    'latency_ms' => $latency,
                    'fallback_used' => !empty($attempts),
                    'timestamp' => date('Y-m-d H:i:s')
                ];
            } catch (Exception $e) {
                $attempts[$name] = $e->getMessage();
                if ($pdo) {
                    $this->logUsage($pdo, $name, $user_id, 'chat', 0, 500, $e->getMessage());
                }
                continue;
            }
        }
        
        return [
            'success' => false,
            'response' => 'Servicio IA offline. Intenta más tarde.',
            'attempts' => $attempts
        ];
    }
    
    private function callProvider(string $name, array $config, string $prompt): string {
        if ($name === 'local') return $this->callOllama($config, $prompt);
        // Placeholder para otros proveedores
        throw new Exception("Proveedor $name no disponible.");
    }

    public function classifySentiment(string $text): array {
        $start_time = microtime(true);
        
        $prompt = "Analiza el siguiente reporte estudiantil y responde ÚNICAMENTE en formato JSON válido.\n" .
                  "Texto del reporte: \"$text\"\n\n" .
                  "JSON Schema:\n" .
                  "{\n" .
                  "  \"sentimiento\": \"positivo|negativo|neutro\",\n" .
                  "  \"prioridad\": \"baja|media|alta|urgente\",\n" .
                  "  \"categoria\": \"infraestructura|docencia|servicios|administracion|salud|seguridad|otro\",\n" .
                  "  \"razon\": \"breve explicacion\"\n" .
                  "}";

        foreach ($this->providers as $name => $config) {
            if (!$config['enabled']) continue;
            try {
                $raw_response = $this->callProvider($name, $config, $prompt);
                $latency = round((microtime(true) - $start_time) * 1000);
                
                // Intentar limpiar el JSON si el LLM agrega texto extra
                $json_start = strpos($raw_response, '{');
                $json_end = strrpos($raw_response, '}') + 1;
                $clean_json = substr($raw_response, $json_start, $json_end - $json_start);
                
                $data = json_decode($clean_json, true);
                if ($data) {
                    return [
                        'success' => true,
                        'analysis' => $data,
                        'provider' => $name,
                        'latency_ms' => $latency
                    ];
                }
            } catch (Exception $e) {
                error_log("Sentiment Engine Error [$name]: " . $e->getMessage());
                continue;
            }
        }

        return ['success' => false, 'error' => 'IA Engine unreachable for sentiment analysis.'];
    }

    private function callOllama(array $config, string $prompt): string {
        $payload = ['model' => $config['model'], 'prompt' => $prompt, 'stream' => false];
        $ch = curl_init($config['url'] . '/api/generate');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $config['timeout']);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($code !== 200) throw new Exception("Ollama error $code");
        $data = json_decode($res, true);
        return $data['response'] ?? "Error en respuesta.";
    private function logUsage(PDO $pdo, string $provider, ?int $user_id, string $type, int $latency, int $status, ?string $error = null) {
        try {
            // Obtener ID de la configuración del proveedor
            $stmt = $pdo->prepare("SELECT id FROM api_configs WHERE provider = ?");
            $stmt->execute([$provider]);
            $cfg_id = $stmt->fetchColumn();

            if ($cfg_id) {
                $ins = $pdo->prepare("INSERT INTO api_usage_logs (config_id, usuario_id, endpoint_called, response_status, latency_ms, error_message) VALUES (?, ?, ?, ?, ?, ?)");
                $ins->execute([$cfg_id, $user_id, $type, $status, $latency, $error]);
            }
        } catch (Exception $e) {
            // Silent fail for logs
        }
    }
}
