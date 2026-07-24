-- ==========================================================
-- CESA WEB - Migration v7.1: Multi-Map Layouts & Archived Editions History
-- Archivo: /database/migrations/v7.1_bazar_multi_map_and_archiving.sql
-- ==========================================================

-- 1. Asegurar columnas de configuración de mapa y fechas en bazar_ediciones
ALTER TABLE `bazar_ediciones` 
ADD COLUMN `mapa_tipo` ENUM('radial_base', 'doble_pasillo', 'exterior_perimetral') DEFAULT 'radial_base' AFTER `nombre`,
ADD COLUMN `fecha_inicio` DATE NULL AFTER `mapa_tipo`,
ADD COLUMN `fecha_fin` DATE NULL AFTER `fecha_inicio`,
ADD COLUMN `estado` ENUM('borrador', 'activa', 'archivada') DEFAULT 'activa' AFTER `fecha_fin`;

-- 2. Asegurar que los puestos tengan edicion_id
ALTER TABLE `bazar_puestos`
ADD COLUMN `edicion_id` INT NOT NULL DEFAULT 1 AFTER `id`;

-- 3. Crear índice para acelerar consultas de mapa por edición
ALTER TABLE `bazar_puestos` ADD INDEX `idx_edicion_puesto` (`edicion_id`, `numero_puesto`);

-- 4. Sembrado de Edición Activa por Defecto y Edición Histórica Archivada de Ejemplo
INSERT INTO `bazar_ediciones` (`id`, `nombre`, `mapa_tipo`, `fecha_inicio`, `fecha_fin`, `estado`, `activa`) VALUES
(1, 'Edición Otoño 2026 (Calle de la Cultura)', 'radial_base', '2026-09-15', '2026-09-18', 'activa', 1),
(2, 'Edición Histórica Día del Estudiante (Mayo 2026)', 'doble_pasillo', '2026-05-20', '2026-05-23', 'archivada', 0)
ON DUPLICATE KEY UPDATE 
  `mapa_tipo` = VALUES(`mapa_tipo`),
  `fecha_inicio` = VALUES(`fecha_inicio`),
  `fecha_fin` = VALUES(`fecha_fin`),
  `estado` = VALUES(`estado`);
