<?php
/**
 * API Identidad Digital QR - CESA WEB v3.5
 * Genera tokens dinámicos firmados para el Carnet Estudiantil.
 * Archivo: /backend/api/auth/identidad.php
 */

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sesión expirada']);
    exit;
}

// 1. Obtener datos clave para la identidad desde la base de datos (JWT no contiene toda la info)
$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT nombre_completo, expediente, carrera, semestre_ingreso, avatar_path FROM usuarios WHERE id = ?");
$stmt->execute([$user['id']]);
$dbUser = $stmt->fetch();

if (!$dbUser) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
    exit;
}

$secret = getenv('APP_SECRET_KEY') ?: 'cesa_industrial_sec_2026';
$timestamp = time();
$expediente = $dbUser['expediente'] ?? '00000000';

// 2. Generar Firma Digital (Integridad)
$payload = $user['id'] . '|' . $expediente . '|' . $timestamp;
$signature = hash_hmac('sha256', $payload, $secret);

// 3. Respuesta estructurada para el generador de QR
echo json_encode([
    'success' => true,
    'identity' => [
        'full_name' => $dbUser['nombre_completo'],
        'expediente' => $expediente,
        'carrera' => $dbUser['carrera'] ?? 'Unison',
        'semestre' => $dbUser['semestre_ingreso'] ?? 'N/A',
        'avatar_path' => $dbUser['avatar_path'],
        'timestamp' => $timestamp,
        'hash' => $signature,
        'qr_data' => base64_encode(json_encode([
            'uid' => $user['id'],
            'exp' => $expediente,
            'ts' => $timestamp,
            'sig' => substr($signature, 0, 16)
        ]))
    ]
]);
