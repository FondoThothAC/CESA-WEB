<?php
/**
 * API: Reportes / Incidencias - Sistema de Karma (v3.8)
 * CESA WEB Industrialized
 */

require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/NotificationManager.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$user = Auth::getAuthenticatedUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

try {
    $pdo = getDBConnection();
    $notificationManager = new NotificationManager($pdo);
    $usuario_id = $user['id'];

    // 1. GET: Listar reportes con Score de Urgencia
    if ($method === 'GET') {
        $modo = $_GET['modo'] ?? 'mis_reportes'; // 'comunidad' o 'mis_reportes'
        $action = $_GET['action'] ?? '';
        
        if ($action === 'moderacion' || $modo === 'admin') {
            // Seguridad Granular: Requiere permiso ver_denuncias
            $authObj = new Auth();
            if (!$authObj->hasPermission('ver_denuncias')) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permisos de Denuncias insuficientes.']);
                exit;
            }
            // Retorna todos los reportes
            $sql = "SELECT r.*,
                           (SELECT valor FROM votos_reportes WHERE reporte_id = r.id AND usuario_id = ?) as user_vote
                    FROM reportes r 
                    ORDER BY r.created_at DESC LIMIT 100";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$usuario_id]);
            
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            exit;
        }
        
        $sql = "SELECT r.*,
                       (SELECT valor FROM votos_reportes WHERE reporte_id = r.id AND usuario_id = ?) as user_vote
                FROM reportes r";
        
        if ($modo === 'comunidad') {
            $sql .= " WHERE r.anonimo = 0 OR r.usuario_id = ?"; 
        } else {
            $sql .= " WHERE r.usuario_id = ?";
        }
        
        $sql .= " ORDER BY r.score DESC, r.created_at DESC LIMIT 100";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario_id, $usuario_id]);
        
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // 2. POST: Acciones (Reportar / Votar / Atender)
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        // ACCIÓN: VOTAR (Reporte Urgente)
        if ($action === 'votar') {
            $id = (int)$data['id'];
            $nuevoValor = (int)$data['valor'];

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT valor FROM votos_reportes WHERE reporte_id = ? AND usuario_id = ?");
            $stmt->execute([$id, $usuario_id]);
            $previo = $stmt->fetch();

            if ($previo) {
                if ((int)$previo['valor'] === $nuevoValor) {
                    $stmt = $pdo->prepare("DELETE FROM votos_reportes WHERE reporte_id = ? AND usuario_id = ?");
                    $stmt->execute([$id, $usuario_id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE votos_reportes SET valor = ? WHERE reporte_id = ? AND usuario_id = ?");
                    $stmt->execute([$nuevoValor, $id, $usuario_id]);
                }
            } else {
                $stmt = $pdo->prepare("INSERT INTO votos_reportes (reporte_id, usuario_id, valor) VALUES (?, ?, ?)");
                $stmt->execute([$id, $usuario_id, $nuevoValor]);
            }

            // Sync scores
            $stmt = $pdo->prepare("
                UPDATE reportes p
                SET 
                    p.upvotes_count = (SELECT COUNT(*) FROM votos_reportes WHERE reporte_id = p.id AND valor = 1),
                    p.downvotes_count = (SELECT COUNT(*) FROM votos_reportes WHERE reporte_id = p.id AND valor = -1),
                    p.score = (SELECT COALESCE(SUM(valor), 0) FROM votos_reportes WHERE reporte_id = p.id)
                WHERE p.id = ?
            ");
            $stmt->execute([$id]);

            $pdo->commit();

            // Trigger de Notificación: Si un reporte alcanza un umbral de urgencia (5 votos)
            $checkScore = $pdo->prepare("SELECT score, asunto FROM reportes WHERE id = ?");
            $checkScore->execute([$id]);
            $reportData = $checkScore->fetch();
            
            if ($reportData && (int)$reportData['score'] >= 5) {
                // Obtener IDs de Mesa Directiva para notificar
                $admins = $pdo->query("SELECT id FROM usuarios WHERE rol IN ('admin', 'mesa_directiva')")->fetchAll(PDO::FETCH_COLUMN);
                $notificationManager->createBroadcastNotification(
                    $admins, 
                    'urgente', 
                    '🚨 REPORTE URGENTE', 
                    "El reporte '{$reportData['asunto']}' ha alcanzado un score crítico de {$reportData['score']}. Requiere atención inmediata.",
                    "/admin/moderacion"
                );
            }

            echo json_encode(['success' => true]);
            exit;
        }

        // ACCIÓN: REPORTAR / CREAR
        if ($action === 'crear' || isset($data['contenido']) || isset($data['descripcion'])) {
            $asunto = $data['asunto'] ?? ('Reporte de ' . ucfirst($data['tipo'] ?? 'incidencia'));
            $descripcion = trim($data['descripcion'] ?? $data['contenido'] ?? '');
            $anonimo = !empty($data['anonimo']) ? 1 : 0;
            $coordinacion = $data['coordinacion'] ?? 'mesa_directiva';
            $categoria = $data['tipo'] ?? $data['categoria'] ?? 'otro';

            if (empty($descripcion)) throw new Exception("La descripción no puede estar vacía.");

            $stmt = $pdo->prepare("
                INSERT INTO reportes 
                (usuario_id, tipo, categoria, coordinacion_asignada, asunto, descripcion, anonimo) 
                VALUES (?, 'queja', ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $usuario_id,
                $categoria,
                $coordinacion,
                $asunto,
                $descripcion,
                $anonimo
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            exit;
        }
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
