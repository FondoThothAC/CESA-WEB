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

-- MURO SOCIAL
CREATE TABLE publicaciones_muro (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    contenido TEXT NOT NULL,
    tipo ENUM('aviso', 'evento', 'urgente', 'comun') DEFAULT 'comun',
    imagen_path VARCHAR(255),
    coordinacion_destino ENUM('integral', 'la_red', 'librx', 'raices', 'impulso', 'humano', 'general') DEFAULT 'general',
    likes INT UNSIGNED DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB;

-- SENTIMENT QUEUE
CREATE TABLE sentimiento_queue (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    texto_original TEXT NOT NULL,
    procesando BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- SENTIMENT ANALYSIS RESULTS
CREATE TABLE sentimiento_analisis (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    texto_original TEXT,
    sentimiento ENUM('positivo', 'negativo', 'neutro') NOT NULL,
    confianza DECIMAL(5,4),
    categoria_detectada ENUM('infraestructura', 'docencia', 'servicios', 'administracion', 'salud', 'emprendimiento', 'general'),
    fuente ENUM('chatbot', 'muro', 'reportes', 'manual') DEFAULT 'chatbot',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- BAZAR EMPRENDEDOR
CREATE TABLE bazar_productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria ENUM('comida', 'servicios', 'tecnologia', 'manualidades', 'ropa', 'otro') DEFAULT 'otro',
    imagen_url VARCHAR(255),
    whatsapp_contacto VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB;

-- BOLSA DE TRABAJO
CREATE TABLE bolsa_vacantes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_nombre VARCHAR(150) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    modalidad ENUM('presencial', 'remoto', 'hibrido') DEFAULT 'presencial',
    tipo ENUM('tiempo_completo', 'medio_tiempo', 'practicas') DEFAULT 'tiempo_completo',
    sueldo_rango VARCHAR(50),
    carreras_target VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE bolsa_postulaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vacante_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    cv_path VARCHAR(255),
    status ENUM('pendiente', 'visto', 'contactado', 'rechazado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vacante_id) REFERENCES bolsa_vacantes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- IA CONFIGURATION & GOVERNANCE
CREATE TABLE api_configs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider ENUM('mac_mini', 'groq', 'gemini', 'mistral', 'ollama_cloud', 'huggingface') NOT NULL UNIQUE,
    api_key_encrypted VARBINARY(512) NULL, -- AES-256 encrypted
    endpoint_url VARCHAR(255) NOT NULL,
    model_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    priority TINYINT UNSIGNED DEFAULT 5, -- 1 = Highest
    rate_limit_per_min INT UNSIGNED DEFAULT 60,
    timeout_seconds TINYINT UNSIGNED DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_priority (is_active, priority)
) ENGINE=InnoDB;

-- IA USAGE AUDIT LOGS
CREATE TABLE api_usage_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    config_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NULL,
    endpoint_called VARCHAR(100),
    request_payload JSON,
    response_status TINYINT UNSIGNED,
    latency_ms INT UNSIGNED,
    tokens_used INT UNSIGNED,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_id) REFERENCES api_configs(id),
    INDEX idx_fecha (created_at),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

-- CHATBOT ACTIONS & SKILLS
CREATE TABLE chatbot_actions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    accion_tipo ENUM('postular_vacante', 'crear_reporte', 'registrar_bazar', 'consultar_estado', 'crear_evento', 'buscar_colegas') NOT NULL,
    contexto JSON,
    estado ENUM('pendiente', 'procesando', 'completado', 'fallido') DEFAULT 'pendiente',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario_accion (usuario_id, accion_tipo),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- EXTENDING CHATBOT HISTORY WITH ACTIONS
ALTER TABLE muro_social ADD COLUMN sentiment VARCHAR(20) DEFAULT 'neutro'; -- Retro-compatibility
ALTER TABLE chatbot_historial 
ADD COLUMN accion_detectada VARCHAR(50) DEFAULT 'ninguna',
ADD COLUMN accion_metadata JSON,
ADD COLUMN provider VARCHAR(50) DEFAULT 'local';
