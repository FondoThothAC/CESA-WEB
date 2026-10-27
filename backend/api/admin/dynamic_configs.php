<?php
/**
 * Dynamic Configs - Endpoints para gestionar Proveedores de IA y Redes Sociales
 * Accesible para admin con permiso 'permiso_ia' o 'roles_social' o master software@fondothoth.com
 */
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/SecureConfig.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDBConnection();
$auth = new Auth();

if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$user = $auth->getUser();

// Validar Permisos
$isMaster = Auth::isMasterEmail($user['email'] ?? null);
$stmt = $pdo->prepare("SELECT permiso_ia, roles_social FROM admin_permisos WHERE usuario_id = ?");
$stmt->execute([$user['id']]);
$permisos = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['permiso_ia' => 0, 'roles_social' => 0];

$canEditIA = $isMaster || $permisos['permiso_ia'];
$canEditSocial = $isMaster || $permisos['roles_social'];

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$type = $_GET['type'] ?? ($_POST['type'] ?? ''); // 'ia' o 'social'

if (!$action || !$type) {
    echo json_encode(['success' => false, 'error' => 'Acción y Tipo son requeridos']);
    exit;
}

if ($type === 'ia' && !$canEditIA) {
    echo json_encode(['success' => false, 'error' => 'No tienes permisos para configurar la IA']);
    exit;
}

if ($type === 'social' && !$canEditSocial) {
    echo json_encode(['success' => false, 'error' => 'No tienes permisos para configurar las Redes Sociales']);
    exit;
}

try {
    if ($action === 'list') {
        if ($type === 'ia') {
            $stmt = $pdo->query("SELECT id, provider, endpoint_url AS api_url, '' AS api_key, 'Bearer {key}' AS auth_header, is_active, CONCAT('{\"default_model\":\"', IFNULL(model_name, 'llama3'), '\"}') AS metadata FROM api_configs ORDER BY priority ASC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $stmt = $pdo->query("SELECT id, plataforma, url_perfil, client_id, client_secret, tokens_json, is_active FROM redes_sociales ORDER BY is_active DESC, plataforma ASC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

    if ($action === 'save') {
        if ($type === 'ia') {
            $id = $_POST['id'] ?? null;
            $provider = $_POST['provider'] ?? '';
            $api_url = $_POST['api_url'] ?? '';
            $api_key = $_POST['api_key'] ?? '';
            $auth_header = $_POST['auth_header'] ?? '';
            $is_active = (int)($_POST['is_active'] ?? 0);
            $metadata = $_POST['metadata'] ?? '{}';

            $decoded = json_decode($metadata, true);
            $model_name = $decoded['default_model'] ?? 'llama3';

            if ($id) {
                if (!empty($api_key)) {
                    $encrypted_key = SecureConfig::encrypt($api_key);
                    $stmt = $pdo->prepare("UPDATE api_configs SET provider=?, endpoint_url=?, api_key_encrypted=?, is_active=?, model_name=? WHERE id=?");
                    $stmt->execute([$provider, $api_url, $encrypted_key, $is_active, $model_name, $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE api_configs SET provider=?, endpoint_url=?, is_active=?, model_name=? WHERE id=?");
                    $stmt->execute([$provider, $api_url, $is_active, $model_name, $id]);
                }
            } else {
                $encrypted_key = SecureConfig::encrypt($api_key);
                $stmt = $pdo->prepare("INSERT INTO api_configs (provider, endpoint_url, api_key_encrypted, is_active, model_name) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$provider, $api_url, $encrypted_key, $is_active, $model_name]);
            }
        } else {
            // Social
            $id = $_POST['id'] ?? null;
            $plataforma = $_POST['plataforma'] ?? '';
            $url_perfil = $_POST['url_perfil'] ?? '';
            $client_id = $_POST['client_id'] ?? '';
            $client_secret = $_POST['client_secret'] ?? '';
            $tokens_json = $_POST['tokens_json'] ?? '';
            $is_active = (int)($_POST['is_active'] ?? 0);

            if ($id) {
                $stmt = $pdo->prepare("UPDATE redes_sociales SET plataforma=?, url_perfil=?, client_id=?, client_secret=?, tokens_json=?, is_active=? WHERE id=?");
                $stmt->execute([$plataforma, $url_perfil, $client_id, $client_secret, $tokens_json, $is_active, $id]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO redes_sociales (plataforma, url_perfil, client_id, client_secret, tokens_json, is_active) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$plataforma, $url_perfil, $client_id, $client_secret, $tokens_json, $is_active]);
            }
        }
        echo json_encode(['success' => true, 'message' => 'Guardado exitosamente']);
        exit;
    }

    if ($action === 'delete') {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $table = ($type === 'ia') ? 'api_configs' : 'redes_sociales';
            $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Eliminado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción no válida']);

} catch (Exception $e) {
    error_log("Error en dynamic_configs: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Ocurrió un error en el servidor.']);
}
