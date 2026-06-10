<?php
/**
 * API Validación de Acceso QR - CESA WEB v3.5
 * Verifica la autenticidad de carnets digitales.
 * Archivo: /backend/api/admin/acceso.php
 */

require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$auth = new Auth();
if (!$auth->hasRole('admin') && !$auth->hasRole('mesa_directiva')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No autorizado para escanear']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$qr_data_encoded = $input['qr_data'] ?? '';

if (empty($qr_data_encoded)) {
    echo json_encode(['success' => false, 'error' => 'Datos de QR faltantes']);
    exit;
}

try {
    // 1. Decodificar Datos
    $decoded = json_decode(base64_decode($qr_data_encoded), true);
    if (!$decoded) throw new Exception("Formato de QR inválido");

    $uid = $decoded['uid'];
    $exp = $decoded['exp'];
    $ts = $decoded['ts'];
    $sig_received = $decoded['sig'];

    // 2. Verificar Vigencia (Margen de 10 minutos para evitar capturas viejas)
    if (time() - $ts > 600) {
        throw new Exception("El Carnet ha expirado. Favor de actualizar (F5).");
    }

    // 3. Verificar Firma Digital
    $secret = getenv('APP_SECRET_KEY') ?: 'cesa_industrial_sec_2026';
    $payload = $uid . '|' . $exp . '|' . $ts;
    $full_sig = hash_hmac('sha256', $payload, $secret);
    
    if (substr($full_sig, 0, 16) !== $sig_received) {
        throw new Exception("Firma digital inválida. Posible carnet apócrifo.");
    }

    // 4. Obtener datos del alumno
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT nombre_completo, carrera, rol FROM usuarios WHERE id = ?");
    $stmt->execute([$uid]);
    $user_info = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user_info) throw new Exception("Alumno no encontrado en el sistema");

    // 5. Registrar Acceso (Auditoría)
    $stmtIns = $pdo->prepare("INSERT INTO accesos_log (usuario_id, escaneado_por, created_at) VALUES (?, ?, NOW())");
    $stmtIns->execute([$uid, $auth->getUserId()]);

    echo json_encode([
        'success' => true,
        'message' => 'Acceso Autorizado',
        'student' => $user_info
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
