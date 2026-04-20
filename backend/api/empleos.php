<?php
/**
 * API Bolsa de Trabajo - CESA WEB v3.5
 * Archivo: /backend/api/empleos.php
 */

require_once __DIR__ . '/../lib/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

// --- MOCK DATA PARA DESARROLLO LOCAL ---
$mock_jobs = [
    [
        'id' => 1,
        'empresa_nombre' => 'Oracle México',
        'titulo' => 'Desarrollador Junior (Internship)',
        'descripcion' => 'Buscamos talento de la UNISON para integrarse a nuestro equipo de Cloud. Requiere conocimientos en SQL y Node.js.',
        'modalidad' => 'hibrido',
        'tipo' => 'practicas',
        'sueldo_rango' => '$8,000 - $12,000',
        'carreras_target' => 'LCC, Ing. Sistemas',
        'created_at' => '2026-04-18 14:00:00'
    ],
    [
        'id' => 2,
        'empresa_nombre' => 'HostGator Latam',
        'titulo' => 'Soporte Técnico Nivel 1',
        'descripcion' => 'Atención a clientes y resolución de problemas de hosting. Excelente ambiente laboral.',
        'modalidad' => 'remoto',
        'tipo' => 'medio_tiempo',
        'sueldo_rango' => '$6,000 - $8,000',
        'carreras_target' => 'Todas',
        'created_at' => '2026-04-19 10:00:00'
    ]
];

if ($method === 'GET') {
    $mode = $_GET['modalidad'] ?? 'todas';
    $results = ($mode === 'todas') 
               ? $mock_jobs 
               : array_values(array_filter($mock_jobs, fn($j) => $j['modalidad'] === $mode));

    echo json_encode(['success' => true, 'vacantes' => $results]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $vacante_id = $input['vacante_id'] ?? 0;
    $usuario_email = $input['usuario_email'] ?? '';

    if (empty($usuario_email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión para postularte']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Postulación enviada correctamente. El reclutador se pondrá en contacto contigo.',
        'postulacion_id' => rand(1000, 9999)
    ]);
    exit;
}
