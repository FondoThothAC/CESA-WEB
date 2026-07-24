<?php
/**
 * Auth Library - CESA WEB v3.6
 * Centraliza la gestión de sesiones y roles
 */

require_once __DIR__ . '/JWTHelper.php';
require_once __DIR__ . '/../config/database.php';

class Auth {
    private ?array $currentUser = null;

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
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? ($_COOKIE['cesa_jwt'] ?? ($_SESSION['token'] ?? null));

        if ($token) {
            // Limpiar Bearer si existe
            if (preg_match('/Bearer\s(\S+)/', $token, $matches)) {
                $token = $matches[1];
            }

            $decoded = JWTHelper::verify($token);
            if ($decoded) {
                // Forzar rol admin si es correo Master o Admin especial
                if (($decoded['email'] ?? '') === 'software@fondothoth.com' || ($decoded['email'] ?? '') === 'a213203453@unison.mx') {
                    $decoded['rol'] = 'admin';
                }
                $this->currentUser = $decoded;
                // Sincronizar con sesión PHP por si se usa en otros scripts
                $_SESSION['user_id'] = $decoded['id'];
                $_SESSION['rol'] = $decoded['rol'];
                $_SESSION['nombre'] = $decoded['nombre'] ?? '';
            }
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
        
        // El master admin de fondothoth y el admin principal unison siempre se consideran admin
        if (($this->currentUser['email'] ?? '') === 'software@fondothoth.com' || ($this->currentUser['email'] ?? '') === 'a213203453@unison.mx') {
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
        
        // El master admin de fondothoth y el admin principal unison siempre tienen todos los permisos
        if (($this->currentUser['email'] ?? '') === 'software@fondothoth.com' || ($this->currentUser['email'] ?? '') === 'a213203453@unison.mx') {
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

