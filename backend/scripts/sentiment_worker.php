<?php
/**
 * SentimentWorker v3.7.1 - Procesamiento Industrial Corregido
 * Maneja dinámicamente las columnas de cada tabla (contenido vs descripcion).
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/ChatbotRouter.php';

class SentimentWorker {
    private $pdo;
    private $router;
    private $running = true;
    private $sleep_time = 10;

    public function __construct() {
        $this->pdo = getDBConnection();
        $this->router = new ChatbotRouter($this->pdo);
        
        if (function_exists('pcntl_signal')) {
            pcntl_signal(SIGTERM, [$this, "stop"]);
            pcntl_signal(SIGINT, [$this, "stop"]);
        }
    }

    public function stop() {
        $this->log("Apagado ordenado detectado...");
        $this->running = false;
    }

    private function log($msg) {
        echo "[" . date('Y-m-d H:i:s') . "] [SENTIMENT WORKER] $msg\n";
    }

    public function run() {
        $this->log("Iniciando motor de sentimiento v3.7.2 (Bazar Support)...");

        while ($this->running) {
            try {
                if (function_exists('pcntl_signal_dispatch')) pcntl_signal_dispatch();

                $processed = 0;
                $processed += $this->processTable('muro', 'publicaciones_muro', 'contenido');
                $processed += $this->processTable('reporte', 'reportes', 'descripcion');
                $processed += $this->processTable('bazar', 'emprendimientos', 'descripcion');

                if ($processed === 0) {
                    $this->log("Sin pendientes. Durmiendo {$this->sleep_time}s...");
                    sleep($this->sleep_time);
                } else {
                    $this->log("Batch completado ($processed items). Continuando.");
                }

            } catch (Exception $e) {
                $this->log("ERROR CRÍTICO: " . $e->getMessage());
                sleep(30); 
                try { $this->pdo = getDBConnection(); } catch(Exception $ex) {} 
            }
        }
    }

    private function processTable($type, $tableName, $textField) {
        $sql = "SELECT t.id, t.$textField as texto 
                FROM $tableName t
                LEFT JOIN sentimiento_analisis a ON a.item_type = ? AND a.item_id = t.id
                WHERE a.id IS NULL
                LIMIT 10";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$type]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $count = 0;
        foreach ($items as $item) {
            if (empty(trim($item['texto'] ?? ''))) {
                $count++; continue;
            }

            $this->log("Analizando $type #{$item['id']}...");
            $analysis = $this->router->classifySentiment($item['texto']);
            
            if ($analysis['success']) {
                $score = (int)$analysis['score'];
                $sentiment = 'neutro';
                if ($score >= 60) $sentiment = 'positivo';
                elseif ($score <= 40) $sentiment = 'negativo';

                $ins = $this->pdo->prepare("
                    INSERT INTO sentimiento_analisis (item_type, item_id, score, sentiment, provider, summary, categoria_tematica)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE score = VALUES(score), sentiment = VALUES(sentiment), summary = VALUES(summary)
                ");
                $ins->execute([
                    $type,
                    $item['id'],
                    $score,
                    $sentiment,
                    $analysis['provider'],
                    $analysis['resumen'] ?? '',
                    $analysis['categoria'] ?? 'General'
                ]);
                
                $this->log("✓ $type #{$item['id']} score: $score% ($sentiment)");
                $count++;
            } else {
                $this->log("✗ Error en $type #{$item['id']}: " . ($analysis['error'] ?? 'Unknown'));
            }
            
            usleep(200000); 
        }
        
        return $count;
    }
}

if (php_sapi_name() === 'cli') {
    $worker = new SentimentWorker();
    $worker->run();
}
