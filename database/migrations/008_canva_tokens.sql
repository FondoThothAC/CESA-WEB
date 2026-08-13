-- ==========================================================
-- CESA WEB - Migration 008: Tabla de Tokens OAuth2 Canva Connect API
-- Archivo: /database/migrations/008_canva_tokens.sql
-- ==========================================================

CREATE TABLE IF NOT EXISTS `ia_canva_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(100) DEFAULT 'admin_cesa',
  `access_token` TEXT NOT NULL,
  `refresh_token` TEXT NOT NULL,
  `token_type` VARCHAR(50) DEFAULT 'Bearer',
  `expires_at` DATETIME NOT NULL,
  `brand_template_id` VARCHAR(100) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
