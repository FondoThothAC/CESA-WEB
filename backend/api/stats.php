<?php
/**
 * API Stats & Analytics - CESA WEB v3.5
 * Archivo: /backend/api/stats.php
 */

require_once __DIR__ . '/../lib/cors.php';
require_once __DIR__ . '/../lib/JWTHelper.php';

header('Content-Type: application/json; charset=utf-8');

// VERIFICACIÓN DE ROL (Solo Admin/Mesa Directiva)
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$user_role = 'student';

if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $decoded = JWTHelper::verify($matches[1]);
    if ($decoded && in_array($decoded['rol'], ['admin', 'mesa_directiva'])) {
        $user_role = $decoded['rol'];
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acceso restringido a Mesa Directiva']);
        exit;
    }
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

// --- MOCK DATA PARA ANALYTICS ---
// En producción estos datos vendrían de consultas SQL COUNT() y AVG() sobre MariaDB
$analytics = [
    'sentiment' => [
        'positivo' => 12,
        'neutro' => 34,
        'negativo' => 8,
        'urgentes_detectados' => 3,
        'mood_score' => 78 // Escala 0-100
    ],
    'bolsa_trabajo' => [
        'vacantes_activas' => 15,
        'postulaciones_totales' => 87,
        'empresas_aliadas' => 6
    ],
    'bazar_emprendedor' => [
        'negocios_activos' => 24,
        'categorias_top' => ['Comida', 'Servicios', 'Tech'],
        'clic_contacto_total' => 156
    ],
    'comunidad' => [
        'usuarios_registrados' => 450,
        'actividad_muro' => 1240, // Interacciones/Vistas
        'carreras_activas' => 18
    ]
];

echo json_encode([
    'success' => true,
    'analytics' => $analytics,
    'generated_at' => date('Y-m-d H:i:s'),
    'role_validated' => $user_role
]);
