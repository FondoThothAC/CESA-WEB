<?php
/**
 * API Votaciones - CESA UNISON v5.5
 * Gestiona elecciones estudiantiles, permisos del Consejo, IP Settings
 * y cifrado AES-256 para Data Science exclusivo de software@fondothoth.com.
 */
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';

header('Content-Type: application/json; charset=utf-8');
$pdo = getDBConnection();
$auth = new Auth();

$isLoggedIn = $auth->isLoggedIn();
$user = $isLoggedIn ? $auth->getUser() : null;

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// LLAVE SECRETA DE ENCRIPTACIÓN AES-256 (Data Science)
define('APP_AES_KEY', getenv('APP_AES_KEY') ?: 'Th0th_M4ster_A3S_2026_Secur3K3y!');

/**
 * Cifrado Determinista (AES-256-CBC) para evitar votos dobles 
 * y permitir descifrado al Master Admin.
 */
function encryptExpediente($expediente, $votacion_id) {
    // Usamos el ID de la votación y la llave para derivar un IV fijo para esta elección
    $iv = substr(hash('sha256', $votacion_id . APP_AES_KEY), 0, 16);
    return openssl_encrypt($expediente, 'aes-256-cbc', APP_AES_KEY, 0, $iv);
}

function decryptExpediente($encrypted, $votacion_id) {
    $iv = substr(hash('sha256', $votacion_id . APP_AES_KEY), 0, 16);
    return openssl_decrypt($encrypted, 'aes-256-cbc', APP_AES_KEY, 0, $iv);
}

function getClientIp() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    // Solo confiar en X-Forwarded-For si REMOTE_ADDR es un proxy inverso declarado en TRUSTED_PROXIES
    $trustedProxies = array_filter(array_map('trim', explode(',', getenv('TRUSTED_PROXIES') ?: '')));
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR']) && in_array($ip, $trustedProxies, true)) {
        $candidates = array_map('trim', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']));
        $ip = $candidates[0];
    }
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function isIpAllowed($ip, $allowed_networks_json) {
    if (empty($allowed_networks_json)) return true; // Si está vacío, se asume libre.
    $networks = json_decode($allowed_networks_json, true) ?? [];
    if (empty($networks)) return true;
    
    foreach ($networks as $net) {
        // Verifica si la IP comienza con el bloque permitido (Ej: 148.225. o 10.0.)
        if (strpos($ip, $net) === 0) return true;
    }
    return false; 
}

// Helper para validar rol_comunicacion o admin
function isAdminOrCouncil() {
    global $user, $pdo;
    if (!$user) return false;
    if (in_array($user['rol'], ['admin', 'mesa_directiva'])) return true;
    
    $stmt = $pdo->prepare("SELECT consejo_elecciones FROM admin_permisos WHERE usuario_id = ?");
    $stmt->execute([$user['id']]);
    $perm = $stmt->fetchColumn();
    return $perm == 1;
}

switch ($action) {
    // 1. Listar Votaciones
    case 'list':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Inicia sesión para ver votaciones']);
            exit;
        }

        $matricula = $user['matricula'] ?? null;
        if (!$matricula) {
            echo json_encode(['success' => true, 'votaciones' => [], 'mensaje' => 'No tienes matrícula registrada.']);
            exit;
        }

        $stmtPadron = $pdo->prepare("SELECT carrera FROM estudiantes_activos WHERE expediente = ?");
        $stmtPadron->execute([$matricula]);
        $padron = $stmtPadron->fetch(PDO::FETCH_ASSOC);

        if (!$padron) {
            echo json_encode(['success' => true, 'votaciones' => [], 'mensaje' => 'No figuras en el padrón electoral activo de este semestre.']);
            exit;
        }

        $stmtVoto = $pdo->prepare("
            SELECT v.id, v.titulo, v.descripcion, v.fecha_inicio, v.fecha_fin, v.estado
            FROM votaciones v
            WHERE (v.estado = 'activa' OR v.estado = 'finalizada')
            AND (v.carrera_objetivo IS NULL OR v.carrera_objetivo = ?)
            ORDER BY v.fecha_inicio DESC
        ");
        $stmtVoto->execute([$padron['carrera']]);
        $votaciones = $stmtVoto->fetchAll(PDO::FETCH_ASSOC);

        foreach ($votaciones as &$v) {
            $encCheck = encryptExpediente($matricula, $v['id']);
            $stmtCheck = $pdo->prepare("SELECT 1 FROM votos_anonimos WHERE voto_encriptado = ?");
            $stmtCheck->execute([$encCheck]);
            $v['ya_voto'] = (bool)$stmtCheck->fetchColumn();

            $stmtCand = $pdo->prepare("SELECT id, nombre, descripcion, foto_path FROM votacion_candidatos WHERE votacion_id = ?");
            $stmtCand->execute([$v['id']]);
            $v['candidatos'] = $stmtCand->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode(['success' => true, 'data' => $votaciones]);
        break;

    // 2. Verificar Elegibilidad y Cargar Candidatos
    case 'verificar':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $votacion_id = $_POST['votacion_id'] ?? null;
        $expediente = $_POST['expediente'] ?? null;

        if (!$votacion_id || !$expediente) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos incompletos para verificación']);
            exit;
        }

        try {
            // Validar que el expediente coincida con el del usuario autenticado
            $stmtU = $pdo->prepare("SELECT matricula FROM usuarios WHERE id = ?");
            $stmtU->execute([$user['id']]);
            $dbMatricula = $stmtU->fetchColumn();

            if (empty($dbMatricula) || strtolower(trim((string)$dbMatricula)) !== strtolower(trim((string)$expediente))) {
                throw new Exception('El expediente ingresado no coincide con tu matrícula registrada de usuario.');
            }

            // Consultar votación
            $stmtV = $pdo->prepare("SELECT * FROM votaciones WHERE id = ?");
            $stmtV->execute([$votacion_id]);
            $votacion = $stmtV->fetch(PDO::FETCH_ASSOC);

            if (!$votacion || $votacion['estado'] !== 'activa' || strtotime($votacion['fecha_fin']) < time()) {
                throw new Exception('La votación no está activa.');
            }

            // Validar IP si hay configuración
            $clientIp = getClientIp();
            if (!isIpAllowed($clientIp, $votacion['redes_ip_permitidas'])) {
                throw new Exception('Sólo puedes votar conectado a la red de la Universidad permitida para esta elección.');
            }

            // Consultar Padrón
            $stmtPadron = $pdo->prepare("SELECT carrera FROM estudiantes_activos WHERE expediente = ?");
            $stmtPadron->execute([$expediente]);
            $padron = $stmtPadron->fetch(PDO::FETCH_ASSOC);

            if (!$padron) {
                throw new Exception('Tu expediente no está registrado en el padrón electoral activo de este semestre.');
            }

            if ($votacion['carrera_objetivo'] !== null && $votacion['carrera_objetivo'] !== $padron['carrera']) {
                throw new Exception('No perteneces a la carrera requerida para esta votación. Exclusivo para: ' . $votacion['carrera_objetivo']);
            }

            // Evitar Doble Voto usando Cifrado AES-256
            $votoEncriptado = encryptExpediente($expediente, $votacion_id);
            $stmtCheck = $pdo->prepare("SELECT 1 FROM votos_anonimos WHERE voto_encriptado = ?");
            $stmtCheck->execute([$votoEncriptado]);
            if ($stmtCheck->fetchColumn()) {
                throw new Exception('Ya has emitido tu voto en esta elección.');
            }

            // Obtener candidatos de la votación
            $stmtCand = $pdo->prepare("SELECT id, nombre as nombre_candidato, descripcion as planillas_o_info, foto_path FROM votacion_candidatos WHERE votacion_id = ?");
            $stmtCand->execute([$votacion_id]);
            $candidatos = $stmtCand->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $candidatos]);

        } catch (Throwable $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    // 3. Emitir Voto
    case 'votar':
    case 'vote':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $votacion_id = $_POST['votacion_id'] ?? null;
        $candidato_id = $_POST['candidato_id'] ?? null;
        $expediente = $_POST['expediente'] ?? null;

        if (!$votacion_id || !$candidato_id || !$expediente) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos incompletos o falta expediente']);
            exit;
        }

        try {
            $pdo->beginTransaction();

            // Validar que el expediente ingresado coincide con el del usuario autenticado en BD
            $stmtU = $pdo->prepare("SELECT matricula FROM usuarios WHERE id = ?");
            $stmtU->execute([$user['id']]);
            $dbMatricula = $stmtU->fetchColumn();

            if (empty($dbMatricula) || strtolower(trim((string)$dbMatricula)) !== strtolower(trim((string)$expediente))) {
                throw new Exception('El expediente ingresado no coincide con tu matrícula registrada de usuario.');
            }

            $stmtV = $pdo->prepare("SELECT * FROM votaciones WHERE id = ? FOR UPDATE");
            $stmtV->execute([$votacion_id]);
            $votacion = $stmtV->fetch(PDO::FETCH_ASSOC);

            if (!$votacion || $votacion['estado'] !== 'activa' || strtotime($votacion['fecha_fin']) < time()) {
                throw new Exception('La votación no está activa.');
            }

            // Validar IP si hay configuración
            $clientIp = getClientIp();
            if (!isIpAllowed($clientIp, $votacion['redes_ip_permitidas'])) {
                throw new Exception('Sólo puedes votar conectado a la red de la Universidad permitida para esta elección.');
            }

            // Padrón
            $stmtPadron = $pdo->prepare("SELECT carrera FROM estudiantes_activos WHERE expediente = ?");
            $stmtPadron->execute([$expediente]);
            $padron = $stmtPadron->fetch(PDO::FETCH_ASSOC);

            if (!$padron) throw new Exception('Tu expediente no está en el padrón electoral.');
            if ($votacion['carrera_objetivo'] !== null && $votacion['carrera_objetivo'] !== $padron['carrera']) {
                throw new Exception('No perteneces a la carrera requerida para esta votación.');
            }

            // Evitar Doble Voto usando Cifrado AES-256
            $votoEncriptado = encryptExpediente($expediente, $votacion_id);
            $stmtCheck = $pdo->prepare("SELECT 1 FROM votos_anonimos WHERE voto_encriptado = ?");
            $stmtCheck->execute([$votoEncriptado]);
            if ($stmtCheck->fetchColumn()) {
                throw new Exception('Ya has emitido tu voto en esta elección.');
            }

            // Registrar voto
            $stmtInsert = $pdo->prepare("INSERT INTO votos_anonimos (votacion_id, candidato_id, voto_encriptado, ip_address) VALUES (?, ?, ?, ?)");
            $stmtInsert->execute([$votacion_id, $candidato_id, $votoEncriptado, $clientIp]);

            // Actualizar Caché de Votos
            $stmtUpdateCand = $pdo->prepare("UPDATE votacion_candidatos SET votos_recibidos = votos_recibidos + 1 WHERE id = ?");
            $stmtUpdateCand->execute([$candidato_id]);

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Voto encriptado registrado con éxito.']);

        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;


    // 3. Obtener Resultados
    case 'resultados':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }

        $votacion_id = $_GET['votacion_id'] ?? null;
        if (!$votacion_id) exit;

        $stmtV = $pdo->prepare("SELECT estado, fecha_publicacion_resultados FROM votaciones WHERE id = ?");
        $stmtV->execute([$votacion_id]);
        $votacion = $stmtV->fetch(PDO::FETCH_ASSOC);

        if (!$votacion) exit;

        $esConsejoOAdmin = isAdminOrCouncil();
        $esMaster = Auth::isMasterEmail($user['email'] ?? null);
        $publicos = ($votacion['fecha_publicacion_resultados'] && strtotime($votacion['fecha_publicacion_resultados']) <= time());

        // Solo Master, Consejo/Admins o Estudiantes (si ya se publicó) pueden ver
        if (!$esMaster && !$esConsejoOAdmin && !$publicos) {
            echo json_encode(['success' => false, 'error' => 'Los resultados aún no son públicos.']);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT id, nombre as nombre_candidato, foto_path, votos_recibidos as votos
            FROM votacion_candidatos
            WHERE votacion_id = ?
            ORDER BY votos DESC
        ");
        $stmt->execute([$votacion_id]);
        $candidatos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $candidatos]);
        break;

    // 4. Data Science Decrypt (Solo Master Admin)
    case 'datascience_decrypt':
        if (!$isLoggedIn || !Auth::isMasterEmail($user['email'] ?? null)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Acceso restringido nivel Dios (Data Science).']);
            exit;
        }

        $votacion_id = $_POST['votacion_id'] ?? null;
        if (!$votacion_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Votacion ID requerido']);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT v.id, v.candidato_id, c.nombre, v.voto_encriptado, v.created_at, v.ip_address
            FROM votos_anonimos v
            JOIN votacion_candidatos c ON v.candidato_id = c.id
            WHERE v.votacion_id = ?
        ");
        $stmt->execute([$votacion_id]);
        $votos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $decrypted_data = [];
        foreach ($votos as $v) {
            $decrypted_data[] = [
                'id_registro' => $v['id'],
                'candidato' => $v['nombre'],
                'expediente_desencriptado' => decryptExpediente($v['voto_encriptado'], $votacion_id),
                'ip_origen' => $v['ip_address'],
                'timestamp' => $v['created_at']
            ];
        }

        echo json_encode(['success' => true, 'mensaje' => '¡PRECAUCIÓN! Datos sensibles.', 'data_science' => $decrypted_data]);
        break;

    // 5. Crear Votación (Solo Consejo/Admin)
    case 'create':
        if (!$isLoggedIn) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'No autorizado']);
            exit;
        }
        if (!isAdminOrCouncil()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Solo el Consejo de Elecciones puede crear votaciones.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $titulo = trim($input['titulo'] ?? '');
        $descripcion = trim($input['descripcion'] ?? '') ?: null;
        $carreraObjetivo = trim($input['carrera_objetivo'] ?? '') ?: null;
        $fechaInicio = trim($input['fecha_inicio'] ?? '');
        $fechaFin = trim($input['fecha_fin'] ?? '');
        $fechaPublicacion = trim($input['fecha_publicacion_resultados'] ?? '') ?: null;
        $redesIp = trim($input['redes_ip_permitidas'] ?? '');

        if ($titulo === '' || $fechaInicio === '' || $fechaFin === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Título y fechas de inicio/fin son obligatorios.']);
            exit;
        }
        if (strtotime($fechaFin) <= strtotime($fechaInicio)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'La fecha de fin debe ser posterior a la de inicio.']);
            exit;
        }
        if ($redesIp !== '' && json_decode($redesIp) === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Las redes IP permitidas deben ser un JSON válido.']);
            exit;
        }
        if ($redesIp !== '') {
            // Validación ligera del formato del array
            $decodedRedes = json_decode($redesIp, true);
            if (!is_array($decodedRedes)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Formato de redes IP inválido (se espera JSON array).']);
                exit;
            }
        } else {
            $redesIp = null;
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO votaciones (titulo, descripcion, carrera_objetivo, fecha_inicio, fecha_fin, fecha_publicacion_resultados, estado, redes_ip_permitidas)
                VALUES (?, ?, ?, ?, ?, ?, 'activa', ?)
            ");
            $stmt->execute([
                $titulo,
                $descripcion,
                $carreraObjetivo,
                date('Y-m-d H:i:s', strtotime($fechaInicio)),
                date('Y-m-d H:i:s', strtotime($fechaFin)),
                $fechaPublicacion ? date('Y-m-d H:i:s', strtotime($fechaPublicacion)) : null,
                $redesIp ?: null
            ]);
            echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId(), 'message' => 'Votación creada y activada.']);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al crear la votación.']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Acción no encontrada']);
}
