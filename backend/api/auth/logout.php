<?php
/**
 * Logout - Destruye la sesión PHP
 */
declare(strict_types=1);
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$auth = new Auth();

$auth->logout();

echo json_encode([
    'success' => true,
    'message' => 'Sesión cerrada correctamente'
]);
