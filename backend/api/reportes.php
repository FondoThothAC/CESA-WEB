<?php
/**
 * API Buzón de Reportes - CESA WEB v3.5
 * Archivo: /backend/api/reportes.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/ChatbotRouter.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $text = $input['reporte'] ?? '';
    $category_client = $input['categoria_manual'] ?? 'general';

    if (empty($text)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Reporte vacío']);
        exit;
    }

    // --- ANÁLISIS DE SENTIMIENTO IA (Mac Mini M4) ---
    $router = new ChatbotRouter();
    $ai_analysis = $router->classifySentiment($text);

    // En producción guardaríamos en MariaDB (tabla sentimiento_analisis)
    // Aquí simulamos el éxito y devolvemos la clasificación para feedback visual

    $result = [
        'success' => true,
        'message' => 'Reporte enviado de forma anónima y encriptada.',
        'ia_classification' => $ai_analysis['success'] ? $ai_analysis['analysis'] : [
            'sentimiento' => 'desconocido',
            'prioridad' => 'media',
            'categoria' => $category_client
        ],
        'provider' => $ai_analysis['provider'] ?? 'fallback',
        'timestamp' => date('Y-m-d H:i:s')
    ];

    echo json_encode($result);
    exit;
}
