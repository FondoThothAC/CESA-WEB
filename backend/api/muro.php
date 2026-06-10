<?php
/**
 * API: Muro Social - Sistema de Karma (v3.7)
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
    echo json_encode(['success' => false, 'error' => 'Sesión no válida']);
    exit;
}

try {
    $pdo = getDBConnection();
    $notificationManager = new NotificationManager($pdo);

    // 1. GET: Listar publicaciones con Karma y Sentimiento
    if ($method === 'GET') {
        $coordinacion = $_GET['coordinacion'] ?? 'general';
        $postId = (int)($_GET['id'] ?? 0);
        $usuario_id = $user['id'];
        
        if ($postId > 0) {
            $stmt = $pdo->prepare("
                SELECT p.*, u.nombre_completo, u.rol, u.avatar_path,
                       s.score as sentiment_score, s.summary as sentiment_summary,
                       (SELECT valor FROM votos_muro WHERE publicacion_id = p.id AND usuario_id = ?) as user_vote
                FROM publicaciones_muro p 
                JOIN usuarios u ON p.usuario_id = u.id 
                LEFT JOIN sentimiento_analisis s ON s.item_type = 'muro' AND s.item_id = p.id
                WHERE p.id = ? AND p.activo = 1
            ");
            $stmt->execute([$usuario_id, $postId]);
            $post = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $post]);
            exit;
        } else {
            $sql = "SELECT p.*, u.nombre_completo, u.rol, u.avatar_path,
                           s.score as sentiment_score, s.summary as sentiment_summary,
                           (SELECT valor FROM votos_muro WHERE publicacion_id = p.id AND usuario_id = ?) as user_vote
                    FROM publicaciones_muro p 
                    JOIN usuarios u ON p.usuario_id = u.id 
                    LEFT JOIN sentimiento_analisis s ON s.item_type = 'muro' AND s.item_id = p.id
                    WHERE p.activo = 1";
            $params = [$usuario_id];
            
            if ($coordinacion !== 'todos') {
                $sql .= " AND p.coordinacion_destino = ?";
                $params[] = $coordinacion;
            }
            
            $sql .= " ORDER BY p.score DESC, p.created_at DESC LIMIT 50";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'posts' => $posts]);
            exit;
        }
    }

    // 2. POST: Acciones (Publicar / Votar)
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        // ACCIÓN: VOTAR (Reddit Logic)
        if ($action === 'votar') {
            $postId = (int)$data['publicacion_id'];
            $nuevoValor = (int)$data['valor']; // 1 o -1

            if (!in_array($nuevoValor, [1, -1])) throw new Exception("Valor de voto inválido");

            $pdo->beginTransaction();

            // 1. Verificar voto previo
            $stmt = $pdo->prepare("SELECT valor FROM votos_muro WHERE publicacion_id = ? AND usuario_id = ?");
            $stmt->execute([$postId, $user['id']]);
            $votoPrevio = $stmt->fetch();

            if ($votoPrevio) {
                if ((int)$votoPrevio['valor'] === $nuevoValor) {
                    // TOGGLE OFF: Si vota lo mismo, borra el voto
                    $stmt = $pdo->prepare("DELETE FROM votos_muro WHERE publicacion_id = ? AND usuario_id = ?");
                    $stmt->execute([$postId, $user['id']]);
                } else {
                    // SWITCH: Cambia de Up a Down o viceversa
                    $stmt = $pdo->prepare("UPDATE votos_muro SET valor = ? WHERE publicacion_id = ? AND usuario_id = ?");
                    $stmt->execute([$nuevoValor, $postId, $user['id']]);
                }
            } else {
                // NUEVO VOTO
                $stmt = $pdo->prepare("INSERT INTO votos_muro (publicacion_id, usuario_id, valor) VALUES (?, ?, ?)");
                $stmt->execute([$postId, $user['id'], $nuevoValor]);
            }

            // 2. Recalcular scores atómicamente en la tabla principal
            $stmt = $pdo->prepare("
                UPDATE publicaciones_muro p
                SET 
                    p.upvotes_count = (SELECT COUNT(*) FROM votos_muro WHERE publicacion_id = p.id AND valor = 1),
                    p.downvotes_count = (SELECT COUNT(*) FROM votos_muro WHERE publicacion_id = p.id AND valor = -1),
                    p.score = (SELECT COALESCE(SUM(valor), 0) FROM votos_muro WHERE publicacion_id = p.id)
                WHERE p.id = ?
            ");
            $stmt->execute([$postId]);

            // 3. Obtener el nuevo score para responder al frontend
            $stmt = $pdo->prepare("SELECT score FROM publicaciones_muro WHERE id = ?");
            $stmt->execute([$postId]);
            $newScore = $stmt->fetchColumn();

            $pdo->commit();
            echo json_encode(['success' => true, 'new_score' => $newScore]);
            exit;
        }

        // ACCIÓN: PUBLICAR (Existente)
        if ($action === 'publicar') {
            $contenido = trim($data['contenido'] ?? '');
            $coordinacion = $data['coordinacion'] ?? 'general';
            $alias_opt_in = $data['usar_alias'] ?? false;
            
            if (empty($contenido)) throw new Exception("El contenido no puede estar vacío");

            // Consultar expediente y alias de la base de datos ya que no vienen en el JWT
            $stmtU = $pdo->prepare("SELECT expediente, alias FROM usuarios WHERE id = ?");
            $stmtU->execute([$user['id']]);
            $dbUser = $stmtU->fetch();
            $alias = $dbUser['alias'] ?? ('CesaUser_' . substr($dbUser['expediente'] ?? '000', -3));

            $stmt = $pdo->prepare("
                INSERT INTO publicaciones_muro 
                (usuario_id, alias_autor, contenido, coordinacion_destino, activo) 
                VALUES (?, ?, ?, ?, 1)
            ");
            $stmt->execute([
                $user['id'],
                $alias_opt_in ? $alias : null,
                $contenido,
                $coordinacion
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            exit;
        }
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
