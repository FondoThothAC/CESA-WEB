<?php
/**
 * Generador de documentos oficiales (.docx) - CESA WEB v7.6
 * Servicio Social y Prácticas Profesionales UNISON
 * Genera: FP1 (Solicitud Unidad Receptora), FP2 (Solicitud de Inscripción),
 *         CARTA_TUTOR (Carta de Asignación de Tutor Profesional)
 * Método: template .docx + sustitución de tokens {{campo}} en word/document.xml (ZipArchive)
 * Archivo: /backend/api/documentos.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/DocxGenerator.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$MESES = [1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril', 5 => 'mayo', 6 => 'junio',
          7 => 'julio', 8 => 'agosto', 9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre'];

function fechaEspañol(?string $date = null): array {
    global $MESES;
    $ts = $date ? strtotime($date) : time();
    return ['dia' => date('j', $ts), 'mes' => $MESES[(int)date('n', $ts)], 'anio' => date('Y', $ts)];
}

function streamDocx(string $bin, string $filename, PDO $pdo, array $logData): void {
    // Log del documento generado
    try {
        $stmt = $pdo->prepare("INSERT INTO documentos_generados (tipo, postulacion_id, proyecto_id, usuario_id, path) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$logData['tipo'], $logData['postulacion_id'] ?? null, $logData['proyecto_id'] ?? null,
                        $logData['usuario_id'] ?? null, '/uploads/documentos/' . $filename]);
    } catch (Exception $e) { /* log no bloqueante */ }

    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($bin));
    header('Cache-Control: no-store');
    echo $bin;
    exit;
}

try {
    $pdo = getDBConnection();
    $isAdmin = $user && in_array($user['rol'], ['admin', 'mesa_directiva', 'coordinador_impulso']);
    $isCompany = $user && $user['rol'] === 'empresa';

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión.']);
        exit;
    }

    // ================================================================
    // GET: FP1 - Solicitud de Estudiantes de la Unidad Receptora
    // ================================================================
    if ($method === 'GET' && $action === 'fp1') {
        $proyecto_id = (int)($_GET['proyecto_id'] ?? 0);

        $stmt = $pdo->prepare("
            SELECT pp.*, ur.*, pp.id as proyecto_id, pp.empresa_id, a.departamento, a.division
            FROM practicas_proyectos pp
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            LEFT JOIN areas a ON pp.area_id = a.id
            WHERE pp.id = ?
        ");
        $stmt->execute([$proyecto_id]);
        $pp = $stmt->fetch();
        if (!$pp) {
            echo json_encode(['success' => false, 'error' => 'Proyecto no encontrado.']);
            exit;
        }
        if (!$isAdmin && !($isCompany && $pp['empresa_id'] == $user['id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $apoyos = json_decode($pp['apoyos'] ?? '{}', true) ?: [];
        $f = fechaEspañol($pp['created_at']);

        $perfil = trim($pp['perfil_deseado'] ?? '');
        $plan = trim($pp['plan_trabajo'] ?? '');

        $data = [
            'departamento' => $pp['departamento'] ?: 'Economía',
            'dia' => $f['dia'], 'mes' => $f['mes'], 'anio' => $f['anio'],
            'razon_social' => $pp['razon_social'],
            'rfc' => $pp['rfc'],
            'nombre_programa' => $pp['nombre_programa'],
            'areas_departamento' => $pp['areas_departamento'],
            'licenciatura_target' => $pp['licenciatura_target'],
            'perfil_deseado_multiline' => $perfil,
            'num_practicantes' => $pp['num_practicantes'],
            'justificacion' => $pp['justificacion'],
            'objetivo' => $pp['objetivo'],
            'plan_trabajo_multiline' => $plan,
            'apoyo_beca' => ($apoyos['beca'] ?? '') ?: '________',
            'apoyo_comida' => ($apoyos['comida'] ?? '') ?: '________',
            'apoyo_transporte' => ($apoyos['transporte'] ?? '') ?: '________',
            'apoyo_equipo' => ($apoyos['equipo'] ?? '') ?: '________',
            'apoyo_otro' => ($apoyos['otro'] ?? '') ?: '____________',
            'apoyo_ninguno' => !empty($apoyos['ninguno']) ? 'X' : '_____',
            'responsable_nombre' => $pp['responsable_nombre'],
            'responsable_puesto' => $pp['responsable_puesto'],
            'responsable_email' => $pp['responsable_email'],
            'telefono' => $pp['telefono'],
        ];

        $bin = DocxGenerator::build('FP1.docx', $data, ["perfil_deseado_multiline", "plan_trabajo_multiline"]);
        streamDocx($bin, 'FP1_' . preg_replace('/[^A-Za-z0-9]+/', '_', $pp['razon_social']) . '_' . $proyecto_id . '.docx',
                   $pdo, ['tipo' => 'FP1', 'proyecto_id' => $proyecto_id, 'usuario_id' => $user['id']]);
    }

    // ================================================================
    // GET: FP2 - Solicitud de Inscripción (prellenado con datos del alumno)
    // ================================================================
    if ($method === 'GET' && $action === 'fp2') {
        $postulacion_id = (int)($_GET['postulacion_id'] ?? 0);

        $stmt = $pdo->prepare("
            SELECT p.*, pp.empresa_id, u.nombre_completo as alumno_nombre, u.carrera as alumno_programa, u.expediente,
                   u.celular as alumno_telefono, u.email as alumno_email, u.creditos_acumulados as alumno_creditos,
                   u.seguro_social_tipo, u.seguro_social_num, u.disponibilidad_horario,
                   pp.nombre_programa, pp.objetivo, pp.tipo_programa, pp.num_practicantes,
                   ur.razon_social, ur.rfc, ur.giro_sector, ur.domicilio, ur.ciudad, ur.cp, ur.telefono,
                   ur.responsable_nombre, ur.responsable_puesto, ur.responsable_email,
                   a.departamento,
                   t.no_empleado as tutor_no_empleado, t.nombre as tutor_nombre, t.titulo_tratamiento as tutor_titulo,
                   t.telefono as tutor_telefono, t.email as tutor_email
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            JOIN practicas_proyectos pp ON p.proyecto_id = pp.id
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            LEFT JOIN areas a ON pp.area_id = a.id
            LEFT JOIN tutores_profesionales t ON p.tutor_profesional_id = t.id
            WHERE p.id = ?
        ");
        $stmt->execute([$postulacion_id]);
        $row = $stmt->fetch();
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Postulación no encontrada.']);
            exit;
        }
        if (!$isAdmin && $row['estudiante_id'] != $user['id'] && !($isCompany && $row['empresa_id'] == $user['id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        if ($row['estado'] !== 'aceptado' && !$isAdmin) {
            echo json_encode(['success' => false, 'error' => 'Debes ser aceptado en el proyecto para descargar el FP2.']);
            exit;
        }

        $f = fechaEspañol();
        $seguro = $row['seguro_social_tipo'] ?? '';
        $data = [
            'departamento' => $row['departamento'] ?: 'Economía',
            'dia' => $f['dia'], 'mes' => $f['mes'], 'anio' => $f['anio'],
            'alumno_nombre' => $row['alumno_nombre'],
            'alumno_programa' => $row['alumno_programa'] ?: 'Licenciatura en ' . ($row['licenciatura_target'] ?? ''),
            'alumno_expediente' => $row['expediente'],
            'alumno_telefono' => $row['alumno_telefono'],
            'alumno_email' => $row['alumno_email'],
            'alumno_creditos' => $row['alumno_creditos'] ?: '',
            'check_imss' => $seguro === 'IMSS' ? 'X' : '',
            'check_isste' => $seguro === 'ISSSTE' ? 'X' : '',
            'check_issteson' => $seguro === 'ISSSTESON' ? 'X' : '',
            'seguro_otro' => $seguro === 'OTRO' ? 'X: ______________' : '',
            'seguro_num' => $row['seguro_social_num'],
            'opcion_elegida' => 'BANCO DE PROYECTOS',
            'disponibilidad_horario' => $row['disponibilidad_horario'],
            'razon_social' => $row['razon_social'],
            'giro_sector' => $row['giro_sector'],
            'domicilio' => $row['domicilio'],
            'ciudad' => $row['ciudad'],
            'cp' => $row['cp'],
            'telefono' => $row['telefono'],
            'responsable_nombre' => $row['responsable_nombre'],
            'responsable_puesto' => $row['responsable_puesto'],
            'responsable_email' => $row['responsable_email'],
            'nombre_programa' => $row['nombre_programa'],
            'objetivo' => $row['objetivo'],
            'horario_acordado' => $row['horario_acordado'] ?: $row['disponibilidad_horario'],
            'tutor_no_empleado' => $row['tutor_no_empleado'],
            'tutor_nombre' => $row['tutor_nombre'],
            'tutor_fecha' => $row['fecha_aceptacion'] ? date('d/m/Y', strtotime($row['fecha_aceptacion'])) : '',
        ];

        $bin = DocxGenerator::build('FP2.docx', $data);
        streamDocx($bin, 'FP2_' . preg_replace('/[^A-Za-z0-9]+/', '_', $row['alumno_nombre']) . '_' . $postulacion_id . '.docx',
                   $pdo, ['tipo' => 'FP2', 'postulacion_id' => $postulacion_id, 'proyecto_id' => $row['proyecto_id'], 'usuario_id' => $user['id']]);
    }

    // ================================================================
    // GET: CARTA_TUTOR - Carta de Asignación de Tutor Profesional
    // ================================================================
    if ($method === 'GET' && $action === 'carta_tutor') {
        $postulacion_id = (int)($_GET['postulacion_id'] ?? 0);

        $stmt = $pdo->prepare("
            SELECT p.*, pp.empresa_id, u.nombre_completo as alumno_nombre, u.carrera as alumno_programa, u.expediente,
                   u.seguro_social_tipo, u.seguro_social_num,
                   pp.nombre_programa, pp.tipo_programa, pp.areas_departamento,
                   ur.razon_social, ur.responsable_nombre, ur.responsable_puesto, ur.ciudad,
                   a.departamento, a.jefe_departamento, a.jefe_titulo,
                   t.no_empleado, t.nombre as tutor_nombre, t.titulo_tratamiento as tutor_titulo,
                   t.telefono as tutor_telefono, t.email as tutor_email
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            JOIN practicas_proyectos pp ON p.proyecto_id = pp.id
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            LEFT JOIN areas a ON pp.area_id = a.id
            LEFT JOIN tutores_profesionales t ON p.tutor_profesional_id = t.id
            WHERE p.id = ?
        ");
        $stmt->execute([$postulacion_id]);
        $row = $stmt->fetch();
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Postulación no encontrada.']);
            exit;
        }
        if (!$isAdmin && !($isCompany && $row['empresa_id'] == $user['id']) && $row['estudiante_id'] != $user['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $f = fechaEspañol();
        $data = [
            'ciudad_departamento' => 'Hermosillo',
            'dia_carta' => $f['dia'], 'mes_carta' => $f['mes'], 'anio_carta' => $f['anio'],
            'responsable_nombre' => $row['responsable_nombre'],
            'responsable_puesto' => $row['responsable_puesto'],
            'razon_social' => $row['razon_social'],
            'alumno_nombre' => $row['alumno_nombre'],
            'alumno_expediente' => $row['expediente'],
            'seguro_tipo' => $row['seguro_social_tipo'] ?: 'IMSS',
            'seguro_num' => $row['seguro_social_num'],
            'tipo_programa_texto' => $row['tipo_programa'] === 'servicio_social' ? 'Servicio Social' : 'Prácticas Profesionales',
            'alumno_programa' => $row['alumno_programa'],
            'nombre_programa' => $row['nombre_programa'],
            'labores_auxiliar' => $row['areas_departamento'] ?: 'gestión, vinculación y promoción',
            'tutor_titulo' => $row['tutor_titulo'] ?: 'Dra.',
            'tutor_nombre' => $row['tutor_nombre'],
            'tutor_telefono' => $row['tutor_telefono'],
            'tutor_email' => $row['tutor_email'],
            'jefe_departamento' => ($row['jefe_titulo'] ?: 'Dr(a).') . ' ' . ($row['jefe_departamento'] ?: 'Por asignar'),
        ];

        $bin = DocxGenerator::build('CARTA_TUTOR.docx', $data);
        streamDocx($bin, 'CARTA_TUTOR_' . preg_replace('/[^A-Za-z0-9]+/', '_', $row['alumno_nombre']) . '_' . $postulacion_id . '.docx',
                   $pdo, ['tipo' => 'CARTA_TUTOR', 'postulacion_id' => $postulacion_id, 'proyecto_id' => $row['proyecto_id'], 'usuario_id' => $user['id']]);
    }

    // ================================================================
    // GET: FPP3/FPP4 - Reportes Parcial/Final de Prácticas
    // ================================================================
    if ($method === 'GET' && ($action === 'fpp3' || $action === 'fpp4')) {
        $postulacion_id = (int)($_GET['postulacion_id'] ?? 0);
        $template = $action === 'fpp3' ? 'FPP3.docx' : 'FPP4.docx';

        $stmt = $pdo->prepare("
            SELECT p.*, u.nombre_completo as alumno_nombre, u.carrera as alumno_programa, u.expediente,
                   u.celular as alumno_celular,
                   pp.nombre_programa, pp.empresa_id,
                   ur.razon_social, ur.telefono, ur.responsable_nombre, ur.responsable_puesto,
                   a.departamento
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            JOIN practicas_proyectos pp ON p.proyecto_id = pp.id
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            LEFT JOIN areas a ON pp.area_id = a.id
            WHERE p.id = ?
        ");
        $stmt->execute([$postulacion_id]);
        $row = $stmt->fetch();
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Postulación no encontrada.']);
            exit;
        }
        if (!$isAdmin && $row['estudiante_id'] != $user['id'] && !($isCompany && $row['empresa_id'] == $user['id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        // FPP4 solo si concluyó; FPP3 solo con prácticas activas o concluidas
        if ($action === 'fpp4' && $row['estado'] !== 'concluido' && !$isAdmin) {
            echo json_encode(['success' => false, 'error' => 'Debes marcar tus prácticas como concluidas para generar el Reporte Final.']);
            exit;
        }

        $ini = $row['fecha_aceptacion'] ? strtotime($row['fecha_aceptacion']) : time();
        $fin = $row['fecha_conclusion'] ? strtotime($row['fecha_conclusion']) : time();
        $horasRealizadas = (int)($row['horas_realizadas'] ?: 0);

        $data = [
            'departamento' => $row['departamento'] ?: 'Economía',
            'periodo_del_dia' => date('d', $ini), 'periodo_del_mes' => $MESES[(int)date('n', $ini)], 'periodo_del_anio' => date('y', $ini),
            'periodo_al_dia' => date('d', $fin), 'periodo_al_mes' => $MESES[(int)date('n', $fin)], 'periodo_al_anio' => date('y', $fin),
            'horas_realizadas' => $horasRealizadas ?: '______',
            'horas_total' => '480',
            'avance_pct' => '100',
            'alumno_nombre' => $row['alumno_nombre'],
            'alumno_expediente' => $row['expediente'],
            'alumno_programa' => $row['alumno_programa'],
            'nombre_programa' => $row['nombre_programa'],
            'razon_social' => $row['razon_social'],
            'responsable_datos' => trim(($row['responsable_nombre'] ?: '') . ' / ' . ($row['responsable_puesto'] ?: '')),
            'telefono' => $row['telefono'],
            'telefono_ext' => '____',
            'celular' => $row['alumno_celular'],
            'descripcion_actividades_multiline' => '',
            'retroalimentacion_tutor' => '',
            'observaciones' => '',
        ];

        $bin = DocxGenerator::build($template, $data, $action === 'fpp3' ? ['descripcion_actividades_multiline'] : []);
        streamDocx($bin, strtoupper($action) . '_' . preg_replace('/[^A-Za-z0-9]+/', '_', $row['alumno_nombre']) . '_' . $postulacion_id . '.docx',
                   $pdo, ['tipo' => strtoupper($action), 'postulacion_id' => $postulacion_id, 'proyecto_id' => $row['proyecto_id'], 'usuario_id' => $user['id']]);
    }

    // ================================================================
    // GET: FPP5 - Solicitud de Baja de Prácticas
    // ================================================================
    if ($method === 'GET' && $action === 'fpp5') {
        $postulacion_id = (int)($_GET['postulacion_id'] ?? 0);
        $tipo_baja = ($_GET['tipo'] ?? 'temporal') === 'definitiva' ? 'definitiva' : 'temporal';

        $stmt = $pdo->prepare("
            SELECT p.*, u.nombre_completo as alumno_nombre, u.carrera as alumno_programa, u.expediente,
                   pp.nombre_programa, pp.empresa_id,
                   ur.razon_social, a.departamento
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            JOIN practicas_proyectos pp ON p.proyecto_id = pp.id
            LEFT JOIN unidades_receptoras ur ON pp.unidad_receptora_id = ur.id
            LEFT JOIN areas a ON pp.area_id = a.id
            WHERE p.id = ?
        ");
        $stmt->execute([$postulacion_id]);
        $row = $stmt->fetch();
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Postulación no encontrada.']);
            exit;
        }
        if (!$isAdmin && $row['estudiante_id'] != $user['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $f = fechaEspañol();
        $data = [
            'departamento' => $row['departamento'] ?: 'Economía',
            'dia_baja' => $f['dia'], 'mes_baja' => $f['mes'], 'anio_baja' => $f['anio'],
            'alumno_programa' => $row['alumno_programa'],
            'alumno_nombre' => $row['alumno_nombre'],
            'alumno_expediente' => $row['expediente'],
            'marca_temporal' => $tipo_baja === 'temporal' ? 'X' : '  ',
            'marca_definitiva' => $tipo_baja === 'definitiva' ? 'X' : '  ',
            'nombre_programa' => $row['nombre_programa'],
            'razon_social' => $row['razon_social'],
            'motivos_baja_multiline' => trim($_GET['motivos'] ?? ''),
        ];

        $bin = DocxGenerator::build('FPP5.docx', $data, ['motivos_baja_multiline']);
        streamDocx($bin, 'FPP5_BAJA_' . preg_replace('/[^A-Za-z0-9]+/', '_', $row['alumno_nombre']) . '_' . $postulacion_id . '.docx',
                   $pdo, ['tipo' => 'FPP5', 'postulacion_id' => $postulacion_id, 'proyecto_id' => $row['proyecto_id'], 'usuario_id' => $user['id']]);
    }

    echo json_encode(['success' => false, 'error' => 'Acción no reconocida.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
