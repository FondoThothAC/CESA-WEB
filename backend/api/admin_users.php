<?php
/**
 * API de Administración de Usuarios - CESA WEB v3.6
 * Solo accesible por rol 'admin'
 * Archivo: /backend/api/admin_users.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/CSRF.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$pdo = getDBConnection();

// BLOQUEO TOTAL: Solo administradores
if (!$auth->isLoggedIn() || !$auth->hasRole('admin')) {
    http_response_code(403);
    die(json_encode(['success' => false, 'error' => 'Acceso denegado. Solo administradores pueden ejecutar esto.']));
}

$action = $_REQUEST['action'] ?? '';

switch ($action) {
    // ============================================================================
    // LISTAR USUARIOS CON FILTROS
    // ============================================================================
    case 'listar':
        try {
            $rol = $_GET['rol'] ?? 'todos';
            $coordinacion = $_GET['coordinacion'] ?? 'todos';
            $busqueda = $_GET['q'] ?? '';

            $query = "SELECT id, nombre_completo, email, rol, coordinacion, estado, created_at 
                      FROM usuarios WHERE 1=1";
            $params = [];

            if ($rol !== 'todos') {
                $query .= " AND rol = ?";
                $params[] = $rol;
            }

            if ($coordinacion !== 'todos') {
                $query .= " AND coordinacion = ?";
                $params[] = $coordinacion;
            }

            if (!empty($busqueda)) {
                $query .= " AND (nombre_completo LIKE ? OR email LIKE ?)";
                $params[] = "%$busqueda%";
                $params[] = "%$busqueda%";
            }

            $query .= " ORDER BY created_at DESC";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $usuarios]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al obtener usuarios: ' . $e->getMessage()]);
        }
        break;

    // ============================================================================
    // ACTUALIZAR USUARIO (ROL, COORDINACIÓN, ESTADO)
    // ============================================================================
    case 'actualizar':
        try {
            // Nota: validateCSRFToken debe estar definida en CSRF.php
            if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
                throw new Exception('Token de seguridad inválido');
            }

            $userId = (int)$_POST['id'];
            $nuevoRol = $_POST['rol'] ?? '';
            $nuevaCoord = $_POST['coordinacion'] ?? '';
            $nuevoEstado = $_POST['estado'] ?? 'activo';

            if ($userId <= 0 || empty($nuevoRol)) {
                throw new Exception('Datos insuficientes para actualizar');
            }

            $currentUser = $auth->getUser();
            // Evitar que el admin se quite el rol de admin a sí mismo accidentalmente
            if ($currentUser['id'] == $userId && $nuevoRol !== 'admin') {
                throw new Exception('No puedes quitarte el rol de administrador a ti mismo.');
            }

            $stmt = $pdo->prepare("
                UPDATE usuarios 
                SET rol = ?, coordinacion = ?, estado = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            
            if ($stmt->execute([$nuevoRol, $nuevaCoord, $nuevoEstado, $userId])) {
                echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
            } else {
                throw new Exception('Error al ejecutar la actualización en BD');
            }

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    // ============================================================================
    // ELIMINAR / BANEAR USUARIO
    // ============================================================================
    case 'eliminar':
        try {
            if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
                throw new Exception('Token de seguridad inválido');
            }

            $userId = (int)$_POST['id'];
            if ($userId <= 0) throw new Exception('ID de usuario inválido');

            $currentUser = $auth->getUser();
            // No permitir eliminar al admin actual
            if ($userId == $currentUser['id']) {
                throw new Exception('No puedes eliminar tu propia cuenta.');
            }

            // Opción: Soft delete (cambiar estado a 'baneado') o Hard delete
            $metodo = $_POST['metodo'] ?? 'ban';

            if ($metodo === 'ban') {
                $stmt = $pdo->prepare("UPDATE usuarios SET estado = 'baneado' WHERE id = ?");
                $stmt->execute([$userId]);
                $msg = 'Usuario baneado exitosamente';
            } else {
                $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
                $stmt->execute([$userId]);
                $msg = 'Usuario eliminado permanentemente';
            }

            echo json_encode(['success' => true, 'message' => $msg]);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Acción no soportada']);
}
