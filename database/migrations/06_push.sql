-- =============================================
-- TABLAS PARA NOTIFICACIONES PUSH
-- =============================================

-- 1. Tokens de dispositivos (para Web Push)
CREATE TABLE IF NOT EXISTS push_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL, -- Clave pública
    auth VARCHAR(255) NOT NULL,   -- Clave de autenticación
    user_agent TEXT,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_activo (activo),
    UNIQUE INDEX idx_endpoint (endpoint(255))
);

-- 2. Plantillas de notificaciones (para reutilizar)
CREATE TABLE IF NOT EXISTS notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    cuerpo TEXT NOT NULL,
    icono VARCHAR(255) DEFAULT '/assets/icons/icon-192.png',
    url VARCHAR(500) DEFAULT '/',
    categoria ENUM('general', 'bolsa_trabajo', 'bazar', 'skills', 'eventos', 'urgente') NOT NULL DEFAULT 'general',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Registro de notificaciones enviadas
CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED,
    titulo VARCHAR(200) NOT NULL,
    cuerpo TEXT NOT NULL,
    icono VARCHAR(255),
    url VARCHAR(500),
    categoria VARCHAR(50) DEFAULT 'general',
    leida BOOLEAN DEFAULT FALSE,
    leida_at DATETIME,
    metodo ENUM('push', 'email', 'sms') DEFAULT 'push',
    status ENUM('pendiente', 'enviada', 'fallida', 'expirada') DEFAULT 'pendiente',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_leida (leida),
    INDEX idx_categoria (categoria),
    INDEX idx_created (created_at)
);

-- 4. Suscripciones por categoría (preferencias de usuario)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_user_cat (usuario_id, categoria)
);

-- 5. Insertar plantillas predefinidas
INSERT IGNORE INTO notification_templates (id, nombre, titulo, cuerpo, icono, url, categoria) VALUES
(1, 'Nueva Vacante', '🎯 Nueva vacante disponible', 'Hay una nueva oportunidad laboral que puede interesarte. ¡Checa los detalles!', '/assets/icons/jobs.png', '/screens/bazar.php?tab=vacantes', 'bolsa_trabajo'),
(2, 'Negocio Verificado', '✅ Tu negocio fue verificado', '¡Buenas noticias! Tu negocio en el Bazar ya está verificado y visible para todos.', '/assets/icons/store.png', '/screens/bazar.php', 'bazar'),
(3, 'Certificado Listo', '🏆 Nuevo certificado obtenido', '¡Felicidades! Has completado exitosamente la evaluación. Descarga tu certificado.', '/assets/icons/cert.png', '/screens/skills.php', 'skills'),
(4, 'Evento CESA', '📅 Nuevo evento del CESA', 'Se ha publicado un nuevo evento. No te lo pierdas.', '/assets/icons/event.png', '/screens/eventos.php', 'eventos'),
(5, 'Aviso Importante', '⚠️ Aviso de la Mesa Directiva', 'La Mesa Directiva tiene un mensaje importante para ti.', '/assets/icons/alert.png', '/', 'urgente');

-- =============================================
-- ACTUALIZAR TABLA USUARIOS PARA PUSH
-- =============================================
SET @dbname = DATABASE();
SET @tablename = 'usuarios';
SET @columnname = 'push_enabled';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " BOOLEAN DEFAULT FALSE;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'email_notifications';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " BOOLEAN DEFAULT TRUE;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'last_push_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " DATETIME NULL;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
