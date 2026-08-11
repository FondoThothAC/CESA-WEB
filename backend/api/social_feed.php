<?php
/**
 * API Social Feed - CESA UNISON v7.5
 * Entrega publicaciones del feed de Instagram/Facebook/X almacenadas en caché y permite sincronización.
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/SocialMediaService.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDBConnection();
$auth = new Auth();
$socialService = new SocialMediaService($pdo);

$action = $_GET['action'] ?? $_POST['action'] ?? 'list';
$plataforma = $_GET['plataforma'] ?? $_POST['plataforma'] ?? 'instagram';

switch ($action) {
    case 'list':
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $posts = $socialService->getCachedPosts($plataforma, $limit);
        echo json_encode(['success' => true, 'data' => $posts], JSON_UNESCAPED_UNICODE);
        break;

    case 'sync':
        if (!$auth->isLoggedIn() || $auth->getUser()['rol'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Permisos insuficientes']);
            break;
        }

        $activeToken = $socialService->getActiveToken('instagram');
        if (!$activeToken) {
            echo json_encode(['success' => false, 'error' => 'No hay un token activo configurado para Instagram']);
            break;
        }

        $result = $socialService->syncInstagramFeed($activeToken['account_id'], $activeToken['access_token']);
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Acción no válida']);
        break;
}
