<?php
/**
 * API Skills / Certificaciones Digitales
 * Sistema CBIT-01 de Micro-credenciales
 */
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

$isLoggedIn = $auth->isLoggedIn();
$user = $isLoggedIn ? $auth->getUser() : null;

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ============================================
// HELPERS
// ============================================
function generateUUID(): string {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function generateHash(string $uuid, int $userId, string $date): string {
    // Definimos una clave secreta para la plataforma
    $secretKey = getenv('APP_SECRET_KEY') ?: 'CESA_V3_SECRET_KEY';
    return hash('sha256', $uuid . $userId . $date . $secretKey);
}

// ============================================
// SWITCH ACTIONS
// ============================================
switch ($action) {
    
    // === LISTAR (DASHBOARD) ===
    case 'listar':
    case 'listar_habilidades':
        // Obtener catálogo
        $stmtCat = $pdo->query("
            SELECT h.*, 
                   (SELECT COUNT(*) FROM preguntas WHERE habilidad_id = h.id AND activo = 1) as total_preguntas,
                   (SELECT COUNT(*) FROM certificados_digitales WHERE habilidad_id = h.id) as certificados_emitidos
            FROM habilidades h
            WHERE h.activo = 1
            ORDER BY h.categoria, h.nombre
        ");
        $catalog = $stmtCat->fetchAll(PDO::FETCH_ASSOC);
        
        // Si está logueado, obtener sus certificados
        $myCerts = [];
        if ($isLoggedIn) {
            $stmtCerts = $pdo->prepare("SELECT * FROM certificados_digitales WHERE usuario_id = ?");
            $stmtCerts->execute([$user['id']]);
            $myCerts = $stmtCerts->fetchAll(PDO::FETCH_ASSOC);
        }
        
        echo json_encode([
            'success' => true,
            'catalog' => $catalog,
            'my_certs' => $myCerts,
            'data' => $catalog // Backward compatibility
        ]);
        break;

    // === INICIAR PRÁCTICA (obtener preguntas con respuestas y explicaciones) ===
    case 'iniciar_practica':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión para practicar']);
            exit;
        }
        
        $habilidadId = (int)($_GET['habilidad_id'] ?? $_POST['habilidad_id'] ?? 0);
        
        // Verificar que existe y tiene preguntas
        $habilidad = $pdo->prepare("SELECT * FROM habilidades WHERE id = ? AND activo = 1");
        $habilidad->execute([$habilidadId]);
        $habilidadData = $habilidad->fetch(PDO::FETCH_ASSOC);
        
        if (!$habilidadData) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Habilidad no encontrada']);
            exit;
        }
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : (isset($_POST['limit']) ? (int)$_POST['limit'] : 30);
        if ($limit < 5) $limit = 5;
        if ($limit > 120) $limit = 120;

        // Obtener preguntas aleatorias con respuesta_correcta y explicacion
        $preguntasStmt = $pdo->prepare("
            SELECT id, pregunta, tipo, opciones, respuesta_correcta, explicacion 
            FROM preguntas 
            WHERE habilidad_id = ? AND activo = 1 
            ORDER BY RAND() 
            LIMIT $limit
        ");
        $preguntasStmt->execute([$habilidadId]);
        $preguntas = $preguntasStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($preguntas)) {
             http_response_code(400);
             echo json_encode(['success' => false, 'error' => 'La habilidad aún no tiene preguntas de práctica configuradas.']);
             exit;
        }

        // Decodificar opciones JSON
        foreach ($preguntas as &$p) {
            $p['opciones'] = json_decode($p['opciones'], true);
        }
        
        echo json_encode([
            'success' => true,
            'habilidad' => [
                'id' => $habilidadData['id'],
                'nombre' => $habilidadData['nombre'],
                'descripcion' => $habilidadData['descripcion'],
                'duracion_minutos' => $habilidadData['duracion_minutos'],
                'icono' => $habilidadData['icono'],
                'color' => $habilidadData['color_hex']
            ],
            'preguntas' => $preguntas
        ]);
        break;
    
    // === INICIAR EVALUACIÓN (obtener preguntas) ===
    case 'iniciar_evaluacion':
    case 'obtener_evaluacion':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión para evaluar']);
            exit;
        }
        
        $habilidadId = (int)($_GET['habilidad_id'] ?? $_POST['habilidad_id'] ?? 0);
        
        // Verificar que existe y tiene preguntas
        $habilidad = $pdo->prepare("SELECT * FROM habilidades WHERE id = ? AND activo = 1");
        $habilidad->execute([$habilidadId]);
        $habilidadData = $habilidad->fetch(PDO::FETCH_ASSOC);
        
        if (!$habilidadData) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Habilidad no encontrada']);
            exit;
        }
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : (isset($_POST['limit']) ? (int)$_POST['limit'] : 30);
        if ($limit < 5) $limit = 5;
        if ($limit > 120) $limit = 120;

        // Obtener preguntas aleatorias (o menos si no hay suficientes)
        $preguntasStmt = $pdo->prepare("
            SELECT id, pregunta, tipo, opciones 
            FROM preguntas 
            WHERE habilidad_id = ? AND activo = 1 
            ORDER BY RAND() 
            LIMIT $limit
        ");
        $preguntasStmt->execute([$habilidadId]);
        $preguntas = $preguntasStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($preguntas)) {
             http_response_code(400);
             echo json_encode(['success' => false, 'error' => 'La habilidad aún no tiene preguntas configuradas.']);
             exit;
        }

        // Decodificar opciones JSON
        foreach ($preguntas as &$p) {
            $p['opciones'] = json_decode($p['opciones'], true);
        }
        
        // Crear registro de evaluación
        $preguntasIds = array_column($preguntas, 'id');
        $insertEval = $pdo->prepare("
            INSERT INTO evaluaciones (usuario_id, habilidad_id, preguntas_json, estado, tiempo_inicio)
            VALUES (?, ?, ?, 'en_proceso', NOW())
        ");
        $insertEval->execute([$user['id'], $habilidadId, json_encode($preguntasIds)]);
        $evaluacionId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'evaluacion_id' => $evaluacionId,
            'habilidad' => [
                'id' => $habilidadData['id'],
                'nombre' => $habilidadData['nombre'],
                'descripcion' => $habilidadData['descripcion'],
                'duracion_minutos' => $habilidadData['duracion_minutos'],
                'icono' => $habilidadData['icono'],
                'color' => $habilidadData['color_hex']
            ],
            'preguntas' => $preguntas,
            'tiempo_limite' => $habilidadData['duracion_minutos'] * 60 // en segundos
        ]);
        break;
    
    // === FINALIZAR EVALUACIÓN (submeter respuestas) ===
    case 'finalizar_evaluacion':
    case 'submintir_evaluacion':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $evaluacionId = (int)($_POST['evaluacion_id'] ?? 0);
        $respuestas = json_decode($_POST['respuestas'] ?? '{}', true);
        
        // Verificar que la evaluación existe y pertenece al usuario
        $evalStmt = $pdo->prepare("SELECT * FROM evaluaciones WHERE id = ? AND usuario_id = ? AND estado = 'en_proceso'");
        $evalStmt->execute([$evaluacionId, $user['id']]);
        $evaluacion = $evalStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$evaluacion) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Evaluación no válida o ya completada']);
            exit;
        }
        
        // Verificar tiempo (si excedió, marcar como caduco)
        $tiempoInicio = strtotime($evaluacion['tiempo_inicio']);
        $tiempoAhora = time();
        $habilidadStmt = $pdo->prepare("SELECT duracion_minutos FROM habilidades WHERE id = ?");
        $habilidadStmt->execute([$evaluacion['habilidad_id']]);
        $habilidad = $habilidadStmt->fetch(PDO::FETCH_ASSOC);
        $tiempoLimite = $tiempoInicio + ($habilidad['duracion_minutos'] * 60);
        
        if ($tiempoAhora > $tiempoLimite) {
            $pdo->prepare("UPDATE evaluaciones SET estado = 'caduco' WHERE id = ?")->execute([$evaluacionId]);
            echo json_encode(['success' => false, 'error' => 'Tiempo expirado', 'expired' => true]);
            exit;
        }
        
        // Calcular puntaje
        $preguntasIds = json_decode($evaluacion['preguntas_json'], true);
        $preguntasStmt = $pdo->prepare("
            SELECT id, respuesta_correcta 
            FROM preguntas 
            WHERE id IN (" . implode(',', array_fill(0, count($preguntasIds), '?')) . ")
        ");
        $preguntasStmt->execute($preguntasIds);
        $correctas = $preguntasStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $aciertos = 0;
        $total = count($correctas);
        
        foreach ($correctas as $pregunta) {
            if (isset($respuestas[$pregunta['id']]) && 
                strtolower(trim((string)$respuestas[$pregunta['id']])) === strtolower(trim((string)$pregunta['respuesta_correcta']))) {
                $aciertos++;
            }
        }
        
        $porcentaje = round(($aciertos / $total) * 100, 2);
        $tiempoUsado = $tiempoAhora - $tiempoInicio;
        
        // Buscar nivel_minimo_aprobatorio
        $habilidadFull = $pdo->prepare("SELECT * FROM habilidades WHERE id = ?");
        $habilidadFull->execute([$evaluacion['habilidad_id']]);
        $habData = $habilidadFull->fetch(PDO::FETCH_ASSOC);
        $aprobado = $porcentaje >= $habData['nivel_minimo_aprobatorio'];
        
        // Actualizar evaluación
        $updateEval = $pdo->prepare("
            UPDATE evaluaciones SET 
                respuestas_json = ?,
                puntaje_obtenido = ?,
                porcentaje = ?,
                estado = ?,
                tiempo_fin = NOW(),
                tiempo_usado_segundos = ?
            WHERE id = ?
        ");
        $updateEval->execute([
            json_encode($respuestas),
            $aciertos,
            $porcentaje,
            'completada',
            $tiempoUsado,
            $evaluacionId
        ]);
        
        // Si aprobó, generar certificado
        $resultado = [
            'success' => true,
            'aprobado' => $aprobado,
            'aciertos' => $aciertos,
            'total' => $total,
            'porcentaje' => $porcentaje,
            'tiempo_usado' => $tiempoUsado,
            'nivel_minimo' => $habData['nivel_minimo_aprobatorio']
        ];
        
        if ($aprobado) {
            // Determinar nivel del certificado
            $nivel = 'CERTIFIED';
            if ($porcentaje >= 90) $nivel = 'EXPERT';
            elseif ($porcentaje >= 80) $nivel = 'ADVANCED';
            
            // Generar UUID único
            $uuid = generateUUID();
            $fechaEmision = date('Y-m-d');
            $hash = generateHash($uuid, $user['id'], $fechaEmision);
            
            // Calcular expiración (1 año)
            $fechaExpiracion = date('Y-m-d', strtotime('+1 year'));
            
            // QR URL - Modificado para app react
            $qrData = "https://cesaunison.fondothoth.com/verificar?uuid=" . $uuid;
            
            // Insertar certificado
            $insertCert = $pdo->prepare("
                INSERT INTO certificados_digitales (
                    evaluacion_id, usuario_id, habilidad_id, uuid, hash_verificacion,
                    nombre_completo, matricula, habilidad_nombre, habilidad_categoria,
                    puntaje, porcentaje, nivel, fecha_emision, fecha_expiracion, qr_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $nombreCompl = $user['nombre_completo'] ?? $user['nombre'] ?? '';
            $insertCert->execute([
                $evaluacionId,
                $user['id'],
                $evaluacion['habilidad_id'],
                $uuid,
                $hash,
                $nombreCompl,
                $user['matricula'] ?? '',
                $habData['nombre'],
                $habData['categoria'],
                $aciertos,
                $porcentaje,
                $nivel,
                $fechaEmision,
                $fechaExpiracion,
                $qrData
            ]);
            
            $resultado['certificado'] = [
                'id' => $pdo->lastInsertId(),
                'uuid' => $uuid,
                'nivel' => $nivel,
                'qr_url' => $qrData
            ];
        }
        
        echo json_encode($resultado);
        break;
    
    // === VERIFICAR CERTIFICADO PÚBLICO (por UUID) ===
    case 'verificar_certificado':
        $uuid = filter_var($_GET['uuid'] ?? '', FILTER_SANITIZE_STRING);
        
        if (empty($uuid)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'UUID requerido']);
            exit;
        }
        
        $cert = $pdo->prepare("SELECT * FROM certificados_digitales WHERE uuid = ?");
        $cert->execute([$uuid]);
        $certificado = $cert->fetch(PDO::FETCH_ASSOC);
        
        if (!$certificado) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Certificado no encontrado']);
            exit;
        }
        
        // Verificar hash
        $hashEsperado = generateHash($certificado['uuid'], $certificado['usuario_id'], $certificado['fecha_emision']);
        $valido = hash_equals($hashEsperado, $certificado['hash_verificacion']);
        
        // Verificar expiración
        $expirado = clone $certificado['fecha_expiracion'] && 
                    strtotime($certificado['fecha_expiracion']) < time();
        
        echo json_encode([
            'success' => true,
            'valido' => $valido && !$expirado,
            'certificado' => [
                'nombre' => $certificado['nombre_completo'],
                'matricula' => $certificado['matricula'],
                'habilidad' => $certificado['habilidad_nombre'],
                'nivel' => $certificado['nivel'],
                'porcentaje' => $certificado['porcentaje'],
                'fecha_emision' => $certificado['fecha_emision'],
                'fecha_expiracion' => $certificado['fecha_expiracion'],
                'expirado' => $expirado
            ]
        ]);
        break;
    
    // === MIS CERTIFICADOS (usuario logueado) ===
    case 'mis_certificados':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT c.*, h.icono, h.color_hex
            FROM certificados_digitales c
            JOIN habilidades h ON c.habilidad_id = h.id
            WHERE c.usuario_id = ?
            ORDER BY c.fecha_emision DESC
        ");
        $stmt->execute([$user['id']]);
        $certificados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $certificados
        ]);
        break;
    
    // === ADMIN: LISTAR TODAS LAS EVALUACIONES ===
    case 'admin_listar':
        if (!$isLoggedIn || !in_array($user['rol'], ['admin', 'mesa_directiva', 'sociedad'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $filtro = $_GET['filtro'] ?? 'todas';
        $where = "";
        
        if ($filtro === 'pendientes') {
            $where = "WHERE e.estado = 'en_proceso'";
        } elseif ($filtro === 'completadas') {
            $where = "WHERE e.estado = 'completada'";
        } elseif ($filtro === 'aprobadas') {
            $where = "WHERE e.estado = 'completada' AND e.porcentaje >= h.nivel_minimo_aprobatorio";
        }
        
        $stmt = $pdo->query("
            SELECT e.*, IFNULL(u.nombre, 'No Name') as nombre_completo, IFNULL(u.email, 'No Email') as matricula,
                   h.nombre as habilidad, h.categoria, h.icono, h.color_hex
            FROM evaluaciones e
            JOIN usuarios u ON e.usuario_id = u.id
            JOIN habilidades h ON e.habilidad_id = h.id
            $where
            ORDER BY e.created_at DESC
            LIMIT 100
        ");
        
        echo json_encode([
            'success' => true,
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
        break;
    
    // === ADMIN: ESTADÍSTICAS ===
    case 'admin_stats':
        if (!$isLoggedIn || !in_array($user['rol'], ['admin', 'mesa_directiva', 'sociedad'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $stats = [
            'total_evaluaciones' => $pdo->query("SELECT COUNT(*) FROM evaluaciones")->fetchColumn(),
            'evaluaciones_mes' => $pdo->query("SELECT COUNT(*) FROM evaluaciones WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn(),
            'total_certificados' => $pdo->query("SELECT COUNT(*) FROM certificados_digitales")->fetchColumn(),
            'certificados_mes' => $pdo->query("SELECT COUNT(*) FROM certificados_digitales WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn(),
            'tasa_aprobacion' => $pdo->query("
                SELECT ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM evaluaciones WHERE estado = 'completada'), 0), 1)
                FROM evaluaciones e
                JOIN habilidades h ON e.habilidad_id = h.id
                WHERE e.estado = 'completada' AND e.porcentaje >= h.nivel_minimo_aprobatorio
            ")->fetchColumn() ?? 0
        ];
        
        // Top habilidades más certificadas
        $topHabilidades = $pdo->query("
            SELECT h.nombre, COUNT(c.id) as total
            FROM habilidades h
            LEFT JOIN certificados_digitales c ON h.id = c.habilidad_id
            GROUP BY h.id
            ORDER BY total DESC
            LIMIT 5
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'stats' => $stats,
            'top_habilidades' => $topHabilidades
        ]);
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Acción no encontrada']);
}
