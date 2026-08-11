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
require_once __DIR__ . '/../lib/JWTHelper.php';
require_once __DIR__ . '/../lib/MailHelper.php';

header('Content-Type: application/json; charset=utf-8');
try {
    $pdo = getDBConnection();
    $auth = new Auth();

    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? $_POST['action'] ?? '';

    // Support for JSON payloads and standard POST requests
    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        if ($rawInput) {
            $data = json_decode($rawInput, true);
            if (is_array($data)) {
                if (empty($action) && isset($data['action'])) $action = $data['action'];
                $_POST = array_merge($_POST, $data);
            }
        }
    }

    $isLoggedIn = $auth->isLoggedIn();
    $user = $isLoggedIn ? $auth->getUser() : null;
} catch (\Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

function bazarActiveEdition(PDO $pdo): array {
    $stmt = $pdo->query("SELECT * FROM bazar_ediciones WHERE activo = 1 ORDER BY id DESC LIMIT 1");
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: ['id' => 1, 'nombre' => 'Bazar CESA', 'mapa_tipo' => 'radial_base'];
}

function bazarTicket(int $id, int $editionId): string { return 'BAZ-' . $editionId . '-' . str_pad((string)$id, 6, '0', STR_PAD_LEFT); }

function bazarVerificationUrl(string $token): string {
    $base = rtrim(getenv('APP_URL') ?: 'https://cesaunison.fondothoth.com', '/');
    return $base . '/api/bazar.php?action=verificar_ticket&token=' . rawurlencode($token);
}

function bazarPdf(array $ticket, string $verifyUrl): string {
    // PDF mínimo, independiente de Composer, con enlace verificable y datos del ticket.
    $escape = static function (string $value): string {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
    };
    $lines = [
        'CESA UNISON - TICKET DE RESERVA',
        'Folio: ' . $ticket['folio'],
        'Estudiante: ' . ($ticket['nombre_completo'] ?? ''),
        'Negocio: ' . ($ticket['nombre_negocio'] ?? ''),
        'Edicion: ' . ($ticket['edicion_nombre'] ?? ''),
        'Puesto: #' . ($ticket['puesto_id'] ?? '') . ' - ' . ($ticket['zona'] ?? ''),
        'Estado: ' . $ticket['estado'],
        'Fecha: ' . ($ticket['created_at'] ?? date('Y-m-d H:i:s')),
        'Verificacion QR: ' . $verifyUrl,
    ];
    $stream = "BT /F1 11 Tf 50 780 Td 15 TL\n";
    foreach ($lines as $line) $stream .= '(' . $escape($line) . ") Tj T*\n";
    $stream .= "ET";
    $objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        '<< /Length ' . strlen($stream) . " >>\nstream\n" . $stream . "\nendstream",
    ];
    $pdf = "%PDF-1.4\n"; $offsets = [0];
    foreach ($objects as $index => $object) { $offsets[$index + 1] = strlen($pdf); $pdf .= ($index + 1) . " 0 obj\n" . $object . "\nendobj\n"; }
    $xref = strlen($pdf); $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
    for ($i = 1; $i <= count($objects); $i++) $pdf .= sprintf('%010d 00000 n %s', $offsets[$i], "\n");
    return $pdf . "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n" . $xref . "\n%%EOF";
}

function bazarTicketPayload(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare("SELECT e.*, u.nombre_completo, u.email, p.zona, be.nombre AS edicion_nombre
        FROM emprendimientos e JOIN usuarios u ON u.id=e.usuario_id
        LEFT JOIN cat_puestos p ON p.id=e.puesto_id LEFT JOIN bazar_ediciones be ON be.id=e.edicion_id WHERE e.id=? LIMIT 1");
    $stmt->execute([$id]); $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return null;
    $row['folio'] = bazarTicket((int)$row['id'], (int)$row['edicion_id']);
    $row['estado'] = !$row['active'] ? 'Rechazada' : ($row['verificado'] ? 'Aprobada' : 'Pendiente');
    return $row;
}

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
                    WHERE e.active = 1 AND e.verificado = 1 AND e.edicion_id = ?";
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
                       u.nombre_completo as dueno, p.coord_x as x, p.coord_y as y, p.id as puesto_id, e.verificado
                FROM emprendimientos e 
                JOIN cat_puestos p ON e.puesto_id = p.id
                JOIN usuarios u ON e.usuario_id = u.id
                WHERE e.active = 1 AND e.edicion_id = ?
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
            $edition = bazarActiveEdition($pdo);
            $stmt = $pdo->prepare("SELECT p.*, CASE WHEN e.id IS NULL THEN 1 ELSE 0 END AS disponible,
                CASE WHEN e.id IS NULL THEN 'disponible' WHEN e.verificado=1 THEN 'aprobado' ELSE 'reservado' END AS estado_reserva
                FROM cat_puestos p LEFT JOIN emprendimientos e ON e.puesto_id=p.id AND e.edicion_id=? AND e.active=1
                WHERE p.activo=1 ORDER BY p.id ASC");
            $stmt->execute([(int)$edition['id']]);
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
        $edition = bazarActiveEdition($pdo);
        $edicion_id = (int)$edition['id'];

        // Validar unicidad: solo 1 negocio activo por estudiante por edición
        $checkStmt = $pdo->prepare("SELECT id FROM emprendimientos WHERE usuario_id = ? AND edicion_id = ? AND active = 1");
        $checkStmt->execute([$user['id'], $edicion_id]);
        $existingId = $checkStmt->fetchColumn();
        if ($existingId) {
            $existingRes = bazarTicketPayload($pdo, (int)$existingId);
            if ($existingRes) {
                $signed = JWTHelper::create(['type' => 'bazar_ticket', 'reservation_id' => (int)$existingId], 31536000);
                $existingRes['verify_url'] = bazarVerificationUrl($signed);
            }
            echo json_encode(['success' => false, 'error' => 'Ya tienes una reserva activa en esta edición.', 'reservation' => $existingRes]);
            exit;
        }

        // Parsear payload (soporta FormData/POST y JSON raw body)
        $rawBody = file_get_contents('php://input');
        $jsonBody = !empty($rawBody) ? json_decode($rawBody, true) : [];
        $payload = array_merge($_POST, is_array($jsonBody) ? $jsonBody : []);

        // Sanitización básica
        $wa_raw = $payload['whatsapp'] ?? '';
        $wa_clean = preg_replace('/[^0-9]/', '', $wa_raw);
        if (strlen($wa_clean) == 10) $wa_clean = '52' . $wa_clean;

        $nombre = htmlspecialchars(trim($payload['nombre_negocio'] ?? $payload['nombre'] ?? ''));
        $descripcion = htmlspecialchars(trim($payload['descripcion'] ?? ''));
        $categoria = htmlspecialchars(trim($payload['categoria'] ?? ''));
        $instagram = htmlspecialchars(trim($payload['instagram'] ?? ''));
        $puesto_id = isset($payload['puesto_id']) ? (int)$payload['puesto_id'] : null;

        if (!$puesto_id || $puesto_id <= 0 || $nombre === '' || $descripcion === '') {
            http_response_code(422); echo json_encode(['success' => false, 'error' => 'Selecciona un puesto y completa los datos requeridos.']); exit;
        }

        $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $nombre))) . '-' . $user['id'] . '-' . rand(100, 999);

        try {
            $pdo->beginTransaction();
            $spot = $pdo->prepare("SELECT id FROM cat_puestos WHERE id=? AND activo=1 FOR UPDATE");
            $spot->execute([$puesto_id]);
            if (!$spot->fetchColumn()) throw new RuntimeException('El puesto seleccionado no existe.');
            $taken = $pdo->prepare("SELECT id FROM emprendimientos WHERE puesto_id=? AND edicion_id=? AND active=1 FOR UPDATE");
            $taken->execute([$puesto_id, $edicion_id]);
            if ($taken->fetchColumn()) throw new RuntimeException('El puesto seleccionado acaba de ser reservado por otra persona.');
            $stmt = $pdo->prepare("
                INSERT INTO emprendimientos (
                    usuario_id, nombre_negocio, slug, descripcion, categoria, whatsapp, instagram, puesto_id, edicion_id, active, verificado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
            ");
            $stmt->execute([
                $user['id'], $nombre, $slug, $descripcion, $categoria, $wa_clean, $instagram, $puesto_id, $edicion_id
            ]);
            $newId = (int)$pdo->lastInsertId();
            $pdo->commit();

            $ticket = bazarTicketPayload($pdo, $newId);
            if (!$ticket) {
                throw new RuntimeException('Reserva creada, pero no se pudo generar la vista del ticket.');
            }

            $signed = JWTHelper::create(['type' => 'bazar_ticket', 'reservation_id' => $newId], 31536000);
            $verifyUrl = bazarVerificationUrl($signed);
            $pdf = bazarPdf($ticket, $verifyUrl);
            $pdfPath = sys_get_temp_dir() . '/cesa-' . $ticket['folio'] . '.pdf';
            file_put_contents($pdfPath, $pdf);

            $emailSent = false;
            try {
                if (!empty($user['email'])) {
                    $emailSent = @MailHelper::send($user['email'], 'Ticket de reserva ' . $ticket['folio'], '<p>Tu solicitud quedó apartada y pendiente de revisión.</p><p>Folio: <strong>' . htmlspecialchars($ticket['folio']) . '</strong></p><p>Adjuntamos tu ticket con QR de verificación.</p>', [['path' => $pdfPath, 'name' => $ticket['folio'] . '.pdf', 'type' => 'application/pdf']]);
                }
            } catch (\Throwable $mErr) {
                $emailSent = false;
            }
            @unlink($pdfPath);

            echo json_encode(['success' => true, 'message' => 'Reserva apartada. Pendiente de validación.', 'reservation' => array_merge($ticket, ['verify_url' => $verifyUrl, 'email_sent' => $emailSent, 'pdf_available' => true])]);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage() ?: 'Error al registrar el negocio']);
        }
        break;

    case 'mis_reservas':
        if (!$isLoggedIn) { http_response_code(401); echo json_encode(['success'=>false,'error'=>'Inicia sesión para consultar tus reservas.']); break; }
        $stmt = $pdo->prepare("SELECT e.*, p.zona, be.nombre AS edicion_nombre FROM emprendimientos e LEFT JOIN cat_puestos p ON p.id=e.puesto_id LEFT JOIN bazar_ediciones be ON be.id=e.edicion_id WHERE e.usuario_id=? ORDER BY e.created_at DESC");
        $stmt->execute([(int)$user['id']]); $reservas = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) { $row['folio'] = bazarTicket((int)$row['id'], (int)$row['edicion_id']); $row['estado'] = !$row['active'] ? 'Rechazada' : ($row['verificado'] ? 'Aprobada' : 'Pendiente'); $row['verify_url'] = bazarVerificationUrl(JWTHelper::create(['type'=>'bazar_ticket','reservation_id'=>(int)$row['id']], 31536000)); $reservas[] = $row; }
        echo json_encode(['success'=>true,'data'=>$reservas]); break;

    case 'verificar_ticket':
        $decoded = JWTHelper::verify((string)($_GET['token'] ?? ''));
        if (!$decoded || ($decoded['type'] ?? '') !== 'bazar_ticket') { http_response_code(400); echo json_encode(['success'=>false,'error'=>'QR o ticket inválido.']); break; }
        $ticket = bazarTicketPayload($pdo, (int)($decoded['reservation_id'] ?? 0));
        if (!$ticket) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Ticket no encontrado.']); break; }
        unset($ticket['email'], $ticket['usuario_id'], $ticket['matricula']);
        echo json_encode(['success'=>true,'data'=>$ticket]); break;

    case 'descargar_ticket':
        if (!$isLoggedIn) { http_response_code(401); echo json_encode(['success'=>false,'error'=>'Inicia sesión.']); break; }
        $ticket = bazarTicketPayload($pdo, (int)($_GET['id'] ?? 0));
        if (!$ticket || (int)$ticket['usuario_id'] !== (int)$user['id']) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Ticket no encontrado.']); break; }
        $signed = JWTHelper::create(['type'=>'bazar_ticket','reservation_id'=>(int)$ticket['id']], 31536000);
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $ticket['folio'] . '.pdf"');
        echo bazarPdf($ticket, bazarVerificationUrl($signed)); break;

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
            $pdo->prepare("UPDATE emprendimientos SET active = 0 WHERE id = ?")->execute([$id]);
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

    // === CONSULTAR CATÁLOGO DE PRODUCTOS / MARKETPLACE DEL EMPRENDIMIENTO ===
    case 'productos':
        $emprendimiento_id = (int)($_GET['emprendimiento_id'] ?? $_POST['emprendimiento_id'] ?? 0);
        if ($emprendimiento_id <= 0) {
            echo json_encode(['success' => true, 'data' => []]);
            exit;
        }
        try {
            $stmt = $pdo->prepare("SELECT * FROM bazar_productos WHERE emprendimiento_id = ? AND disponible = 1 ORDER BY id DESC");
            $stmt->execute([$emprendimiento_id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al obtener productos']);
        }
        break;

    // === AGREGAR PRODUCTO AL MARKETPLACE DE BAZAR ===
    case 'agregar_producto':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión para subir productos a tu catálogo']);
            exit;
        }
        $emprendimiento_id = (int)($_POST['emprendimiento_id'] ?? 0);
        $nombre = htmlspecialchars(trim($_POST['nombre'] ?? ''));
        $descripcion = htmlspecialchars(trim($_POST['descripcion'] ?? ''));
        $precio = (float)($_POST['precio'] ?? 0.0);
        $imagen_url = htmlspecialchars(trim($_POST['imagen_url'] ?? ''));

        if ($emprendimiento_id <= 0 || empty($nombre)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos incompletos del producto']);
            exit;
        }

        try {
            // Verificar pertenencia del emprendimiento
            $checkOwner = $pdo->prepare("SELECT id FROM emprendimientos WHERE id = ? AND (usuario_id = ? OR ? IN ('admin', 'mesa_directiva'))");
            $checkOwner->execute([$emprendimiento_id, $user['id'], $user['rol']]);
            if (!$checkOwner->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'No tienes permisos sobre este negocio']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO bazar_productos (emprendimiento_id, nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$emprendimiento_id, $nombre, $descripcion, $precio, $imagen_url]);

            echo json_encode(['success' => true, 'message' => 'Producto publicado en el marketplace']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al agregar producto']);
        }
        break;

    default:
        if ($method === 'GET') {
            // Already handled
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Acción no encontrada']);
        }
}
