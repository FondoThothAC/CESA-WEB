<?php
/**
 * AdminHelper v1.0 - CESA WEB Industrialized
 * Centralización de logs y utilidades administrativas
 */
declare(strict_types=1);

class AdminHelper {
    
    /**
     * Registra una acción administrativa en la base de datos
     * @param PDO $pdo Instancia de base de datos
     * @param int $usuario_id ID del administrador/coordinador
     * @param string $accion Nombre corto de la acción (e.g. 'bazar_aprobado')
     * @param string $descripcion Detalle legible de la acción
     * @param array $metadata Datos adicionales en formato JSON
     */
    public static function logAction(PDO $pdo, int $usuario_id, string $accion, string $descripcion, array $metadata = []): bool {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO admin_logs (usuario_id, accion, descripcion, metadata, ip_address)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            
            return $stmt->execute([
                $usuario_id,
                $accion,
                $descripcion,
                json_encode($metadata),
                $ip
            ]);
        } catch (Exception $e) {
            // No bloqueamos la ejecución si falla el log, pero lo reportamos al error log del server
            error_log("[ADMIN HELPER] Error recording log: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica si el usuario actual tiene privilegios para una acción
     * @param array $user Data del usuario de sesión
     * @param array $allowedRoles Roles permitidos
     */
    public static function checkAccess(array $user, array $allowedRoles = ['admin', 'mesa_directiva']): void {
        if (!in_array($user['rol'], $allowedRoles)) {
            header('Content-Type: application/json');
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No tienes permisos suficientes para esta operación']);
            exit;
        }
    }
}
