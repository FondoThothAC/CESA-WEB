-- CESA SQL MIGRATION v3.6 (CORREGIDO)
-- GOBERNANZA ADMINISTRATIVA Y BOLSA DE TRABAJO

USE cesa_web;

-- 1. Tabla de Empresas (Requerida para Vacantes)
CREATE TABLE IF NOT EXISTS empresas (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    descripcion TEXT,
    logo_path VARCHAR(255),
    sitio_web VARCHAR(255),
    verificada TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla de Vacantes (Requerida para Postulaciones)
CREATE TABLE IF NOT EXISTS vacantes (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT(10) UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    requisitos TEXT,
    modalidad ENUM('presencial', 'remoto', 'hibrido') DEFAULT 'presencial',
    activo TINYINT(1) DEFAULT 1,
    verificado TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabla para monitorear el rendimiento de las APIs de IA
CREATE TABLE IF NOT EXISTS api_stats (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    latency_ms INT DEFAULT 0,
    status_code INT DEFAULT 200,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (provider),
    INDEX (created_at)
) ENGINE=InnoDB;

-- 4. Tabla para análisis de sentimiento granular (0-100)
CREATE TABLE IF NOT EXISTS sentimiento_analisis (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_type ENUM('muro', 'reporte', 'chat') NOT NULL,
    item_id INT(10) UNSIGNED NOT NULL,
    score INT DEFAULT 50,
    provider VARCHAR(50),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (item_type, item_id),
    INDEX (score)
) ENGINE=InnoDB;

-- 5. Tabla para Postulaciones
CREATE TABLE IF NOT EXISTS postulaciones (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT(10) UNSIGNED NOT NULL,
    vacante_id INT(10) UNSIGNED NOT NULL,
    estado ENUM('pendiente', 'visto', 'aceptado', 'rechazado') DEFAULT 'pendiente',
    cv_path VARCHAR(255),
    mensaje_estudiante TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE,
    INDEX (estado)
) ENGINE=InnoDB;

-- 6. Tabla para interacciones en el Bazar
CREATE TABLE IF NOT EXISTS interacciones_negocio (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    negocio_id INT NOT NULL, -- Nota: emprendimientos.id suele ser INT por defecto, ajustar si es UNSIGNED
    usuario_id INT(10) UNSIGNED NOT NULL,
    tipo ENUM('vista', 'contacto_whatsapp', 'click_ubicacion') DEFAULT 'vista',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX (tipo)
) ENGINE=InnoDB;
