<?php
/**
 * API Noticias - CESA UNISON v3.6
 * Gestiona el feed principal y dispara notificaciones push.
 */
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/VapidLibrary.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

$isLoggedIn = $auth->isLoggedIn();
$user = $isLoggedIn ? $auth->getUser() : null;

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Helper para enviar push
function sendNewsPush($subscription, $title, $body, $icon, $url) {
    $pubKey = defined('VAPID_PUBLIC_KEY') ? VAPID_PUBLIC_KEY : getenv('VAPID_PUBLIC_KEY');
    $privKey = defined('VAPID_PRIVATE_KEY') ? VAPID_PRIVATE_KEY : getenv('VAPID_PRIVATE_KEY');
    $subject = defined('VAPID_SUBJECT') ? VAPID_SUBJECT : getenv('VAPID_SUBJECT');
    
    if (!$pubKey || !$privKey) {
        return ['success' => false, 'error' => 'VAPID keys not configured'];
    }

    $vapid = new VapidLibrary($pubKey, $privKey, $subject);
    return $vapid->sendPush($subscription, [
        'title' => $title,
        'body' => $body,
        'icon' => $icon,
        'url' => $url
    ]);
}

switch ($action) {
    case 'list':
        $carrera_destino = $_GET['carrera_destino'] ?? null;
        if ($carrera_destino) {
            $stmt = $pdo->prepare("
                SELECT n.*, u.nombre_completo as autor_nombre, u.avatar_path as autor_avatar
                FROM noticias n
                LEFT JOIN usuarios u ON n.autor_id = u.id
                WHERE n.activo = TRUE AND (n.carrera_destino IS NULL OR n.carrera_destino = ?)
                ORDER BY n.fecha_publicacion DESC
                LIMIT 50
            ");
            $stmt->execute([$carrera_destino]);
        } else {
            $stmt = $pdo->query("
                SELECT n.*, u.nombre_completo as autor_nombre, u.avatar_path as autor_avatar
                FROM noticias n
                LEFT JOIN usuarios u ON n.autor_id = u.id
                WHERE n.activo = TRUE
                ORDER BY n.fecha_publicacion DESC
                LIMIT 50
            ");
        }
        $noticias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Map imagen_path to imagen_url for frontend compatibility
        foreach ($noticias as &$n) {
            $n['imagen_url'] = $n['imagen_path'] ?? null;
        }
        echo json_encode(['success' => true, 'noticias' => $noticias, 'data' => $noticias]);
        break;

    case 'create':
        if (!$isLoggedIn || (!$auth->hasPermission('rol_comunicacion') && $user['rol'] !== 'sociedad' && $user['rol'] !== 'admin' && $user['rol'] !== 'mesa_directiva')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado para publicar noticias']);
            exit;
        }

        $titulo = trim($_POST['titulo'] ?? '');
        $contenido = trim($_POST['contenido'] ?? '');
        $imagen_path = $_POST['imagen_path'] ?? $_POST['imagen_url'] ?? null;
        $carrera_destino = $_POST['carrera_destino'] ?? null;
        if ($carrera_destino === '') {
            $carrera_destino = null;
        }
        $send_push = filter_var($_POST['send_push'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (empty($titulo) || empty($contenido)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Título y contenido son requeridos']);
            exit;
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO noticias (titulo, contenido, imagen_path, autor_id, carrera_destino) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$titulo, $contenido, $imagen_path, $user['id'], $carrera_destino]);
            $noticiaId = $pdo->lastInsertId();

            $enviadas = 0;
            if ($send_push) {
                // Obtener usuarios con Push habilitado
                $stmtPush = $pdo->query("
                    SELECT pt.*, u.id as uid 
                    FROM push_tokens pt
                    JOIN usuarios u ON pt.usuario_id = u.id
                    WHERE pt.activo = TRUE AND u.push_enabled = TRUE
                ");
                $tokens = $stmtPush->fetchAll(PDO::FETCH_ASSOC);

                $icon = '/assets/icons/icon-192.png';
                $url = '/noticias/' . $noticiaId;

                foreach ($tokens as $token) {
                    $subscription = [
                        'endpoint' => $token['endpoint'],
                        'keys' => [
                            'p256dh' => $token['p256dh'],
                            'auth' => $token['auth']
                        ]
                    ];
                    
                    $result = sendNewsPush($subscription, 'Noticia CESA: ' . $titulo, substr(strip_tags($contenido), 0, 100) . '...', $icon, $url);
                    
                    try {
                        $insertNotif = $pdo->prepare("
                            INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, icono, url, categoria, metodo, status)
                            VALUES (?, ?, ?, ?, ?, 'general', 'push', ?)
                        ");
                        $insertNotif->execute([
                            $token['uid'],
                            $titulo,
                            substr(strip_tags($contenido), 0, 100),
                            $icon,
                            $url,
                            $result['success'] ? 'enviada' : 'fallida'
                        ]);
                    } catch (Exception $innerEx) {
                        // ignore if table doesn't exist
                    }

                    if ($result['success']) $enviadas++;
                }
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'noticia_id' => $noticiaId, 'push_enviadas' => $enviadas]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al crear la noticia: ' . $e->getMessage()]);
        }
        break;

    case 'delete':
        if (!$isLoggedIn || (!$auth->hasPermission('rol_comunicacion') && $user['rol'] !== 'admin' && $user['rol'] !== 'mesa_directiva')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE noticias SET activo = FALSE WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Acción no encontrada']);
}
