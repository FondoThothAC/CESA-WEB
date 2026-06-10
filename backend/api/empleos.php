<?php
/**
 * API Bolsa de Trabajo - CESA WEB v3.7 (Industrializado)
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

    // ================================================================
    // GET: Listar/Buscar Vacantes
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
            VALUES (?, '✅ Postulación Recibida', 'Hemos registrado tu interés exitosamente. El equipo CESA revisará tu perfil académico y te contactará pronto.', 'sistema')
        ");
        $notif->execute([$user['id']]);

        echo json_encode(['success' => true, 'message' => '¡Postulación enviada! Te notificaremos por correo pronto.']);
        exit;
    }

    // ================================================================
    // POST: Publicar nueva vacante (solo admins/coordinadores)
    // ================================================================
    if ($method === 'POST' && $action === 'publicar') {
        if (!$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Sin permisos para publicar.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("
            INSERT INTO bolsa_vacantes 
            (empresa_nombre, titulo, descripcion, modalidad, tipo, sueldo_rango, carreras_target, skill_id, verificada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([
            trim($input['empresa_nombre'] ?? 'Empresa CESA'),
            trim($input['titulo']),
            trim($input['descripcion'] ?? ''),
            $input['modalidad'] ?? 'presencial',
            $input['tipo'] ?? 'tiempo_completo',
            trim($input['sueldo_rango'] ?? 'A convenir'),
            trim($input['carreras_target'] ?? 'todas'),
            isset($input['skill_id']) ? (int)$input['skill_id'] : null
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
