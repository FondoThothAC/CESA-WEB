<?php
/**
 * API Solicitudes de Elecciones - CESA UNISON
 * Gestiona las solicitudes de alumnos para convocar elecciones de Sociedades de Alumnos.
 */
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

$isLoggedIn = $auth->isLoggedIn();
$user = $isLoggedIn ? $auth->getUser() : null;

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'list':
        // Solo admins o mesa directiva pueden listar las solicitudes
        if (!$isLoggedIn || !in_array($user['rol'], ['admin', 'mesa_directiva'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        try {
            $stmt = $pdo->query("
                SELECT s.*, u.nombre_completo as solicitante_nombre, u.email as solicitante_email
                FROM solicitudes_elecciones s
                JOIN usuarios u ON s.usuario_id = u.id
                ORDER BY s.created_at DESC
            ");
            $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $solicitudes]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al cargar las solicitudes: ' . $e->getMessage()]);
        }
        break;

    case 'create':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión para realizar esta solicitud.']);
            exit;
        }

        $carrera = trim($_POST['carrera'] ?? '');
        $motivo = trim($_POST['motivo'] ?? '');

        if (empty($carrera)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'La carrera es requerida.']);
            exit;
        }

        try {
            // Verificar si ya existe una solicitud reciente de este usuario para esta carrera
            $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM solicitudes_elecciones WHERE usuario_id = ? AND carrera = ? AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)");
            $stmtCheck->execute([$user['id'], $carrera]);
            if ($stmtCheck->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Ya has realizado una solicitud para esta carrera en los últimos 7 días.']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO solicitudes_elecciones (usuario_id, carrera, motivo) VALUES (?, ?, ?)");
            $stmt->execute([$user['id'], $carrera, $motivo]);

            echo json_encode(['success' => true, 'message' => 'Solicitud registrada correctamente. El consejo estudiantil evaluará la propuesta.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al crear la solicitud: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Acción no encontrada']);
}
