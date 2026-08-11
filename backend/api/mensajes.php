<?php
/**
 * API Mensajes Privados P2P - CESA WEB v4.0
 * Funcionalidad: Conversaciones entre alumnos y empresas, historial y auditorías.
 * Archivo: /backend/api/mensajes.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../config/database.php';

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
    $method = $_SERVER['REQUEST_METHOD'];
    $myId = (int)$user['id'];

    // 1. GET requests
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'threads';

        // ACCIÓN: Listar Hilos de Conversación (Inbox)
        if ($action === 'threads') {
            $sql = "
                SELECT DISTINCT 
                    u.id, 
                    u.nombre_completo as nombre, 
                    u.rol,
                    u.avatar_path as avatar,
                    (
                        SELECT contenido 
                        FROM mensajes_privados 
                        WHERE (emisor_id = :my_id AND receptor_id = u.id) 
                           OR (emisor_id = u.id AND receptor_id = :my_id) 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) as lastMessage,
                    (
                        SELECT created_at 
                        FROM mensajes_privados 
                        WHERE (emisor_id = :my_id AND receptor_id = u.id) 
                           OR (emisor_id = u.id AND receptor_id = :my_id) 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) as last_time,
                    (
                        SELECT COUNT(*) 
                        FROM mensajes_privados 
                        WHERE emisor_id = u.id 
                          AND receptor_id = :my_id 
                          AND leido = 0
                    ) as unread
                FROM usuarios u
                JOIN mensajes_privados m ON (m.emisor_id = u.id AND m.receptor_id = :my_id) 
                                         OR (m.receptor_id = u.id AND m.emisor_id = :my_id)
                WHERE u.id != :my_id
                ORDER BY last_time DESC
            ";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':my_id' => $myId]);
            $threads = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $threads]);
            exit;
        }

        // ACCIÓN: Obtener Historial de Chat con un Contacto
        if ($action === 'chat') {
            $contactId = (int)($_GET['contact_id'] ?? 0);
            if (!$contactId) {
                throw new Exception('ID de contacto requerido');
            }

            // Marcar mensajes como leídos
            $stmtUpdate = $pdo->prepare("UPDATE mensajes_privados SET leido = 1 WHERE emisor_id = ? AND receptor_id = ?");
            $stmtUpdate->execute([$contactId, $myId]);

            $stmt = $pdo->prepare("
                SELECT id, emisor_id, receptor_id, contenido, created_at 
                FROM mensajes_privados 
                WHERE (emisor_id = ? AND receptor_id = ?) 
                   OR (emisor_id = ? AND receptor_id = ?) 
                ORDER BY created_at ASC 
                LIMIT 200
            ");
            $stmt->execute([$myId, $contactId, $contactId, $myId]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $messages]);
            exit;
        }
    }

    // 2. POST requests: Enviar Mensaje P2P
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $receptorId = (int)($input['receptor_id'] ?? 0);
        $contenido = trim($input['contenido'] ?? '');
        $lat = isset($input['lat']) && $input['lat'] !== '' ? (float)$input['lat'] : null;
        $lon = isset($input['lon']) && $input['lon'] !== '' ? (float)$input['lon'] : null;

        if (!$receptorId) throw new Exception('Receptor no especificado');
        if (empty($contenido)) throw new Exception('El mensaje no puede estar vacío');

        // Extraer metadatos de red
        $clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (strpos($clientIp, ',') !== false) {
            $parts = explode(',', $clientIp);
            $clientIp = trim($parts[0]);
        }
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        // Geolocalización fallback por IP
        $geo = getIpGeolocation($clientIp);
        if ($lat === null || $lon === null) {
            $lat = $geo['lat'];
            $lon = $geo['lon'];
        }
        $city = $geo['city'];
        $country = $geo['country'];

        // Guardar mensaje
        $stmt = $pdo->prepare("
            INSERT INTO mensajes_privados 
            (emisor_id, receptor_id, contenido, leido, ip_address, user_agent, geoloc_lat, geoloc_lon, geoloc_city, geoloc_country) 
            VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $myId, 
            $receptorId, 
            $contenido, 
            $clientIp, 
            $userAgent, 
            $lat, 
            $lon, 
            $city, 
            $country
        ]);

        echo json_encode([
            'success' => true, 
            'message_id' => $pdo->lastInsertId(),
            'message' => 'Mensaje enviado correctamente'
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// Helper para geolocalización por IP
function getIpGeolocation($ip) {
    if ($ip === '127.0.0.1' || $ip === '::1' || empty($ip)) {
        return [
            'city' => 'Hermosillo',
            'country' => 'Mexico',
            'lat' => 29.0883,
            'lon' => -110.9614
        ];
    }
    try {
        $ch = curl_init("http://ip-api.com/json/" . $ip);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);
        $res = curl_exec($ch);
        if ($res) {
            $data = json_decode($res, true);
            if (($data['status'] ?? '') === 'success') {
                return [
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                    'lat' => $data['lat'] ?? null,
                    'lon' => $data['lon'] ?? null
                ];
            }
        }
    } catch (Exception $e) {}
    return [
        'city' => null,
        'country' => null,
        'lat' => null,
        'lon' => null
    ];
}
