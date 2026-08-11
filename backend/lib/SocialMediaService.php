<?php
/**
 * Servicio de Integración Social Media (Meta Graph API / Instagram / Facebook & X Twitter)
 * CESA WEB v7.5 - Gestión de Tokens, Feed Automático y Publicación Multicanal.
 */
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class SocialMediaService
{
    private PDO $pdo;
    private string $graphApiVersion = 'v19.0';
    private string $graphBaseUrl = 'https://graph.facebook.com';

    public function __construct(?PDO $pdo = null)
    {
        $this->pdo = $pdo ?? getDBConnection();
    }

    /**
     * Guarda o actualiza un Token de Red Social en la base de datos.
     */
    public function saveToken(string $plataforma, string $accountId, string $accessToken, ?string $refreshToken = null, ?string $expiresAt = null, ?string $accountName = null): bool
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO social_tokens (plataforma, account_id, account_name, access_token, refresh_token, expires_at, is_active)
            VALUES (:plataforma, :account_id, :account_name, :access_token, :refresh_token, :expires_at, 1)
            ON DUPLICATE KEY UPDATE
                account_name = VALUES(account_name),
                access_token = VALUES(access_token),
                refresh_token = COALESCE(VALUES(refresh_token), refresh_token),
                expires_at = VALUES(expires_at),
                is_active = 1,
                updated_at = CURRENT_TIMESTAMP
        ");

        return $stmt->execute([
            ':plataforma' => $plataforma,
            ':account_id' => $accountId,
            ':account_name' => $accountName,
            ':access_token' => $accessToken,
            ':refresh_token' => $refreshToken,
            ':expires_at' => $expiresAt
        ]);
    }

    /**
     * Obtiene el Token activo para una plataforma específica.
     */
    public function getActiveToken(string $plataforma): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM social_tokens 
            WHERE plataforma = :plataforma AND is_active = 1 
            ORDER BY updated_at DESC LIMIT 1
        ");
        $stmt->execute([':plataforma' => $plataforma]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    /**
     * Renueva un User Access Token de Meta a un Long-Lived Token (duración de 60 días)
     * o intercambia por un Page Access Token (Sin expiración / Never Expire).
     */
    public function exchangeMetaTokenForLongLived(string $shortToken, string $appId, string $appSecret): ?array
    {
        $url = "{$this->graphBaseUrl}/{$this->graphApiVersion}/oauth/access_token?" . http_build_query([
            'grant_type' => 'fb_exchange_token',
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'fb_exchange_token' => $shortToken
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        if (!$response) {
            return null;
        }

        $data = json_decode($response, true);
        if (isset($data['access_token'])) {
            $expiresIn = $data['expires_in'] ?? 5184000; // 60 días en segundos
            $expiresAt = date('Y-m-d H:i:s', time() + $expiresIn);
            return [
                'access_token' => $data['access_token'],
                'expires_at' => $expiresAt,
                'token_type' => $data['token_type'] ?? 'bearer'
            ];
        }

        return null;
    }

    /**
     * Sincroniza las publicaciones del perfil oficial de Instagram y las almacena en la tabla de caché.
     */
    public function syncInstagramFeed(string $igUserId, string $accessToken, int $limit = 15): array
    {
        $fields = 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,username';
        $url = "{$this->graphBaseUrl}/{$this->graphApiVersion}/{$igUserId}/media?" . http_build_query([
            'fields' => $fields,
            'limit' => $limit,
            'access_token' => $accessToken
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        if (!$response) {
            return ['success' => false, 'error' => 'Error de conexión con Meta Graph API'];
        }

        $data = json_decode($response, true);
        if (isset($data['error'])) {
            return ['success' => false, 'error' => $data['error']['message'] ?? 'Error desconocido'];
        }

        $postsSynced = 0;
        if (!empty($data['data'])) {
            $stmt = $this->pdo->prepare("
                INSERT INTO social_posts_cache (plataforma, post_external_id, autor, contenido, media_url, permalink, media_type, likes_count, comments_count, posted_at)
                VALUES ('instagram', :post_id, :autor, :contenido, :media_url, :permalink, :media_type, :likes_count, :comments_count, :posted_at)
                ON DUPLICATE KEY UPDATE
                    contenido = VALUES(contenido),
                    media_url = VALUES(media_url),
                    permalink = VALUES(permalink),
                    likes_count = VALUES(likes_count),
                    comments_count = VALUES(comments_count),
                    synced_at = CURRENT_TIMESTAMP
            ");

            foreach ($data['data'] as $item) {
                $postedAt = isset($item['timestamp']) ? date('Y-m-d H:i:s', strtotime($item['timestamp'])) : date('Y-m-d H:i:s');
                $stmt->execute([
                    ':post_id' => $item['id'],
                    ':autor' => $item['username'] ?? 'cesa_unison',
                    ':contenido' => $item['caption'] ?? '',
                    ':media_url' => $item['media_url'] ?? '',
                    ':permalink' => $item['permalink'] ?? '',
                    ':media_type' => $item['media_type'] ?? 'IMAGE',
                    ':likes_count' => (int)($item['like_count'] ?? 0),
                    ':comments_count' => (int)($item['comments_count'] ?? 0),
                    ':posted_at' => $postedAt
                ]);
                $postsSynced++;
            }
        }

        return ['success' => true, 'synced_count' => $postsSynced];
    }

    /**
     * Publica una imagen con leyenda en la cuenta oficial de Instagram.
     */
    public function publishToInstagram(string $igUserId, string $accessToken, string $imageUrl, string $caption): array
    {
        // Paso 1: Crear el contenedor del media
        $containerUrl = "{$this->graphBaseUrl}/{$this->graphApiVersion}/{$igUserId}/media";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $containerUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'image_url' => $imageUrl,
            'caption' => $caption,
            'access_token' => $accessToken
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $resContainer = curl_exec($ch);
        curl_close($ch);

        $containerData = json_decode($resContainer ?: '{}', true);
        if (!isset($containerData['id'])) {
            return ['success' => false, 'error' => $containerData['error']['message'] ?? 'Error al crear contenedor de media'];
        }

        $creationId = $containerData['id'];

        // Paso 2: Publicar el contenedor creado
        $publishUrl = "{$this->graphBaseUrl}/{$this->graphApiVersion}/{$igUserId}/media_publish";
        $ch2 = curl_init();
        curl_setopt($ch2, CURLOPT_URL, $publishUrl);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, http_build_query([
            'creation_id' => $creationId,
            'access_token' => $accessToken
        ]));
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        $resPublish = curl_exec($ch2);
        curl_close($ch2);

        $publishData = json_decode($resPublish ?: '{}', true);
        if (isset($publishData['id'])) {
            return ['success' => true, 'post_id' => $publishData['id']];
        }

        return ['success' => false, 'error' => $publishData['error']['message'] ?? 'Error al publicar contenedor en Instagram'];
    }

    /**
     * Obtiene las publicaciones del feed social almacenadas en la base de datos de CESA-WEB.
     */
    public function getCachedPosts(string $plataforma = 'instagram', int $limit = 10): array
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM social_posts_cache 
            WHERE plataforma = :plataforma 
            ORDER BY posted_at DESC LIMIT :limit
        ");
        $stmt->bindValue(':plataforma', $plataforma, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
