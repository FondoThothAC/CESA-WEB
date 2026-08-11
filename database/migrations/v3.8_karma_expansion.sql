-- Migration: Expansión de Karma (v3.8)
-- CESA WEB Industrialized
-- Desc: Habilita Upvotes/Downvotes en Bazar y Reportes

-- 1. Tablas de Votos para Bazar/Emprendimientos
CREATE TABLE IF NOT EXISTS votos_bazar (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emprendimiento_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    valor TINYINT NOT NULL COMMENT '1 Up, -1 Down',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_voto_bazar (emprendimiento_id, usuario_id),
    FOREIGN KEY (emprendimiento_id) REFERENCES emprendimientos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Tablas de Votos para Reportes (Incidencias)
CREATE TABLE IF NOT EXISTS votos_reportes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporte_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    valor TINYINT NOT NULL COMMENT '1 Up, -1 Down',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_voto_reporte (reporte_id, usuario_id),
    FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Expandir tablas de negocio con Score
ALTER TABLE emprendimientos 
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN upvotes_count INT UNSIGNED DEFAULT 0,
ADD COLUMN downvotes_count INT UNSIGNED DEFAULT 0;

ALTER TABLE reportes 
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN upvotes_count INT UNSIGNED DEFAULT 0,
ADD COLUMN downvotes_count INT UNSIGNED DEFAULT 0;
