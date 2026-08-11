-- ===========================================
-- MIGRATION: Tutorías Peer-to-Peer Module
-- CESA WEB v3.9
-- ===========================================

USE cesa_web;

-- 1. Catálogo de Materias
CREATE TABLE IF NOT EXISTS materias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    clave VARCHAR(20) NULL,
    categoria ENUM('matematicas', 'ingenieria', 'sociales', 'administracion', 'idiomas', 'otro') DEFAULT 'otro',
    icono VARCHAR(50) DEFAULT 'fas fa-book',
    color_hex VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Configuración de Tutores
CREATE TABLE IF NOT EXISTS tutores_config (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    precio_hora DECIMAL(10,2) DEFAULT 0.00,
    modalidad ENUM('presencial', 'virtual', 'hibrido') DEFAULT 'virtual',
    disponible_ahora BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    descripcion_short VARCHAR(200),
    facebook_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (usuario_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Materias que imparte cada tutor
CREATE TABLE IF NOT EXISTS tutor_materias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT UNSIGNED NOT NULL, -- Hace referencia al usuarios.id o tutores_config.usuario_id
    materia_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    UNIQUE KEY (tutor_id, materia_id)
) ENGINE=InnoDB;

-- 4. Registro de Sesiones de Tutoría
CREATE TABLE IF NOT EXISTS tutorias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    solicitante_id INT UNSIGNED NOT NULL,
    tutor_id INT UNSIGNED NOT NULL,
    materia_id INT UNSIGNED NOT NULL,
    fecha_propuesta DATETIME NOT NULL,
    modalidad ENUM('presencial', 'virtual') NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada') DEFAULT 'pendiente',
    link_reunion VARCHAR(512) NULL,
    mensaje_solicitud TEXT,
    calificacion_alumno TINYINT UNSIGNED NULL, -- 1-5 estrellas
    comentario_alumno TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Data Inicial: Materias de ejemplo
INSERT IGNORE INTO materias (nombre, clave, categoria, icono, color_hex) VALUES 
('Cálculo Diferencial', 'MAT101', 'matematicas', 'fas fa-calculator', '#3B82F6'),
('Física I', 'FIS102', 'ingenieria', 'fas fa-atom', '#8B5CF6'),
('Programación Avanzada', 'CS103', 'ingenieria', 'fas fa-laptop-code', '#10B981'),
('Contabilidad Financiera', 'ADM104', 'administracion', 'fas fa-file-invoice-dollar', '#F59E0B'),
('Inglés Técnico', 'IDI105', 'idiomas', 'fas fa-language', '#EC4899');
