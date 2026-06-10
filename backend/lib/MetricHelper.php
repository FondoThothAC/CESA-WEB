<?php
/**
 * MetricHelper v1.0 - CESA WEB Industrialized
 * Cálculos de KPIs para Emprendedores y Administración
 */
declare(strict_types=1);

class MetricHelper {

    /**
     * Obtiene el resumen de métricas para un emprendimiento específico
     */
    public static function getSummaryMetrics(PDO $pdo, int $emprendimientoId): array {
        // 1. Obtener views básicos de la tabla base
        $stmt = $pdo->prepare("SELECT views, nombre_negocio FROM emprendimientos WHERE id = ?");
        $stmt->execute([$emprendimientoId]);
        $baseData = $stmt->fetch();
        
        if (!$baseData) return [];

        // 2. Calcular agregados de sentimiento
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN sentiment = 'positivo' THEN 1 ELSE 0 END) as pos,
                SUM(CASE WHEN sentiment = 'negativo' THEN 1 ELSE 0 END) as neg,
                SUM(CASE WHEN sentiment = 'neutro' THEN 1 ELSE 0 END) as neu
            FROM sentimiento_analisis 
            WHERE item_type = 'bazar' AND item_id = ?
        ");
        $stmt->execute([$emprendimientoId]);
        $sentData = $stmt->fetch();

        $totalSent = max(1, (int)$sentData['total']);
        
        return [
            'views' => (int)$baseData['views'],
            'sent_positivo_pct' => round(((int)$sentData['pos'] / $totalSent) * 100, 1),
            'sent_negativo_pct' => round(((int)$sentData['neg'] / $totalSent) * 100, 1),
            'sent_total' => (int)$sentData['total'],
            'satisfaccion' => round(((int)$sentData['pos'] / $totalSent) * 100, 1),
            'nombre_negocio' => $baseData['nombre_negocio']
        ];
    }

    /**
     * Obtiene el histórico de vistas (simulado a partir de sentimiento_queue o logs de vistas si existen)
     * Para esta fase inicial, usaremos una distribución aleatoria basada en el total para demo,
     * pero lista para conectarse a una tabla de 'vistas_diarias'.
     */
    public static function getHistoricalViews(PDO $pdo, int $emprendimientoId, string $periodo = '7d'): array {
        $days = ($periodo === '30d') ? 30 : 7;
        $history = [];
        
        $stmt = $pdo->prepare("SELECT views FROM emprendimientos WHERE id = ?");
        $stmt->execute([$emprendimientoId]);
        $total = $stmt->fetchColumn() ?: 0;
        
        // Simulación controlada para el dashboard inicial
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('d/m', strtotime("-$i days"));
            $history[] = [
                'dia' => $date,
                'vistas' => (int)($total / $days) + rand(-5, 10)
            ];
        }
        
        return $history;
    }

    /**
     * Obtiene los temas más mencionados por la IA
     */
    public static function getTrendingTopics(PDO $pdo, int $emprendimientoId): array {
        $stmt = $pdo->prepare("
            SELECT categoria_tematica as tema, COUNT(*) as menciones
            FROM sentimiento_analisis
            WHERE item_type = 'bazar' AND item_id = ? AND categoria_tematica IS NOT NULL
            GROUP BY categoria_tematica
            ORDER BY menciones DESC
            LIMIT 5
        ");
        $stmt->execute([$emprendimientoId]);
        return $stmt->fetchAll();
    }
}
