-- ==========================================================
-- CESA WEB - Migration v7.6d: Convocatorias reales FICSOC + Config del Sitio
-- Fuente: fi-csoc.unison.mx (Convocatorias y Avisos / Noticias)
-- Archivo: /database/migrations/v7.6d_seed_noticias_y_config.sql
-- ==========================================================

USE cesa_web;

-- ----------------------------------------------------------
-- 1. Configuración del sitio (feature flags administrables)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_config (
    clave VARCHAR(60) PRIMARY KEY,
    valor VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO site_config (clave, valor) VALUES
('bolsa_trabajo_activa', '0');

-- ----------------------------------------------------------
-- 2. Convocatorias y noticias reales de la FICSOC (idempotente)
-- ----------------------------------------------------------

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Convocatoria para la asignación de BECAS AYUDANTÍA del semestre 2026-2',
       'Ya está abierta la convocatoria de Becas Ayudantía para el semestre 2026-2 de la Facultad Interdisciplinaria de Ciencias Sociales. Fecha límite: 27 de agosto.\n\nConsulta la convocatoria completa: https://fi-csoc.unison.mx/wp-content/uploads/2026/08/BECAS-AYUDANTIA-2026-2.pdf',
       1, '2026-08-17 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%BECAS AYUDANTÍA%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'CONVOCATORIA PROYECTOS DE VINCULACIÓN Y APOYO COMUNITARIO 2026-2',
       'Abierta la convocatoria de Proyectos de Vinculación y Apoyo Comunitario 2026-2 de la FICSOC. Vence el 11 de agosto de 2026.\n\nConvocatoria completa: https://fi-csoc.unison.mx/wp-content/uploads/2026/06/CONVOCATORIA-VINCULACION-Y-APOYO-COMUNITARIO_FI-2026-2.pdf',
       1, '2026-06-23 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%VINCULACIÓN Y APOYO COMUNITARIO%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT '2ª CONVOCATORIA PERIODO SABÁTICO 2026-2 / 2027-1',
       'Segunda convocatoria de Periodo Sabático 2026-2 / 2027-1 de la FICSOC. Vence el 29 de junio de 2026 a las 15:00 horas.\n\nConvocatoria: https://fi-csoc.unison.mx/wp-content/uploads/2026/06/CONVOCATORIA-PERIODO-SABATICO-2026-2.pdf',
       1, '2026-06-23 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%PERIODO SABÁTICO 2026-2%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Convocatoria de la Maestría en Ciencias Sociales 2026-2028 (PICS)',
       'Publicada la convocatoria del Programa Institucional de Ciencias Sociales (PICS): Maestría en Ciencias Sociales 2026-2028.\n\nConvocatoria: https://fi-csoc.unison.mx/wp-content/uploads/2025/12/convocatoria-PICS-Maestria-2026-2028.pdf',
       1, '2025-12-04 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%Maestría en Ciencias Sociales 2026-2028%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Convocatoria del Doctorado en Ciencias Sociales 2026-2029 (PICS)',
       'Publicada la convocatoria del Programa Institucional de Ciencias Sociales (PICS): Doctorado en Ciencias Sociales 2026-2029.\n\nConvocatoria: https://fi-csoc.unison.mx/wp-content/uploads/2025/12/convocatoria-PICS-Doctorado-2026-2029.pdf',
       1, '2025-12-04 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%Doctorado en Ciencias Sociales 2026-2029%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'CONVOCATORIA INTERNA 2026 DE APOYO A PROYECTOS DE INVESTIGACIÓN',
       'Convocatoria interna 2026 de apoyo a proyectos de investigación de la FICSOC. Vence el 2 de febrero de 2026.\n\nConvocatoria: https://fi-csoc.unison.mx/wp-content/uploads/2026/01/CONVOCATORIA-INTERNA-2026-DE-APOYO-A-PROYECTOS-DE-INVESTIGACION.pdf',
       1, '2026-01-13 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%APOYO A PROYECTOS DE INVESTIGACIÓN%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Diplomado en Comunicación — Campus Nogales',
       'La FICSOC abre el Diplomado en Comunicación en el Campus Nogales. Consulta información e inscripción en la página de la Facultad.\n\nVer publicación: https://fi-csoc.unison.mx/wp-content/uploads/2026/09/diplomado_comunicacion.jpeg',
       1, '2026-09-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%Diplomado en Comunicación%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Estudiante de Derecho de la UNISON es medallista centroamericano',
       'Un estudiante de la Licenciatura en Derecho de la UNISON obtuvo medalla en competencia centroamericana, poniendo en alto el nombre de la institución.\n\nVer nota completa: https://fi-csoc.unison.mx/es-medallista-centroamericano-estudiante-de-derecho-de-la-unison/',
       1, '2026-09-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%medallista centroamericano%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Reciben a una nueva generación de estudiantes de Trabajo Social',
       'La Licenciatura en Trabajo Social de la FICSOC dio la bienvenida a su nueva generación de estudiantes.\n\nVer nota: https://fi-csoc.unison.mx/reciben-a-una-nueva-generacion-de-estudiantes-de-trabajo-social/',
       1, '2026-09-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%nueva generación de estudiantes de Trabajo Social%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Concluye gira de promoción del III Congreso Internacional de Derecho',
       'Concluyó la gira de promoción del III Congreso Internacional de Derecho de la UNISON, organizado por el Departamento de Derecho de la FICSOC.\n\nVer nota: https://fi-csoc.unison.mx/concluye-gira-de-promocion-del-iii-congreso-internacional-de-derecho/',
       1, '2026-09-01 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%III Congreso Internacional de Derecho%');

INSERT INTO noticias (titulo, contenido, autor_id, fecha_publicacion)
SELECT 'Bienvenida e inducción a estudiantes de nuevo ingreso de Derecho',
       'El Departamento de Derecho de la FICSOC brindó la bienvenida e inducción a los estudiantes de nuevo ingreso.\n\nVer nota: https://fi-csoc.unison.mx/brindan-bienvenida-e-induccion-a-estudiantes-de-nuevo-ingreso-de-derecho/',
       1, '2026-08-25 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo LIKE '%inducción a estudiantes de nuevo ingreso de Derecho%');
