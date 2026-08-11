<?php
/**
 * API Moderación - CESA WEB v3.5
 * Acceso: Mesa Directiva / Admin
 * Sincronizado con schema.sql (reportes.respuesta)
 */

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/cors.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
$user = $auth->getUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

try {
    $pdo = getDBConnection();
    $action = $_POST['action'] ?? '';

    // Validar permisos granulares según la acción
    if (in_array($action, ['verificar_negocio', 'destacar_negocio', 'rechazar_negocio'])) {
        if (!$auth->hasPermission('bazar_y_reservaciones')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Permisos de Bazar y Reservaciones insuficientes.']);
            exit;
        }
    } elseif ($action === 'resolver_reporte') {
        if (!$auth->hasPermission('ver_denuncias')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Permisos de Denuncias insuficientes.']);
            exit;
        }
    } elseif (in_array($action, ['verificar_vacante', 'rechazar_vacante'])) {
        if (!$auth->hasPermission('bolsa_trabajo')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Permisos de Bolsa de Trabajo insuficientes.']);
            exit;
        }
    } else {
        if ($user['rol'] !== 'admin' && $user['rol'] !== 'mesa_directiva') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Acceso denegado.']);
            exit;
        }
    }

    switch ($action) {
        // --- MODERACIÓN BAZAR ---
        case 'verificar_negocio':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE emprendimientos SET verificado = 1 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Negocio verificado']);
            break;

        case 'destacar_negocio':
            $id = (int)($_POST['id'] ?? 0);
            $featured = (int)($_POST['featured'] ?? 0);
            $stmt = $pdo->prepare("UPDATE emprendimientos SET featured = ? WHERE id = ?");
            $stmt->execute([$featured, $id]);
            echo json_encode(['success' => true]);
            break;

        case 'rechazar_negocio':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE emprendimientos SET active = 0 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        // --- MODERACIÓN REPORTES ---
        case 'resolver_reporte':
            $id = (int)($_POST['id'] ?? 0);
            $respuesta = $_POST['respuesta'] ?? $_POST['comentario'] ?? '';
            $status = $_POST['estado'] ?? $_POST['status'] ?? 'resuelto';
            $stmt = $pdo->prepare("UPDATE reportes SET estado = ?, respuesta = ?, responded_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $respuesta, $id]);
            echo json_encode(['success' => true]);
            break;

        // --- MODERACIÓN BOLSA DE TRABAJO ---
        case 'verificar_vacante':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE bolsa_vacantes SET verificada = 1 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Vacante verificada']);
            break;

        case 'rechazar_vacante':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE bolsa_vacantes SET activo = 0 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Vacante ocultada']);
            break;

        default:
            throw new Exception('Acción no reconocida');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
