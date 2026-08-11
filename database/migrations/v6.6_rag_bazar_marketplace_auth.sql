-- ==========================================================
-- CESA WEB - Migration v6.6: RAG Knowledge, Bazar Marketplace, Auth Unificada & Accesorios
-- ==========================================================

USE cesa_web;

-- 1. Tabla de Conocimiento Institucional RAG (en formato .md para la IA)
CREATE TABLE IF NOT EXISTS `ia_conocimiento_rag` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `titulo` VARCHAR(200) NOT NULL,
    `categoria` VARCHAR(100) DEFAULT 'general',
    `archivo_original` VARCHAR(255) NULL,
    `contenido_md` LONGTEXT NOT NULL,
    `tokens_estimados` INT UNSIGNED DEFAULT 0,
    `activo` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT KEY `ft_contenido` (`titulo`, `contenido_md`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modificar la columna categoria en emprendimientos para incluir 'accesorios'
ALTER TABLE `emprendimientos` 
MODIFY COLUMN `categoria` ENUM('comida', 'productos', 'servicios', 'asesorias', 'tecnologia', 'arte', 'accesorios', 'otro') DEFAULT 'otro';

-- 3. Tabla de Productos del Catálogo / Marketplace de cada Emprendimiento
CREATE TABLE IF NOT EXISTS `bazar_productos` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `emprendimiento_id` INT UNSIGNED NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `precio` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `imagen_url` VARCHAR(255) NULL,
    `disponible` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`emprendimiento_id`) REFERENCES `emprendimientos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Agregar columnas de Identidad Unificada (telefono y curp) a la tabla usuarios
ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `telefono` VARCHAR(20) NULL AFTER `matricula`,
ADD COLUMN IF NOT EXISTS `curp` VARCHAR(20) NULL AFTER `telefono`,
ADD INDEX IF NOT EXISTS `idx_telefono` (`telefono`),
ADD INDEX IF NOT EXISTS `idx_curp` (`curp`);

-- 5. Actualizar la fecha del próximo Bazar al 12 de Agosto de 2026 en la tabla bazar_ediciones
INSERT INTO `bazar_ediciones` (`id`, `nombre`, `fecha_inicio`, `activo`) VALUES
(4, 'Edición Agosto 2026', '2026-08-12', 1)
ON DUPLICATE KEY UPDATE `nombre` = 'Edición Agosto 2026', `fecha_inicio` = '2026-08-12', `activo` = 1;

-- Desactivar ediciones anteriores
UPDATE `bazar_ediciones` SET `activo` = 0 WHERE `id` != 4;
