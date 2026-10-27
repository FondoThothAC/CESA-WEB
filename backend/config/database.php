<?php
/**
 * Database Connection - CESA WEB v3.5
 * Archivo: /backend/config/database.php
 * Provee una instancia única de PDO conectada a MariaDB
 */

// Cargar variables de entorno si no están cargadas
if (!getenv('DB_HOST')) {
    $envPath = __DIR__ . '/../.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . "=" . trim($value));
        }
    }
}

function getDBConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host = getenv('DB_HOST') ?: '';
        $db   = getenv('DB_NAME') ?: '';
        $user = getenv('DB_USER') ?: '';
        $pass = getenv('DB_PASS') ?: '';

        if ($host === '' || $db === '' || $user === '') {
            throw new RuntimeException('Configuración de base de datos incompleta: revisa DB_HOST, DB_NAME y DB_USER');
        }
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => getenv('CESA_DB_EMULATE_PREPARES') === '1',
        ];

        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
        } catch (\PDOException $e) {
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
    }
    return $pdo;
}
