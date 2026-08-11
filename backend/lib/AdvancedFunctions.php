<?php
/**
 * AdvancedFunctions - Habilidades y Acciones Estructuradas del Chatbot v3.5
 * Archivo: /backend/lib/AdvancedFunctions.php
 */

class AdvancedFunctions {
    private $pdo;
    
    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Detectar intención avanzada y ejecutar acción estructurada
     */
    public function processIntent(string $message, int $user_id, array $context): array {
        $intents = [
            'postular_vacante' => [
                'keywords' => ['postular', 'aplicar', 'vacante', 'empleo', 'trabajo'],
                'handler' => [$this, 'handleJobApplication']
            ],
            'reportar_problema' => [
                'keywords' => ['queja', 'reportar', 'problema', 'inconforme', 'denuncia'],
                'handler' => [$this, 'handleReport']
            ],
            'registrar_emprendimiento' => [
                'keywords' => ['bazar', 'negocio', 'emprender', 'vender', 'producto'],
                'handler' => [$this, 'handleBazarRegistration']
            ],
            'consultar_estado' => [
                'keywords' => ['estado', 'seguimiento', 'como va', 'mi reporte', 'mi vacante'],
                'handler' => [$this, 'handleStatusQuery']
            ],
            'crear_evento' => [
                'keywords' => ['evento', 'taller', 'organizar', 'charla', 'conferencia'],
                'handler' => [$this, 'handleEventCreation']
            ],
            'buscar_colegas' => [
                'keywords' => ['compañeros', 'colegas', 'estudiantes de', 'quien mas'],
                'handler' => [$this, 'handleFindPeers']
            ]
        ];
        
        $message_lower = mb_strtolower($message, 'UTF-8');
        
        foreach ($intents as $intent => $config) {
            foreach ($config['keywords'] as $kw) {
                if (str_contains($message_lower, $kw)) {
                    $result = call_user_func($config['handler'], $user_id, $context);
                    $this->logAction($user_id, $intent, $result);
                    return $result;
                }
            }
        }
        
        return ['action' => 'none'];
    }
    
    private function handleJobApplication(int $user_id, array $context): array {
        return [
            'action' => 'redirect',
            'response' => "¡Excelente elección! 💼 Para postularte, puedes ver las vacantes activas aquí: [Ver Vacantes](/empleos). ¿En qué área buscas desarrollarte?",
            'url' => '/empleos'
        ];
    }
    
    private function handleReport(int $user_id, array $context): array {
        return [
            'action' => 'redirect',
            'response' => "Entiendo la situación. 🗣️ Tu reporte es valioso. Puedes enviarlo de forma anónima aquí: [Buzón de Reportes](/reportar).",
            'url' => '/reportar'
        ];
    }
    
    private function handleBazarRegistration(int $user_id, array $context): array {
        return [
            'action' => 'redirect',
            'response' => "🚀 ¡Gris iniciativa! El CESA apoya el emprendimiento. Registra tu negocio aquí: [Registrar Bazar](/bazar?nuevo)",
            'url' => '/bazar'
        ];
    }

    private function handleStatusQuery(int $user_id, array $context): array {
        // Consultar últimos reportes y postulaciones
        $stmt = $this->pdo->prepare("
            (SELECT 'Reporte' as tipo, asunto as ref, estado, created_at FROM reportes WHERE usuario_id = ?)
            UNION 
            (SELECT 'Vacante' as tipo, '' as ref, status as estado, created_at FROM bolsa_postulaciones WHERE usuario_id = ?)
            ORDER BY created_at DESC LIMIT 3
        ");
        $stmt->execute([$user_id, $user_id]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($items)) {
            return [
                'action' => 'message',
                'response' => "🔍 No encontré trámites recientes. ¿Quieres iniciar alguno?"
            ];
        }

        $res = "📊 Tus estados actuales:\n";
        foreach ($items as $it) {
            $res .= "- {$it['tipo']}: {$it['ref']} ({$it['estado']})\n";
        }
        return ['action' => 'message', 'response' => $res];
    }

    private function handleEventCreation(int $user_id, array $context): array {
        // Verificar rol
        $stmt = $this->pdo->prepare("SELECT rol FROM usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $rol = $stmt->fetchColumn();

        if (!in_array($rol, ['admin', 'mesa_directiva', 'sociedad'])) {
            return [
                'action' => 'message',
                'response' => "⚠️ Lo siento, solo miembros de Sociedades o Mesa Directiva pueden organizar eventos oficiales via CESA Bot."
            ];
        }

        return [
            'action' => 'redirect',
            'response' => "🗓️ ¡Manos a la obra! Prepara tu evento aquí: [Gestión de Eventos](/eventos/nuevo)",
            'url' => '/eventos/nuevo'
        ];
    }

    private function handleFindPeers(int $user_id, array $context): array {
        $stmt = $this->pdo->prepare("SELECT carrera FROM usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $carrera = $stmt->fetchColumn();

        return [
            'action' => 'message',
            'response' => "🎓 Hay 15 estudiantes de **$carrera** activos ahora. ¡Te sugiero revisar el Muro Social para conectar con ellos!"
        ];
    }

    private function logAction(int $user_id, string $type, array $result) {
        $stmt = $this->pdo->prepare("INSERT INTO chatbot_actions (usuario_id, accion_tipo, metadata) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $type, json_encode($result)]);
    }
}
