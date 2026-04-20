<?php
/**
 * Production Config Initializer - CESA WEB v3.5
 * Archivo: /backend/scripts/init_prod_config.php
 * Uso: php init_prod_config.php
 */

require_once __DIR__ . '/../lib/SecureConfig.php';
require_once __DIR__ . '/../config/database.php';

echo "🚀 CESA WEB - Inicializador de Configuraciones de IA\n";
echo "====================================================\n";

try {
    $pdo = new PDO("mysql:host=".getenv('DB_HOST').";dbname=".getenv('DB_NAME'), getenv('DB_USER'), getenv('DB_PASS'));
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Configuración de Groq (Prioridad 1)
    echo "1. Ingresa tu API Key de GROQ (deja vacío para omitir): ";
    $groq_key = trim(fgets(STDIN));
    if ($groq_key) {
        $encrypted = SecureConfig::encrypt($groq_key);
        $stmt = $pdo->prepare("INSERT INTO api_configs (provider, model_name, api_key_encrypted, priority) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE api_key_encrypted = VALUES(api_key_encrypted)");
        $stmt->execute(['groq', 'llama-3.1-70b-versatile', $encrypted, 1]);
        echo "✅ Groq configurado.\n";
    }

    // 2. Configuración de Gemini (Prioridad 2)
    echo "2. Ingresa tu API Key de GEMINI (deja vacío para omitir): ";
    $gemini_key = trim(fgets(STDIN));
    if ($gemini_key) {
        $encrypted = SecureConfig::encrypt($gemini_key);
        $stmt = $pdo->prepare("INSERT INTO api_configs (provider, model_name, api_key_encrypted, priority) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE api_key_encrypted = VALUES(api_key_encrypted)");
        $stmt->execute(['gemini', 'gemini-1.5-flash', $encrypted, 2]);
        echo "✅ Gemini configurado.\n";
    }

    // 3. Crear primer Admin si no existe
    $admin_check = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE rol = 'admin'")->fetchColumn();
    if ($admin_check == 0) {
        echo "3. No hay administradores. Creando cuenta root@unison.mx...\n";
        $pass = "admin123";
        $hashed = password_hash($pass, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Administrador CESA', 'root@unison.mx', $hashed, 'admin']);
        echo "✅ Admin creado (root@unison.mx / $pass). ¡CÁMBIALA DE INMEDIATO!\n";
    }

    echo "====================================================\n";
    echo "🎉 Configuración inicial completada.\n";
    echo "⚠️ ELIMINA ESTE ARCHIVO DEL SERVIDOR POR SEGURIDAD.\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
