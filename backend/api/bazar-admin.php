<?php
/**
 * API: Bazar Administrativo - CESA WEB v4.5
 * Moderación y administración centralizada del Bazar y Puestos (Calle de la Cultura)
 * Archivo: /backend/api/bazar-admin.php
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
            
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'puestos_status':
            // 1. Obtener la edición activa
            $activeStmt = $pdo->query("SELECT * FROM bazar_ediciones WHERE activo = 1 LIMIT 1");
            $edicionActiva = $activeStmt->fetch(PDO::FETCH_ASSOC);

            // 2. Obtener la lista completa de los 72 puestos y su ocupación
            $puestosStmt = $pdo->query("
                SELECT 
                    cp.id as puesto_id,
                    cp.zona,
                    cp.coord_x,
                    cp.coord_y,
                    cp.disponible,
                    cp.activo,
                    e.id as emprendimiento_id,
                    e.nombre_negocio,
                    e.categoria,
                    e.descripcion,
                    e.instagram,
                    e.whatsapp,
                    u.nombre_completo as responsable,
                    u.matricula
                FROM cat_puestos cp
                LEFT JOIN emprendimientos e ON cp.id = e.puesto_id AND e.activo = 1 AND e.verificado = 1
                LEFT JOIN usuarios u ON e.usuario_id = u.id
                ORDER BY cp.id ASC
            ");
            $puestos = $puestosStmt->fetchAll(PDO::FETCH_ASSOC);

            // 3. Contadores
            $totalPuestos = count($puestos);
            $ocupados = 0;
            foreach ($puestos as $p) {
                if ($p['emprendimiento_id']) {
                    $ocupados++;
                }
            }
            $libres = $totalPuestos - $ocupados;

            echo json_encode([
                'success' => true,
                'edicion' => $edicionActiva,
                'stats' => [
                    'total_puestos' => $totalPuestos,
                    'ocupados' => $ocupados,
                    'libres' => $libres,
                    'porcentaje_ocupacion' => $totalPuestos > 0 ? round(($ocupados / $totalPuestos) * 100, 1) : 0
                ],
                'puestos' => $puestos
            ]);
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

        case 'asignar_puesto':
            $id = (int)($_POST['id'] ?? 0);
            $puesto_id = isset($_POST['puesto_id']) && $_POST['puesto_id'] !== '' ? (int)$_POST['puesto_id'] : null;

            // Limpiar si el puesto ya estaba asignado a otro negocio
            if ($puesto_id) {
                $cleanStmt = $pdo->prepare("UPDATE emprendimientos SET puesto_id = NULL WHERE puesto_id = ? AND id != ?");
                $cleanStmt->execute([$puesto_id, $id]);
            }

            $stmt = $pdo->prepare("UPDATE emprendimientos SET puesto_id = ? WHERE id = ?");
            $stmt->execute([$puesto_id, $id]);

            AdminHelper::logAction($pdo, $user['id'], 'bazar_asignar_puesto', "Negocio ID $id puesto reubicado a: " . ($puesto_id ?? 'Sin Puesto'));
            echo json_encode(['success' => true, 'message' => 'Ubicación de puesto actualizada correctamente.']);
            break;

        case 'liberar_puesto':
            $puesto_id = (int)($_POST['puesto_id'] ?? 0);
            if ($puesto_id > 0) {
                $stmt = $pdo->prepare("UPDATE emprendimientos SET puesto_id = NULL WHERE puesto_id = ?");
                $stmt->execute([$puesto_id]);
                AdminHelper::logAction($pdo, $user['id'], 'bazar_liberar_puesto', "Puesto ID $puesto_id liberado");
            }
            echo json_encode(['success' => true, 'message' => 'Puesto liberado con éxito.']);
            break;

        default:
            throw new Exception("Acción '$action' no reconocida");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
