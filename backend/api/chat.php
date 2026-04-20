<?php
/**
 * CESA Chatbot - Entry Point v3.5
 * Archivo: /backend/api/chat.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/ChatbotRouter.php';
require_once __DIR__ . '/../lib/JWTHelper.php';
require_once __DIR__ . '/../lib/RateLimiter.php';

header('Content-Type: application/json; charset=utf-8');

// 1. JWT Authentication
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$user_id = null;

if (str_starts_with($authHeader, 'Bearer ')) {
    $token = substr($authHeader, 7);
    $payload = JWTHelper::verify($token);
    $user_id = $payload ? $payload['id'] : null;
}

// 2. Rate Limiting (preventivo)
$limiter = new RateLimiter();
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (!$limiter->check($ip, 30, 60)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Rate limit exceeded. 30 msg/min.']);
    exit;
}

// 3. Capturar input
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? '';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Mensaje vacío']);
    exit;
}

// 4. Iniciar Router con PDO para skills avanzadas
try {
    $pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));
    $router = new ChatbotRouter($pdo);
    $result = $router->process($message, $user_id, $pdo);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la IA motor.']);
}
