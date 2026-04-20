<?php
/**
 * RateLimiter - Control de peticiones preventivo v3.5
 * Archivo: /backend/lib/RateLimiter.php
 */

class RateLimiter {
    private $storage_dir;
    
    public function __construct() {
        $this->storage_dir = __DIR__ . '/../../storage/rate_limits';
        if (!is_dir($this->storage_dir)) {
            mkdir($this->storage_dir, 0777, true);
        }
    }
    
    public function check(string $key, int $limit, int $window): bool {
        $file = $this->storage_dir . '/' . md5($key) . '.json';
        $now = time();
        $data = [];
        
        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true) ?: [];
        }
        
        // Limpiar expirados
        $data = array_filter($data, function($t) use ($now, $window) {
            return ($now - $t) < $window;
        });
        
        if (count($data) >= $limit) {
            return false;
        }
        
        $data[] = $now;
        file_put_contents($file, json_encode($data));
        return true;
    }
}
