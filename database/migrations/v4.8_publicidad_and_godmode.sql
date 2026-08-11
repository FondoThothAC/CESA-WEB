-- ==========================================================
-- CESA WEB - Migration v4.8: Publicidad & AdMob Config
-- ==========================================================

USE cesa_web;

CREATE TABLE IF NOT EXISTS publicidad_config (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activo BOOLEAN DEFAULT FALSE,
    publisher_id VARCHAR(100) NULL,
    banner_slot_id VARCHAR(100) NULL,
    interstitial_slot_id VARCHAR(100) NULL,
    frecuencia_diaria INT DEFAULT 2,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar configuración inicial por defecto
INSERT IGNORE INTO publicidad_config (id, activo, publisher_id, banner_slot_id, interstitial_slot_id, frecuencia_diaria)
VALUES (1, 0, '', '', '', 2);
