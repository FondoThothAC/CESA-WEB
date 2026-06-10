USE cesa_web;

-- 1. Crear tabla de ediciones si no existe
CREATE TABLE IF NOT EXISTS `bazar_ediciones` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL UNIQUE,
    `fecha_inicio` DATE NOT NULL,
    `activo` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insertar algunas ediciones semilla
INSERT INTO `bazar_ediciones` (`id`, `nombre`, `fecha_inicio`, `activo`) VALUES
(1, 'Edición Otoño 2025', '2025-10-15', 0),
(2, 'Edición Primavera 2026', '2026-03-20', 0),
(3, 'Edición Verano 2026', '2026-06-15', 1)
ON DUPLICATE KEY UPDATE `activo` = VALUES(`activo`);

-- 3. Agregar columna edicion_id a emprendimientos
ALTER TABLE `emprendimientos` 
ADD COLUMN `edicion_id` INT UNSIGNED NULL AFTER `puesto_id`,
ADD CONSTRAINT `fk_emprendimientos_edicion` FOREIGN KEY (`edicion_id`) REFERENCES `bazar_ediciones` (`id`) ON DELETE SET NULL,
ADD INDEX (`edicion_id`);

-- 4. Asociar emprendimientos existentes a la edición activa (id = 3)
UPDATE `emprendimientos` 
SET `edicion_id` = 3
WHERE `edicion_id` IS NULL;

-- 5. Truncar y poblar cat_puestos con los 72 puntos radiales exactos del plano Calle de la Cultura
TRUNCATE TABLE `cat_puestos`;
INSERT INTO `cat_puestos` (`zona`, `coord_x`, `coord_y`, `disponible`, `activo`) VALUES
('este', 58.4, 50, 1, 1),
('este', 62.6, 50, 1, 1),
('este', 66.8, 50, 1, 1),
('este', 71, 50, 1, 1),
('este', 75.2, 50, 1, 1),
('este', 79.4, 50, 1, 1),
('este', 83.6, 50, 1, 1),
('este', 87.8, 50, 1, 1),
('este', 92, 50, 1, 1),
('sureste', 55.94, 55.94, 1, 1),
('sureste', 58.91, 58.91, 1, 1),
('sureste', 61.88, 61.88, 1, 1),
('sureste', 64.85, 64.85, 1, 1),
('sureste', 67.82, 67.82, 1, 1),
('sureste', 70.79, 70.79, 1, 1),
('sureste', 73.76, 73.76, 1, 1),
('sureste', 76.73, 76.73, 1, 1),
('sureste', 79.7, 79.7, 1, 1),
('sur', 50, 58.4, 1, 1),
('sur', 50, 62.6, 1, 1),
('sur', 50, 66.8, 1, 1),
('sur', 50, 71, 1, 1),
('sur', 50, 75.2, 1, 1),
('sur', 50, 79.4, 1, 1),
('sur', 50, 83.6, 1, 1),
('sur', 50, 87.8, 1, 1),
('sur', 50, 92, 1, 1),
('suroeste', 44.06, 55.94, 1, 1),
('suroeste', 41.09, 58.91, 1, 1),
('suroeste', 38.12, 61.88, 1, 1),
('suroeste', 35.15, 64.85, 1, 1),
('suroeste', 32.18, 67.82, 1, 1),
('suroeste', 29.21, 70.79, 1, 1),
('suroeste', 26.24, 73.76, 1, 1),
('suroeste', 23.27, 76.73, 1, 1),
('suroeste', 20.3, 79.7, 1, 1),
('oeste', 41.6, 50, 1, 1),
('oeste', 37.4, 50, 1, 1),
('oeste', 33.2, 50, 1, 1),
('oeste', 29, 50, 1, 1),
('oeste', 24.8, 50, 1, 1),
('oeste', 20.6, 50, 1, 1),
('oeste', 16.4, 50, 1, 1),
('oeste', 12.2, 50, 1, 1),
('oeste', 8, 50, 1, 1),
('noroeste', 44.06, 44.06, 1, 1),
('noroeste', 41.09, 41.09, 1, 1),
('noroeste', 38.12, 38.12, 1, 1),
('noroeste', 35.15, 35.15, 1, 1),
('noroeste', 32.18, 32.18, 1, 1),
('noroeste', 29.21, 29.21, 1, 1),
('noroeste', 26.24, 26.24, 1, 1),
('noroeste', 23.27, 23.27, 1, 1),
('noroeste', 20.3, 20.3, 1, 1),
('norte', 50, 41.6, 1, 1),
('norte', 50, 37.4, 1, 1),
('norte', 50, 33.2, 1, 1),
('norte', 50, 29, 1, 1),
('norte', 50, 24.8, 1, 1),
('norte', 50, 20.6, 1, 1),
('norte', 50, 16.4, 1, 1),
('norte', 50, 12.2, 1, 1),
('norte', 50, 8, 1, 1),
('noreste', 55.94, 44.06, 1, 1),
('noreste', 58.91, 41.09, 1, 1),
('noreste', 61.88, 38.12, 1, 1),
('noreste', 64.85, 35.15, 1, 1),
('noreste', 67.82, 32.18, 1, 1),
('noreste', 70.79, 29.21, 1, 1),
('noreste', 73.76, 26.24, 1, 1),
('noreste', 76.73, 23.27, 1, 1),
('noreste', 79.7, 20.3, 1, 1);
