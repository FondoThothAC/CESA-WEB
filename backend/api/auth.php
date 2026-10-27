<?php
/**
 * API Auth - CESA WEB v3.5
 * Integración Real con MariaDB
 * Archivo: /backend/api/auth.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/JWTHelper.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/RateLimiter.php';
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
    $pdo = getDBConnection();

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // LOGIN ACTION
        if ($action === 'login') {
            // Rate limiting anti fuerza bruta: 5 intentos por 15 min por IP+identificador
            $rateLimiter = new RateLimiter();
            $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $rawIdentifier = trim($input['email'] ?? $input['identifier'] ?? '');
            $rlKey = 'login_' . $clientIp . '_' . substr(md5($rawIdentifier), 0, 12);
            if (!$rateLimiter->check($rlKey, 5, 900)) {
                http_response_code(429);
                echo json_encode(['success' => false, 'error' => 'Demasiados intentos de inicio de sesión. Espera 15 minutos.']);
                exit;
            }

            $password = $input['password'] ?? '';
            $telefonoInput = trim($input['telefono'] ?? '');
            $curpInput = trim($input['curp'] ?? '');
            
            if (empty($rawIdentifier)) throw new Exception('Por favor ingresa tu Número de Expediente o Correo.');

            $identifier = strtolower($rawIdentifier);
            
            // Extraer solo dígitos numéricos para la matrícula/expediente
            preg_match('/\d+/', $identifier, $matches);
            $clean_num = $matches[0] ?? '';

            // Construir versión limpia del correo institucional
            $clean_email = str_contains($identifier, '@')
                ? $identifier
                : (!empty($clean_num) ? "a{$clean_num}@unison.mx" : $identifier);

            $clean_phone_id = preg_replace('/\D/', '', $identifier);

            // Buscar por Email (LOWER), Expediente, Matrícula, Teléfono, Celular o CURP
            $stmt = $pdo->prepare("
                SELECT * FROM usuarios 
                WHERE (
                    LOWER(email) = :id 
                    OR LOWER(email) = :clean_email
                    OR expediente = :clean_num
                    OR matricula = :clean_num
                    OR (:clean_phone != '' AND (telefono = :clean_phone OR celular = :clean_phone))
                    OR LOWER(curp) = :id
                ) 
                AND activo = 1
            ");
            $stmt->execute([
                ':id' => $identifier,
                ':clean_email' => $clean_email,
                ':clean_num' => $clean_num,
                ':clean_phone' => $clean_phone_id
            ]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Autenticación flexible: Contraseña o Número de Celular/Teléfono ligado
            $authSuccess = false;
            if ($user) {
                // 1. Verificación por hash de contraseña tradicional
                if (!empty($password) && password_verify($password, $user['password_hash'])) {
                    $authSuccess = true;
                }
                
                // 2. Verificación si el teléfono o celular coincide (removiendo espacios y guiones)
                $providedPhone = !empty($telefonoInput) ? $telefonoInput : $password;
                $cleanProvidedPhone = preg_replace('/\D/', '', $providedPhone);
                $dbPhone = preg_replace('/\D/', '', $user['telefono'] ?? '');
                $dbCelular = preg_replace('/\D/', '', $user['celular'] ?? '');

                if (!empty($cleanProvidedPhone) && strlen($cleanProvidedPhone) >= 7) {
                    if ((!empty($dbPhone) && $cleanProvidedPhone === $dbPhone) || 
                        (!empty($dbCelular) && $cleanProvidedPhone === $dbCelular)) {
                        $authSuccess = true;
                    }
                }

                // 3. Verificación alternativa si se proporciona CURP
                if (!empty($curpInput) && strtolower($curpInput) === strtolower(trim($user['curp'] ?? ''))) {
                    $authSuccess = true;
                }
            }

            if ($user && $authSuccess) {
                $role = $user['rol'];
                if (Auth::isMasterEmail($user['email'])) {
                    $role = 'admin';
                }
                $expedienteCode = $user['expediente'] ?: ($user['matricula'] ?: '');
                $token = JWTHelper::create([
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'rol' => $role,
                    'nombre' => $user['nombre_completo'],
                    'nombre_completo' => $user['nombre_completo'],
                    'expediente' => $expedienteCode,
                    'matricula' => $expedienteCode,
                    'carrera' => $user['carrera'] ?? 'No especificada',
                    'avatar_path' => $user['avatar_path'] ?? null
                ]);
                
                // Guardar JWT en Cookie para portales PHP (30 días, alineado con el JWT)
                setcookie('cesa_jwt', $token, [
                    'expires' => time() + 3600 * 24 * 30,
                    'path' => '/',
                    'domain' => $cookie_domain,
                    'secure' => $is_secure,
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]);

                // Guardar en sesión de PHP para persistencia nativa
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['rol'] = $role;
                $_SESSION['nombre'] = $user['nombre_completo'];
                $_SESSION['nombre_completo'] = $user['nombre_completo'];
                $_SESSION['expediente'] = $expedienteCode;
                $_SESSION['matricula'] = $expedienteCode;
                $_SESSION['carrera'] = $user['carrera'] ?? 'No especificada';

                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'nombre' => $user['nombre_completo'],
                        'nombre_completo' => $user['nombre_completo'],
                        'rol' => $role,
                        'email' => $user['email'],
                        'expediente' => $expedienteCode,
                        'matricula' => $expedienteCode,
                        'carrera' => $user['carrera'] ?? 'No especificada',
                        'avatar_path' => $user['avatar_path'] ?? null,
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
            $password = $input['password'] ?? '';
            $nombre = trim($input['nombre_completo'] ?? '');
            $matricula = trim($input['matricula'] ?? '');
            $telefono = trim($input['telefono'] ?? '');
            $curp = trim($input['curp'] ?? '');
            $rol = trim($input['rol'] ?? 'estudiante');
            $carrera = trim($input['carrera'] ?? 'No especificada');

            // Roles auto-asignables: mesa_directiva solo puede otorgarla un admin
            $validRoles = ['estudiante', 'empresa', 'sociedad'];
            if (!in_array($rol, $validRoles)) {
                throw new Exception('Rol de registro no válido.');
            }

            if (empty($email) || empty($nombre)) throw new Exception('Correo y Nombre completo son obligatorios');

            // Contraseña obligatoria: nunca asignar contraseñas predecibles
            if (strlen($password) < 8) {
                throw new Exception('La contraseña debe tener al menos 8 caracteres');
            }

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
                (email, password_hash, nombre_completo, matricula, expediente, telefono, celular, curp, rol, carrera) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$email, $hash, $nombre, $matricula, $matricula, $telefono, $telefono, $curp, $rol, $carrera]);

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
                if (Auth::isMasterEmail($decoded['email'] ?? null)) {
                    $decoded['rol'] = 'admin';
                }
                // Asegurar simetría de nombre y nombre_completo
                if (empty($decoded['nombre_completo']) && !empty($decoded['nombre'])) {
                    $decoded['nombre_completo'] = $decoded['nombre'];
                }
                if (empty($decoded['nombre']) && !empty($decoded['nombre_completo'])) {
                    $decoded['nombre'] = $decoded['nombre_completo'];
                }
                echo json_encode(['success' => true, 'user' => $decoded]);
                exit;
            }
        }

        // Si no hay token o falló, revisar si hay sesión de PHP activa
        if (isset($_SESSION['user_id'])) {
            $role = $_SESSION['rol'];
            if (Auth::isMasterEmail($_SESSION['email'] ?? null)) {
                $role = 'admin';
            }
            $nombreVal = $_SESSION['nombre_completo'] ?? $_SESSION['nombre'] ?? 'Estudiante';
            echo json_encode([
                'success' => true, 
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'email' => $_SESSION['email'],
                    'rol' => $role,
                    'nombre' => $nombreVal,
                    'nombre_completo' => $nombreVal,
                    'expediente' => $_SESSION['expediente'] ?? $_SESSION['matricula'] ?? '',
                    'matricula' => $_SESSION['matricula'] ?? $_SESSION['expediente'] ?? '',
                    'carrera' => $_SESSION['carrera'] ?? 'No especificada'
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
