<?php
/**
 * CORS Security Engine - CESA WEB v3.5
 * Archivo: /backend/lib/cors.php
 */

// Obtener el origen de la petición
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Dominios permitidos (Ajustar para producción)
$allowed_origins = [
    'http://localhost:3000',      // Desarrollo Next.js
    'https://cesa.unison.mx',     // Producción Oficial
    'https://cesa-web.pages.dev'  // Staging (opcional)
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Por defecto en producción, solo permitir el dominio oficial
    header("Access-Control-Allow-Origin: https://cesa.unison.mx");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Manejo de peticiones pre-vuelo (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
