<?php
/**
 * API Bolsa de Trabajo - CESA WEB v3.7 (Industrializado) + v4.0 (Company & Student Dashboards)
 * Tablas: bolsa_vacantes + postulaciones
 * Archivo: /backend/api/empleos.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($_POST['action'] ?? 'listar');

try {
    $pdo = getDBConnection();
    $isAdmin = $user && in_array($user['rol'], ['admin', 'mesa_directiva', 'coordinador_impulso']);
    $isCompany = $user && $user['rol'] === 'empresa';

    // ================================================================
    // GET: Listar/Buscar Vacantes (Público / Estudiantes / General)
    // ================================================================
    if ($method === 'GET' && $action === 'listar') {
        $modalidad = $_GET['modalidad'] ?? 'todas';
        $carrera   = $_GET['carrera'] ?? '';
        $tipo      = $_GET['tipo'] ?? '';
        $showAll   = isset($_GET['full']) && $isAdmin;

        $sql = "SELECT v.*, 
                       (SELECT COUNT(*) FROM postulaciones WHERE vacante_id = v.id) as postulaciones_count,
                       IF(? IS NOT NULL, (SELECT id FROM postulaciones WHERE vacante_id = v.id AND estudiante_id = ? LIMIT 1), NULL) as ya_postulado,
                       IF(v.skill_id IS NOT NULL AND ? IS NOT NULL AND (SELECT COUNT(*) FROM certificados_digitales WHERE usuario_id = ? AND skill_id = v.skill_id) > 0, 100, 0) as match_score
                FROM bolsa_vacantes v 
                WHERE v.activo = 1";
        $params = [$user['id'] ?? null, $user['id'] ?? null, $user['id'] ?? null, $user['id'] ?? null];

        if (!$showAll) {
            $sql .= " AND v.verificada = 1";
        }
        if ($modalidad !== 'todas') {
            $sql .= " AND v.modalidad = ?";
            $params[] = $modalidad;
        }
        if ($tipo) {
            $sql .= " AND v.tipo = ?";
            $params[] = $tipo;
        }
        if ($carrera) {
            $sql .= " AND (v.carreras_target LIKE ? OR v.carreras_target = 'todas')";
            $params[] = "%{$carrera}%";
        }

        $sql .= " ORDER BY v.verificada DESC, v.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'vacantes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Mis Postulaciones (Estudiantes)
    // ================================================================
    if ($method === 'GET' && $action === 'mis_postulaciones') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión.']);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT p.*, v.titulo, v.empresa_nombre, v.tipo as vacante_tipo
            FROM postulaciones p
            JOIN bolsa_vacantes v ON p.vacante_id = v.id
            WHERE p.estudiante_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$user['id']]);

        echo json_encode(['success' => true, 'postulaciones' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Mis Vacantes Publicadas (Empresas)
    // ================================================================
    if ($method === 'GET' && $action === 'mis_vacantes') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT v.*, 
                   (SELECT COUNT(*) FROM postulaciones WHERE vacante_id = v.id) as postulaciones_count
            FROM bolsa_vacantes v 
            WHERE v.empresa_id = ? OR ? = 1
            ORDER BY v.created_at DESC
        ");
        $stmt->execute([$user['id'], $isAdmin ? 1 : 0]);

        echo json_encode(['success' => true, 'vacantes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Candidatos para una vacante (Empresas)
    // ================================================================
    if ($method === 'GET' && $action === 'candidatos') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $vacante_id = (int)($_GET['vacante_id'] ?? 0);
        
        // Validar propiedad de la vacante
        if (!$isAdmin) {
            $check = $pdo->prepare("SELECT id FROM bolsa_vacantes WHERE id = ? AND empresa_id = ?");
            $check->execute([$vacante_id, $user['id']]);
            if (!$check->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'No autorizado para ver esta vacante']);
                exit;
            }
        }

        $stmt = $pdo->prepare("
            SELECT p.*, u.nombre_completo as estudiante_nombre, u.email as estudiante_email, u.carrera as estudiante_carrera
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            WHERE p.vacante_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$vacante_id]);

        echo json_encode(['success' => true, 'candidatos' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // POST: Actualizar estado del candidato (Empresas)
    // ================================================================
    if ($method === 'POST' && $action === 'actualizar_estado') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $postulacion_id = (int)($input['postulacion_id'] ?? 0);
        $estado = $input['estado'] ?? 'pendiente';
        $feedback = trim($input['feedback'] ?? '');

        // Validar propiedad
        if (!$isAdmin) {
            $check = $pdo->prepare("
                SELECT p.id FROM postulaciones p 
                JOIN bolsa_vacantes v ON p.vacante_id = v.id 
                WHERE p.id = ? AND v.empresa_id = ?
            ");
            $check->execute([$postulacion_id, $user['id']]);
            if (!$check->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'No autorizado']);
                exit;
            }
        }

        $stmt = $pdo->prepare("UPDATE postulaciones SET estado = ?, feedback_empresa = ? WHERE id = ?");
        $stmt->execute([$estado, $feedback, $postulacion_id]);

        echo json_encode(['success' => true, 'message' => 'Estado actualizado correctamente.']);
        exit;
    }

    // ================================================================
    // POST: Postularse a una vacante
    // ================================================================
    if ($method === 'POST' && $action === 'postular') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $vacante_id = (int)($input['vacante_id'] ?? 0);
        $mensaje    = trim($input['mensaje'] ?? '');

        if (!$vacante_id) {
            echo json_encode(['success' => false, 'error' => 'Vacante no válida.']);
            exit;
        }

        // Verificar no duplicado
        $check = $pdo->prepare("SELECT id FROM postulaciones WHERE vacante_id = ? AND estudiante_id = ?");
        $check->execute([$vacante_id, $user['id']]);
        if ($check->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Ya te postulaste a esta vacante.']);
            exit;
        }

        // Registrar postulación
        $ins = $pdo->prepare("INSERT INTO postulaciones (vacante_id, estudiante_id, mensaje_estudiante) VALUES (?, ?, ?)");
        $ins->execute([$vacante_id, $user['id'], $mensaje]);

        // Notificación de confirmación al alumno
        $notif = $pdo->prepare("
            INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) 
            VALUES (?, '✅ Postulación Recibida', 'Hemos registrado tu interés exitosamente. El equipo revisará tu perfil académico y te contactará pronto.', 'sistema')
        ");
        $notif->execute([$user['id']]);

        echo json_encode(['success' => true, 'message' => '¡Postulación enviada! Te notificaremos pronto.']);
        exit;
    }

    // ================================================================
    // POST: Subir Memoria de Prácticas
    // ================================================================
    if ($method === 'POST' && $action === 'subir_memoria') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $postulacion_id = (int)($_POST['postulacion_id'] ?? 0);
        if (!$postulacion_id) {
            echo json_encode(['success' => false, 'error' => 'Postulación no válida.']);
            exit;
        }

        // Validar propiedad de la postulación
        $check = $pdo->prepare("SELECT id FROM postulaciones WHERE id = ? AND estudiante_id = ?");
        $check->execute([$postulacion_id, $user['id']]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado.']);
            exit;
        }

        if (!isset($_FILES['memoria']) || $_FILES['memoria']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'error' => 'Error al subir el archivo.']);
            exit;
        }

        $uploadDir = __DIR__ . '/../../uploads/memorias/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $ext = pathinfo($_FILES['memoria']['name'], PATHINFO_EXTENSION);
        $filename = 'memoria_' . $postulacion_id . '_' . time() . '.' . $ext;
        $dest = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['memoria']['tmp_name'], $dest)) {
            $path = '/uploads/memorias/' . $filename;
            $stmt = $pdo->prepare("UPDATE postulaciones SET memoria_path = ? WHERE id = ?");
            $stmt->execute([$path, $postulacion_id]);

            echo json_encode(['success' => true, 'message' => 'Memoria subida exitosamente.', 'memoria_path' => $path]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al guardar el archivo.']);
        }
        exit;
    }

    // ================================================================
    // POST: Publicar nueva vacante (Empresas y Admins)
    // ================================================================
    if ($method === 'POST' && $action === 'publicar') {
        if (!$isAdmin && !$isCompany) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Sin permisos para publicar.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        
        $empresa_id = $isCompany ? $user['id'] : null;
        $empresa_nombre = $isCompany ? $user['nombre_completo'] : trim($input['empresa_nombre'] ?? 'Empresa CESA');

        $stmt = $pdo->prepare("
            INSERT INTO bolsa_vacantes 
            (empresa_id, empresa_nombre, titulo, descripcion, modalidad, tipo, sueldo_rango, carreras_target, verificada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $empresa_id,
            $empresa_nombre,
            trim($input['titulo']),
            trim($input['descripcion'] ?? ''),
            $input['modalidad'] ?? 'presencial',
            $input['tipo'] ?? 'tiempo_completo',
            trim($input['sueldo_rango'] ?? 'A convenir'),
            trim($input['carreras_target'] ?? 'todas'),
            $isAdmin ? 1 : 0 // Si lo publica una empresa, requiere verificación de un admin
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Vacante publicada'.($isAdmin?'':'. Pendiente de verificación.')]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
