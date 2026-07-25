-- ==========================================================
-- CESA WEB - Migration v7.5: Integraciones Social Media (Meta / Instagram / Facebook & X Twitter)
-- Archivo: /database/migrations/v7.5_social_integrations.sql
-- ==========================================================

USE cesa_web;

-- 1. Tabla para Tokens de Acceso y Credenciales de Redes Sociales
CREATE TABLE IF NOT EXISTS social_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plataforma ENUM('instagram', 'facebook', 'x_twitter') NOT NULL,
    account_id VARCHAR(100) NOT NULL,
    account_name VARCHAR(150) NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NULL,
    expires_at DATETIME NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_platform_account (plataforma, account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Caché para Publicaciones del Feed Social
CREATE TABLE IF NOT EXISTS social_posts_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plataforma ENUM('instagram', 'facebook', 'x_twitter') NOT NULL,
    post_external_id VARCHAR(120) NOT NULL,
    autor VARCHAR(100) NULL,
    contenido TEXT NULL,
    media_url TEXT NULL,
    permalink TEXT NULL,
    media_type VARCHAR(50) DEFAULT 'IMAGE',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    posted_at DATETIME NOT NULL,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_post_id (plataforma, post_external_id),
    INDEX idx_posted_at (posted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Logs de Webhooks Entrantes (DMs, Menciones, Eventos)
CREATE TABLE IF NOT EXISTS social_webhooks_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plataforma ENUM('instagram', 'facebook', 'x_twitter') NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    sender_id VARCHAR(100) NULL,
    payload JSON NOT NULL,
    procesado TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_procesado (procesado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
