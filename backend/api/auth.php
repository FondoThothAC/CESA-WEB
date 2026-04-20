<?php
/**
 * API Auth - CESA WEB v3.5
 * Archivo: /backend/api/auth.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/JWTHelper.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// --- MOCK DATABASE PARA DESARROLLO LOCAL ---
// En producción, esto se leería de MariaDB
$mock_users = [
    'root@unison.mx' => [
        'id' => 1,
        'email' => 'root@unison.mx',
        'nombre_completo' => 'Roberto Celis',
        'password_hash' => password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]),
        'rol' => 'admin'
    ]
];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // LOGIN ACTION
    if ($action === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        
        if (isset($mock_users[$email]) && password_verify($password, $mock_users[$email]['password_hash'])) {
            $user = $mock_users[$email];
            $token = JWTHelper::create([
                'id' => $user['id'],
                'email' => $user['email'],
                'rol' => $user['rol'],
                'nombre' => $user['nombre_completo']
            ]);
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'nombre' => $user['nombre_completo'],
                    'rol' => $user['rol'],
                    'email' => $user['email']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
        }
        exit;
    }

    // REGISTER ACTION
    if ($action === 'signup') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $nombre = $input['nombre'] ?? '';
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !str_ends_with($email, '@unison.mx')) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Solo se permiten correos @unison.mx']);
            exit;
        }

        // Mocking successful registration
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado (Mock). Por favor inicia sesión.'
        ]);
        exit;
    }
}

// GET USER INFO (Verify Token)
if ($method === 'GET' && $action === 'me') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $decoded = JWTHelper::verify($matches[1]);
        if ($decoded) {
            echo json_encode(['success' => true, 'user' => $decoded]);
            exit;
        }
    }
    
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}
