<?php
/**
 * Check Session - Verifica si hay sesión activa para React
 */
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

if (!$auth->isLoggedIn()) {
    echo json_encode([
        'success' => false,
        'authenticated' => false
    ]);
    exit;
}

$user = $auth->getUser();

// Send back the jwt token if it's stored in session/cookie so React can save it to localStorage
$headers = getallheaders();
$token = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? ($_COOKIE['cesa_jwt'] ?? ($_SESSION['token'] ?? null));
if ($token && preg_match('/Bearer\s(\S+)/', $token, $matches)) {
    $token = $matches[1];
}

echo json_encode([
    'success' => true,
    'authenticated' => true,
    'user' => [
        'id' => (int)$user['id'],
        'matricula' => $user['matricula'] ?? 'N/A',
        'nombre_completo' => $user['nombre_completo'] ?? $user['nombre'] ?? 'N/A',
        'email' => $user['email'] ?? 'N/A',
        'carrera' => $user['carrera'] ?? 'No especificada',
        'rol' => $user['rol'],
        'avatar_url' => $user['avatar_url'] ?? null,
        'verificado' => (bool)($user['verificado'] ?? false),
        'created_at' => $user['created_at'] ?? null
    ],
    'token' => $token,
    'session_expires' => $_SESSION['expires'] ?? null
]);
