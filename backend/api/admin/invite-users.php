<?php
/**
 * invite-users.php - Registro masivo de usuarios v3.5
 * Archivo: /backend/api/admin/invite-users.php
 */

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/MailHelper.php';

header('Content-Type: application/json');

$auth = new Auth();
if (!$auth->isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
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

// Skip header (esperado: nombre,correo,rol,carrera)
fgetcsv($handle);

$pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));

while (($data = fgetcsv($handle)) !== FALSE) {
    if (count($data) < 3) continue;

    $nombre = $data[0];
    $email = $data[1];
    $rol = $data[2];
    $carrera = $data[3] ?? 'Institucional';
    $tempPass = substr(md5(uniqid()), 0, 8); // Pass temporal

    try {
        // 1. Crear usuario en DB
        $hashed = password_hash($tempPass, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol, carrera) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $email, $hashed, $rol, $carrera]);

        // 2. Enviar Invitación
        if (MailHelper::sendInvitation($email, $nombre, $tempPass)) {
            $count++;
        } else {
            $errors[] = "No se pudo enviar correo a $email";
        }
    } catch (PDOException $e) {
        $errors[] = "Error con $email: " . ($e->getCode() == 23000 ? "Correo ya existe" : $e->getMessage());
    }
}

fclose($handle);

echo json_encode([
    'success' => true,
    'invited_count' => $count,
    'errors' => $errors
]);
