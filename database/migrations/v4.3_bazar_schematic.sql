-- Migración v4.3: Soporte para Mapa Esquemático de la Plaza del Estudiante
-- Este script habilita la vinculación de emprendimientos a puestos específicos dentro del layout SVG.

-- 1. Añadir columna de puesto a emprendimientos
ALTER TABLE emprendimientos 
ADD COLUMN puesto_id INT UNSIGNED NULL AFTER categoria,
ADD INDEX (puesto_id);

-- 2. Tabla de definición de puestos (Coordenadas X, Y relativas al SVG)
CREATE TABLE IF NOT EXISTS cat_puestos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    zona VARCHAR(50) NULL, -- Ej: 'pasillo_norte', 'radial_ne'
    coord_x DECIMAL(5,2) NOT NULL, -- Porcentaje 0-100
    coord_y DECIMAL(5,2) NOT NULL, -- Porcentaje 0-100
    disponible TINYINT(1) DEFAULT 1,
    activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Inserción de semillas para los puestos (Lógica radial básica)
-- Nota: Estas coordenadas se ajustarán finamente en el componente frontend.
-- Radial Norte (x=50, y decreciente)
INSERT INTO cat_puestos (zona, coord_x, coord_y) VALUES 
('norte', 50.0, 40.0), ('norte', 50.0, 35.0), ('norte', 50.0, 30.0), ('norte', 50.0, 25.0), ('norte', 50.0, 20.0), ('norte', 50.0, 15.0);

-- Radial Sur (x=50, y creciente)
INSERT INTO cat_puestos (zona, coord_x, coord_y) VALUES 
('sur', 50.0, 60.0), ('sur', 50.0, 65.0), ('sur', 50.0, 70.0), ('sur', 50.0, 75.0), ('sur', 50.0, 80.0), ('sur', 50.0, 85.0);

-- Radial Este (y=50, x creciente)
INSERT INTO cat_puestos (zona, coord_x, coord_y) VALUES 
('este', 60.0, 50.0), ('este', 65.0, 50.0), ('este', 70.0, 50.0), ('este', 75.0, 50.0), ('este', 80.0, 50.0), ('este', 85.0, 50.0);

-- Radial Oeste (y=50, x decreciente)
INSERT INTO cat_puestos (zona, coord_x, coord_y) VALUES 
('oeste', 40.0, 50.0), ('oeste', 35.0, 50.0), ('oeste', 30.0, 50.0), ('oeste', 25.0, 50.0), ('oeste', 20.0, 50.0), ('oeste', 15.0, 50.0);

-- Diagonales (Noreste, Sureste, Suroeste, Noroeste) se añadirán en la lógica de generación del worker o manualmente.
