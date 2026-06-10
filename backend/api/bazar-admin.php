<?php
/**
 * API: Bazar Administrativo - CESA WEB v3.9
 * Moderación centralizada de emprendimientos
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/AdminHelper.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser();

// Seguridad de Grado Industrial
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sesión no iniciada']);
    exit;
}

AdminHelper::checkAccess($user, ['admin', 'mesa_directiva']);

$pdo = getDBConnection();
$action = $_GET['action'] ?? $_POST['action'] ?? 'listar';

try {
    switch ($action) {
        case 'listar':
            $filtro = $_GET['status'] ?? 'todos';
            $sql = "SELECT e.*, u.nombre_completo as emprendedor, u.matricula 
                    FROM emprendimientos e
                    JOIN usuarios u ON e.usuario_id = u.id ";
            
            $where = [];
            $params = [];

            if ($filtro === 'pendiente') {
                $where[] = "e.verificado = 0";
            } else if ($filtro === 'activo') {
                $where[] = "e.activo = 1 AND e.verificado = 1";
            }

            if ($where) {
                $sql .= " WHERE " . implode(" AND ", $where);
            }

            $sql .= " ORDER BY e.created_at DESC LIMIT 100";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'aprobar':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE emprendimientos SET verificado = 1, activo = 1 WHERE id = ?");
            $stmt->execute([$id]);
            
            AdminHelper::logAction($pdo, $user['id'], 'bazar_aprobar', "Negocio ID $id aprobado");
            echo json_encode(['success' => true]);
            break;

        case 'rechazar':
            $id = (int)($_POST['id'] ?? 0);
            $razon = $_POST['razon'] ?? 'No cumple con los lineamientos';
            
            $stmt = $pdo->prepare("UPDATE emprendimientos SET activo = 0, verificado = 0 WHERE id = ?");
            $stmt->execute([$id]);
            
            AdminHelper::logAction($pdo, $user['id'], 'bazar_rechazar', "Negocio ID $id rechazado", ['razon' => $razon]);
            echo json_encode(['success' => true]);
            break;

        case 'destacar':
            $id = (int)($_POST['id'] ?? 0);
            $featured = (int)($_POST['featured'] ?? 0);
            
            $stmt = $pdo->prepare("UPDATE emprendimientos SET featured = ? WHERE id = ?");
            $stmt->execute([$featured, $id]);
            
            AdminHelper::logAction($pdo, $user['id'], 'bazar_destacar', "Negocio ID $id estado destacado: $featured");
            echo json_encode(['success' => true]);
            break;

        default:
            throw new Exception("Acción '$action' no reconocida");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
