<?php
/**
 * MailHelper - Motor de Correos Transaccionales v3.5
 * Archivo: /backend/lib/MailHelper.php
 */

class MailHelper {
    public static function send(string $to, string $subject, string $body, array $attachments = []): bool {
        $host = getenv('SMTP_HOST');
        $from = getenv('SMTP_FROM') ?: 'no-reply@cesa.unison.mx';
        $fromName = getenv('SMTP_NAME') ?: 'CESA UNISON';

        // En entornos de desarrollo, solo logueamos el correo
        if (getenv('APP_ENV') === 'development') {
            $logDir = __DIR__ . '/../storage/mail_logs';
            if (!is_dir($logDir)) mkdir($logDir, 0777, true);
            $logFile = $logDir . '/' . time() . '_' . md5($to) . '.html';
            file_put_contents($logFile, "TO: $to\nSUBJECT: $subject\n\n$body");
            return true;
        }

        // Headers para HTML
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = "From: $fromName <$from>";
        $headers[] = "Reply-To: $from";

        // NOTA: Para producción real con SMTP autenticado, se recomienda PHPMailer.
        // Aquí usamos mail() como base para la infraestructura.
        return mail($to, $subject, self::wrapTemplate($subject, $body), implode("\r\n", $headers));
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
            <a href='https://cesa.unison.mx/login' style='display: inline-block; background: #4f46e5; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 20px;'>Acceder a la Plataforma</a>
            <p style='margin-top: 20px; font-size: 12px; color: #999;'>Por seguridad, se te pedirá cambiar tu contraseña al primer ingreso.</p>
        ";
        return self::send($to, $subject, $body);
    }
}
