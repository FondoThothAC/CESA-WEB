-- ===========================================
-- CESA WEB - Schema Base de Datos v3.5
-- Compatible con MariaDB 10.6+
-- ===========================================

CREATE DATABASE IF NOT EXISTS cesa_web 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE cesa_web;

-- USERS & AUTH
CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    matricula VARCHAR(20) NULL,
    rol ENUM('estudiante', 'empresa', 'sociedad', 'mesa_directiva', 'admin') DEFAULT 'estudiante',
    avatar_path VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB;

-- MURO SOCIAL (EXTENDED)
CREATE TABLE publicaciones_muro (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    contenido TEXT NOT NULL,
    tipo ENUM('aviso', 'evento', 'urgente', 'comun', 'logro') DEFAULT 'comun',
    imagen_path VARCHAR(255),
    coordinacion_destino ENUM('integral', 'la_red', 'librx', 'raices', 'impulso', 'humano', 'general') DEFAULT 'general',
    likes_count INT UNSIGNED DEFAULT 0,
    comentarios_count INT UNSIGNED DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    destacada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_fecha (created_at),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB;

CREATE TABLE comentarios_muro (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    contenido TEXT NOT NULL,
    likes_count INT UNSIGNED DEFAULT 0,
    parent_id INT UNSIGNED NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones_muro(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comentarios_muro(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE likes_muro (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT UNSIGNED NULL,
    comentario_id INT UNSIGNED NULL,
    usuario_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones_muro(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_id) REFERENCES comentarios_muro(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (publicacion_id, comentario_id, usuario_id),
    CHECK (publicacion_id IS NOT NULL OR comentario_id IS NOT NULL)
) ENGINE=InnoDB;

-- CHATBOT HISTORY
CREATE TABLE chatbot_historial (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NULL,
    session_id VARCHAR(100),
    mensaje TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    provider ENUM('local', 'groq', 'gemini', 'none') DEFAULT 'local',
    latency_ms INT UNSIGNED,
    accion_detectada VARCHAR(50) DEFAULT 'ninguna',
    accion_metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

-- SENTIMENT QUEUE (INDUSTRIALIZED)
CREATE TABLE sentimiento_queue (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    texto_original TEXT NOT NULL,
    source ENUM('chatbot', 'muro', 'reportes') DEFAULT 'chatbot',
    source_id BIGINT UNSIGNED NULL,
    procesando BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- BAZAR EMPRENDEDOR
CREATE TABLE emprendimientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    nombre_negocio VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    categoria ENUM('comida', 'productos', 'servicios', 'asesorias', 'tecnologia', 'arte', 'otro') DEFAULT 'otro',
    logo_path VARCHAR(255),
    whatsapp VARCHAR(20),
    instagram VARCHAR(100),
    ubicacion VARCHAR(150),
    horario VARCHAR(100),
    precio_min DECIMAL(10,2),
    precio_max DECIMAL(10,2),
    envios BOOLEAN DEFAULT FALSE,
    views INT UNSIGNED DEFAULT 0,
    likes_count INT UNSIGNED DEFAULT 0,
    verificado BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- BUZÓN DE REPORTES (INDUSTRIALIZED)
CREATE TABLE reportes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('queja', 'sugerencia', 'felicitacion', 'urgente', 'denuncia') NOT NULL,
    categoria ENUM('infraestructura', 'docencia', 'servicios', 'administracion', 'salud', 'seguridad', 'acoso', 'otro') DEFAULT 'otro',
    coordinacion_asignada ENUM('integral', 'la_red', 'librx', 'raices', 'impulso', 'humano', 'mesa_directiva') DEFAULT 'mesa_directiva',
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    anonimo BOOLEAN DEFAULT FALSE,
    usuario_id INT UNSIGNED NULL,
    email_seguimiento VARCHAR(100) NULL,
    telefono_seguimiento VARCHAR(20) NULL,
    evidencia JSON NULL,
    estado ENUM('nuevo', 'asignado', 'en_proceso', 'en_revision', 'resuelto', 'cerrado', 'descartado') DEFAULT 'nuevo',
    prioridad ENUM('baja', 'media', 'alta', 'urgente', 'critica') DEFAULT 'media',
    asignado_a INT UNSIGNED NULL,
    respuesta TEXT NULL,
    responded_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB;

-- NOTIFICACIONES
CREATE TABLE notificaciones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    tipo ENUM('sistema', 'muro', 'reporte', 'chatbot', 'alerta') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    url_action VARCHAR(500) NULL,
    icono VARCHAR(50) NULL,
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_leida (usuario_id, leida)
) ENGINE=InnoDB;

-- BOLSA DE TRABAJO
CREATE TABLE bolsa_vacantes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT UNSIGNED NULL,
    empresa_nombre VARCHAR(150) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    modalidad ENUM('presencial', 'remoto', 'hibrido') DEFAULT 'presencial',
    tipo ENUM('tiempo_completo', 'medio_tiempo', 'practicas') DEFAULT 'tiempo_completo',
    sueldo_rango VARCHAR(50),
    carreras_target VARCHAR(255),
    verificada BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE api_configs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider ENUM('mac_mini', 'groq', 'gemini', 'mistral', 'ollama_cloud', 'huggingface', 'openrouter') NOT NULL UNIQUE,
    api_key_encrypted VARCHAR(512) NULL,
    endpoint_url VARCHAR(255) NOT NULL,
    model_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    priority TINYINT UNSIGNED DEFAULT 5,
    rate_limit_per_min INT DEFAULT 60,
    timeout_seconds INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
