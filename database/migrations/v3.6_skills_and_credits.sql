-- ===========================================
-- MIGRATION: Academic Progress & Skills Module
-- CESA WEB v3.6
-- ===========================================

USE cesa_web;

-- 1. SISTEMA DE PROGRESO ACADÉMICO POR CRÉDITOS

-- Configuración de carreras y sus escalas de créditos
CREATE TABLE IF NOT EXISTS carrera_creditos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    carrera VARCHAR(100) NOT NULL,
    total_creditos_carrera INT UNSIGNED NOT NULL, -- Ej: 350 para Lic. en Derecho
    configuracion_semestres JSON NOT NULL, -- Array: [{"sem":1,"min":0,"max":40}, {"sem":2,"min":41,"max":80}...]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_carrera (carrera)
) ENGINE=InnoDB;

-- Historial académico del estudiante (sirve como fuente de verdad)
CREATE TABLE IF NOT EXISTS historial_academico (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    materia_codigo VARCHAR(20) NOT NULL,
    materia_nombre VARCHAR(200) NOT NULL,
    creditos INT UNSIGNED NOT NULL,
    semestre_teorico INT UNSIGNED NOT NULL, -- El semestre "oficial" de la materia
    calificacion DECIMAL(4,2) NOT NULL,
    periodo VARCHAR(20) NOT NULL, -- Ej: "2024-1", "2024-2"
    estado ENUM('aprobada', 'reprobada', 'cursando', 'retirada') DEFAULT 'cursando',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_periodo (periodo)
) ENGINE=InnoDB;

-- 2. SISTEMA DE SKILLS Y CERTIFICACIÓN

-- Catálogo de skills (Inglés, Excel, Python, Liderazgo, etc.)
CREATE TABLE IF NOT EXISTS skills_catalogo (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE, -- "ENG-B2", "EXCEL-ADV", "PY-BASIC"
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria ENUM('tecnico', 'idioma', 'blando', 'herramienta', 'certificacion_externa') NOT NULL,
    icono VARCHAR(100), -- FontAwesome class
    color_hex VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Configuración de examen
    tiempo_limite_minutos INT UNSIGNED DEFAULT 30,
    puntaje_aprobatorio INT UNSIGNED DEFAULT 80, -- Porcentaje
    intentos_maximos INT UNSIGNED DEFAULT 3, -- Por período de vigencia
    
    -- Vigencia y recertificación
    vigencia_meses INT UNSIGNED DEFAULT 12, -- 0 = sin expiración
    requiere_recertificacion BOOLEAN DEFAULT FALSE,
    skill_predecesora_id INT UNSIGNED NULL, -- Ej: Para tomar Excel Avanzado necesitas Excel Básico
    
    -- Metadatos del certificado
    template_certificado VARCHAR(50) DEFAULT 'default', -- Plantilla PDF/HTML
    firma_digital_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_predecesora_id) REFERENCES skills_catalogo(id),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB;

-- Preguntas del banco para cada skill
CREATE TABLE IF NOT EXISTS skills_preguntas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_id INT UNSIGNED NOT NULL,
    tipo ENUM('multiple_choice', 'verdadero_falso', 'practica_codigo', 'ensayo_corto') NOT NULL,
    pregunta TEXT NOT NULL,
    opciones JSON NULL, -- ["Opción A", "Opción B", "Opción C", "Opción D"]
    respuesta_correcta VARCHAR(500), -- Índice o texto para autocalificación
    peso_porcentaje DECIMAL(5,2) DEFAULT 10.00, -- Peso en el examen total
    dificultad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (skill_id) REFERENCES skills_catalogo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Intentos de examen
CREATE TABLE IF NOT EXISTS skills_intentos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    skill_id INT UNSIGNED NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    puntaje_obtenido DECIMAL(5,2) NULL, -- 0-100
    estado ENUM('en_progreso', 'completado', 'aprobado', 'reprobado', 'abandonado') DEFAULT 'en_progreso',
    respuestas JSON NULL, -- Guardar respuestas para auditoría
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills_catalogo(id) ON DELETE CASCADE,
    INDEX idx_usuario_skill (usuario_id, skill_id)
) ENGINE=InnoDB;

-- 3. CERTIFICADOS DIGITALES ÚNICOS

CREATE TABLE IF NOT EXISTS certificados_digitales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    certificado_uuid CHAR(36) NOT NULL UNIQUE, -- UUID v4 para verificación pública
    
    -- Datos del titular
    usuario_id INT UNSIGNED NOT NULL,
    nombre_completo_certificado VARCHAR(200) NOT NULL, -- Snapshot del nombre al momento de certificar
    
    -- Datos del skill
    skill_id INT UNSIGNED NOT NULL,
    skill_codigo VARCHAR(50) NOT NULL,
    skill_nombre VARCHAR(100) NOT NULL,
    nivel VARCHAR(50), -- "Básico", "Intermedio", "Avanzado", "B2", etc.
    
    -- Fechas y vigencia
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NULL, -- Calculado según vigencia_meses
    
    -- Seguridad y verificación
    hash_verificacion VARCHAR(64) NOT NULL, -- SHA-256 de datos + secret_key
    blockchain_tx_hash VARCHAR(66) NULL, -- Opcional: hash en blockchain para inmutabilidad
    qr_code_data TEXT, -- Datos embebidos en el QR
    
    -- Estado
    estado ENUM('activo', 'expirado', 'revocado', 'renovado') DEFAULT 'activo',
    revocado_motivo TEXT NULL,
    revocado_por INT UNSIGNED NULL,
    
    -- Metadatos del examen
    puntaje_obtenido DECIMAL(5,2) NOT NULL,
    intento_id BIGINT UNSIGNED NOT NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills_catalogo(id),
    FOREIGN KEY (revocado_por) REFERENCES usuarios(id),
    FOREIGN KEY (intento_id) REFERENCES skills_intentos(id),
    
    INDEX idx_uuid (certificado_uuid),
    INDEX idx_usuario (usuario_id),
    INDEX idx_expiracion (fecha_expiracion),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- 4. INSERT INITIAL DATA (Ejemplo de carrera)
INSERT INTO carrera_creditos (carrera, total_creditos_carrera, configuracion_semestres)
VALUES ('Ingeniería Industrial', 400, '[{"sem":1,"min":0,"max":40}, {"sem":2,"min":41,"max":80}, {"sem":3,"min":81,"max":120}, {"sem":4,"min":121,"max":160}, {"sem":5,"min":161,"max":200}, {"sem":6,"min":201,"max":245}, {"sem":7,"min":246,"max":290}, {"sem":8,"min":291,"max":340}, {"sem":9,"min":341,"max":400}]')
ON DUPLICATE KEY UPDATE total_creditos_carrera = 400;

-- Ejemplo de Skill
INSERT INTO skills_catalogo (codigo, nombre, descripcion, categoria, icono, color_hex, vigencia_meses)
VALUES ('ENG-B2', 'Inglés B2 (Intermedio-Alto)', 'Certificación de competencia en idioma inglés nivel B2 según el MCERL.', 'idioma', 'fas fa-language', '#3B82F6', 12)
ON DUPLICATE KEY UPDATE nombre = 'Inglés B2 (Intermedio-Alto)';
