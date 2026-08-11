<?php
/**
 * MailHelper - Motor de Correos Transaccionales v3.5
 * Archivo: /backend/lib/MailHelper.php
 */

class MailHelper {
    public static function send(string $to, string $subject, string $body, array $attachments = []): bool {
        $host = getenv('SMTP_HOST');
        $from = getenv('SMTP_FROM') ?: 'no-reply@cesaunison.fondothoth.com';
        $fromName = getenv('SMTP_NAME') ?: 'CESA UNISON';

        // En entornos de desarrollo, solo logueamos el correo
        if (getenv('APP_ENV') === 'development') {
            $logDir = __DIR__ . '/../storage/mail_logs';
            if (!is_dir($logDir)) mkdir($logDir, 0777, true);
            $logFile = $logDir . '/' . time() . '_' . md5($to) . '.html';
            file_put_contents($logFile, "TO: $to\nSUBJECT: $subject\n\n$body");
            return true;
        }

        $headers[] = 'MIME-Version: 1.0';
        $headers[] = "From: $fromName <$from>";
        $headers[] = "Reply-To: $from";
        if (!$attachments) {
            $headers[] = 'Content-type: text/html; charset=utf-8';
            return mail($to, $subject, self::wrapTemplate($subject, $body), implode("\r\n", $headers));
        }
        $boundary = '=_CESA_' . md5(uniqid('', true));
        $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';
        $message = '--' . $boundary . "\r\nContent-Type: text/html; charset=utf-8\r\n\r\n" . self::wrapTemplate($subject, $body) . "\r\n";
        foreach ($attachments as $attachment) {
            $path = $attachment['path'] ?? '';
            if (!$path || !is_readable($path)) continue;
            $name = basename($attachment['name'] ?? basename($path));
            $type = $attachment['type'] ?? 'application/octet-stream';
            $message .= '--' . $boundary . "\r\nContent-Type: $type; name=\"$name\"\r\nContent-Disposition: attachment; filename=\"$name\"\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode((string)file_get_contents($path))) . "\r\n";
        }
        return mail($to, $subject, $message . '--' . $boundary . "--\r\n", implode("\r\n", $headers));
    }

    private static function wrapTemplate(string $title, string $content): string {
        return "
        <html>
        <body style='font-family: sans-serif; color: #333; line-height: 1.6;'>
            <div style='max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;'>
                <div style='background: #4f46e5; color: #fff; padding: 20px; text-align: center;'>
                    <h1 style='margin: 0;'>$title</h1>
                </div>
                <div style='padding: 30px;'>
                    $content
                </div>
                <div style='background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666;'>
                    Este es un correo institucional del CESA UNISON.<br>
                    &copy; 2026 Fondo Thoth AC. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        ";
    }

    public static function sendInvitation(string $to, string $name, string $tempPassword): bool {
        $subject = "Bienvenido al ecosistema CESA WEB";
        $body = "
            <h2>Hola, $name 👋</h2>
            <p>Has sido invitado a formar parte de la plataforma institucional del CESA.</p>
            <p>Tus credenciales temporales son:</p>
            <div style='background: #f3f4f6; padding: 15px; border-radius: 5px; font-family: monospace;'>
                <strong>Correo:</strong> $to<br>
                <strong>Contraseña:</strong> $tempPassword
            </div>
            <p>Puedes iniciar sesión aquí:</p>
            <a href='https://cesaunison.fondothoth.com/login' style='display: inline-block; background: #4f46e5; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 20px;'>Acceder a la Plataforma</a>
            <p style='margin-top: 20px; font-size: 12px; color: #999;'>Por seguridad, se te pedirá cambiar tu contraseña al primer ingreso.</p>
        ";
        return self::send($to, $subject, $body);
    }
}
