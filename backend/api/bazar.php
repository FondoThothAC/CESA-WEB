<?php
/**
 * API Bazar Emprendedor - CESA WEB v3.5
 * Archivo: /backend/api/bazar.php
 */

require_once __DIR__ . '/../lib/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$upload_dir = __DIR__ . '/../uploads/bazar/';

// Asegurar carpeta de uploads para bazar
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// --- MOCK DATA PARA DESARROLLO LOCAL ---
$mock_products = [
    [
        'id' => 1,
        'usuario_id' => 1,
        'titulo' => 'Galletas Artesanales Unison',
        'descripcion' => 'Deliciosas galletas de avena y chocolate hechas en casa. Apoya a una estudiante de Nutrición.',
        'precio' => 45.00,
        'categoria' => 'comida',
        'whatsapp_contacto' => '6621234567',
        'imagen_url' => null,
        'vendedor' => 'Ana Karen López',
        'created_at' => '2026-04-18 11:00:00'
    ],
    [
        'id' => 2,
        'usuario_id' => 2,
        'titulo' => 'Asesoría de Programación Python',
        'descripcion' => 'Clases de regularización para Ingeniería. 100% garantizado o no pagas.',
        'precio' => 150.00,
        'categoria' => 'servicios',
        'whatsapp_contacto' => '6629876543',
        'imagen_url' => null,
        'vendedor' => 'Luis Martínez',
        'created_at' => '2026-04-18 12:30:00'
    ]
];

if ($method === 'GET') {
    $category = $_GET['categoria'] ?? 'todas';
    $results = ($category === 'todas') 
               ? $mock_products 
               : array_values(array_filter($mock_products, fn($p) => $p['categoria'] === $category));

    echo json_encode(['success' => true, 'productos' => $results]);
    exit;
}

if ($method === 'POST') {
    // Lógica Simple de Registro de Producto
    $titulo = $_POST['titulo'] ?? '';
    $precio = $_POST['precio'] ?? 0;
    $categoria = $_POST['categoria'] ?? 'otro';
    $image_path = null;

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $filename = 'bazar_' . uniqid() . '.' . $ext;
        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $upload_dir . $filename)) {
            $image_path = 'uploads/bazar/' . $filename;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Producto publicado (Mock)',
        'producto' => [
            'id' => rand(100, 999),
            'titulo' => $titulo,
            'precio' => $precio,
            'categoria' => $categoria,
            'imagen_url' => $image_path,
            'vendedor' => 'Tú (Demo)',
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    exit;
}
