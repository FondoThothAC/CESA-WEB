-- ==========================================================
-- CESA WEB - Migration v7.6: Servicio Social y Prácticas Profesionales
-- Reemplaza/refuerza el módulo de Bolsa de Trabajo con los formatos
-- oficiales UNISON: FP1 (Solicitud Unidad Receptora), FP2 (Solicitud
-- de Inscripción) y Carta de Asignación de Tutor.
-- Archivo: /database/migrations/v7.6_practicas_profesionales.sql
-- ==========================================================

USE cesa_web;

-- ----------------------------------------------------------
-- 1. Datos del alumno requeridos por el FP2 (seguro social y horario)
--    (expediente, celular y creditos_acumulados ya existen desde v6.9)
-- ----------------------------------------------------------
ALTER TABLE `usuarios` ADD COLUMN `seguro_social_tipo` ENUM('IMSS','ISSSTE','ISSSTESON','OTRO') NULL AFTER `curp`;
ALTER TABLE `usuarios` ADD COLUMN `seguro_social_num` VARCHAR(20) NULL AFTER `seguro_social_tipo`;
ALTER TABLE `usuarios` ADD COLUMN `disponibilidad_horario` VARCHAR(120) NULL AFTER `seguro_social_num`;

-- ----------------------------------------------------------
-- 2. Unidades Receptoras (perfil empresa - datos del encabezado FP1/FP2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS unidades_receptoras (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NULL,
    razon_social VARCHAR(200) NOT NULL,
    rfc VARCHAR(20) NULL,
    giro_sector VARCHAR(150) NULL,
    domicilio VARCHAR(255) NULL,
    ciudad VARCHAR(100) NULL,
    cp VARCHAR(10) NULL,
    telefono VARCHAR(30) NULL,
    responsable_nombre VARCHAR(150) NULL,
    responsable_puesto VARCHAR(150) NULL,
    responsable_email VARCHAR(100) NULL,
    aprobada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_ur_usuario (usuario_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. Áreas: división -> programa académico -> departamento (para Carta Tutor)
--    Seed inicial: División de Ciencias Sociales
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS areas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    division VARCHAR(100) NOT NULL,
    programa VARCHAR(150) NOT NULL,
    departamento VARCHAR(150) NOT NULL,
    jefe_departamento VARCHAR(150) NULL,
    jefe_titulo VARCHAR(20) NULL DEFAULT 'Dr(a).',
    coord_practicas_nombre VARCHAR(150) NULL,
    coord_practicas_email VARCHAR(100) NULL,
    coord_ss_nombre VARCHAR(150) NULL,
    coord_ss_email VARCHAR(100) NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE KEY uk_programa (programa)
) ENGINE=InnoDB;

INSERT INTO areas (division, programa, departamento, jefe_departamento, jefe_titulo) VALUES
('Ciencias Sociales', 'Derecho', 'Derecho', 'Por asignar', 'Dr(a).'),
('Ciencias Sociales', 'Economía', 'Economía', 'Por asignar', 'Dr(a).'),
('Ciencias Sociales', 'Sociología', 'Sociología', 'Por asignar', 'Dr(a).'),
('Ciencias Sociales', 'Trabajo Social', 'Trabajo Social', 'Por asignar', 'Dr(a).'),
('Ciencias Sociales', 'Psicología', 'Psicología', 'Por asignar', 'Dr(a).'),
('Ciencias Sociales', 'Ciencias Políticas y Administración Pública', 'Ciencias Políticas y Administración Pública', 'Por asignar', 'Dr(a).'),
('Ciencias Sociales', 'Negocios y Comercio Internacionales', 'Economía', 'Por asignar', 'Dr(a).')
ON DUPLICATE KEY UPDATE division = VALUES(division);

-- ----------------------------------------------------------
-- 4. Proyectos de Prácticas Profesionales / Servicio Social (contenido FP1)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS practicas_proyectos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT UNSIGNED NULL,
    unidad_receptora_id INT UNSIGNED NULL,
    area_id INT UNSIGNED NULL,
    nombre_programa VARCHAR(255) NOT NULL,
    areas_departamento TEXT NULL,
    licenciatura_target VARCHAR(150) NULL,
    perfil_deseado TEXT NULL,
    num_practicantes INT UNSIGNED DEFAULT 1,
    justificacion TEXT NULL,
    objetivo TEXT NULL,
    plan_trabajo TEXT NULL,
    apoyos JSON NULL,
    tipo_programa ENUM('practicas_profesionales','servicio_social') DEFAULT 'practicas_profesionales',
    estado ENUM('pendiente','aprobado','rechazado','cupo_lleno','cerrado') DEFAULT 'pendiente',
    fecha_asignacion DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (unidad_receptora_id) REFERENCES unidades_receptoras(id) ON DELETE SET NULL,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    INDEX idx_pp_estado (estado),
    INDEX idx_pp_area (area_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. Postulaciones: vinculadas a proyectos de prácticas + estados de fila de espera
-- ----------------------------------------------------------
ALTER TABLE `postulaciones` ADD COLUMN `proyecto_id` INT UNSIGNED NULL AFTER `vacante_id`;
ALTER TABLE `postulaciones` MODIFY COLUMN `estado` VARCHAR(30) DEFAULT 'pendiente';
ALTER TABLE `postulaciones` ADD COLUMN `tutor_profesional_id` INT UNSIGNED NULL AFTER `proyecto_id`;
ALTER TABLE `postulaciones` ADD COLUMN `fecha_aceptacion` DATETIME NULL AFTER `estado`;
ALTER TABLE `postulaciones` ADD COLUMN `horario_acordado` VARCHAR(150) NULL AFTER `fecha_aceptacion`;
ALTER TABLE `postulaciones` ADD COLUMN `fecha_conclusion` DATETIME NULL AFTER `horario_acordado`;
ALTER TABLE `postulaciones` ADD COLUMN `horas_realizadas` INT UNSIGNED NULL AFTER `fecha_conclusion`;

-- ----------------------------------------------------------
-- 6. Tutores profesionales asignados por postulación (Carta Tutor)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutores_profesionales (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    no_empleado VARCHAR(20) NULL,
    nombre VARCHAR(200) NOT NULL,
    titulo_tratamiento VARCHAR(20) NULL DEFAULT 'Dra.',
    telefono VARCHAR(30) NULL,
    email VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. Log de documentos generados (FP1, FP2, Carta Tutor)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS documentos_generados (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('FP1','FP2','CARTA_TUTOR') NOT NULL,
    postulacion_id INT UNSIGNED NULL,
    proyecto_id INT UNSIGNED NULL,
    usuario_id INT UNSIGNED NULL,
    path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postulacion_id) REFERENCES postulaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES practicas_proyectos(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_doc_post (postulacion_id)
) ENGINE=InnoDB;
