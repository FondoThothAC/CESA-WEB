<?php
/**
 * AdvancedFunctions - Habilidades y Acciones Estructuradas del Chatbot v3.1
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
            ]
        ];
        
        $message_lower = mb_strtolower($message, 'UTF-8');
        
        foreach ($intents as $intent => $config) {
            foreach ($config['keywords'] as $kw) {
                if (str_contains($message_lower, $kw)) {
                    return call_user_func($config['handler'], $user_id, $context);
                }
            }
        }
        
        return ['action' => 'none'];
    }
    
    private function handleJobApplication(int $user_id, array $context): array {
        return [
            'action' => 'redirect',
            'response' => "¡Excelente elección! 💼 Para postularte, puedes ver las vacantes activas y subir tu CV aquí: [Ver Vacantes](/bolsa-de-trabajo). ¿En qué área buscas desarrollarte?",
            'url' => '/bolsa-de-trabajo'
        ];
    }
    
    private function handleReport(int $user_id, array $context): array {
        return [
            'action' => 'redirect',
            'response' => "Entiendo la situación. 🗣️ Tu reporte es muy valioso para la Mesa Directiva. Puedes enviarlo de forma anónima o identificada aquí: [Buzón de Reportes](/buzon).",
            'url' => '/buzon'
        ];
    }
    
    private function handleBazarRegistration(int $user_id, array $context): array {
        return [
            'action' => 'redirect',
            'response' => "🚀 ¡Qué gran iniciativa! El CESA apoya el emprendimiento estudiantil. Puedes registrar tu negocio aquí: [Registrar en Bazar](/bazar). ¿Qué tipo de productos vendes?",
            'url' => '/bazar'
        ];
    }
}
