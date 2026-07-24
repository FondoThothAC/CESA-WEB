-- CESA WEB v6.2 - Anuncios por Carrera y Solicitud de Elecciones
-- Fecha: 2026-06-29

USE cesa_web;

-- 1. Agregar columna carrera_destino a noticias
ALTER TABLE noticias
ADD COLUMN carrera_destino VARCHAR(150) NULL AFTER autor_id;

-- 2. Crear tabla solicitudes_elecciones
CREATE TABLE IF NOT EXISTS solicitudes_elecciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    carrera VARCHAR(150) NOT NULL,
    motivo TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
