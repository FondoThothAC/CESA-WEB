-- =============================================
-- MIGRACIÓN v5.4: Votaciones, Noticias y Padrón
-- =============================================

-- 1. Tabla de Noticias (Comunicados)
CREATE TABLE IF NOT EXISTS noticias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    imagen_path VARCHAR(255) NULL,
    autor_id INT UNSIGNED NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_activo (activo),
    INDEX idx_fecha (fecha_publicacion)
) ENGINE=InnoDB;

-- 2. Tabla Padrón Electoral (Estudiantes Activos)
-- Esta tabla se limpia y se recarga cada semestre mediante CSV
CREATE TABLE IF NOT EXISTS estudiantes_activos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expediente VARCHAR(50) NOT NULL,
    carrera VARCHAR(150) NOT NULL,
    semestre VARCHAR(20) NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_expediente (expediente),
    INDEX idx_carrera (carrera)
) ENGINE=InnoDB;

-- 3. Tabla de Votaciones (Elecciones)
CREATE TABLE IF NOT EXISTS votaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    carrera_objetivo VARCHAR(150) NULL, -- Si es NULL, es para todas las carreras (General)
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado ENUM('borrador', 'activa', 'finalizada', 'cancelada') DEFAULT 'borrador',
    require_ip_whitelist BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_carrera_obj (carrera_objetivo)
) ENGINE=InnoDB;

-- 4. Candidatos de la Votación
CREATE TABLE IF NOT EXISTS votacion_candidatos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    votacion_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    foto_path VARCHAR(255) NULL,
    votos_recibidos INT UNSIGNED DEFAULT 0, -- Caché para lecturas rápidas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (votacion_id) REFERENCES votaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Votos Anónimos (Secreto pero auditable)
-- Para garantizar el secreto, NO almacenamos el ID del usuario ni el expediente.
-- En su lugar, almacenamos un HASH(expediente + votacion_id + SALT_SECRETO).
-- Así sabemos que un expediente votó sin saber por quién, y este hash es único,
-- impidiendo que el mismo hash se inserte dos veces gracias al UNIQUE constraint.
CREATE TABLE IF NOT EXISTS votos_anonimos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    votacion_id INT UNSIGNED NOT NULL,
    candidato_id INT UNSIGNED NOT NULL,
    voto_hash VARCHAR(128) NOT NULL, -- SHA-512 del (expediente + id + salt)
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (votacion_id) REFERENCES votaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (candidato_id) REFERENCES votacion_candidatos(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_voto_unico (votacion_id, voto_hash),
    INDEX idx_candidato (candidato_id)
) ENGINE=InnoDB;

-- 6. Agregar permiso granular para Comunicación en admin_permisos
SET @dbname = DATABASE();
SET @tablename = 'admin_permisos';
SET @columnname = 'rol_comunicacion';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " BOOLEAN DEFAULT FALSE AFTER ver_denuncias;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Actualizamos a los Super Admins para que tengan el rol de comunicación
UPDATE admin_permisos ap
JOIN usuarios u ON ap.usuario_id = u.id
SET ap.rol_comunicacion = 1
WHERE u.email = 'software@fondothoth.com';
