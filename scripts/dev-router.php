<?php
/**
 * Router para php -S (SOLO DESARROLLO LOCAL).
 * Uso: php -S 127.0.0.1:8090 -t backend scripts/dev-router.php
 *
 * - /api/<carpeta>/<archivo>.php  ↦  backend/api/<carpeta>/<archivo>.php
 * - /api/v1/cualquiercosa         ↦  proxy HTTP a RUST (RUST_DEV_URL, default 127.0.0.1:8091)
 * - CORS transparente para http://localhost:3000 / 127.0.0.1:3000
 */

header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');

// ============ Proxy /api/v1/* → Rust ============
if (str_starts_with($uri, '/api/v1/')) {
    $rustBase = getenv('RUST_DEV_URL') ?: 'http://127.0.0.1:8091';
    $url = $rustBase . $uri;
    if (!empty($_SERVER['QUERY_STRING'])) {
        $url .= '?' . $_SERVER['QUERY_STRING'];
    }

    $ch = curl_init($url);
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        $body = file_get_contents('php://input');
        if ($body !== '' && $body !== false) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
    }
    $hdrs = ['Accept: application/json'];
    foreach (['HTTP_AUTHORIZATION' => 'Authorization', 'CONTENT_TYPE' => 'Content-Type'] as $key => $out) {
        if (!empty($_SERVER[$key])) {
            $hdrs[] = $out . ': ' . $_SERVER[$key];
        }
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $hdrs);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $resp = curl_exec($ch);
    $err = curl_errno($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE) ?: 502;


    http_response_code($status);
    header('Content-Type: application/json');
    if ($err) {
        echo json_encode(['success' => false, 'error' => 'Rust backend no disponible (' . $rustBase . ')']);
    } else {
        echo $resp;
    }
    return true;
}

// ============ Archivos PHP exactos del backend/api ============
if (preg_match('#^/api/([a-zA-Z0-9_/\-]+\.php)$#', $uri, $m)) {
    $target = realpath(__DIR__ . '/../backend/api/' . $m[1]);
    $apiRoot = realpath(__DIR__ . '/../backend/api');
    if ($target && str_starts_with($target, $apiRoot)) {
        $_GET = array_merge($_GET, $_GET); // query string se mantiene por PHP-S
        chdir(dirname($target));
        include $target;
        exit;
    }
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Ruta PHP no encontrada: ' . $m[1]]);
    return true;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'error' => 'Router dev: sin ruta para ' . $uri]);
return true;
