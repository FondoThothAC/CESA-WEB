-- ==========================================================
-- CESA WEB - Migration v4.4: AI Delegation & Social Setup
-- ==========================================================

USE cesa_web;

-- 1. Agregar columnas de delegación IA a la tabla de reportes
ALTER TABLE reportes 
ADD COLUMN requiere_atencion_humana BOOLEAN DEFAULT FALSE AFTER estado,
ADD COLUMN analisis_ia TEXT NULL AFTER requiere_atencion_humana;

-- 2. Crear tabla para configuraciones de redes sociales
CREATE TABLE IF NOT EXISTS social_configs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(50) NOT NULL UNIQUE, -- 'instagram', 'whatsapp'
    access_token TEXT NULL,
    refresh_token TEXT NULL,
    client_id VARCHAR(255) NULL,
    client_secret VARCHAR(255) NULL,
    page_id VARCHAR(100) NULL,
    phone_number_id VARCHAR(100) NULL,
    waba_id VARCHAR(100) NULL,
    verify_token VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
