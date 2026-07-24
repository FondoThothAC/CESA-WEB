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
            $identifier = trim($input['email'] ?? $input['identifier'] ?? '');
            $password = $input['password'] ?? '';
            
            if (empty($identifier)) throw new Exception('Por favor ingresa tu Correo (@unison.mx), Celular o CURP.');

            // Buscar por Email, Teléfono, CURP o Matrícula
            $stmt = $pdo->prepare("
                SELECT * FROM usuarios 
                WHERE (email = :id OR telefono = :id OR curp = :id OR matricula = :id) 
                AND activo = 1
            ");
            $stmt->execute([':id' => $identifier]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Permitir inicio de sesión con contraseña, o sin contraseña si ingresa los 3 datos de validación
            $authSuccess = false;
            if ($user) {
                if (!empty($password) && password_verify($password, $user['password_hash'])) {
                    $authSuccess = true;
                } else if (!empty($input['curp']) && !empty($input['telefono']) && 
                           strtolower(trim($input['curp'])) === strtolower(trim($user['curp'] ?? '')) &&
                           trim($input['telefono']) === trim($user['telefono'] ?? '')) {
                    // Autenticación por Validación de Identidad Triple (Sin contraseña)
                    $authSuccess = true;
                }
            }

            if ($user && $authSuccess) {
                $role = $user['rol'];
                if ($user['email'] === 'software@fondothoth.com' || $user['email'] === 'a213203453@unison.mx') {
                    $role = 'admin';
                }
                $token = JWTHelper::create([
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'rol' => $role,
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
                $_SESSION['rol'] = $role;
                $_SESSION['nombre'] = $user['nombre_completo'];

                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'nombre' => $user['nombre_completo'],
                        'rol' => $role,
                        'email' => $user['email'],
                        'telefono' => $user['telefono'] ?? '',
                        'curp' => $user['curp'] ?? ''
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Identificador o contraseña/datos de identidad incorrectos']);
            }
            exit;
        }

        // REGISTER ACTION
        if ($action === 'signup') {
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? 'Unison2026!';
            $nombre = trim($input['nombre_completo'] ?? '');
            $matricula = trim($input['matricula'] ?? '');
            $telefono = trim($input['telefono'] ?? '');
            $curp = trim($input['curp'] ?? '');
            $rol = trim($input['rol'] ?? 'estudiante');
            
            $validRoles = ['estudiante', 'empresa', 'sociedad', 'mesa_directiva'];
            if (!in_array($rol, $validRoles)) {
                $rol = 'estudiante';
            }
            
            if (empty($email) || empty($nombre)) throw new Exception('Correo y Nombre completo son obligatorios');

            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || (!str_ends_with($email, '@unison.mx') && !str_ends_with($email, '@fondothoth.com'))) {
                throw new Exception('Solo se permiten correos institucionales (@unison.mx o @fondothoth.com)');
            }

            // Verificar si ya existe por Email, Celular o CURP
            $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? OR (telefono != '' AND telefono = ?) OR (curp != '' AND curp = ?)");
            $check->execute([$email, $telefono, $curp]);
            if ($check->fetch()) throw new Exception('El usuario, correo, teléfono o CURP ya se encuentra registrado');

            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            
            $stmt = $pdo->prepare("
                INSERT INTO usuarios 
                (email, password_hash, nombre_completo, matricula, telefono, curp, rol) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$email, $hash, $nombre, $matricula, $telefono, $curp, $rol]);

            echo json_encode([
                'success' => true,
                'message' => 'Registro completado con éxito. Ya puedes ingresar.'
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
                if (($decoded['email'] ?? '') === 'software@fondothoth.com' || ($decoded['email'] ?? '') === 'a213203453@unison.mx') {
                    $decoded['rol'] = 'admin';
                }
                echo json_encode(['success' => true, 'user' => $decoded]);
                exit;
            }
        }

        // Si no hay token o falló, revisar si hay sesión de PHP activa
        if (isset($_SESSION['user_id'])) {
            $role = $_SESSION['rol'];
            if (($_SESSION['email'] ?? '') === 'software@fondothoth.com' || ($_SESSION['email'] ?? '') === 'a213203453@unison.mx') {
                $role = 'admin';
            }
            echo json_encode([
                'success' => true, 
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'email' => $_SESSION['email'],
                    'rol' => $role,
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
