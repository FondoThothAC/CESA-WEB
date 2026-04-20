<?php
/**
 * API Muro Social - CESA WEB v3.5
 * Archivo: /backend/api/muro.php
 */

require_once __DIR__ . '/../lib/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$upload_dir = __DIR__ . '/../uploads/';

// --- MOCK DATA PARA DESARROLLO LOCAL (Si la DB no está lista) ---
$mock_posts = [
    [
        'id' => 1,
        'nombre_completo' => 'Ángela Carrasco',
        'rol' => 'mesa_directiva',
        'contenido' => '¡Bienvenidos al nuevo ciclo escolar! Estamos preparando grandes sorpresas para ustedes en este periodo 2026-2028.',
        'tipo' => 'aviso',
        'imagen_url' => null,
        'created_at' => '2026-04-18 09:00:00',
        'likes' => 24
    ],
    [
        'id' => 2,
        'nombre_completo' => 'CESA UNISON',
        'rol' => 'admin',
        'contenido' => 'Mañana iniciamos el Bazar Emprendedor en la plaza de los 100 años. ¡No faltes!',
        'tipo' => 'evento',
        'imagen_url' => null,
        'created_at' => '2026-04-18 10:15:00',
        'likes' => 56
    ]
];

if ($method === 'GET') {
    // Aquí iría la consulta a MariaDB
    echo json_encode(['success' => true, 'posts' => $mock_posts]);
    exit;
}

if ($method === 'POST') {
    // Simulación de guardado y manejo de archivos
    $content = $_POST['contenido'] ?? '';
    $type = $_POST['tipo'] ?? 'comun';
    $image_path = null;

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $filename = uniqid('post_') . '.' . $ext;
        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $upload_dir . $filename)) {
            $image_path = 'uploads/' . $filename;
        }
    }

    if (empty($content)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Contenido vacío']);
        exit;
    }

    // En producción guardaríamos en la DB
    echo json_encode([
        'success' => true, 
        'message' => 'Publicación creada (Mock)',
        'post' => [
            'id' => rand(100, 999),
            'nombre_completo' => 'Tú (Demo)',
            'rol' => 'estudiante',
            'contenido' => $content,
            'tipo' => $type,
            'imagen_url' => $image_path,
            'created_at' => date('Y-m-d H:i:s'),
            'likes' => 0
        ]
    ]);
    exit;
}
