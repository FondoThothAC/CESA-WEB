<?php
/**
 * cron_sentiment.php - Procesamiento de IA en Batch (Background)
 * CESA Institutional Suite v3.5
 * Ubicación: /backend/scripts/cron_sentiment.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/ChatbotRouter.php';

// Solo ejecutar vía CLI (Cron) o con clave secreta
if (php_sapi_name() !== 'cli' && ($_GET['key'] ?? '') !== (getenv('APP_SECRET_KEY') ?: 'admin')) {
    die("Acceso denegado.");
}

$pdo = getDBConnection();
$ai = new ChatbotRouter($pdo);

echo "🚀 Iniciando procesamiento de sentimiento IA...\n";

// 1. Procesar Muro Social (Últimas 50 publicaciones no analizadas)
$posts = $pdo->query("
    SELECT p.id, p.contenido 
    FROM publicaciones_muro p
    LEFT JOIN sentimiento_analisis s ON s.item_id = p.id AND s.item_type = 'muro'
    WHERE s.id IS NULL
    ORDER BY p.created_at DESC
    LIMIT 50
")->fetchAll(PDO::FETCH_ASSOC);

$count = 0;
foreach ($posts as $post) {
    echo "  - Analizando post #{$post['id']}... ";
    $result = $ai->classifySentiment($post['contenido']);
    
    if ($result['success']) {
        $stmt = $pdo->prepare("
            INSERT INTO sentimiento_analisis (item_type, item_id, score, provider, summary)
            VALUES ('muro', ?, ?, ?, ?)
        ");
        $stmt->execute([
            $post['id'], 
            $result['score'], 
            $result['provider'], 
            $result['resumen']
        ]);
        echo "✅ Score: {$result['score']}\n";
        $count++;
    } else {
        echo "❌ Error: {$result['error']}\n";
    }
}

// 2. Procesar Reportes Críticos (No analizados)
$reports = $pdo->query("
    SELECT r.id, r.descripcion 
    FROM reportes r
    LEFT JOIN sentimiento_analisis s ON s.item_id = r.id AND s.item_type = 'reporte'
    WHERE s.id IS NULL
    ORDER BY r.created_at DESC
    LIMIT 20
")->fetchAll(PDO::FETCH_ASSOC);

foreach ($reports as $rep) {
    echo "  - Analizando reporte #{$rep['id']}... ";
    $result = $ai->classifySentiment($rep['descripcion']);
    if ($result['success']) {
        $stmt = $pdo->prepare("
            INSERT INTO sentimiento_analisis (item_type, item_id, score, provider, summary)
            VALUES ('reporte', ?, ?, ?, ?)
        ");
        $stmt->execute([$rep['id'], $result['score'], $result['provider'], $result['resumen']]);
        echo "✅ Score: {$result['score']}\n";
    }
}

echo "✨ Procesamiento completado. $count item(s) analizados.\n";
