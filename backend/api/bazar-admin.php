<?php
/**
 * API: Bazar Administrativo - CESA WEB v4.6
 * Moderación, administración centralizada y auditoría del Bazar y Puestos (Calle de la Cultura)
 * Archivo: /backend/api/bazar-admin.php
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/AdminHelper.php';
require_once __DIR__ . '/../lib/NotificationManager.php';
require_once __DIR__ . '/../lib/BazarEvents.php';

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
                $where[] = "e.active = 1 AND e.verificado = 1";
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
            $requestedEdicionId = isset($_GET['edicion_id']) && $_GET['edicion_id'] !== '' ? (int)$_GET['edicion_id'] : null;

            if ($requestedEdicionId) {
                $activeStmt = $pdo->prepare("SELECT * FROM bazar_ediciones WHERE id = ? LIMIT 1");
                $activeStmt->execute([$requestedEdicionId]);
            } else {
                $activeStmt = $pdo->query("SELECT * FROM bazar_ediciones WHERE estado = 'activa' OR activo = 1 ORDER BY id DESC LIMIT 1");
            }
            $edicionActiva = $activeStmt->fetch(PDO::FETCH_ASSOC);

            // Fallback si no hay edición
            if (!$edicionActiva) {
                $edicionActiva = [
                    'id' => 1,
                    'nombre' => 'Edición Otoño 2026',
                    'mapa_tipo' => 'radial_base',
                    'estado' => 'activa',
                    'fecha_inicio' => date('Y-m-d'),
                    'fecha_fin' => date('Y-m-d', strtotime('+3 days'))
                ];
            }

            // 2. Obtener la lista de puestos
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
                    e.verificado,
                    u.nombre_completo as responsable,
                    u.matricula
                FROM cat_puestos cp
                LEFT JOIN emprendimientos e ON cp.id = e.puesto_id AND e.active = 1
                LEFT JOIN usuarios u ON e.usuario_id = u.id
                ORDER BY cp.id ASC
            ");
            $puestos = $puestosStmt->fetchAll(PDO::FETCH_ASSOC);

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
                'mapa_tipo' => $edicionActiva['mapa_tipo'] ?? 'radial_base',
                'stats' => [
                    'total_puestos' => $totalPuestos,
                    'ocupados' => $ocupados,
                    'libres' => $libres,
                    'porcentaje_ocupacion' => $totalPuestos > 0 ? round(($ocupados / $totalPuestos) * 100, 1) : 0
                ],
                'puestos' => $puestos
            ]);
            break;

        case 'ediciones_list':
            $stmt = $pdo->query("SELECT * FROM bazar_ediciones ORDER BY id DESC");
            $ediciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'ediciones' => $ediciones]);
            break;

        case 'crear_edicion':
            $nombre = trim($_POST['nombre'] ?? '');
            $mapa_tipo = $_POST['mapa_tipo'] ?? 'radial_base';
            $fecha_inicio = $_POST['fecha_inicio'] ?? date('Y-m-d');
            $fecha_fin = $_POST['fecha_fin'] ?? date('Y-m-d', strtotime('+3 days'));

            if (empty($nombre)) {
                echo json_encode(['success' => false, 'error' => 'El nombre de la edición es requerido']);
                exit;
            }

            // Desactivar edición previa activa
            $pdo->query("UPDATE bazar_ediciones SET estado = 'archivada', activo = 0 WHERE estado = 'activa'");

            $stmt = $pdo->prepare("
                INSERT INTO bazar_ediciones (nombre, mapa_tipo, fecha_inicio, fecha_fin, estado, activo)
                VALUES (?, ?, ?, ?, 'activa', 1)
            ");
            $stmt->execute([$nombre, $mapa_tipo, $fecha_inicio, $fecha_fin]);
            $newId = $pdo->lastInsertId();

            AdminHelper::logAction($pdo, $user['id'], 'bazar_crear_edicion', "Nueva edición '$nombre' ($mapa_tipo) creada");
            bazarEmitEvent($pdo, 'edicion_creada', ['id' => (int)$newId, 'nombre' => $nombre, 'mapa_tipo' => $mapa_tipo]);
            echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Edición del Bazar activada con éxito.']);
            break;

        case 'archivar_edicion':
            $edicionId = (int)($_POST['edicion_id'] ?? 0);
            if ($edicionId <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID de edición inválido']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE bazar_ediciones SET estado = 'archivada', activo = 0 WHERE id = ?");
            $stmt->execute([$edicionId]);

            AdminHelper::logAction($pdo, $user['id'], 'bazar_archivar_edicion', "Edición ID $edicionId archivada");
            bazarEmitEvent($pdo, 'edicion_archivada', ['id' => $edicionId]);
            echo json_encode(['success' => true, 'message' => 'Edición congelada y enviada al historial permanente.']);
            break;

        case 'aprobar':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE emprendimientos SET verificado = 1, active = 1, verificado_por = ?, fecha_verificacion = NOW() WHERE id = ?");
            $stmt->execute([(int)$user['id'], $id]);
            $owner = $pdo->prepare("SELECT usuario_id, nombre_negocio FROM emprendimientos WHERE id = ?");
            $owner->execute([$id]); $owner = $owner->fetch(PDO::FETCH_ASSOC);
            if ($owner) (new NotificationManager($pdo))->createNotification((int)$owner['usuario_id'], 'sistema', 'Reserva de Bazar aprobada', 'Tu reserva de ' . $owner['nombre_negocio'] . ' fue aprobada.', '#bazar');

            AdminHelper::logAction($pdo, $user['id'], 'bazar_aprobar', "Negocio ID $id aprobado");
            $reserva = bazarReservaEmitible($pdo, $id);
            bazarEmitEvent($pdo, 'reserva_aprobada', bazarEventoReserva($reserva, 'APROBADA', [
                'sms' => ($owner['nombre_negocio'] ?? 'Un negocio') . ' apareció en el Bazar',
            ]));
            echo json_encode(['success' => true]);
            break;

        case 'rechazar':
            $id = (int)($_POST['id'] ?? 0);
            $razon = $_POST['razon'] ?? 'No cumple con los lineamientos';
            $owner = $pdo->prepare("SELECT usuario_id, nombre_negocio FROM emprendimientos WHERE id = ?");
            $owner->execute([$id]); $owner = $owner->fetch(PDO::FETCH_ASSOC);
            $stmt = $pdo->prepare("UPDATE emprendimientos SET active = 0, verificado = 0, puesto_id = NULL WHERE id = ?");
            $stmt->execute([$id]);
            if ($owner) (new NotificationManager($pdo))->createNotification((int)$owner['usuario_id'], 'sistema', 'Reserva de Bazar rechazada', 'Tu reserva de ' . $owner['nombre_negocio'] . ' fue rechazada. Consulta tu Perfil.', '#perfil');
            
            AdminHelper::logAction($pdo, $user['id'], 'bazar_rechazar', "Negocio ID $id rechazado", ['razon' => $razon]);
            bazarEmitEvent($pdo, 'reserva_rechazada', bazarEventoReserva(bazarReservaEmitible($pdo, $id), 'RECHAZADA'));
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
            $reserva = bazarReservaEmitible($pdo, $id);
            bazarEmitEvent($pdo, 'puesto_asignado', bazarEventoReserva($reserva, 'REASIGNADO', [
                'puesto_previo' => null, 'sms' => 'Administración reubicó el puesto #' . ($puesto_id ?? '-') . ': ' . ($reserva['nombre_negocio'] ?? ''),
            ]));
            echo json_encode(['success' => true, 'message' => 'Ubicación de puesto actualizada correctamente.']);
            break;

        case 'liberar_puesto':
            $puesto_id = (int)($_POST['puesto_id'] ?? 0);
            if ($puesto_id > 0) {
                $stmt = $pdo->prepare("UPDATE emprendimientos SET puesto_id = NULL WHERE puesto_id = ?");
                $stmt->execute([$puesto_id]);
                AdminHelper::logAction($pdo, $user['id'], 'bazar_liberar_puesto', "Puesto ID $puesto_id liberado");
                bazarEmitEvent($pdo, 'puesto_liberado', ['puesto_id' => $puesto_id, 'sms' => 'Libraron el puesto #' . $puesto_id]);
            }
            echo json_encode(['success' => true, 'message' => 'Puesto liberado con éxito.']);
            break;

        case 'logs':
            $stmt = $pdo->query("
                SELECT l.id, l.usuario_id, l.accion, l.descripcion, l.ip_address, l.created_at,
                       u.nombre_completo as usuario_nombre, u.email as usuario_email, u.matricula
                FROM admin_logs l
                LEFT JOIN usuarios u ON l.usuario_id = u.id
                WHERE l.accion LIKE 'bazar_%'
                ORDER BY l.created_at DESC
                LIMIT 50
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        default:
            throw new Exception("Acción '$action' no reconocida");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
