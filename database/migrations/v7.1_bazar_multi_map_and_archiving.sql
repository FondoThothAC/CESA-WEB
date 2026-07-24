-- ==========================================================
-- CESA WEB - Migration v7.1: Multi-Map Layouts & Single Edition 12 Agosto 2026
-- Archivo: /database/migrations/v7.1_bazar_multi_map_and_archiving.sql
-- ==========================================================

-- 1. Agregar columnas en bazar_ediciones de forma tolerante
ALTER TABLE `bazar_ediciones` ADD COLUMN `mapa_tipo` ENUM('radial_base', 'doble_pasillo', 'exterior_perimetral') DEFAULT 'radial_base';
ALTER TABLE `bazar_ediciones` ADD COLUMN `fecha_fin` DATE NULL;
ALTER TABLE `bazar_ediciones` ADD COLUMN `estado` ENUM('borrador', 'activa', 'archivada') DEFAULT 'activa';

-- 2. Asegurar que los puestos del catálogo tengan la columna edicion_id
ALTER TABLE `cat_puestos` ADD COLUMN `edicion_id` INT NOT NULL DEFAULT 1;

-- 3. Limpiar ediciones antiguas y dejar únicamente la edición de Agosto 12, 2026
DELETE FROM `bazar_ediciones`;
INSERT INTO `bazar_ediciones` (`id`, `nombre`, `mapa_tipo`, `fecha_inicio`, `fecha_fin`, `estado`, `activo`) VALUES
(1, 'Bazar Estudiantil CESA - 12 de Agosto de 2026', 'radial_base', '2026-08-12', '2026-08-15', 'activa', 1);

-- 4. Re-asociar todos los emprendimientos existentes a la edición 1
UPDATE `emprendimientos` SET `edicion_id` = 1 WHERE `edicion_id` IS NULL OR `edicion_id` != 1;

