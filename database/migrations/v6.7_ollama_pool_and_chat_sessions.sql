-- ==========================================================
-- CESA WEB - Migration v6.7: Ollama Multi-Key Pool & Persistencia de Sesiones de Chat IA
-- ==========================================================

USE cesa_web;

-- 1. Tabla de Sesiones del Chat IA (para persistencia, Inbox y compresión en Markdown)
CREATE TABLE IF NOT EXISTS `ia_chat_sesiones` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT UNSIGNED NOT NULL,
    `titulo` VARCHAR(200) DEFAULT 'Conversación con Asistente BOB',
    `resumen_contexto_md` LONGTEXT NULL COMMENT 'Resumen comprimido en Markdown del contexto anterior cuando se llena el hilo',
    `mensajes_count` INT UNSIGNED DEFAULT 0,
    `ultimo_sentimiento` VARCHAR(50) DEFAULT 'neutro',
    `ultimo_score` INT DEFAULT 50,
    `activo` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    INDEX `idx_usuario_activo` (`usuario_id`, `activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Mensajes del Chat de la IA
CREATE TABLE IF NOT EXISTS `ia_chat_mensajes` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `sesion_id` INT UNSIGNED NOT NULL,
    `usuario_id` INT UNSIGNED NOT NULL,
    `emisor` ENUM('usuario', 'asistente', 'sistema') NOT NULL,
    `contenido` TEXT NOT NULL,
    `sentimiento_score` INT DEFAULT 50,
    `sentimiento_categoria` VARCHAR(50) DEFAULT 'neutro',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`sesion_id`) REFERENCES `ia_chat_sesiones`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    INDEX `idx_sesion_fecha` (`sesion_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Agregar columna de sentimiento a chatbot_historial
ALTER TABLE `chatbot_historial`
ADD COLUMN IF NOT EXISTS `sentimiento_score` INT DEFAULT 50 AFTER `accion_detectada`,
ADD COLUMN IF NOT EXISTS `sentimiento_categoria` VARCHAR(50) DEFAULT 'neutro' AFTER `sentimiento_score`;
