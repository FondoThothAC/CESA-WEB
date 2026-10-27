-- ==========================================================
-- CESA WEB - Migration v7.6b: Catálogo real de áreas FICSOC
-- Fuente: fi-csoc.unison.mx (Prácticas Profesionales y Servicio Social)
-- Archivo: /database/migrations/v7.6b_seed_areas_ficsoc.sql
-- ==========================================================

USE cesa_web;

-- Catálogo oficial: División de Ciencias Sociales (campus Hermosillo)
-- Coordinadores de Prácticas Profesionales y de Servicio Social por licenciatura
INSERT INTO areas (division, programa, departamento, jefe_departamento, jefe_titulo,
                   coord_practicas_nombre, coord_practicas_email,
                   coord_ss_nombre, coord_ss_email, activo) VALUES
('Ciencias Sociales', 'Derecho', 'Derecho', 'Por asignar', 'Dr(a).',
 'Dra. Lucila Caballero Gutiérrez', 'lucila.caballero@unison.mx',
 'Mtro. Víctor Manuel Ramírez Leyva', 'victor.ramirez@unison.mx', 1),
('Ciencias Sociales', 'Psicología', 'Psicología y Ciencias de la Comunicación', 'Por asignar', 'Dr(a).',
 'Dr. Miguel Contreras Orduño', 'miguel.contreras@unison.mx',
 'Dra. Teresa Iveth Sotelo Quiñonez', 'teresa.sotelo@unison.mx', 1),
('Ciencias Sociales', 'Ciencias de la Comunicación', 'Psicología y Ciencias de la Comunicación', 'Por asignar', 'Dr(a).',
 'Dr. Flavio Valencia Castillo', 'flavio.valencia@unison.mx',
 'Dra. Elodia Guadalupe Ortega Escalante', 'elodia.ortega@unison.mx', 1),
('Ciencias Sociales', 'Historia', 'Historia y Antropología', 'Por asignar', 'Dr(a).',
 'Dr. Miguel Ángel Grijalva Dávila', 'miguel.grijalva@unison.mx',
 'Dr. Miguel Ángel Grijalva Dávila', 'miguel.grijalva@unison.mx', 1),
('Ciencias Sociales', 'Trabajo Social', 'Trabajo Social', 'Por asignar', 'Dr(a).',
 'Mtra. Jacobet Rosas Yépez', 'jacobet.rosas@unison.mx',
 'Mtra. Luz Jhoana Gutiérrez Córdova', 'luz.gutierrez@unison.mx', 1),
('Ciencias Sociales', 'Sociología', 'Sociología y Administración Pública', 'Por asignar', 'Dr(a).',
 'Dr. Francisco Manuel Piña Osuna', 'francisco.pina@unison.mx',
 'Dr. Francisco Manuel Piña Osuna', 'francisco.pina@unison.mx', 1),
('Ciencias Sociales', 'Administración Pública', 'Sociología y Administración Pública', 'Por asignar', 'Dr(a).',
 'Dr. Francisco Manuel Piña Osuna', 'francisco.pina@unison.mx',
 'Dr. Francisco Manuel Piña Osuna', 'francisco.pina@unison.mx', 1),
('Ciencias Sociales', 'Educación', 'Historia y Antropología', 'Por asignar', 'Dr(a).',
 'Dra. Carolina López Larios', 'carolina.lopezlarios@unison.mx',
 'Dra. Daniela Borbón Mendívil', 'daniela.borbon@unison.mx', 1),
('Ciencias Sociales', 'Antropología', 'Historia y Antropología', 'Por asignar', 'Dr(a).',
 'Dr. Miguel Ángel Esparza Escalante', 'miguel.esparza@unison.mx',
 'Dr. Miguel Ángel Esparza Escalante', 'miguel.esparza@unison.mx', 1),
('Ciencias Sociales', 'Seguridad Pública', 'Sociología y Administración Pública', 'Por asignar', 'Dr(a).',
 'Dr. Francisco Manuel Piña Osuna', 'francisco.pina@unison.mx',
 'Dr. Francisco Manuel Piña Osuna', 'francisco.pina@unison.mx', 1),
('Ciencias Económicas y Administrativas', 'Negocios y Comercio Internacionales', 'Economía', 'Dra. Lizbeth Salgado Beltrán', 'Dra.',
 'Por asignar', NULL,
 'Por asignar', NULL, 1)
ON DUPLICATE KEY UPDATE
    division = VALUES(division),
    departamento = VALUES(departamento),
    jefe_departamento = VALUES(jefe_departamento),
    jefe_titulo = VALUES(jefe_titulo),
    coord_practicas_nombre = VALUES(coord_practicas_nombre),
    coord_practicas_email = VALUES(coord_practicas_email),
    coord_ss_nombre = VALUES(coord_ss_nombre),
    coord_ss_email = VALUES(coord_ss_email),
    activo = 1;

-- Coordinadoras generales de la FICSOC (referencia para notificaciones)
-- Prácticas Profesionales: Dra. Mariel Michessedett Montes Castillo <mariel.montes@unison.mx>
-- Servicio Social: Mtra. Patricia Moya Grijalva <patricia.moya@unison.mx>
