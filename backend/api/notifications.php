<?php
/**
 * API Notificaciones Push - CESA UNISON v3.5
 * Sistema completo de Web Push Notifications
 */
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/VapidLibrary.php'; // Ver más abajo

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

$isLoggedIn = $auth->isLoggedIn();
$user = $isLoggedIn ? $auth->getUser() : null;

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ============================================
// HELPERS
// ============================================
function sendWebPush($subscription, $title, $body, $icon, $url) {
    // Si las claves VAPID no están definidas en database.php o env, mockearemos
    $pubKey = defined('VAPID_PUBLIC_KEY') ? VAPID_PUBLIC_KEY : getenv('VAPID_PUBLIC_KEY');
    $privKey = defined('VAPID_PRIVATE_KEY') ? VAPID_PRIVATE_KEY : getenv('VAPID_PRIVATE_KEY');
    $subject = defined('VAPID_SUBJECT') ? VAPID_SUBJECT : getenv('VAPID_SUBJECT');
    
    if (!$pubKey || !$privKey) {
        return ['success' => false, 'error' => 'VAPID keys not configured'];
    }

    $vapid = new VapidLibrary(
        $pubKey,
        $privKey,
        $subject
    );
    
    return $vapid->sendPush($subscription, [
        'title' => $title,
        'body' => $body,
        'icon' => $icon,
        'url' => $url
    ]);
}

// ============================================
// SWITCH ACTIONS
// ============================================
switch ($action) {
    
    // === OBTENER VAPID PUBLIC KEY (para el frontend) ===
    case 'vapid_key':
        $pubKey = defined('VAPID_PUBLIC_KEY') ? VAPID_PUBLIC_KEY : getenv('VAPID_PUBLIC_KEY');
        echo json_encode([
            'success' => true,
            'publicKey' => $pubKey
        ]);
        break;
    
    // === REGISTRAR TOKEN DE DISPOSITIVO ===
    case 'registrar_token':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['endpoint']) || empty($data['keys']['p256dh']) || empty($data['keys']['auth'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos de suscripción incompletos']);
            exit;
        }
        
        try {
            // Upsert token
            $stmt = $pdo->prepare("
                INSERT INTO push_tokens (usuario_id, endpoint, p256dh, auth, user_agent)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    p256dh = VALUES(p256dh),
                    auth = VALUES(auth),
                    user_agent = VALUES(user_agent),
                    last_used = NOW(),
                    activo = TRUE
            ");
            $stmt->execute([
                $user['id'],
                $data['endpoint'],
                $data['keys']['p256dh'],
                $data['keys']['auth'],
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
            
            // Actualizar preferencia de push en usuario
            $pdo->prepare("UPDATE usuarios SET push_enabled = TRUE WHERE id = ?")->execute([$user['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Token registrado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al guardar token']);
        }
        break;
    
    // === ELIMINAR TOKEN (unsubscribe) ===
    case 'eliminar_token':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $endpoint = filter_var($_GET['endpoint'] ?? '', FILTER_SANITIZE_URL);
        
        if (empty($endpoint)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Endpoint requerido']);
            exit;
        }
        
        $pdo->prepare("UPDATE push_tokens SET activo = FALSE WHERE usuario_id = ? AND endpoint = ?")
            ->execute([$user['id'], $endpoint]);
        
        // Verificar si quedan tokens activos
        $remaining = $pdo->prepare("SELECT COUNT(*) FROM push_tokens WHERE usuario_id = ? AND activo = TRUE");
        $remaining->execute([$user['id']]);
        $count = $remaining->fetchColumn();
        
        if ($count == 0) {
            $pdo->prepare("UPDATE usuarios SET push_enabled = FALSE WHERE id = ?")->execute([$user['id']]);
        }
        
        echo json_encode(['success' => true]);
        break;
    
    // === ENVIAR NOTIFICACIÓN A USUARIO ===
    case 'enviar':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $titulo = filter_var($_POST['titulo'] ?? '', FILTER_SANITIZE_STRING);
        $cuerpo = filter_var($_POST['cuerpo'] ?? '', FILTER_SANITIZE_STRING);
        $url = filter_var($_POST['url'] ?? '/', FILTER_SANITIZE_URL);
        $icon = filter_var($_POST['icon'] ?? '/assets/icons/icon-192.png', FILTER_SANITIZE_URL);
        
        if (empty($titulo) || empty($cuerpo)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Título y cuerpo requeridos']);
            exit;
        }
        
        // Obtener tokens activos del usuario
        $stmt = $pdo->prepare("SELECT * FROM push_tokens WHERE usuario_id = ? AND activo = TRUE");
        $stmt->execute([$user['id']]);
        $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($tokens)) {
            echo json_encode(['success' => false, 'error' => 'No tienes notificaciones push habilitadas']);
            exit;
        }
        
        $enviadas = 0;
        $errores = [];
        
        foreach ($tokens as $token) {
            $subscription = [
                'endpoint' => $token['endpoint'],
                'keys' => [
                    'p256dh' => $token['p256dh'],
                    'auth' => $token['auth']
                ]
            ];
            
            $result = sendWebPush($subscription, $titulo, $cuerpo, $icon, $url);
            
            // Registrar en historial
            $insert = $pdo->prepare("
                INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, icono, url, metodo, status)
                VALUES (?, ?, ?, ?, ?, 'push', ?)
            ");
            $insert->execute([
                $user['id'],
                $titulo,
                $cuerpo,
                $icon,
                $url,
                $result['success'] ? 'enviada' : 'fallida'
            ]);
            
            if ($result['success']) {
                $enviadas++;
            } else {
                $errores[] = $result['error'] ?? 'Unknown Error';
            }
        }
        
        echo json_encode([
            'success' => true,
            'enviadas' => $enviadas,
            'errores' => $errores
        ]);
        break;
    
    // === MARCAR COMO LEÍDA ===
    case 'mark_read':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("UPDATE notificaciones_enviadas SET leida = TRUE, leida_at = NOW() WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$id, $user['id']]);
        } else {
            $stmt = $pdo->prepare("UPDATE notificaciones_enviadas SET leida = TRUE, leida_at = NOW() WHERE usuario_id = ?");
            $stmt->execute([$user['id']]);
        }
        echo json_encode(['success' => true]);
        break;

    // === MIS NOTIFICACIONES (historial) ===
    case 'mis_notificaciones':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT * FROM notificaciones_enviadas 
            WHERE usuario_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute([$user['id']]);
        $notificaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatear tiempos relativos
        foreach ($notificaciones as &$n) {
            $time = strtotime($n['created_at']);
            $diff = time() - $time;
            if ($diff < 60) $n['time_ago'] = "Hace un momento";
            elseif ($diff < 3600) $n['time_ago'] = "Hace " . round($diff/60) . "m";
            elseif ($diff < 86400) $n['time_ago'] = "Hace " . round($diff/3600) . "h";
            else $n['time_ago'] = date('d M', $time);
            
            // Compatibilidad con UI anterior (mensaje vs cuerpo)
            $n['mensaje'] = $n['cuerpo'];
            $n['tipo'] = $n['categoria']; // Usar categoría como tipo visual
        }
        
        echo json_encode([
            'success' => true,
            'notifications' => $notificaciones
        ]);
        break;
    
    // === NOTIFICACIONES NO LEÍDAS ===
    case 'no_leidas':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total FROM notificaciones_enviadas 
            WHERE usuario_id = ? AND leida = FALSE
        ");
        $stmt->execute([$user['id']]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'count' => (int)$count['total']
        ]);
        break;
    
    // === PREFERENCIAS ===
    case 'preferencias':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            // Obtener preferencias
            $stmt = $pdo->prepare("SELECT categoria, enabled FROM notification_preferences WHERE usuario_id = ?");
            $stmt->execute([$user['id']]);
            $prefsList = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $result = [];
            foreach ($prefsList as $p) {
                $result[$p['categoria']] = (bool)$p['enabled'];
            }
            
            echo json_encode([
                'success' => true,
                'push_enabled' => (bool)$user['push_enabled'],
                'preferences' => $result
            ]);
        } else {
            // Actualizar preferencias
            $data = json_decode(file_get_contents('php://input'), true);
            $prefs = $data['preferences'] ?? [];
            $pushEnabled = $data['push_enabled'] ?? false;
            
            // Actualizar estado general
            $pdo->prepare("UPDATE usuarios SET push_enabled = ? WHERE id = ?")
                ->execute([$pushEnabled, $user['id']]);
            
            // Actualizar categorías
            foreach ($prefs as $categoria => $enabled) {
                $pdo->prepare("
                    INSERT INTO notification_preferences (usuario_id, categoria, enabled)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE enabled = VALUES(enabled)
                ")->execute([$user['id'], $categoria, $enabled]);
            }
            
            echo json_encode(['success' => true]);
        }
        break;
    
    // ========================================
    // ADMIN ACTIONS
    // ========================================
    
    // === ENVIAR A TODOS LOS USUARIOS ===
    case 'admin_enviar_todos':
        if (!$isLoggedIn || !in_array($user['rol'], ['admin', 'mesa_directiva'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $titulo = filter_var($_POST['titulo'] ?? '', FILTER_SANITIZE_STRING);
        $cuerpo = filter_var($_POST['cuerpo'] ?? '', FILTER_SANITIZE_STRING);
        $url = filter_var($_POST['url'] ?? '/', FILTER_SANITIZE_URL);
        $icon = filter_var($_POST['icon'] ?? '/assets/icons/icon-192.png', FILTER_SANITIZE_URL);
        $categoria = filter_var($_POST['categoria'] ?? 'general', FILTER_SANITIZE_STRING);
        
        if (empty($titulo) || empty($cuerpo)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Título y cuerpo requeridos']);
            exit;
        }
        
        // Obtener todos los tokens activos
        $stmt = $pdo->query("
            SELECT pt.*, u.id as uid 
            FROM push_tokens pt
            JOIN usuarios u ON pt.usuario_id = u.id
            WHERE pt.activo = TRUE AND u.push_enabled = TRUE
        ");
        $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $enviadas = 0;
        $errores = 0;
        
        foreach ($tokens as $token) {
            $subscription = [
                'endpoint' => $token['endpoint'],
                'keys' => [
                    'p256dh' => $token['p256dh'],
                    'auth' => $token['auth']
                ]
            ];
            
            $result = sendWebPush($subscription, $titulo, $cuerpo, $icon, $url);
            
            $insert = $pdo->prepare("
                INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, icono, url, categoria, metodo, status)
                VALUES (?, ?, ?, ?, ?, ?, 'push', ?)
            ");
            $insert->execute([
                $token['uid'],
                $titulo,
                $cuerpo,
                $icon,
                $url,
                $categoria,
                $result['success'] ? 'enviada' : 'fallida'
            ]);
            
            if ($result['success']) $enviadas++;
            else $errores++;
        }
        
        echo json_encode([
            'success' => true,
            'total_enviados' => count($tokens),
            'exitosos' => $enviadas,
            'fallidos' => $errores
        ]);
        break;
    
    // === ENVIAR POR CATEGORÍA ===
    case 'admin_enviar_categoria':
        if (!$isLoggedIn || !in_array($user['rol'], ['admin', 'mesa_directiva'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $titulo = filter_var($_POST['titulo'] ?? '', FILTER_SANITIZE_STRING);
        $cuerpo = filter_var($_POST['cuerpo'] ?? '', FILTER_SANITIZE_STRING);
        $url = filter_var($_POST['url'] ?? '/', FILTER_SANITIZE_URL);
        $categoria = filter_var($_POST['categoria'] ?? '', FILTER_SANITIZE_STRING);
        
        if (empty($titulo) || empty($cuerpo) || empty($categoria)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Faltan campos requeridos']);
            exit;
        }
        
        // Obtener usuarios con esta categoría habilitada
        $stmt = $pdo->prepare("
            SELECT DISTINCT pt.*, u.id as uid
            FROM push_tokens pt
            JOIN usuarios u ON pt.usuario_id = u.id
            LEFT JOIN notification_preferences np ON u.id = np.usuario_id AND np.categoria = ?
            WHERE pt.activo = TRUE AND u.push_enabled = TRUE
            AND (np.enabled IS NULL OR np.enabled = TRUE)
        ");
        $stmt->execute([$categoria]);
        $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $enviadas = 0;
        
        foreach ($tokens as $token) {
            $subscription = [
                'endpoint' => $token['endpoint'],
                'keys' => [
                    'p256dh' => $token['p256dh'],
                    'auth' => $token['auth']
                ]
            ];
            
            $icon = filter_var($_POST['icon'] ?? '/assets/icons/icon-192.png', FILTER_SANITIZE_URL);
            $result = sendWebPush($subscription, $titulo, $cuerpo, $icon, $url);
            
            $insert = $pdo->prepare("
                INSERT INTO notificaciones_enviadas (usuario_id, titulo, cuerpo, icono, url, categoria, metodo, status)
                VALUES (?, ?, ?, ?, ?, ?, 'push', ?)
            ");
            $insert->execute([
                $token['uid'],
                $titulo,
                $cuerpo,
                $icon,
                $url,
                $categoria,
                $result['success'] ? 'enviada' : 'fallida'
            ]);
            
            if ($result['success']) $enviadas++;
        }
        
        echo json_encode([
            'success' => true,
            'total' => count($tokens),
            'enviadas' => $enviadas
        ]);
        break;
    
    // === STATS ADMIN ===
    case 'admin_stats':
        if (!$isLoggedIn || !in_array($user['rol'], ['admin', 'mesa_directiva'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        
        $stats = [
            'tokens_activos' => $pdo->query("SELECT COUNT(*) FROM push_tokens WHERE activo = TRUE")->fetchColumn(),
            'usuarios_con_push' => $pdo->query("SELECT COUNT(*) FROM usuarios WHERE push_enabled = TRUE")->fetchColumn(),
            'notificaciones_enviadas' => $pdo->query("SELECT COUNT(*) FROM notificaciones_enviadas WHERE status = 'enviada'")->fetchColumn(),
            'notificaciones_mes' => $pdo->query("SELECT COUNT(*) FROM notificaciones_enviadas WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn(),
            'tasa_apertura' => $pdo->query("
                SELECT ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM notificaciones_enviadas), 0), 1)
                FROM notificaciones_enviadas WHERE leida = TRUE
            ")->fetchColumn() ?? 0
        ];
        
        // Top notificaciones más enviadas
        $top = $pdo->query("
            SELECT titulo, COUNT(*) as total, MAX(created_at) as ultima
            FROM notificaciones_enviadas
            GROUP BY titulo
            ORDER BY total DESC
            LIMIT 5
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'stats' => $stats,
            'top_notifications' => $top
        ]);
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Acción no encontrada']);
}
