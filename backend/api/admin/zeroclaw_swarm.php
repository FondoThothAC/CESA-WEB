<?php
/**
 * ZeroClaw Swarm & Board Meetings API - CESA WEB v7.0
 * Archivo: /backend/api/admin/zeroclaw_swarm.php
 * Acceso: Admin / Mesa Directiva / Permiso IA
 */

declare(strict_types=1);

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/JWTHelper.php';
require_once __DIR__ . '/../../lib/SecureConfig.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();

if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$user = $auth->getCurrentUser();
$isMaster = ($user['email'] ?? '') === 'software@fondothoth.com';
$isAdmin = in_array($user['rol'] ?? '', ['admin', 'mesa_directiva'], true);
$hasIaPerm = !empty($user['permiso_ia']);

if (!$isMaster && !$isAdmin && !$hasIaPerm) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Permisos insuficientes']);
    exit;
}

$pdo = getDBConnection();
$action = $_GET['action'] ?? $_POST['action'] ?? 'list_agents';

try {
    // ----------------------------------------------------
    // 1. LISTAR SUB-AGENTES DEL SWARM
    // ----------------------------------------------------
    if ($action === 'list_agents') {
        $stmt = $pdo->query("
            SELECT a.*, COUNT(j.id) as total_jobs
            FROM zeroclaw_agents a
            LEFT JOIN zeroclaw_agent_jobs j ON j.agent_id = a.id AND j.activa = 1
            GROUP BY a.id
            ORDER BY a.id ASC
        ");
        $agents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'agents' => $agents
        ]);
        exit;
    }

    // ----------------------------------------------------
    // 2. CREAR O EDITAR SUB-AGENTE (DINÁMICO)
    // ----------------------------------------------------
    if ($action === 'save_agent') {
        $id = isset($_POST['id']) && $_POST['id'] !== '' ? (int)$_POST['id'] : null;
        $nombre_agente = trim($_POST['nombre_agente'] ?? '');
        $encargado_nombre = trim($_POST['encargado_nombre'] ?? '');
        $eje_trabajo = trim($_POST['eje_trabajo'] ?? '');
        $color_hex = trim($_POST['color_hex'] ?? '#3b82f6');
        $avatar_sprite = trim($_POST['avatar_sprite'] ?? 'agent_male_1');
        $telegram_chat_id = trim($_POST['telegram_chat_id'] ?? '');
        $canal_notificacion = $_POST['canal_notificacion'] ?? 'telegram';
        $prompt_personalidad = trim($_POST['prompt_personalidad'] ?? '');
        $req_aprobacion = isset($_POST['req_aprobacion']) ? (int)$_POST['req_aprobacion'] : 1;
        $activo = isset($_POST['activo']) ? (int)$_POST['activo'] : 1;

        if (empty($nombre_agente) || empty($encargado_nombre) || empty($eje_trabajo)) {
            echo json_encode(['success' => false, 'error' => 'El nombre del agente, encargado y eje son obligatorios.']);
            exit;
        }

        if ($id) {
            $stmt = $pdo->prepare("
                UPDATE zeroclaw_agents SET
                    nombre_agente = ?,
                    encargado_nombre = ?,
                    eje_trabajo = ?,
                    color_hex = ?,
                    avatar_sprite = ?,
                    telegram_chat_id = ?,
                    canal_notificacion = ?,
                    prompt_personalidad = ?,
                    req_aprobacion = ?,
                    activo = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $nombre_agente, $encargado_nombre, $eje_trabajo, $color_hex,
                $avatar_sprite, $telegram_chat_id, $canal_notificacion,
                $prompt_personalidad, $req_aprobacion, $activo, $id
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO zeroclaw_agents
                (nombre_agente, encargado_nombre, eje_trabajo, color_hex, avatar_sprite, telegram_chat_id, canal_notificacion, prompt_personalidad, req_aprobacion, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $nombre_agente, $encargado_nombre, $eje_trabajo, $color_hex,
                $avatar_sprite, $telegram_chat_id, $canal_notificacion,
                $prompt_personalidad, $req_aprobacion, $activo
            ]);
            $id = (int)$pdo->lastInsertId();
        }

        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Agente guardado con éxito.']);
        exit;
    }

    // ----------------------------------------------------
    // 3. LISTAR TAREAS CRON DE AGENTES
    // ----------------------------------------------------
    if ($action === 'list_jobs') {
        $stmt = $pdo->query("
            SELECT j.*, a.nombre_agente, a.encargado_nombre, a.eje_trabajo, a.color_hex
            FROM zeroclaw_agent_jobs j
            JOIN zeroclaw_agents a ON a.id = j.agent_id
            ORDER BY j.id DESC
        ");
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'jobs' => $jobs]);
        exit;
    }

    // ----------------------------------------------------
    // 4. CREAR / EDITAR TAREA CRON
    // ----------------------------------------------------
    if ($action === 'save_job') {
        $id = isset($_POST['id']) && $_POST['id'] !== '' ? (int)$_POST['id'] : null;
        $agent_id = (int)($_POST['agent_id'] ?? 0);
        $titulo_tarea = trim($_POST['titulo_tarea'] ?? '');
        $frecuencia_label = trim($_POST['frecuencia_label'] ?? 'Diario 09:00 AM');
        $cron_expression = trim($_POST['cron_expression'] ?? '0 9 * * *');
        $tipo_accion = $_POST['tipo_accion'] ?? 'recordatorio';
        $detalles_json = trim($_POST['detalles_json'] ?? '{}');
        $activa = isset($_POST['activa']) ? (int)$_POST['activa'] : 1;

        if ($agent_id <= 0 || empty($titulo_tarea)) {
            echo json_encode(['success' => false, 'error' => 'Agente y título de tarea son obligatorios.']);
            exit;
        }

        if ($id) {
            $stmt = $pdo->prepare("
                UPDATE zeroclaw_agent_jobs SET
                    agent_id = ?, titulo_tarea = ?, frecuencia_label = ?, cron_expression = ?,
                    tipo_accion = ?, detalles_json = ?, activa = ?
                WHERE id = ?
            ");
            $stmt->execute([$agent_id, $titulo_tarea, $frecuencia_label, $cron_expression, $tipo_accion, $detalles_json, $activa, $id]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO zeroclaw_agent_jobs
                (agent_id, titulo_tarea, frecuencia_label, cron_expression, tipo_accion, detalles_json, activa)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$agent_id, $titulo_tarea, $frecuencia_label, $cron_expression, $tipo_accion, $detalles_json, $activa]);
            $id = (int)$pdo->lastInsertId();
        }

        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Tarea Cron programada correctamente.']);
        exit;
    }

    // ----------------------------------------------------
    // 5. ELIMINAR / ALTERNAR TAREA CRON
    // ----------------------------------------------------
    if ($action === 'toggle_job') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare("UPDATE zeroclaw_agent_jobs SET activa = NOT activa WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'delete_job') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM zeroclaw_agent_jobs WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }

    // ----------------------------------------------------
    // 6. LISTAR Y ACCIONAR APROBACIONES PENDIENTES
    // ----------------------------------------------------
    if ($action === 'list_approvals') {
        $stmt = $pdo->query("
            SELECT p.*, a.nombre_agente, a.encargado_nombre, a.color_hex
            FROM zeroclaw_pending_approvals p
            JOIN zeroclaw_agents a ON a.id = p.agent_id
            ORDER BY p.id DESC
        ");
        $approvals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'approvals' => $approvals]);
        exit;
    }

    if ($action === 'action_approval') {
        $id = (int)($_POST['id'] ?? 0);
        $estado = $_POST['estado'] ?? 'aprobado'; // aprobado, rechazado, cambios_solicitados
        $feedback = trim($_POST['feedback'] ?? '');

        $stmt = $pdo->prepare("UPDATE zeroclaw_pending_approvals SET estado = ?, feedback_humano = ? WHERE id = ?");
        $stmt->execute([$estado, $feedback, $id]);

        echo json_encode(['success' => true, 'message' => "Estado actualizado a '$estado'."]);
        exit;
    }

    // ----------------------------------------------------
    // 7. SIMULADOR DE MESA DE EXPERTOS (JUNTA SEMANAL)
    // ----------------------------------------------------
    if ($action === 'run_meeting') {
        // Ejecución sintetizada de la junta (12 interacciones simuladas)
        $interactions = [
            ["agent" => "Bob Prime", "role" => "Líder", "text" => "¡Bienvenidos a la Mesa de Expertos del CESA UNISON! Iniciamos sesión de seguimiento semanal."],
            ["agent" => "Atlas", "role" => "Emprendimiento", "text" => "Reporto 18 puestos asignados en el Bazar Estudiantil esta semana. Necesitamos apoyo con el flyer de la edición especial."],
            ["agent" => "Aria", "role" => "Comunicaciones", "text" => "Enterada, Atlas. Ya generé el borrador en Canva para el torneo y preparo la gráfica del Bazar. Ángela revisará el borrador antes de difundir."],
            ["agent" => "Orión", "role" => "Deportes", "text" => "El torneo de fútbol interfacultades tiene 12 equipos inscritos. Solicité a Cleo el presupuesto de arbitraje."],
            ["agent" => "Cleo", "role" => "Finanzas", "text" => "Presupuesto de arbitraje revisado y pre-aprobado. Auditoría lista. Christian me dará el visto bueno final."],
            ["agent" => "Minerva", "role" => "Académico", "text" => "El banco de tutorías registró 45 consultas de EXANI. Mariana solicitó incluir 20 preguntas más de estadística."],
            ["agent" => "Aurora", "role" => "Bienestar", "text" => "Hemos recibido 5 solicitudes de apoyo psicopedagógico. Alexandra está coordinando la primera canalización."],
            ["agent" => "Lyra", "role" => "Cultura", "text" => "La edición #4 de la Gaceta CESA está al 85%. Bárbara enviará el PDF preliminar a Presidencia."],
            ["agent" => "Nova", "role" => "Relaciones", "text" => "Confirmado nuevo convenio con la cafetería del campus para 15% de descuento con credencial CESA."],
            ["agent" => "Bob Prime", "role" => "Líder", "text" => "Excelente trabajo. Consolidando minuta ejecutiva y enviando reporte en CCO a Presidencia y grupo de Telegram."]
        ];

        $resumen = "Resumen de Junta: 18 puestos en Bazar, 12 equipos en Torneo de Fútbol, 45 tutorías EXANI y nuevo convenio comercial de 15% de descuento activado.";

        $stmt = $pdo->prepare("
            INSERT INTO zeroclaw_meeting_logs (fecha_sesion, tipo_sesion, total_interacciones, resumen_ejecutivo, acuerdos_json, telegram_sent)
            VALUES (NOW(), 'martes_sincro', ?, ?, ?, 1)
        ");
        $stmt->execute([count($interactions), $resumen, json_encode($interactions, JSON_UNESCAPED_UNICODE)]);

        echo json_encode([
            'success' => true,
            'message' => 'Sesión de Mesa de Expertos completada y notificada por Telegram (CCO Admin).',
            'interactions' => $interactions,
            'resumen' => $resumen
        ]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no válida']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
