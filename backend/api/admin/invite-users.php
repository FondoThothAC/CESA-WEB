<?php
/**
 * invite-users.php - Registro masivo de usuarios v3.5
 * Archivo: /backend/api/admin/invite-users.php
 * Sincronizado con schema.sql (nombre_completo, password_hash)
 */

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/MailHelper.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json');

$auth = new Auth();
if (!$auth->hasRole('admin')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Recibir CSV
if (!isset($_FILES['csv']) || $_FILES['csv']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No se recibió archivo CSV válido']);
    exit;
}

$file = $_FILES['csv']['tmp_name'];
$handle = fopen($file, "r");
$count = 0;
$errors = [];

// Skip header (esperado: nombre_completo,email,rol,matricula)
fgetcsv($handle);

try {
    $pdo = getDBConnection();
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (count($data) < 3) continue;

        $nombre = trim($data[0]);
        $email = trim($data[1]);
        $rol = trim($data[2]);
        $matricula = trim($data[3] ?? '');
        
        // Generar Password Temporal
        $tempPass = substr(bin2hex(random_bytes(4)), 0, 8); 

        try {
            // 1. Crear usuario en DB con esquema industrializado
            $hashed = password_hash($tempPass, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $pdo->prepare("INSERT INTO usuarios (nombre_completo, email, password_hash, rol, matricula) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$nombre, $email, $hashed, $rol, $matricula]);

            // 2. Enviar Invitación Real/Log
            if (MailHelper::sendInvitation($email, $nombre, $tempPass)) {
                $count++;
            } else {
                $errors[] = "Usuario creado pero falló el envío de correo a $email";
            }
        } catch (PDOException $e) {
            $errors[] = "Error con $email: " . ($e->getCode() == 23000 ? "Correo ya existe" : $e->getMessage());
        }
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
} finally {
    if ($handle) fclose($handle);
}

echo json_encode([
    'success' => true,
    'invited_count' => $count,
    'errors' => $errors
]);
