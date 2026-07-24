-- ==========================================================
-- CESA WEB - Migration v5.3: Granular Admin Permissions, OpenRouter Support & Geolocation Auditing
-- ==========================================================

USE cesa_web;

-- 1. Tabla de permisos granulares para administradores
CREATE TABLE IF NOT EXISTS admin_permisos (
    usuario_id INT UNSIGNED PRIMARY KEY,
    publicar_anuncios BOOLEAN DEFAULT FALSE,
    bazar_y_reservaciones BOOLEAN DEFAULT FALSE,
    bolsa_trabajo BOOLEAN DEFAULT FALSE,
    roles_social BOOLEAN DEFAULT FALSE,
    ver_denuncias BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Modificar el enum de proveedores de API para incluir OpenRouter
ALTER TABLE api_configs MODIFY COLUMN provider ENUM('mac_mini', 'groq', 'gemini', 'mistral', 'ollama_cloud', 'huggingface', 'openrouter') NOT NULL UNIQUE;

-- 3. Agregar columnas de metadatos de geolocalización a chatbot_historial
ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) NULL;
ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255) NULL;
ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS geoloc_lat DECIMAL(10, 8) NULL;
ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS geoloc_lon DECIMAL(11, 8) NULL;
ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS geoloc_city VARCHAR(100) NULL;
ALTER TABLE chatbot_historial ADD COLUMN IF NOT EXISTS geoloc_country VARCHAR(100) NULL;

-- 4. Agregar columnas de metadatos de geolocalización a mensajes_privados
ALTER TABLE mensajes_privados ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) NULL;
ALTER TABLE mensajes_privados ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255) NULL;
ALTER TABLE mensajes_privados ADD COLUMN IF NOT EXISTS geoloc_lat DECIMAL(10, 8) NULL;
ALTER TABLE mensajes_privados ADD COLUMN IF NOT EXISTS geoloc_lon DECIMAL(11, 8) NULL;
ALTER TABLE mensajes_privados ADD COLUMN IF NOT EXISTS geoloc_city VARCHAR(100) NULL;
ALTER TABLE mensajes_privados ADD COLUMN IF NOT EXISTS geoloc_country VARCHAR(100) NULL;
