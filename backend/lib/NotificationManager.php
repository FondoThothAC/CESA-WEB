<?php
/**
 * NotificationManager - Sistema de Notificaciones Unificado v3.5
 * Muro Social + Buzón de Reportes + IA
 * Archivo: /backend/lib/NotificationManager.php
 */

class NotificationManager {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Crear notificación para un usuario específico
     */
    public function createNotification(int $userId, string $type, string $title, string $message, ?string $url = null, ?string $icon = null): bool {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO notificaciones 
                (usuario_id, tipo, titulo, mensaje, url_action, icono)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            return $stmt->execute([$userId, $type, $title, $message, $url, $icon]);
        } catch (Exception $e) {
            error_log("Error creando notificación: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Crear notificación masiva para una lista de usuarios (ej: Mesa Directiva)
     */
    public function createBroadcastNotification(array $userIds, string $type, string $title, string $message, ?string $url = null): bool {
        try {
            if (empty($userIds)) return true;

            $this->pdo->beginTransaction();
            
            $stmt = $this->pdo->prepare("
                INSERT INTO notificaciones 
                (usuario_id, tipo, titulo, mensaje, url_action)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($userIds as $userId) {
                if ($userId) {
                    $stmt->execute([$userId, $type, $title, $message, $url]);
                }
            }
            
            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollback();
            }
            error_log("Error creando notificación masiva: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Marcar notificación como leída
     */
    public function markAsRead(int $notificationId, int $userId): bool {
        $stmt = $this->pdo->prepare("UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?");
        return $stmt->execute([$notificationId, $userId]);
    }

    /**
     * Obtener conteo de notificaciones no leídas
     */
    public function getUnreadCount(int $userId): int {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM notificaciones WHERE usuario_id = ? AND leida = 0");
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Obtener historial de notificaciones con paginación
     */
    public function getNotifications(int $userId, int $limit = 20, int $offset = 0): array {
        $stmt = $this->pdo->prepare("
            SELECT * FROM notificaciones 
            WHERE usuario_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
