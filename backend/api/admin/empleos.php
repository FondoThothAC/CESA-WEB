<?php
/**
 * Bolsa de Trabajo - Módulo Administrativo v3.7 (Industrializado)
 * Tablas: bolsa_vacantes + postulaciones
 * Archivo: /backend/api/admin/empleos.php
 */

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
if (!$auth->hasRole('admin') && !$auth->hasRole('mesa_directiva') && !$auth->hasRole('coordinador_impulso')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$pdo = getDBConnection();
$action = $_GET['action'] ?? 'listar';

// ================================================================
// Verificar / Rechazar vacante
// ================================================================
if ($action === 'verificar_vacante' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id    = (int)($input['id'] ?? 0);
    $val   = (int)($input['verificada'] ?? 1);

    $stmt = $pdo->prepare("UPDATE bolsa_vacantes SET verificada = ? WHERE id = ?");
    $stmt->execute([$val, $id]);

    echo json_encode(['success' => true]);
    exit;
}

// ================================================================
// Listar todas las vacantes (con conteo de postulantes)
// ================================================================
if ($action === 'listar') {
    $stmt = $pdo->query("
        SELECT v.*,
               (SELECT COUNT(*) FROM postulaciones WHERE vacante_id = v.id) as postulaciones_count
        FROM bolsa_vacantes v
        ORDER BY v.verificada ASC, v.created_at DESC
    ");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ================================================================
// Listar postulantes de una vacante específica
// ================================================================
if ($action === 'listar_postulaciones') {
    $vacante_id = (int)($_GET['vacante_id'] ?? 0);

    if ($vacante_id) {
        $stmt = $pdo->prepare("
            SELECT p.*, u.nombre_completo as estudiante, u.matricula, u.carrera, u.email
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            WHERE p.vacante_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$vacante_id]);
    } else {
        $stmt = $pdo->query("
            SELECT p.*, u.nombre_completo as estudiante, u.matricula, u.carrera,
                   v.titulo as vacante_titulo, v.empresa_nombre
            FROM postulaciones p
            JOIN usuarios u ON p.estudiante_id = u.id
            JOIN bolsa_vacantes v ON p.vacante_id = v.id
            ORDER BY p.created_at DESC
            LIMIT 100
        ");
    }

    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ================================================================
// Actualizar estado de postulación
// ================================================================
if ($action === 'actualizar_postulacion' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $id     = (int)($input['id'] ?? 0);
    $estado = $input['estado'] ?? 'visto';

    $valid = ['pendiente', 'visto', 'aceptado', 'rechazado'];
    if (!in_array($estado, $valid)) {
        echo json_encode(['success' => false, 'error' => 'Estado inválido']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE postulaciones SET estado = ? WHERE id = ?");
    $stmt->execute([$estado, $id]);

    // Notification Logic
    $post_stmt = $pdo->prepare("
        SELECT p.estudiante_id, v.titulo, v.empresa_nombre 
        FROM postulaciones p 
        JOIN bolsa_vacantes v ON p.vacante_id = v.id 
        WHERE p.id = ?
    ");
    $post_stmt->execute([$id]);
    $post_data = $post_stmt->fetch(PDO::FETCH_ASSOC);

    if ($post_data) {
        $msg = "";
        $tipo = "info";
        if ($estado === 'aceptado') {
            $msg = "¡Tu perfil ha sido aceptado por {$post_data['empresa_nombre']}! Se pondrán en contacto contigo pronto.";
            $tipo = "success";
        } elseif ($estado === 'entrevista') {
            $msg = "{$post_data['empresa_nombre']} quiere agendar una entrevista contigo.";
            $tipo = "success";
        } elseif ($estado === 'rechazado') {
            $msg = "La empresa {$post_data['empresa_nombre']} ha descartado tu postulación para la vacante de {$post_data['titulo']}. ¡Sigue intentando!";
            $tipo = "alert";
        } elseif ($estado === 'visto') {
            $msg = "Tu postulación para la vacante de {$post_data['titulo']} ha sido vista.";
            $tipo = "info";
        }

        if ($msg) {
            $notif_stmt = $pdo->prepare("INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, categoria, status) VALUES (?, ?, ?, 'bolsa_trabajo', 'enviada')");
            $notif_stmt->execute([$post_data['estudiante_id'], "Actualización de Empleo", $msg]);
        }
    }

    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Acción no reconocida.']);
