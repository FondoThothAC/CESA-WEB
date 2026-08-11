<?php
/**
 * API de Evaluaciones - CESA WEB v3.6
 * Archivo: /backend/api/evaluaciones.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/AcademicProgressManager.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$userId = $auth->getUserId();
$pdo = getDBConnection();
$progressManager = new AcademicProgressManager($pdo);

$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        // ============================================================================
        // LISTAR DISPONIBLES
        // ============================================================================
        case 'listar':
            $stmt = $pdo->prepare("SELECT id, codigo, nombre, descripcion, categoria, icono, color_hex, tiempo_limite_minutos, puntaje_aprobatorio, intentos_maximos FROM skills_catalogo ORDER BY categoria, nombre");
            $stmt->execute();
            $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // También obtener los certificados que YA tiene el usuario
            $stmtC = $pdo->prepare("SELECT skill_id, certificado_uuid, fecha_expiracion, estado FROM certificados_digitales WHERE usuario_id = ? AND estado = 'activo'");
            $stmtC->execute([$userId]);
            $myCerts = $stmtC->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'catalog' => $skills, 'my_certs' => $myCerts]);
            break;

        // ============================================================================
        // INICIAR EVALUACIÓN
        // ============================================================================
        case 'iniciar':
            $skillId = (int)($_POST['skill_id'] ?? 0);
            
            // Verificar que la skill exista y esté activa
            $stmt = $pdo->prepare("SELECT * FROM skills_catalogo WHERE id = ?");
            $stmt->execute([$skillId]);
            $skill = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$skill) {
                throw new Exception('Skill no encontrada');
            }
            
            // Verificar intentos realizados
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM skills_intentos WHERE usuario_id = ? AND skill_id = ? AND estado != 'en_progreso'");
            $stmt->execute([$userId, $skillId]);
            if ($stmt->fetchColumn() >= $skill['intentos_maximos']) {
                throw new Exception('Has alcanzado el límite de intentos para esta certificación.');
            }
            
            // Crear intento
            $stmt = $pdo->prepare("
                INSERT INTO skills_intentos (usuario_id, skill_id, estado, fecha_inicio, ip_address, user_agent)
                VALUES (?, ?, 'en_progreso', NOW(), ?, ?)
            ");
            $stmt->execute([
                $userId, 
                $skillId, 
                $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0', 
                $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
            ]);
            $intentoId = $pdo->lastInsertId();
            
            $limit = isset($_POST['examSize']) ? (int)$_POST['examSize'] : 120;
            if ($limit < 10) $limit = 10;
            if ($limit > 120) $limit = 120;

            // Obtener preguntas aleatorias
            $preguntasStmt = $pdo->prepare("
                SELECT id, tipo, pregunta, opciones, peso_porcentaje
                FROM skills_preguntas
                WHERE skill_id = ? AND activa = 1
                ORDER BY RAND()
                LIMIT $limit
            ");
            $preguntasStmt->execute([$skillId]);
            $preguntas = $preguntasStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Sanitizar opciones para el cliente (no enviar la respuesta correcta)
            foreach ($preguntas as &$preg) {
                if ($preg['opciones']) {
                    $preg['opciones'] = json_decode($preg['opciones'], true);
                }
            }
            
            echo json_encode([
                'success' => true,
                'intento_id' => $intentoId,
                'skill' => [
                    'nombre' => $skill['nombre'],
                    'tiempo_limite' => $skill['tiempo_limite_minutos']
                ],
                'preguntas' => $preguntas
            ]);
            break;

        // ============================================================================
        // SUBMIT RESPUESTAS
        // ============================================================================
        case 'submit':
            $intentoId = (int)($_POST['intento_id'] ?? 0);
            $respuestas = json_decode($_POST['respuestas'] ?? '[]', true);
            
            if (!$intentoId || empty($respuestas)) {
                throw new Exception('Datos incompletos');
            }
            
            // Obtener detalles del intento y la skill
            $stmt = $pdo->prepare("
                SELECT i.*, s.puntaje_aprobatorio, s.tiempo_limite_minutos
                FROM skills_intentos i
                JOIN skills_catalogo s ON i.skill_id = s.id
                WHERE i.id = ? AND i.usuario_id = ? AND i.estado = 'en_progreso'
            ");
            $stmt->execute([$intentoId, $userId]);
            $intento = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$intento) {
                throw new Exception('Intento no válido o ya finalizado');
            }
            
            // Verificar tiempo (opcional, margen de 1 min)
            $inicio = strtotime($intento['fecha_inicio']);
            $ahora = time();
            $limite = $inicio + ($intento['tiempo_limite_minutos'] * 60) + 60;
            
            if ($ahora > $limite) {
                $stmt = $pdo->prepare("UPDATE skills_intentos SET estado = 'abandonado', fecha_fin = NOW() WHERE id = ?");
                $stmt->execute([$intentoId]);
                throw new Exception('El tiempo límite ha expirado.');
            }
            
            // Calcular puntaje
            $puntajeTotal = 0;
            $maxPuntaje = 0;
            
            foreach ($respuestas as $qId => $resp) {
                $stmt = $pdo->prepare("SELECT respuesta_correcta, peso_porcentaje FROM skills_preguntas WHERE id = ?");
                $stmt->execute([$qId]);
                $pregunta = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($pregunta) {
                    $maxPuntaje += $pregunta['peso_porcentaje'];
                    // Comparación simple de texto/índice
                    if (trim((string)$resp) === trim((string)$pregunta['respuesta_correcta'])) {
                        $puntajeTotal += $pregunta['peso_porcentaje'];
                    }
                }
            }
            
            // Normalizar a base 100 si es necesario
            $calificacionFinal = ($maxPuntaje > 0) ? ($puntajeTotal / $maxPuntaje) * 100 : 0;
            $aprobo = ($calificacionFinal >= $intento['puntaje_aprobatorio']);
            
            // Actualizar intento
            $stmt = $pdo->prepare("
                UPDATE skills_intentos 
                SET puntaje_obtenido = ?, estado = ?, fecha_fin = NOW(), respuestas = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $calificacionFinal,
                $aprobo ? 'aprobado' : 'reprobado',
                json_encode($respuestas),
                $intentoId
            ]);
            
            $res = [
                'success' => true,
                'calificacion' => round($calificacionFinal, 1),
                'aprobo' => $aprobo,
                'mensaje' => $aprobo ? '¡Felicidades! Has aprobado la evaluación.' : 'No has alcanzado el puntaje mínimo. Sigue practicando.'
            ];
            
            // Si aprobó, generar certificado automáticamente
            if ($aprobo) {
                $certRes = $progressManager->generarCertificado($intentoId);
                if ($certRes['success']) {
                    $res['certificado_uuid'] = $certRes['uuid'];
                }
            }
            
            echo json_encode($res);
            break;

        default:
            throw new Exception('Acción no reconocida');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
