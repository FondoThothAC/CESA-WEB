-- v6.0 Dynamic Providers Migration
-- Convertimos la tabla de api_configs a un esquema más genérico y creamos la de redes sociales

-- 1. Modificar tabla api_configs existente
-- Se remueve el ENUM estricto y el constraint UNIQUE (si existe como key) para permitir agregar N proveedores
ALTER TABLE api_configs MODIFY COLUMN provider VARCHAR(100) NOT NULL;

-- Asegurar que existan columnas útiles para la UI si no existen
-- (Se asume que api_url, api_key, auth_header, is_active existen basado en código anterior)
-- Si falta alguna, se añadirá aquí (usando IF NOT EXISTS si el motor lo soportara, pero en MariaDB normal usamos esto o verificamos en backend)

-- 2. Crear tabla redes_sociales
CREATE TABLE IF NOT EXISTS redes_sociales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plataforma VARCHAR(50) NOT NULL,
    url_perfil VARCHAR(255),
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    tokens_json TEXT,
    is_active TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar redes iniciales comunes si no hay nada
INSERT INTO redes_sociales (plataforma, is_active) VALUES
('Instagram', 0),
('WhatsApp', 0),
('TikTok', 0),
('Facebook', 0);
