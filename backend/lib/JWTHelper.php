<?php
/**
 * JWTHelper - Lightweight JWT for PHP (No dependencies)
 * Archivo: /backend/lib/JWTHelper.php
 */

class JWTHelper {
    private static ?string $secret = null;

    private static function getSecret(): string {
        if (self::$secret === null) {
            $secret = getenv('JWT_SECRET');
            if (!$secret || strlen($secret) < 32) {
                throw new RuntimeException('JWT_SECRET no está configurada o es demasiado corta (mínimo 32 caracteres).');
            }
            self::$secret = $secret;
        }
        return self::$secret;
    }

    public static function create(array $payload, int $expiry = 2592000): string {
        $secret = self::getSecret();
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['exp'] = time() + $expiry;
        $payload_json = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload_json);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function verify(string $jwt): ?array {
        try {
            $secret = self::getSecret();
        } catch (RuntimeException $e) {
            return null;
        }

        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) return null;

        $header = $tokenParts[0];
        $payload = $tokenParts[1];
        $signatureProvided = $tokenParts[2];

        $signature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if (!hash_equals($base64UrlSignature, $signatureProvided)) return null;

        $payload_data = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($payload_data) || (($payload_data['exp'] ?? 0) < time())) return null; // Expirado o inválido

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
