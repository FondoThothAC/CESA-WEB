<?php
/**
 * CarnetService - CESA WEB v4.0
 * Gestiona la generación y validación de firmas para carnets digitales.
 */
class CarnetService {
    private static $secret_key;

    /**
     * Inicializa la llave secreta desde el entorno
     */
    private static function init() {
        if (!self::$secret_key) {
            self::$secret_key = getenv('APP_SECRET_KEY') ?: 'cesa_industrial_sec_2026';
        }
    }

    /**
     * Genera un payload firmado para el QR del carnet
     * Formato: base64(json({uid, exp, ts, sig}))
     * @param int $userId ID del usuario
     * @param int $validitySeconds Tiempo de validez del token (default 10 min)
     * @return string Payload en base64
     */
    public static function generateSecurePayload(int $userId, int $validitySeconds = 600): string {
        self::init();
        
        $ts = time();
        $exp = $ts + $validitySeconds;
        
        // Payload intermedio para la firma
        $payload_to_sign = $userId . '|' . $exp . '|' . $ts;
        
        // Generar firma HMAC-SHA256 truncada para brevedad en QR
        $full_sig = hash_hmac('sha256', $payload_to_sign, self::$secret_key);
        $short_sig = substr($full_sig, 0, 16);
        
        // Estructura final
        $data = [
            'uid' => $userId,
            'exp' => $exp,
            'ts'  => $ts,
            'sig' => $short_sig
        ];
        
        return base64_encode(json_encode($data));
    }

    /**
     * Verifica si un payload de carnet es válido
     * (Usado principalmente para pruebas locales o redundancia de acceso.php)
     */
    public static function validatePayload(string $base64Payload): ?array {
        self::init();
        
        $decoded = json_decode(base64_decode($base64Payload), true);
        if (!$decoded) return null;

        $uid = $decoded['uid'];
        $exp = $decoded['exp'];
        $ts  = $decoded['ts'];
        $sig = $decoded['sig'];

        // Verificar expiración
        if (time() > $exp) return null;

        // Re-verificar firma
        $payload_to_sign = $uid . '|' . $exp . '|' . $ts;
        $expected_sig = substr(hash_hmac('sha256', $payload_to_sign, self::$secret_key), 0, 16);

        if ($expected_sig !== $sig) return null;

        return $decoded;
    }
}
