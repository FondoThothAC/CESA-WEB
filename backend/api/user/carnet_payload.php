<?php
/**
 * API: Obtener Payload de Carnet - CESA WEB v4.0
 * Genera un nuevo código firmado para el QR del alumno.
 */
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/CarnetService.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit;
}

$user = $auth->getUser();
$payload = CarnetService::generateSecurePayload($user['id']);

echo json_encode([
    'success' => true,
    'payload' => $payload,
    'expires_in' => 600,
    'timestamp' => time()
]);
