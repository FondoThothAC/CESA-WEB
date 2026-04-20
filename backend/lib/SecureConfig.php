<?php
/**
 * SecureConfig - Helper para cifrado de configuraciones sensibles v3.1
 * Archivo: /backend/lib/SecureConfig.php
 */

class SecureConfig {
    private static $cipher = 'aes-256-cbc';
    private static $key;
    
    /**
     * Inicializa la llave de cifrado a partir del APP_SECRET
     */
    public static function init(): void {
        $secret = getenv('JWT_SECRET') ?: 'cesa_default_fallback_secret_2026';
        self::$key = hash('sha256', $secret, true);
    }
    
    /**
     * Cifra un texto plano
     */
    public static function encrypt(string $plaintext): string {
        if (!self::$key) self::init();
        
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($plaintext, self::$cipher, self::$key, OPENSSL_RAW_DATA, $iv);
        // Retornamos IV + Datos cifrados en base64
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * Descifra un texto cifrado
     */
    public static function decrypt(string $ciphertext): ?string {
        if (!self::$key) self::init();
        
        $data = base64_decode($ciphertext);
        if (strlen($data) < 16) return null;
        
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        
        $decrypted = openssl_decrypt($encrypted, self::$cipher, self::$key, OPENSSL_RAW_DATA, $iv);
        return $decrypted ?: null;
    }
}
