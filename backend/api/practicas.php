<?php
/**
 * API Servicio Social y Prácticas Profesionales - CESA WEB v7.6
 * Basado en formatos oficiales UNISON: FP1 (Solicitud Unidad Receptora),
 * FP2 (Solicitud de Inscripción) y Carta de Asignación de Tutor.
 * Tablas: unidades_receptoras, areas, practicas_proyectos, postulaciones, tutores_profesionales
 * Archivo: /backend/api/practicas.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($_POST['action'] ?? 'proyectos');

try {
    $pdo = getDBConnection();
    $isAdmin = $user && in_array($user['rol'], ['admin', 'mesa_directiva', 'coordinador_impulso']);
    $isCompany = $user && $user['rol'] === 'empresa';

    // ================================================================
    // GET: Catálogo de áreas (divisiones/programas académicos)
    // ================================================================
    if ($method === 'GET' && $action === 'areas') {
        $stmt = $pdo->query("SELECT * FROM areas WHERE activo = 1 ORDER BY division, programa");
        echo json_encode(['success' => true, 'areas' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Listar proyectos aprobados (Estudiantes)
    // Filtra por programa académico del alumno (carrera)
    // ================================================================
    if ($method === 'GET' && $action === 'proyectos') {
        $area_id = (int)($_GET['area_id'] ?? 0);
        $tipo    = $_GET['tipo'] ?? '';
        $showAll = isset($_GET['full']) && $isAdmin;

        $sql = "SELECT pp.*, ur.razon_social, ur.rfc, ur.giro_sector, ur.domicilio, ur.ciudad, ur.cp,
                       ur.telefono as ur_telefono, ur.responsable_nombre, ur.responsable_puesto, ur.responsable_email,
                       a.programa, a.division,
                       (SELECT COUNT(*) FROM postulaciones WHERE proyecto_id = pp.id AND estado NOT IN ('rechazado','lista_espera')) as postulaciones_activas,
                       (SELECT COUNT(*) FROM postulaciones WHERE proyecto_id = pp.id AND estado = 'aceptado') as aceptados_count,
                       IF(? IS NOT NULL, (SELECT id FROM postulaciones WHERE proyecto_id = pp.id AND estudiante_id = ? LIMIT 1), NULL) as ya_postulado,
                       IF(? IS NOT NULL, (SELECT estado FROM postulaciones WHERE proyecto_id = pp.id AND estudiante_id = ? LIMIT 1), NULL) as mi_estado
                FROM practicas_proyectos pp
                LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
                LEFT JOIN areas a ON pp.area_id = a.id
                WHERE 1=1";
        $params = [$user['id'] ?? null, $user['id'] ?? null, $user['id'] ?? null, $user['id'] ?? null];

        if (!$showAll) {
            $sql .= " AND pp.estado IN ('aprobado','cupo_lleno')";
        }
        if ($area_id) {
            $sql .= " AND pp.area_id = ?";
            $params[] = $area_id;
        } elseif ($user && !empty($user['carrera']) && !$showAll) {
            // Auto-filtro por carrera del alumno
            $sql .= " AND (a.programa LIKE ? OR pp.licenciatura_target LIKE ? OR pp.area_id IS NULL)";
            $params[] = "%{$user['carrera']}%";
            $params[] = "%{$user['carrera']}%";
        }
        if ($tipo) {
            $sql .= " AND pp.tipo_programa = ?";
            $params[] = $tipo;
        }

        $sql .= " ORDER BY pp.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'proyectos' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Mis proyectos publicados (Empresas)
    // ================================================================
    if ($method === 'GET' && $action === 'mis_proyectos') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT pp.*, ur.razon_social, a.programa,
                   (SELECT COUNT(*) FROM postulaciones WHERE proyecto_id = pp.id AND estado NOT IN ('rechazado','lista_espera')) as postulaciones_activas,
                   (SELECT COUNT(*) FROM postulaciones WHERE proyecto_id = pp.id AND estado = 'aceptado') as aceptados_count
            FROM practicas_proyectos pp
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            LEFT JOIN areas a ON pp.area_id = a.id
            WHERE pp.empresa_id = ? OR ? = 1
            ORDER BY pp.created_at DESC
        ");
        $stmt->execute([$user['id'], $isAdmin ? 1 : 0]);

        echo json_encode(['success' => true, 'proyectos' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Mi unidad receptora (perfil empresa)
    // ================================================================
    if ($method === 'GET' && $action === 'mi_unidad') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM unidades_receptoras WHERE usuario_id = ? LIMIT 1");
        $stmt->execute([$user['id']]);
        echo json_encode(['success' => true, 'unidad' => $stmt->fetch() ?: null]);
        exit;
    }

    // ================================================================
    // GET: Candidatos de un proyecto con posición en fila de espera (Empresas)
    // ================================================================
    if ($method === 'GET' && $action === 'candidatos') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $proyecto_id = (int)($_GET['proyecto_id'] ?? 0);

        // Validar propiedad
        if (!$isAdmin) {
            $check = $pdo->prepare("SELECT id FROM practicas_proyectos WHERE id = ? AND empresa_id = ?");
            $check->execute([$proyecto_id, $user['id']]);
            if (!$check->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'No autorizado para ver este proyecto']);
                exit;
            }
        }

        $stmt = $pdo->prepare("
            SELECT p.*, u.nombre_completo as estudiante_nombre, u.email as estudiante_email,
                   u.carrera as estudiante_carrera, u.expediente, u.creditos_acumulados,
                   @row := @row + 1 as fila_orden,
                   (SELECT COUNT(*) FROM postulaciones p2
                     WHERE p2.proyecto_id = p.proyecto_id AND p2.estado = 'aceptado') as aceptados_count
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            JOIN (SELECT @row := 0) r
            WHERE p.proyecto_id = ?
            ORDER BY FIELD(p.estado, 'entrevista', 'pendiente', 'lista_espera', 'aceptado', 'rechazado'), p.created_at ASC
        ");
        $stmt->execute([$proyecto_id]);

        echo json_encode(['success' => true, 'candidatos' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Mis postulaciones a proyectos con posición en fila (Estudiante)
    // ================================================================
    if ($method === 'GET' && $action === 'mis_postulaciones') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión.']);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT p.*, pp.nombre_programa, pp.num_practicantes, pp.estado as proyecto_estado,
                   pp.tipo_programa, ur.razon_social,
                   (SELECT COUNT(*) FROM postulaciones p2
                     WHERE p2.proyecto_id = p.proyecto_id
                       AND p2.estado NOT IN ('rechazado')
                       AND p2.created_at < p.created_at
                       AND p2.estado IN ('pendiente','entrevista','lista_espera')
                   ) + 1 as posicion_fila,
                   (SELECT COUNT(*) FROM postulaciones p3
                     WHERE p3.proyecto_id = p.proyecto_id AND p3.estado = 'aceptado') as aceptados_count
            FROM postulaciones p
            JOIN practicas_proyectos pp ON p.proyecto_id = pp.id
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            WHERE p.estudiante_id = ? AND p.proyecto_id IS NOT NULL
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$user['id']]);

        echo json_encode(['success' => true, 'postulaciones' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ================================================================
    // GET: Pendientes de aprobación (Admin)
    // ================================================================
    if ($method === 'GET' && $action === 'pendientes_aprobacion') {
        if (!$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $stmt = $pdo->query("
            SELECT pp.*, ur.razon_social, ur.rfc, ur.responsable_nombre, ur.aprobada, a.programa,
                   (SELECT COUNT(*) FROM postulaciones WHERE proyecto_id = pp.id) as postulaciones_count
            FROM practicas_proyectos pp
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            LEFT JOIN areas a ON pp.area_id = a.id
            WHERE pp.estado = 'pendiente'
            ORDER BY pp.created_at ASC
        ");

        $unidades = $pdo->query("
            SELECT ur.*, u.email as usuario_email, u.nombre_completo as usuario_nombre
            FROM unidades_receptoras ur
            LEFT JOIN usuarios u ON ur.usuario_id = u.id
            WHERE ur.aprobada = 0
            ORDER BY ur.created_at ASC
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'proyectos' => $stmt->fetchAll(PDO::FETCH_ASSOC), 'unidades' => $unidades]);
        exit;
    }

    // ================================================================
    // POST: Registrar unidad receptora + proyecto FP1 (Empresa)
    // ================================================================
    if ($method === 'POST' && $action === 'registrar_empresa') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Solo las empresas registradas pueden publicar proyectos.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $required = ['razon_social', 'nombre_programa'];
        foreach ($required as $f) {
            if (empty($input[$f])) {
                echo json_encode(['success' => false, 'error' => "El campo '{$f}' es obligatorio."]);
                exit;
            }
        }

        $pdo->beginTransaction();
        try {
            // 1. Upsert unidad receptora
            $stmt = $pdo->prepare("SELECT id FROM unidades_receptoras WHERE usuario_id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $existing = $stmt->fetch();

            $urData = [
                trim($input['razon_social']),
                trim($input['rfc'] ?? ''),
                trim($input['giro_sector'] ?? ''),
                trim($input['domicilio'] ?? ''),
                trim($input['ciudad'] ?? ''),
                trim($input['cp'] ?? ''),
                trim($input['telefono'] ?? ''),
                trim($input['responsable_nombre'] ?? ''),
                trim($input['responsable_puesto'] ?? ''),
                trim($input['responsable_email'] ?? '')
            ];

            if ($existing) {
                $stmt = $pdo->prepare("
                    UPDATE unidades_receptoras SET razon_social=?, rfc=?, giro_sector=?, domicilio=?, ciudad=?,
                    cp=?, telefono=?, responsable_nombre=?, responsable_puesto=?, responsable_email=?
                    WHERE usuario_id = ?
                ");
                $stmt->execute(array_merge($urData, [$user['id']]));
                $unidad_id = (int)$existing['id'];
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO unidades_receptoras
                    (usuario_id, razon_social, rfc, giro_sector, domicilio, ciudad, cp, telefono, responsable_nombre, responsable_puesto, responsable_email)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute(array_merge([$user['id']], $urData));
                $unidad_id = (int)$pdo->lastInsertId();
            }

            // 2. Resolver área
            $area_id = (int)($input['area_id'] ?? 0);
            if (!$area_id && !empty($input['licenciatura_target'])) {
                $stmt = $pdo->prepare("SELECT id FROM areas WHERE programa LIKE ? LIMIT 1");
                $stmt->execute(['%' . $input['licenciatura_target'] . '%']);
                $area = $stmt->fetch();
                $area_id = $area ? (int)$area['id'] : null;
            }

            // 3. Insertar proyecto (FP1)
            $stmt = $pdo->prepare("
                INSERT INTO practicas_proyectos
                (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target,
                 perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user['id'],
                $unidad_id,
                $area_id ?: null,
                trim($input['nombre_programa']),
                trim($input['areas_departamento'] ?? ''),
                trim($input['licenciatura_target'] ?? ''),
                trim($input['perfil_deseado'] ?? ''),
                max(1, (int)($input['num_practicantes'] ?? 1)),
                trim($input['justificacion'] ?? ''),
                trim($input['objetivo'] ?? ''),
                trim($input['plan_trabajo'] ?? ''),
                json_encode($input['apoyos'] ?? ['beca' => '', 'comida' => '', 'transporte' => '', 'equipo' => '', 'otro' => '', 'ninguno' => false]),
                $input['tipo_programa'] ?? 'practicas_profesionales',
                $isAdmin ? 'aprobado' : 'pendiente'
            ]);
            $proyecto_id = (int)$pdo->lastInsertId();

            $pdo->commit();

            // Notificar a admins sobre nuevo proyecto pendiente
            if (!$isAdmin) {
                $pdo->prepare("
                    INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo)
                    SELECT id, '📋 Nuevo proyecto de Prácticas', CONCAT('La unidad receptora \"', ?, '\" solicitó publicar el proyecto \"', ?, '\". Requiere aprobación.'), 'sistema'
                    FROM usuarios WHERE rol = 'admin'
                ")->execute([$input['razon_social'], $input['nombre_programa']]);
            }

            echo json_encode([
                'success' => true,
                'id' => $proyecto_id,
                'unidad_id' => $unidad_id,
                'message' => $isAdmin ? 'Proyecto publicado y aprobado.' : 'Solicitud enviada. Pendiente de aprobación del administrador.'
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        exit;
    }

    // ================================================================
    // POST: Aprobar/Rechazar unidad receptora (Admin)
    // ================================================================
    if ($method === 'POST' && $action === 'aprobar_unidad') {
        if (!$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $unidad_id = (int)($input['unidad_id'] ?? 0);
        $aprobar = !empty($input['aprobar']);

        $stmt = $pdo->prepare("UPDATE unidades_receptoras SET aprobada = ? WHERE id = ?");
        $stmt->execute([$aprobar ? 1 : 0, $unidad_id]);

        // Notificar a la empresa
        $stmt = $pdo->prepare("SELECT usuario_id, razon_social FROM unidades_receptoras WHERE id = ?");
        $stmt->execute([$unidad_id]);
        if ($ur = $stmt->fetch()) {
            $pdo->prepare("INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, 'sistema')")->execute([
                $ur['usuario_id'],
                $aprobar ? '✅ Unidad Receptora aprobada' : '❌ Unidad Receptora rechazada',
                $aprobar
                    ? "Tu unidad receptora \"{$ur['razon_social']}\" fue aprobada. Ya puedes publicar proyectos de prácticas."
                    : "Tu solicitud de unidad receptora \"{$ur['razon_social']}\" no fue aprobada. Contacta al coordinador."
            ]);
        }

        echo json_encode(['success' => true, 'message' => $aprobar ? 'Unidad aprobada.' : 'Unidad rechazada.']);
        exit;
    }

    // ================================================================
    // POST: Aprobar/Rechazar proyecto (Admin)
    // ================================================================
    if ($method === 'POST' && $action === 'aprobar_proyecto') {
        if (!$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $proyecto_id = (int)($input['proyecto_id'] ?? 0);
        $aprobar = !empty($input['aprobar']);

        $stmt = $pdo->prepare("SELECT empresa_id, nombre_programa FROM practicas_proyectos WHERE id = ?");
        $stmt->execute([$proyecto_id]);
        if ($proy = $stmt->fetch()) {
            $pdo->prepare("UPDATE practicas_proyectos SET estado = ? WHERE id = ?")->execute([
                $aprobar ? 'aprobado' : 'rechazado', $proyecto_id
            ]);
            if ($proy['empresa_id']) {
                $pdo->prepare("INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, 'sistema')")->execute([
                    $proy['empresa_id'],
                    $aprobar ? '✅ Proyecto aprobado' : '❌ Proyecto rechazado',
                    $aprobar
                        ? "Tu proyecto \"{$proy['nombre_programa']}\" fue aprobado. Los estudiantes ya pueden postularse."
                        : "Tu proyecto \"{$proy['nombre_programa']}\" no fue aprobado. Revisa el registro e intenta de nuevo."
                ]);
            }
            echo json_encode(['success' => true, 'message' => $aprobar ? 'Proyecto aprobado.' : 'Proyecto rechazado.']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Proyecto no encontrado.']);
        }
        exit;
    }

    // ================================================================
    // POST: Postularse a un proyecto (Estudiante) -> entra a la fila
    // ================================================================
    if ($method === 'POST' && $action === 'postular') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $proyecto_id = (int)($input['proyecto_id'] ?? 0);
        $mensaje = trim($input['mensaje'] ?? '');

        // Validar proyecto abierto
        $stmt = $pdo->prepare("SELECT nombre_programa, num_practicantes, estado, tipo_programa FROM practicas_proyectos WHERE id = ?");
        $stmt->execute([$proyecto_id]);
        $proy = $stmt->fetch();
        if (!$proy || !in_array($proy['estado'], ['aprobado'])) {
            echo json_encode(['success' => false, 'error' => 'Este proyecto no está aceptando postulaciones.']);
            exit;
        }

        // Reglamento UNISON: Servicio Social requiere 70% de créditos aprobados
        if ($proy['tipo_programa'] === 'servicio_social') {
            $stmt = $pdo->prepare("SELECT creditos_acumulados, creditos_totales_carrera FROM usuarios WHERE id = ?");
            $stmt->execute([$user['id']]);
            $cred = $stmt->fetch();
            if ($cred) {
                $total = (int)($cred['creditos_totales_carrera'] ?: 400);
                $acum = (int)($cred['creditos_acumulados'] ?: 0);
                if ($acum < $total * 0.7) {
                    echo json_encode(['success' => false, 'error' => "Para Servicio Social necesitas el 70% de créditos aprobados (Reglamento UNISON). Llevas {$acum} de {$total} créditos."]);
                    exit;
                }
            }
        }

        // Sin duplicados
        $check = $pdo->prepare("SELECT id FROM postulaciones WHERE proyecto_id = ? AND estudiante_id = ?");
        $check->execute([$proyecto_id, $user['id']]);
        if ($check->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Ya te postulaste a este proyecto.']);
            exit;
        }

        $ins = $pdo->prepare("INSERT INTO postulaciones (proyecto_id, estudiante_id, mensaje_estudiante) VALUES (?, ?, ?)");
        $ins->execute([$proyecto_id, $user['id'], $mensaje]);
        $posicion = (int)$pdo->lastInsertId();

        // Posición real en la fila
        $stmt = $pdo->prepare("SELECT COUNT(*) + 1 FROM postulaciones WHERE proyecto_id = ? AND id < ? AND estado NOT IN ('rechazado')");
        $stmt->execute([$proyecto_id, $posicion]);
        $posicion = (int)$stmt->fetchColumn();

        $pdo->prepare("INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, 'sistema')")->execute([
            $user['id'],
            '✅ Postulación registrada',
            "Estás en la fila de espera del proyecto \"{$proy['nombre_programa']}\" en la posición #{$posicion}. La empresa entrevistará y aceptará candidatos hasta llenar el cupo."
        ]);

        echo json_encode(['success' => true, 'message' => "¡Postulación enviada! Estás en la posición #{$posicion} de la fila."]);
        exit;
    }

    // ================================================================
    // POST: Concluir prácticas (Estudiante) -> habilita FPP-4 reporte final
    // ================================================================
    if ($method === 'POST' && $action === 'concluir_practicas') {
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $postulacion_id = (int)($input['postulacion_id'] ?? 0);
        $horas = (int)($input['horas_realizadas'] ?? 0);

        // Validar propiedad y que esté aceptado
        $stmt = $pdo->prepare("SELECT estado FROM postulaciones WHERE id = ? AND estudiante_id = ?");
        $stmt->execute([$postulacion_id, $user['id']]);
        $post = $stmt->fetch();
        if (!$post || $post['estado'] !== 'aceptado') {
            echo json_encode(['success' => false, 'error' => 'Solo puedes concluir prácticas aceptadas y activas.']);
            exit;
        }

        $pdo->prepare("UPDATE postulaciones SET estado = 'concluido', fecha_conclusion = NOW(), horas_realizadas = ? WHERE id = ?")
            ->execute([$horas ?: null, $postulacion_id]);

        // Notificar
        $pdo->prepare("INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, '🏁 Prácticas concluidas', 'Registraste la conclusión de tus prácticas. Ya puedes generar tu Reporte Final (FPP-4) desde Mis Postulaciones.', 'sistema')")->execute([$user['id']]);

        echo json_encode(['success' => true, 'message' => 'Prácticas marcadas como concluidas. Ya puedes descargar tu FPP-4.']);
        exit;
    }

    // ================================================================
    // POST: Acciones sobre candidatos (Empresa)
    // entrevistar | aceptar | rechazar | lista_espera
    // ================================================================
    if ($method === 'POST' && $action === 'accion_candidato') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $postulacion_id = (int)($input['postulacion_id'] ?? 0);
        $nuevo_estado = $input['estado'] ?? '';
        $feedback = trim($input['feedback'] ?? '');
        $horario = trim($input['horario_acordado'] ?? '');

        if (!in_array($nuevo_estado, ['entrevista', 'aceptado', 'rechazado', 'lista_espera', 'pendiente'])) {
            echo json_encode(['success' => false, 'error' => 'Estado no válido.']);
            exit;
        }

        // Validar propiedad + datos del proyecto
        $sql = "SELECT pp.id, pp.nombre_programa, pp.num_practicantes, pp.empresa_id
                FROM postulaciones p
                JOIN practicas_proyectos pp ON p.proyecto_id = pp.id
                WHERE p.id = ?";
        if (!$isAdmin) {
            $sql .= " AND pp.empresa_id = ?";
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute(!$isAdmin ? [$postulacion_id, $user['id']] : [$postulacion_id]);
        $data = $stmt->fetch();
        if (!$data) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        // Si acepta, validar cupo disponible
        if ($nuevo_estado === 'aceptado') {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM postulaciones WHERE proyecto_id = ? AND estado = 'aceptado'");
            $stmt->execute([$data['id']]);
            $aceptados = (int)$stmt->fetchColumn();
            if ($aceptados >= (int)$data['num_practicantes']) {
                echo json_encode(['success' => false, 'error' => "Cupo lleno ({$aceptados}/{$data['num_practicantes']}). No puedes aceptar más candidatos."]);
                exit;
            }
        }

        $pdo->prepare("UPDATE postulaciones SET estado = ?, feedback_empresa = ?, horario_acordado = ?,
                       fecha_aceptacion = IF(? = 'aceptado', NOW(), NULL) WHERE id = ?")
            ->execute([$nuevo_estado, $feedback, $horario, $nuevo_estado, $postulacion_id]);

        // Obtener estudiante para notificar
        $stmt = $pdo->prepare("SELECT estudiante_id FROM postulaciones WHERE id = ?");
        $stmt->execute([$postulacion_id]);
        $estudiante_id = (int)$stmt->fetchColumn();

        $mensajes = [
            'entrevista' => "🎯 La empresa te invitó a entrevista para \"{$data['nombre_programa']}\". ¡Prepárate!",
            'aceptado' => "🎉 ¡Felicidades! Fuiste ACEPTADO en \"{$data['nombre_programa']}\". Ya puedes descargar tu formato FP2 prellenado desde 'Mis Postulaciones'.",
            'rechazado' => "Tu postulación a \"{$data['nombre_programa']}\" no fue seleccionada en esta ocasión.",
            'lista_espera' => "Pasaste a lista de espera en \"{$data['nombre_programa']}\". Te avisaremos si se libera un lugar.",
            'pendiente' => "Tu postulación a \"{$data['nombre_programa']}\" volvió a estado pendiente."
        ];
        $pdo->prepare("INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, 'sistema')")->execute([
            $estudiante_id,
            $nuevo_estado === 'aceptado' ? '🎉 ¡Aceptado en Prácticas!' : '📢 Actualización de tu postulación',
            $mensajes[$nuevo_estado]
        ]);

        // Si se llenó el cupo, cerrar proyecto y notificar a los demás
        if ($nuevo_estado === 'aceptado') {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM postulaciones WHERE proyecto_id = ? AND estado = 'aceptado'");
            $stmt->execute([$data['id']]);
            if ((int)$stmt->fetchColumn() >= (int)$data['num_practicantes']) {
                $pdo->prepare("UPDATE practicas_proyectos SET estado = 'cupo_lleno' WHERE id = ?")->execute([$data['id']]);

                $stmt = $pdo->prepare("
                    SELECT estudiante_id FROM postulaciones
                    WHERE proyecto_id = ? AND estado IN ('pendiente','entrevista','lista_espera') AND estudiante_id != ?
                ");
                $stmt->execute([$data['id'], $estudiante_id]);
                $notif = $pdo->prepare("INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, 'sistema')");
                foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $uid) {
                    $notif->execute([
                        $uid,
                        '🚫 Cupo lleno',
                        "El cupo de \"{$data['nombre_programa']}\" se llenó. Quedaste en lista de espera, pero te invitamos a explorar otros proyectos disponibles."
                    ]);
                    $pdo->prepare("UPDATE postulaciones SET estado = 'lista_espera' WHERE proyecto_id = ? AND estudiante_id = ? AND estado IN ('pendiente','entrevista')")
                        ->execute([$data['id'], $uid]);
                }
            }
        }

        echo json_encode(['success' => true, 'message' => 'Estado actualizado y estudiante notificado.']);
        exit;
    }

    // ================================================================
    // POST: Registrar tutor profesional de una postulación (Empresa/Admin)
    // ================================================================
    if ($method === 'POST' && $action === 'asignar_tutor') {
        if (!$isCompany && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $postulacion_id = (int)($input['postulacion_id'] ?? 0);
        $tutor = $input['tutor'] ?? [];

        $stmt = $pdo->prepare("INSERT INTO tutores_profesionales (no_empleado, nombre, titulo_tratamiento, telefono, email) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            trim($tutor['no_empleado'] ?? ''),
            trim($tutor['nombre'] ?? ''),
            trim($tutor['titulo'] ?? 'Dra.'),
            trim($tutor['telefono'] ?? ''),
            trim($tutor['email'] ?? '')
        ]);
        $tutor_id = (int)$pdo->lastInsertId();

        $pdo->prepare("UPDATE postulaciones SET tutor_profesional_id = ? WHERE id = ?")->execute([$tutor_id, $postulacion_id]);

        echo json_encode(['success' => true, 'tutor_id' => $tutor_id, 'message' => 'Tutor profesional asignado.']);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
