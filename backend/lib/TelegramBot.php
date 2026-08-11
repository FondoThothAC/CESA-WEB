<?php
/**
 * Telegram Bot Helper (ZeroClaw) - CESA WEB
 * Archivo: /backend/lib/TelegramBot.php
 */

declare(strict_types=1);

class TelegramBot {
    private string $token;
    private string $apiUrl;

    public function __construct(string $token = '') {
        // Cargar variables de entorno si no están cargadas
        if (!getenv('TELEGRAM_BOT_TOKEN')) {
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
        $this->token = $token ?: getenv('TELEGRAM_BOT_TOKEN');
        $this->apiUrl = "https://api.telegram.org/bot{$this->token}/";
    }

    public function sendMessage(string $chatId, string $text, array $replyMarkup = null): ?array {
        $data = [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML'
        ];

        if ($replyMarkup) {
            $data['reply_markup'] = json_encode($replyMarkup);
        }

        return $this->request('sendMessage', $data);
    }

    private function request(string $method, array $data): ?array {
        if (empty($this->token)) {
            error_log("TelegramBot Error: No token configured");
            return null;
        }

        $url = $this->apiUrl . $method;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            error_log("TelegramBot Curl Error: " . $error);
            return null;
        }

        return json_decode($response, true);
    }
}
