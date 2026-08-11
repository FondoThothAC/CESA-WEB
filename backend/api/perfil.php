<?php
/**
 * API Perfil Estudiantil - CESA WEB v1.2
 * Provee datos de perfil, progreso académico y CV.
 * Archivo: /backend/api/perfil.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/AcademicProgressManager.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser(); 
$method = $_SERVER['REQUEST_METHOD'];

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

try {
    $pdo = getDBConnection();
    $academicManager = new AcademicProgressManager($pdo);

    if ($method === 'GET') {
        // Datos básicos del perfil
        $stmt = $pdo->prepare("
            SELECT id, nombre_completo, email, rol, expediente, carrera, semestre_ingreso, avatar_path, bio 
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        // Progreso académico real
        $profile['progreso_academico'] = $academicManager->calcularSemestreReal((int)$user['id']);

        // Skills Verificadas
        $stmtS = $pdo->prepare("
            SELECT h.nombre, sc.nivel, sc.created_at as verificado_en
            FROM habilidades h
            JOIN certificados_digitales sc ON h.id = sc.habilidad_id
            WHERE sc.usuario_id = ? AND (sc.fecha_expiracion IS NULL OR sc.fecha_expiracion >= CURDATE())
        ");
        $stmtS->execute([$user['id']]);
        $profile['skills'] = $stmtS->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $profile]);
        exit;
    }

    if ($method === 'POST') {
        $action = $_GET['action'] ?? 'update';
        
        if ($action === 'update') {
            $input = json_decode(file_get_contents('php://input'), true);
            $bio = trim(strip_tags((string)($input['bio'] ?? '')));
            $carrera = isset($input['carrera']) ? trim(strip_tags((string)$input['carrera'])) : null;
            $avatar_path = isset($input['avatar_path']) ? trim(strip_tags((string)$input['avatar_path'])) : null;
            
            $updates = ["bio = ?"];
            $params = [$bio];

            if ($carrera !== null) {
                $updates[] = "carrera = ?";
                $params[] = $carrera;
            }
            if ($avatar_path !== null) {
                $updates[] = "avatar_path = ?";
                $params[] = $avatar_path;
            }

            $params[] = $user['id'];
            $sql = "UPDATE usuarios SET " . implode(", ", $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Perfil actualizado exitosamente']);
            exit;
        }
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
