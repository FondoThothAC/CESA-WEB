-- ==========================================================
-- CESA WEB - Migration v6.8: Activación de Publicidad & Bazar Dashboard
-- Archivo: /database/migrations/v6.8_activate_publicidad_and_bazar.sql
-- ==========================================================

USE cesa_web;

-- 1. Crear tabla publicidad_config si no existe y asegurar la fila por defecto
CREATE TABLE IF NOT EXISTS publicidad_config (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activo BOOLEAN DEFAULT FALSE,
    publisher_id VARCHAR(100) NULL,
    banner_slot_id VARCHAR(100) NULL,
    interstitial_slot_id VARCHAR(100) NULL,
    frecuencia_diaria INT DEFAULT 2,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar o actualizar estado de publicidad a ACTIVO (1) con slots de prueba oficiales AdMob / AdSense
INSERT INTO publicidad_config (id, activo, publisher_id, banner_slot_id, interstitial_slot_id, frecuencia_diaria)
VALUES (1, 1, 'ca-pub-3940256099942544', '6300978111', '1033173712', 2)
ON DUPLICATE KEY UPDATE 
    activo = 1,
    publisher_id = IF(publisher_id IS NULL OR publisher_id = '', 'ca-pub-3940256099942544', publisher_id),
    banner_slot_id = IF(banner_slot_id IS NULL OR banner_slot_id = '', '6300978111', banner_slot_id),
    interstitial_slot_id = IF(interstitial_slot_id IS NULL OR interstitial_slot_id = '', '1033173712', interstitial_slot_id);

-- 2. Asegurar existencia de edición activa de Bazar (id = 4 o id = 3)
CREATE TABLE IF NOT EXISTS `bazar_ediciones` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL UNIQUE,
    `fecha_inicio` DATE NOT NULL,
    `activo` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bazar_ediciones` (`id`, `nombre`, `fecha_inicio`, `activo`) VALUES
(4, 'Edición Oficial 12 de Agosto de 2026', '2026-08-12', 1)
ON DUPLICATE KEY UPDATE `activo` = 1;
