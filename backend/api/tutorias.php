<?php
/**
 * API: Tutorías Peer-to-Peer - CESA WEB Industrialized
 * Handles matchmaking, tutor configuration and session bookings.
 */

require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/NotificationManager.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$user = Auth::getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

try {
    $pdo = getDBConnection();
    $notif = new NotificationManager($pdo);
    $usuario_id = (int)$user['id'];

    // 1. GET: Fetch tutors, available subjects or user's sessions
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list_tutors';

        if ($action === 'list_tutors') {
            $materia = $_GET['materia'] ?? null;
            $onlineOnly = isset($_GET['online']) ? (bool)$_GET['online'] : false;

            $sql = "SELECT u.id, u.nombre_completo, u.avatar_path,
                           tc.precio_hora, tc.modalidad, tc.disponible_ahora, tc.descripcion_short,
                           GROUP_CONCAT(m.nombre) as materias
                    FROM usuarios u
                    JOIN tutores_config tc ON u.id = tc.usuario_id
                    JOIN tutor_materias tm ON u.id = tm.tutor_id
                    JOIN materias m ON tm.materia_id = m.id
                    WHERE tc.activo = 1";
            
            $params = [];
            if ($onlineOnly) {
                $sql .= " AND tc.disponible_ahora = 1";
            }
            if ($materia) {
                $sql .= " AND m.nombre LIKE ?";
                $params[] = "%$materia%";
            }

            $sql .= " GROUP BY u.id ORDER BY tc.disponible_ahora DESC, u.nombre_completo ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            exit;
        }

        if ($action === 'my_sessions') {
            $stmt = $pdo->prepare("
                SELECT t.*, 
                       u_sol.nombre_completo as solicitante_nombre,
                       u_tut.nombre_completo as tutor_nombre,
                       m.nombre as materia_nombre
                FROM tutorias t
                JOIN usuarios u_sol ON t.solicitante_id = u_sol.id
                JOIN usuarios u_tut ON t.tutor_id = u_tut.id
                JOIN materias m ON t.materia_id = m.id
                WHERE t.solicitante_id = ? OR t.tutor_id = ?
                ORDER BY t.fecha_propuesta DESC
            ");
            $stmt->execute([$usuario_id, $usuario_id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            exit;
        }
    }

    // 2. POST: Actions (Book, Update Config, Toggle Availability)
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        if ($action === 'book') {
            $tutor_id = (int)$data['tutor_id'];
            $materia_id = (int)$data['materia_id'];
            $fecha = $data['fecha_propuesta'];
            $modalidad = $data['modalidad'] ?? 'virtual';
            $mensaje = $data['mensaje'] ?? '';

            $stmt = $pdo->prepare("
                INSERT INTO tutorias (solicitante_id, tutor_id, materia_id, fecha_propuesta, modalidad, mensaje_solicitud)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$usuario_id, $tutor_id, $materia_id, $fecha, $modalidad, $mensaje]);
            
            $notif->create($tutor_id, 'muro', 'Nueva solicitud de tutoría', $user['nombre_completo'] . ' te ha solicitado ayuda.', '#tutorias');
            
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            exit;
        }

        if ($action === 'toggle_availability') {
            $stmt = $pdo->prepare("UPDATE tutores_config SET disponible_ahora = NOT disponible_ahora WHERE usuario_id = ?");
            $stmt->execute([$usuario_id]);
            echo json_encode(['success' => true]);
            exit;
        }
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
