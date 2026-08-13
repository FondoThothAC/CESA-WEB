-- ==============================================================================
-- MIGRACIÓN 007: TABLA DE SESIONES DEL MOTOR DE AGENTES IA
-- CESA UNISON — Base de datos: cesa_web
-- ==============================================================================
-- Esta tabla reemplaza la funcionalidad básica de `ia_chat_mensajes` con soporte
-- para múltiples canales (web, telegram, api), registro de herramientas usadas
-- y URLs de imágenes generadas por el agente.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `ia_agentes_sesiones` (
  `id`                BIGINT        UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id`        VARCHAR(36)   NOT NULL COMMENT 'UUID único de la sesión de conversación',
  `user_id`           BIGINT                 COMMENT 'ID del usuario autenticado (NULL si es anónimo)',
  `canal`             ENUM('web','telegram','api') NOT NULL DEFAULT 'web' COMMENT 'Canal de origen del mensaje',
  `rol`               ENUM('user','assistant','tool') NOT NULL COMMENT 'Quién envió el mensaje',
  `mensaje`           TEXT          NOT NULL COMMENT 'Contenido del mensaje',
  `herramientas_usadas` VARCHAR(255) DEFAULT '' COMMENT 'Lista CSV de herramientas ejecutadas en esta respuesta',
  `imagen_url`        TEXT                   COMMENT 'URL de imagen generada (si aplica)',
  `creado_en`         DATETIME      NOT NULL DEFAULT NOW() COMMENT 'Timestamp de creación',
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_user_id`    (`user_id`),
  KEY `idx_canal`      (`canal`),
  KEY `idx_creado_en`  (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Historial de sesiones y mensajes del Motor de Agentes Bob';

-- ==============================================================================
-- ÍNDICE COMPUESTO para recuperar historial paginado por sesión eficientemente
-- ==============================================================================
ALTER TABLE `ia_agentes_sesiones`
  ADD INDEX `idx_session_canal_fecha` (`session_id`, `canal`, `creado_en` DESC);
