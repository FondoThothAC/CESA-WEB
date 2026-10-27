<?php
/**
 * Auth Library - CESA WEB v3.6
 * Centraliza la gestión de sesiones y roles
 */

require_once __DIR__ . '/JWTHelper.php';
require_once __DIR__ . '/../config/database.php';

class Auth {
    private ?array $currentUser = null;

    /**
     * Determina si un correo tiene privilegios de Master Admin.
     * La lista se configura vía variable de entorno ADMIN_MASTER_EMAILS (separada por comas).
     */
    public static function isMasterEmail(?string $email): bool {
        if (!$email) return false;
        $email = strtolower(trim($email));
        $raw = getenv('ADMIN_MASTER_EMAILS');
        if ($raw !== false && trim($raw) !== '') {
            $masters = array_map('trim', explode(',', strtolower($raw)));
        } else {
            // Fallback temporal hasta definir ADMIN_MASTER_EMAILS en el entorno
            $masters = ['software@fondothoth.com', 'a213203453@unison.mx'];
        }
        return in_array($email, $masters, true);
    }

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->verifyAuth();
    }

    /**
     * Verifica la autenticidad del token o sesión
     */
    private function verifyAuth(): void {
        // Intentar obtener token de Header, Cookie o Sesión
        $allHeaders = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
        $token = $allHeaders['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ($_COOKIE['cesa_jwt'] ?? ($_SESSION['token'] ?? null));

        if ($token) {
            // Limpiar Bearer si existe
            if (preg_match('/Bearer\s(\S+)/', $token, $matches)) {
                $token = $matches[1];
            }

            $decoded = JWTHelper::verify($token);
            if ($decoded) {
                // Forzar rol admin si es correo Master
                if (self::isMasterEmail($decoded['email'] ?? null)) {
                    $decoded['rol'] = 'admin';
                }
                $this->currentUser = $decoded;
                // Sincronizar con sesión PHP por si se usa en otros scripts
                $_SESSION['user_id'] = $decoded['id'];
                $_SESSION['rol'] = $decoded['rol'];
                $_SESSION['nombre'] = $decoded['nombre'] ?? '';

                // Renovación deslizante: si al token le quedan < 7 días,
                // re-emitir cookie + token para mantener la sesión activa sin re-login.
                $this->slidingRenewal($token, $decoded);
            }
        }

        // Respaldo de sesión nativa si no hay token Bearer activo
        if (!$this->currentUser && isset($_SESSION['user_id'])) {
            $this->currentUser = [
                'id' => (int)$_SESSION['user_id'],
                'email' => $_SESSION['email'] ?? '',
                'rol' => $_SESSION['rol'] ?? 'estudiante',
                'nombre' => $_SESSION['nombre'] ?? ''
            ];
        }
    }

    /**
     * Renovación deslizante de sesión.
     * Si el JWT vigente tiene menos de RENEW_WINDOW segundos de vida restante,
     * emite un token nuevo (30 días) y refresca la cookie cesa_jwt.
     * El token fresco viaja en el header X-Token-Renewed para que el
     * frontend (Next.js) actualice su localStorage.
     */
    private function slidingRenewal(string $currentToken, array $decoded): void {
        // Solo renovar si la petición NO viene con Bearer del frontend Next.js
        // (esa vía se renueva vía cookie igualmente; el header avisa a ambos).
        $allHeaders = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
        $isBearer = isset($allHeaders['authorization']) || isset($_SERVER['HTTP_AUTHORIZATION']);

        $renewWindow = 7 * 24 * 3600; // 7 días antes de expirar
        if (($decoded['exp'] ?? 0) - time() > $renewWindow) {
            return; // Token aún fresco
        }

        // Re-emitir manteniendo el payload, expiración nueva a 30 días
        unset($decoded['exp'], $decoded['iat'], $decoded['nbf']);
        $newToken = JWTHelper::create($decoded);

        // Cookie de 30 días, alineada con la vida del JWT (fix del bug de 7 días)
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $cookie_domain = '';
        if (preg_match('/\.([a-z0-9\-]+\.[a-z]{2,})$/i', explode(':', $host)[0], $m)) {
            $cookie_domain = '.' . $m[1];
        }
        $is_secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';

        setcookie('cesa_jwt', $newToken, [
            'expires' => time() + 3600 * 24 * 30,
            'path' => '/',
            'domain' => $cookie_domain,
            'secure' => $is_secure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        $_SESSION['token'] = $newToken;

        // Avisar al frontend el token renovado (para sincronizar localStorage)
        header('X-Token-Renewed: ' . $newToken);
        if ($isBearer) {
            // El frontend guarda el nuevo token si su interceptor lo detecta
            header('Access-Control-Expose-Headers: X-Token-Renewed');
        }
    }

    public function isLoggedIn(): bool {
        return $this->currentUser !== null;
    }

    public function getUser(): ?array {
        return $this->currentUser;
    }

    public function getUserId(): ?int {
        return $this->currentUser['id'] ?? null;
    }

    public function hasRole(string $role): bool {
        if (!$this->isLoggedIn()) return false;

        // El master admin siempre tiene todos los roles
        if (self::isMasterEmail($this->currentUser['email'] ?? null)) {
            return true;
        }
        
        // Roles por jerarquía o exactos
        if ($this->currentUser['rol'] === 'admin') return true; // Admin puede todo
        
        if ($role === 'mesa_directiva' && $this->currentUser['rol'] === 'mesa_directiva') return true;
        if ($role === 'sociedad' && ($this->currentUser['rol'] === 'sociedad' || $this->currentUser['rol'] === 'mesa_directiva')) return true;
        
        return $this->currentUser['rol'] === $role;
    }

    /**
     * Verifica permisos granulares de administrador.
     * El correo software@fondothoth.com siempre tiene acceso completo (Modo Dios).
     */
    public function hasPermission(string $permission): bool {
        if (!$this->isLoggedIn()) return false;

        // El master admin siempre tiene todos los permisos
        if (self::isMasterEmail($this->currentUser['email'] ?? null)) {
            return true;
        }
        
        // Si no es admin ni mesa_directiva, no tiene ningún permiso administrativo
        if ($this->currentUser['rol'] !== 'admin' && $this->currentUser['rol'] !== 'mesa_directiva') {
            return false;
        }

        try {
            $pdo = getDBConnection();
            $stmt = $pdo->prepare("SELECT * FROM admin_permisos WHERE usuario_id = ?");
            $stmt->execute([$this->currentUser['id']]);
            $perms = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$perms) {
                // Por defecto, si no hay registro específico de permisos granulares,
                // asumimos privilegios mínimos (false) para administradores estándar.
                return false;
            }
            
            return isset($perms[$permission]) && (bool)$perms[$permission];
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Helper estático para obtener el usuario autenticado de forma rápida
     */
    public static function getAuthenticatedUser(): ?array {
        $auth = new self();
        return $auth->getUser();
    }

    public function logout(): void {
        $this->currentUser = null;
        unset($_SESSION['user_id'], $_SESSION['rol'], $_SESSION['nombre'], $_SESSION['token']);
        
        $cookie_domain = '';
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $clean_host = explode(':', $host)[0];
        if (!filter_var($clean_host, FILTER_VALIDATE_IP) && $clean_host !== 'localhost') {
            if (preg_match('/([a-z0-9\-]+\.[a-z0-9\-]+)$/i', $clean_host, $matches)) {
                $cookie_domain = '.' . $matches[1];
            }
        }
        
        setcookie('cesa_jwt', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'domain' => $cookie_domain,
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'samesite' => 'Lax'
        ]);
    }
}

