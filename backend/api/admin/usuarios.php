<?php
/**
 * API Gestión de Usuarios - CESA WEB v3.5
 * Acceso: Admin / Mesa Directiva
 * Sincronizado con schema.sql (activo, nombre_completo)
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/cors.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$userAdmin = $auth->getUser();

if (!$userAdmin || !in_array($userAdmin['rol'], ['admin', 'mesa_directiva'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

try {
    $pdo = getDBConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    // 1. LISTAR USUARIOS (GET)
    if ($method === 'GET') {
        $search = $_GET['q'] ?? '';
        $role = $_GET['rol'] ?? 'todos';
        
        $query = "SELECT id, nombre_completo, email, rol, matricula, created_at, activo FROM usuarios WHERE 1=1";
        $params = [];
        
        if ($search) {
            $query .= " AND (nombre_completo LIKE ? OR email LIKE ? OR matricula LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($role !== 'todos') {
            $query .= " AND rol = ?";
            $params[] = $role;
        }
        
        $query .= " ORDER BY created_at DESC LIMIT 500";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // 2. ACTUALIZAR USUARIO (POST)
    if ($method === 'POST') {
        $userId = (int)($_POST['id'] ?? 0);
        $action = $_POST['action'] ?? '';

        if (!$userId) throw new Exception('ID de usuario requerido');

        switch ($action) {
            case 'update_role':
                $newRole = $_POST['rol'] ?? '';
                if (!in_array($newRole, ['estudiante', 'empresa', 'sociedad', 'mesa_directiva', 'admin'])) {
                    throw new Exception('Rol inválido');
                }
                $stmt = $pdo->prepare("UPDATE usuarios SET rol = ? WHERE id = ?");
                $stmt->execute([$newRole, $userId]);
                break;
                
            case 'toggle_active':
                $status = (int)($_POST['activo'] ?? 0);
                $stmt = $pdo->prepare("UPDATE usuarios SET activo = ? WHERE id = ?");
                $stmt->execute([$status, $userId]);
                break;
                
            default:
                throw new Exception('Acción no reconocida');
        }

        echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
