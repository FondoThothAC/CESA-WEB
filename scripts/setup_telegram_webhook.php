<?php
/**
 * Setup Telegram Webhook - CESA WEB
 * Archivo: /scripts/setup_telegram_webhook.php
 * Ejecutar: php scripts/setup_telegram_webhook.php https://tu-dominio.com/api/zeroclaw_webhook.php
 */

if (php_sapi_name() !== 'cli') {
    exit('Este script solo puede ejecutarse en la linea de comandos.');
}

if ($argc < 2) {
    echo "Uso: php scripts/setup_telegram_webhook.php <URL_DEL_WEBHOOK>\n";
    echo "Ejemplo: php scripts/setup_telegram_webhook.php https://cesa.fondothoth.com/api/zeroclaw_webhook.php\n";
    exit(1);
}

$webhookUrl = $argv[1];

// Cargar token del .env
$envPath = __DIR__ . '/../backend/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . "=" . trim($value));
    }
}

$token = getenv('TELEGRAM_BOT_TOKEN');
if (!$token) {
    echo "Error: TELEGRAM_BOT_TOKEN no esta configurado en backend/.env\n";
    exit(1);
}

$secret = getenv('TELEGRAM_WEBHOOK_SECRET');

$apiUrl = "https://api.telegram.org/bot{$token}/setWebhook";

$data = [
    'url' => $webhookUrl
];

if ($secret) {
    $data['secret_token'] = $secret;
}

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$error = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($error) {
    echo "Error cURL: $error\n";
    exit(1);
}

if ($httpCode >= 200 && $httpCode < 300) {
    echo "Webhook configurado exitosamente a: $webhookUrl\n";
    echo "Respuesta de Telegram: $response\n";
} else {
    echo "Error configurando Webhook (HTTP $httpCode):\n";
    echo $response . "\n";
}
