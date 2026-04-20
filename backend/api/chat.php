<?php
/**
 * CESA Chatbot - Entry Point
 * Archivo: /backend/api/chat.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/ChatbotRouter.php';

header('Content-Type: application/json; charset=utf-8');

// Capturar input
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? '';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Mensaje vacío']);
    exit;
}

// Iniciar Router
$router = new ChatbotRouter();
$result = $router->process($message);

echo json_encode($result);
