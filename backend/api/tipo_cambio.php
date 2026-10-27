<?php
/**
 * Tipo de cambio FIX (Banxico SF43718) con respaldo público.
 * El token vive en el entorno (BANXICO_TOKEN) y nunca llega al navegador.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=1800');

function tc_respond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function tc_fetch(string $url, array $headers = []): ?string
{
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers),
            'timeout' => 6,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    return $raw === false ? null : $raw;
}

$cacheFile = sys_get_temp_dir() . '/cesa_tipo_cambio.json';
if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < 1800) {
    $cached = json_decode((string) @file_get_contents($cacheFile), true);
    if (is_array($cached) && isset($cached['tipo_cambio']) && $cached['tipo_cambio'] > 0) {
        tc_respond(200, ['success' => true, 'data' => $cached]);
    }
}

$tipoCambio = null;
$fecha = null;
$fuente = null;

$token = getenv('BANXICO_TOKEN') ?: '';
if ($token !== '') {
    $raw = tc_fetch(
        'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno?mediaType=json',
        ['Bmx-Token: ' . $token, 'Accept: application/json']
    );
    $json = $raw === null ? null : json_decode($raw, true);
    $dato = $json['bmx']['series'][0]['datos'][0] ?? null;
    if (is_array($dato) && isset($dato['dato'])) {
        $valor = (float) str_replace(',', '', (string) $dato['dato']);
        if ($valor > 0) {
            $tipoCambio = $valor;
            $fecha = $dato['fecha'] ?? null;
            $fuente = 'banxico';
        }
    }
}

if ($tipoCambio === null) {
    $raw = tc_fetch('https://open.er-api.com/v6/latest/USD', ['Accept: application/json']);
    $json = $raw === null ? null : json_decode($raw, true);
    $valor = (float) ($json['rates']['MXN'] ?? 0);
    if ($valor > 0) {
        $tipoCambio = $valor;
        $fecha = $json['time_last_update_utc'] ?? null;
        $fuente = 'alternativa';
    }
}

if ($tipoCambio === null) {
    tc_respond(502, [
        'success' => false,
        'error' => 'No se pudo obtener el tipo de cambio. Ingreselo manualmente.',
    ]);
}

$data = [
    'tipo_cambio' => round($tipoCambio, 4),
    'fecha' => $fecha,
    'fuente' => $fuente,
];

@file_put_contents($cacheFile, json_encode($data));

tc_respond(200, ['success' => true, 'data' => $data]);
