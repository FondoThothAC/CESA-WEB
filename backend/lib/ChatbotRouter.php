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
    
    public function __construct() {
        // Cargar contexto del directorio para alimentar a la IA
        $this->loadDirectoryContext();

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
    
    public function process(string $message, ?int $user_id = null): array {
        $start_time = microtime(true);
        $attempts = [];
        $prompt = $this->getSystemPrompt() . "\n\nUSUARIO: " . $message . "\nASISTENTE:";
        
        foreach ($this->providers as $name => $config) {
            if (!$config['enabled']) continue;
            
            try {
                $response = $this->callProvider($name, $config, $prompt);
                $latency = round((microtime(true) - $start_time) * 1000);
                
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
    }
}
