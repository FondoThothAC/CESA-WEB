<?php
/**
 * API: Bazar Emprendedor v4.0
 * - Soporte para Múltiples Ediciones y Archivo Histórico
 * - Sistema de Karma incluido (v3.8)
 * - Registro único por estudiante
 * - Moderación de Admin
 * - Tracking de vistas
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Support for JSON payloads and standard POST requests
if ($method === 'POST' && empty($action)) {
    $rawInput = file_get_contents('php://input');
    if ($rawInput) {
        $data = json_decode($rawInput, true);
        if ($data && isset($data['action'])) {
            $action = $data['action'];
            $_POST = array_merge($_POST, $data);
        }
    }
}

$isLoggedIn = $auth->isLoggedIn();
$user = $isLoggedIn ? $auth->getUser() : null;

switch ($action) {
    // === LISTAR NEGOCIOS DE UNA EDICIÓN (público o filtrado) ===
    case 'listar':
    case '': // Default action for backwards compat
        $categoria = filter_var($_GET['categoria'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS);
        $q = trim($_GET['q'] ?? '');
        $edicion_id = isset($_GET['edicion_id']) ? (int)$_GET['edicion_id'] : null;

        if (!$edicion_id) {
            // Obtener la edición activa por defecto
            $activeStmt = $pdo->query("SELECT id FROM bazar_ediciones WHERE activo = 1 LIMIT 1");
            $activeEd = $activeStmt->fetch();
            $edicion_id = $activeEd ? (int)$activeEd['id'] : 3;
        }
        
        // We include views and score correctly
        $query = "SELECT e.*, u.nombre_completo as dueno, u.matricula";
        
        // Include user vote if logged in
        if ($isLoggedIn) {
            $query .= ", (SELECT valor FROM votos_bazar WHERE emprendimiento_id = e.id AND usuario_id = ?) as user_vote";
            $params = [$user['id']];
        } else {
            $query .= ", NULL as user_vote";
            $params = [];
        }

        $query .= " FROM emprendimientos e
                    JOIN usuarios u ON e.usuario_id = u.id
                    WHERE e.activo = 1 AND e.verificado = 1 AND e.edicion_id = ?";
        $params[] = $edicion_id;
        
        if ($categoria && $categoria !== 'todas') {
            $query .= " AND e.categoria = ?";
            $params[] = $categoria;
        }

        if ($q) {
            $query .= " AND (e.nombre_negocio LIKE ? OR e.descripcion LIKE ?)";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        $query .= " ORDER BY e.featured DESC, e.score DESC, e.views DESC, e.created_at DESC LIMIT 50";
        
        try {
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $data,
                'total' => count($data)
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error de base de datos']);
        }
        break;

    // === LISTAR EDICIONES DEL BAZAR ===
    case 'listar_ediciones':
        try {
            $stmt = $pdo->query("SELECT * FROM bazar_ediciones ORDER BY fecha_inicio DESC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al cargar las ediciones del bazar']);
        }
        break;

    // === LISTAR UBICACIONES PARA EL MAPA ESQUEMÁTICO ===
    case 'listar_ubicaciones':
        $edicion_id = isset($_GET['edicion_id']) ? (int)$_GET['edicion_id'] : null;

        if (!$edicion_id) {
            // Obtener la edición activa por defecto
            $activeStmt = $pdo->query("SELECT id FROM bazar_ediciones WHERE activo = 1 LIMIT 1");
            $activeEd = $activeStmt->fetch();
            $edicion_id = $activeEd ? (int)$activeEd['id'] : 3;
        }

        try {
            $stmt = $pdo->prepare("
                SELECT e.id, e.nombre_negocio, e.slug, e.categoria, e.descripcion, e.whatsapp, e.instagram,
                       u.nombre_completo as dueno, p.coord_x as x, p.coord_y as y, p.id as puesto_id
                FROM emprendimientos e 
                JOIN cat_puestos p ON e.puesto_id = p.id
                JOIN usuarios u ON e.usuario_id = u.id
                WHERE e.activo = 1 AND e.verificado = 1 AND e.edicion_id = ?
            ");
            $stmt->execute([$edicion_id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al cargar layout del bazar']);
        }
        break;

    // === OBTENER CATÁLOGO DE PUESTOS (para el selector) ===
    case 'catalogo_puestos':
        try {
            $stmt = $pdo->query("SELECT * FROM cat_puestos WHERE activo = 1 ORDER BY id ASC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al cargar catálogo de puestos']);
        }
        break;

    // === REGISTRAR NUEVO NEGOCIO EN LA EDICIÓN ACTIVA ===
    case 'registrar':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión para registrar un negocio']);
            exit;
        }

        // Obtener la edición activa
        $activeStmt = $pdo->query("SELECT id FROM bazar_ediciones WHERE activo = 1 LIMIT 1");
        $activeEd = $activeStmt->fetch();
        $edicion_id = $activeEd ? (int)$activeEd['id'] : 3;

        // Validar unicidad: solo 1 negocio activo por estudiante por edición
        $checkStmt = $pdo->prepare("SELECT id FROM emprendimientos WHERE usuario_id = ? AND edicion_id = ? AND activo = 1");
        $checkStmt->execute([$user['id'], $edicion_id]);
        if ($checkStmt->fetch()) {
            echo json_encode([
                'success' => false,
                'error' => 'Ya tienes un negocio registrado en esta edición del bazar. Puedes gestionarlo desde tu perfil.'
            ]);
            exit;
        }

        // Sanitización básica
        $wa_raw = $_POST['whatsapp'] ?? '';
        $wa_clean = preg_replace('/[^0-9]/', '', $wa_raw);
        if (strlen($wa_clean) == 10) $wa_clean = '52' . $wa_clean;

        $nombre = htmlspecialchars(trim($_POST['nombre_negocio'] ?? $_POST['nombre'] ?? ''));
        $descripcion = htmlspecialchars(trim($_POST['descripcion'] ?? ''));
        $categoria = htmlspecialchars(trim($_POST['categoria'] ?? ''));
        $instagram = htmlspecialchars(trim($_POST['instagram'] ?? ''));
        $puesto_id = isset($_POST['puesto_id']) ? (int)$_POST['puesto_id'] : null;

        try {
            $stmt = $pdo->prepare("
                INSERT INTO emprendimientos (
                    usuario_id, nombre_negocio, descripcion, categoria, whatsapp, instagram, puesto_id, edicion_id, activo, verificado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
            ");
            $stmt->execute([
                $user['id'], $nombre, $descripcion, $categoria, $wa_clean, $instagram, $puesto_id, $edicion_id
            ]);

            echo json_encode([
                'success' => true,
                'message' => '¡Negocio registrado con éxito! Pendiente de validación 🦉',
                'id' => $pdo->lastInsertId()
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al registrar el negocio']);
        }
        break;

    // === REGISTRAR VISTA / CLIC (analytics) ===
    case 'registrar_vista':
    case 'registrar_view':
        $id = (int)($_POST['id'] ?? $_POST['negocio_id'] ?? 0);
        if ($id > 0) {
            $pdo->prepare("UPDATE emprendimientos SET views = views + 1 WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID inválido']);
        }
        break;

    // === VERIFICAR NEGOCIO (solo Admin/Mesa) ===
    case 'verificar':
        if (!$isLoggedIn || !in_array($user['rol'], ['admin', 'mesa_directiva', 'coordinador_impulso'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $id = (int)($_POST['id'] ?? 0);
        $accion = $_POST['accion'] ?? '';

        if ($accion === 'verificar') {
            $pdo->prepare("UPDATE emprendimientos SET verificado = 1 WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Negocio validado e indexado']);
        } elseif ($accion === 'rechazar') {
            $pdo->prepare("UPDATE emprendimientos SET activo = 0 WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Negocio rechazado']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Acción no válida']);
        }
        break;

    // === VOTAR (Bazar Karma) ===
    case 'votar':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debe iniciar sesión para votar']);
            exit;
        }
        $id = (int)($_POST['id'] ?? 0);
        $nuevoValor = (int)($_POST['valor'] ?? 0);

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT valor FROM votos_bazar WHERE emprendimiento_id = ? AND usuario_id = ?");
            $stmt->execute([$id, $user['id']]);
            $previo = $stmt->fetch();

            if ($previo) {
                if ((int)$previo['valor'] === $nuevoValor) {
                    $pdo->prepare("DELETE FROM votos_bazar WHERE emprendimiento_id = ? AND usuario_id = ?")->execute([$id, $user['id']]);
                } else {
                    $pdo->prepare("UPDATE votos_bazar SET valor = ? WHERE emprendimiento_id = ? AND usuario_id = ?")->execute([$nuevoValor, $id, $user['id']]);
                }
            } else {
                $pdo->prepare("INSERT INTO votos_bazar (emprendimiento_id, usuario_id, valor) VALUES (?, ?, ?)")->execute([$id, $user['id'], $nuevoValor]);
            }

            // Sync scores
            $pdo->prepare("
                UPDATE emprendimientos p
                SET 
                    p.upvotes_count = (SELECT COUNT(*) FROM votos_bazar WHERE emprendimiento_id = p.id AND valor = 1),
                    p.downvotes_count = (SELECT COUNT(*) FROM votos_bazar WHERE emprendimiento_id = p.id AND valor = -1),
                    p.score = (SELECT COALESCE(SUM(valor), 0) FROM votos_bazar WHERE emprendimiento_id = p.id)
                WHERE p.id = ?
            ")->execute([$id]);

            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al procesar el voto']);
        }
        break;

    default:
        // By default act as GET config if no action is explicitly stated but params exist
        if ($method === 'GET') {
            // Already handled above
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Acción no encontrada']);
        }
}
