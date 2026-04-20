<?php
/**
 * JWTHelper - Lightweight JWT for PHP (No dependencies)
 * Archivo: /backend/lib/JWTHelper.php
 */

class JWTHelper {
    private static $secret = 'cesa_secret_key_2026_2028'; // Cambiar en producción

    public static function create(array $payload, int $expiry = 3600): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['exp'] = time() + $expiry;
        $payload_json = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload_json);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function verify(string $jwt): ?array {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) return null;

        $header = $tokenParts[0];
        $payload = $tokenParts[1];
        $signatureProvided = $tokenParts[2];

        $signature = hash_hmac('sha256', $header . "." . $payload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if ($base64UrlSignature !== $signatureProvided) return null;

        $payload_data = json_decode(self::base64UrlDecode($payload), true);
        if (($payload_data['exp'] ?? 0) < time()) return null; // Expirado

        return $payload_data;
    }

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}
