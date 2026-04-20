<?php
/**
 * SentimentWorker - Procesamiento Batch de Sentimientos v3.5
 * Archivo: /backend/scripts/sentiment_worker.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/ChatbotRouter.php';

class SentimentWorker {
    private $pdo;
    private $router;
    
    public function __construct() {
        $this->pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));
        $this->router = new ChatbotRouter($this->pdo);
    }
    
    public function run() {
        echo "[SENTIMENT WORKER] Iniciando proceso... " . date('Y-m-d H:i:s') . "\n";
        
        // 1. Procesar Muro Social (Simulacro de batch)
        $stmt = $this->pdo->query("SELECT id, contenido FROM muro_social WHERE sentiment = 'neutro' LIMIT 50");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($posts as $post) {
            $analysis = $this->router->classifySentiment($post['contenido']);
            if ($analysis['success']) {
                $sent = $analysis['analysis']['sentimiento'];
                $upd = $this->pdo->prepare("UPDATE muro_social SET sentiment = ? WHERE id = ?");
                $upd->execute([$sent, $post['id']]);
                echo "✓ Post {$post['id']}: $sent\n";
            }
        }
        
        echo "[SENTIMENT WORKER] Proceso completado.\n";
    }
}

// Ejecución CLI
if (php_sapi_name() === 'cli') {
    $worker = new SentimentWorker();
    $worker->run();
}
