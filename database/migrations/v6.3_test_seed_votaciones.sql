-- CESA WEB v6.3 - Sembrado de Votaciones de Prueba (Negocios y Psicología)
-- Fecha: 2026-06-29

USE cesa_web;

-- Borramos registros previos si existieran para evitar duplicados en la prueba
DELETE FROM votaciones WHERE titulo LIKE '%Negocios y Comercio Internacional%' OR titulo LIKE '%Psicología%';

-- 1. Insertamos las Votaciones (Aperturas Electorales)
INSERT INTO votaciones 
(titulo, descripcion, carrera_objetivo, fecha_inicio, fecha_fin, fecha_publicacion_resultados, estado, redes_ip_permitidas) 
VALUES 
('Elecciones Sociedad de Alumnos de Negocios y Comercio Internacional', 'Votación oficial para elegir a la nueva mesa directiva de la carrera de Negocios y Comercio Internacional.', 'Negocios y Comercio Internacional', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 'activa', '["148.225."]'),
('Elecciones Sociedad de Alumnos de Psicología', 'Votación oficial para elegir a la nueva mesa directiva de la carrera de Psicología. Participa y haz escuchar tu voz.', 'Psicología', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 'activa', '["148.225."]');

-- 2. Recuperamos los IDs insertados usando variables
SET @id_negocios = (SELECT id FROM votaciones WHERE carrera_objetivo = 'Negocios y Comercio Internacional' ORDER BY id DESC LIMIT 1);
SET @id_psicologia = (SELECT id FROM votaciones WHERE carrera_objetivo = 'Psicología' ORDER BY id DESC LIMIT 1);

-- 3. Insertamos los candidatos para Negocios y Comercio Internacional
INSERT INTO votacion_candidatos (votacion_id, nombre, descripcion) VALUES 
(@id_negocios, 'Planilla Innova (Negocios)', 'Visión global, emprendimiento internacional y alianzas con empresas locales e internacionales.'),
(@id_negocios, 'Planilla Fuerza (Negocios)', 'Mejores alianzas estratégicas empresariales y apoyo para certificaciones aduanales.');

-- 4. Insertamos los candidatos para Psicología
INSERT INTO votacion_candidatos (votacion_id, nombre, descripcion) VALUES 
(@id_psicologia, 'Planilla Azul (Psicología)', 'Propuestas enfocadas en la salud mental estudiantil, talleres de intervención y congresos.'),
(@id_psicologia, 'Planilla Oro (Psicología)', 'Enfoque en prácticas profesionales de alto impacto e investigación neurológica.');
