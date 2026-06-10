<?php
/**
 * API Auth - CESA WEB v3.5
 * Integración Real con MariaDB
 * Archivo: /backend/api/auth.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/JWTHelper.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

// Configuración de sesión global dinámica para dominio y seguridad
$cookie_domain = '';
$host = $_SERVER['HTTP_HOST'] ?? '';
$clean_host = explode(':', $host)[0];
if (!filter_var($clean_host, FILTER_VALIDATE_IP) && $clean_host !== 'localhost') {
    if (preg_match('/([a-z0-9\-]+\.[a-z0-9\-]+)$/i', $clean_host, $matches)) {
        $cookie_domain = '.' . $matches[1];
    }
}
$is_secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';

session_set_cookie_params([
    'lifetime' => 3600 * 24 * 7, // 7 días de sesión
    'path' => '/',
    'domain' => $cookie_domain,
    'secure' => $is_secure,
    'httponly' => false,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // LOGIN ACTION
        if ($action === 'login') {
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            
            if (empty($email) || empty($password)) throw new Exception('Credenciales incompletas');

            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND activo = 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password_hash'])) {
                $token = JWTHelper::create([
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'rol' => $user['rol'],
                    'nombre' => $user['nombre_completo']
                ]);
                
                // Guardar JWT en Cookie para portales PHP
                setcookie('cesa_jwt', $token, [
                    'expires' => time() + 3600 * 24 * 7,
                    'path' => '/',
                    'domain' => $cookie_domain,
                    'secure' => $is_secure,
                    'httponly' => false,
                    'samesite' => 'Lax'
                ]);

                // Guardar en sesión de PHP para persistencia nativa
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['rol'] = $user['rol'];
                $_SESSION['nombre'] = $user['nombre_completo'];

                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'nombre' => $user['nombre_completo'],
                        'rol' => $user['rol'],
                        'email' => $user['email']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Correo o contraseña incorrectos']);
            }
            exit;
        }

        // REGISTER ACTION
        if ($action === 'signup') {
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            $nombre = trim($input['nombre_completo'] ?? '');
            $matricula = trim($input['matricula'] ?? '');
            
            if (empty($email) || empty($password) || empty($nombre)) throw new Exception('Faltan campos obligatorios');

            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || (!str_ends_with($email, '@unison.mx') && !str_ends_with($email, '@fondothoth.com'))) {
                throw new Exception('Solo se permiten correos institucionales (@unison.mx o @fondothoth.com)');
            }

            // Verificar si ya existe
            $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $check->execute([$email]);
            if ($check->fetch()) throw new Exception('El correo ya está registrado');

            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            
            $stmt = $pdo->prepare("INSERT INTO usuarios (email, password_hash, nombre_completo, matricula, rol) VALUES (?, ?, ?, ?, 'estudiante')");
            $stmt->execute([$email, $hash, $nombre, $matricula]);

            echo json_encode([
                'success' => true,
                'message' => 'Registro completado con éxito. Ahora puedes iniciar sesión.'
            ]);
            exit;
        }

        // LOGOUT ACTION
        if ($action === 'logout') {
            session_destroy();
            setcookie('cesa_jwt', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'domain' => $cookie_domain,
                'secure' => $is_secure,
                'samesite' => 'Lax'
            ]);
            echo json_encode(['success' => true, 'message' => 'Sesión cerrada']);
            exit;
        }
    }

    // GET USER INFO (Verify Token)
    if ($method === 'GET' && $action === 'me') {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? ($_COOKIE['cesa_jwt'] ?? '');
        
        $token = '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        } else {
            $token = $authHeader;
        }

        if ($token) {
            $decoded = JWTHelper::verify($token);
            if ($decoded) {
                echo json_encode(['success' => true, 'user' => $decoded]);
                exit;
            }
        }

        // Si no hay token o falló, revisar si hay sesión de PHP activa
        if (isset($_SESSION['user_id'])) {
            echo json_encode([
                'success' => true, 
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'email' => $_SESSION['email'],
                    'rol' => $_SESSION['rol'],
                    'nombre' => $_SESSION['nombre']
                ]
            ]);
            exit;
        }
        
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Sesión expirada o inválida']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
