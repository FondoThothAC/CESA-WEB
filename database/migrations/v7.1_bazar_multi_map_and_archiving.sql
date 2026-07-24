-- ==========================================================
-- CESA WEB - Migration v7.1: Multi-Map Layouts & Archived Editions History
-- Archivo: /database/migrations/v7.1_bazar_multi_map_and_archiving.sql
-- ==========================================================

-- 1. Agregar columnas en bazar_ediciones de forma tolerante a columnas ya existentes
ALTER TABLE `bazar_ediciones` ADD COLUMN `mapa_tipo` ENUM('radial_base', 'doble_pasillo', 'exterior_perimetral') DEFAULT 'radial_base';
ALTER TABLE `bazar_ediciones` ADD COLUMN `fecha_fin` DATE NULL;
ALTER TABLE `bazar_ediciones` ADD COLUMN `estado` ENUM('borrador', 'activa', 'archivada') DEFAULT 'activa';

-- 2. Asegurar que los puestos del catálogo (cat_puestos) tengan la columna edicion_id
ALTER TABLE `cat_puestos` ADD COLUMN `edicion_id` INT NOT NULL DEFAULT 1;

-- 3. Crear índice para consultas de puestos por edición
ALTER TABLE `cat_puestos` ADD INDEX `idx_edicion_puesto` (`edicion_id`, `id`);

-- 4. Sembrado / Actualización de ediciones
INSERT INTO `bazar_ediciones` (`id`, `nombre`, `mapa_tipo`, `fecha_inicio`, `fecha_fin`, `estado`, `activo`) VALUES
(1, 'Edición Otoño 2026 (Calle de la Cultura)', 'radial_base', '2026-09-15', '2026-09-18', 'activa', 1),
(2, 'Edición Histórica Día del Estudiante (Mayo 2026)', 'doble_pasillo', '2026-05-20', '2026-05-23', 'archivada', 0)
ON DUPLICATE KEY UPDATE 
  `mapa_tipo` = VALUES(`mapa_tipo`),
  `estado` = VALUES(`estado`);
