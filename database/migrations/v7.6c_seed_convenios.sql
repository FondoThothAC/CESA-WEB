-- ==========================================================
-- CESA WEB - Migration v7.6c: Precarga de Unidades Receptoras con Convenio
-- Fuente: convenios_pp_dcs.pdf (fi-csoc.unison.mx) - Convenios de la
--         División de Ciencias Sociales para Prácticas Profesionales
-- Idempotente: solo inserta si la razón social no existe.
-- Archivo: /database/migrations/v7.6c_seed_convenios.sql
-- ==========================================================

USE cesa_web;

-- 1. Consejo de la Judicatura Federal (SSU y PPU en órganos del Consejo)
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Consejo de la Judicatura Federal', 'Órgano del Poder Judicial de la Federación', 'Hermosillo, Sonora', 'Hermosillo', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Consejo de la Judicatura Federal');

-- 2. Sentit Nobis, S.C. (Cultura de la Paz y Métodos Alternativos)
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Sentit Nobis, S.C.', 'Despacho profesional - Cultura de la Paz y Resolución de Conflictos', 'Hermosillo, Sonora', 'Hermosillo', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Sentit Nobis, S.C.');

-- 3. Instituto Sonorense de la Mujer
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Instituto Sonorense de la Mujer (ISM)', 'Organismo Público Estatal', 'Hermosillo, Sonora', 'Hermosillo', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Instituto Sonorense de la Mujer (ISM)');

-- 4. Fundación Hermosiarte Sonora, A.C.
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Fundación Hermosiarte Sonora, A.C. (HERMOSIARTE)', 'Asociación Civil - Desarrollo Social y Cultura de Paz', 'Hermosillo, Sonora', 'Hermosillo', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Fundación Hermosiarte Sonora, A.C. (HERMOSIARTE)');

-- 5. Municipio de Hermosillo (Programa EnCausa)
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Municipio de Hermosillo, Sonora (Programa EnCausa)', 'Gobierno Municipal - Dirección General de Desarrollo Social', 'Hermosillo, Sonora', 'Hermosillo', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Municipio de Hermosillo, Sonora (Programa EnCausa)');

-- 6. Colegio de Sonora (COLSON)
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Colegio de Sonora (EL COLSON)', 'Institución de Investigación - CAEC USON 109 (Derecho, participación ciudadana y anticorrupción)', 'Hermosillo, Sonora', 'Hermosillo', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Colegio de Sonora (EL COLSON)');

-- 7. Secretaría Técnica y de Atención Ciudadana, Gobierno del Estado de Sonora
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Secretaría Técnica y de Atención Ciudadana, Gobierno del Estado de Sonora', 'Dependencia del Gobierno Estatal - Bufete Jurídico Gratuito', 'Hermosillo, Sonora', 'Hermosillo', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Secretaría Técnica y de Atención Ciudadana, Gobierno del Estado de Sonora');

-- 8. Universidad de Arizona (Derecho)
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'Universidad de Arizona, EUA', 'Institución de Educación Superior Internacional - Investigación aplicada', 'Tucson, Arizona, EUA', 'Tucson', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'Universidad de Arizona, EUA');

-- 9. UNAM - Instituto de Investigaciones Sociales
INSERT INTO unidades_receptoras (usuario_id, razon_social, giro_sector, domicilio, ciudad, responsable_nombre, responsable_puesto, aprobada)
SELECT NULL, 'UNAM - Instituto de Investigaciones Sociales', 'Institución de Educación Superior - Investigación Académica', 'Ciudad de México', 'CDMX', 'Responsable de Convenios', 'Enlace de Prácticas y Servicio Social', 1
WHERE NOT EXISTS (SELECT 1 FROM unidades_receptoras WHERE razon_social = 'UNAM - Instituto de Investigaciones Sociales');

-- ----------------------------------------------------------
-- Proyectos genéricos aprobados (uno por unidad) visibles para alumnos
-- ----------------------------------------------------------

-- 1. Consejo de la Judicatura Federal -> Derecho
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, a.id, 'Servicio Social y Prácticas Profesionales en órganos del Consejo de la Judicatura Federal', 'Órganos del Consejo', 'Derecho',
       'Interés por el ámbito judicial; capacidad de análisis documental; manejo de herramientas informáticas; responsabilidad y ética profesional.',
       5, 'Convenio de Colaboración firmado entre la DCS-UNISON y el Consejo de la Judicatura Federal (15/08/2016, vigencia indefinida) para la realización de SSU y PPU en órganos del Consejo.',
       'Consolidar la formación jurídica del estudiante mediante la participación en actividades propias de los órganos del Consejo de la Judicatura Federal.',
       'Apoyo en gestión documental y expedientes\nAsistencia en áreas administrativas y jurisdiccionales\nElaboración de reportes e indicadores\nApoyo en atención ciudadana', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur, areas a
WHERE ur.razon_social = 'Consejo de la Judicatura Federal' AND a.programa = 'Derecho'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%Consejo de la Judicatura Federal%');

-- 2. Sentit Nobis, S.C.
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, NULL, 'Cultura de la Paz y Métodos Alternativos para la Gestión de Conflictos', 'Áreas administrativas y de intervención social', 'Todas las licenciaturas de la DCS',
       'Habilidades de comunicación y mediación; trabajo en equipo; interés en métodos alternativos de resolución de conflictos.',
       5, 'Convenio de Colaboración firmado entre la DCS-UNISON y Sentit Nobis, S.C. (01/02/2017, renovación automática) sobre actividades relativas a Cultura de la Paz y Métodos Alternativos para la Gestión de Conflictos.',
       'Contribuir al desarrollo de una cultura de paz y vías de solución pacífica de conflictos, aplicando los conocimientos del programa educativo del estudiante.',
       'Apoyo en procesos de mediación y resolución de conflictos\nGestión documental y logística de talleres\nElaboración de reportes de actividades\nApoyo en vinculación institucional', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur
WHERE ur.razon_social = 'Sentit Nobis, S.C.'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%Cultura de la Paz y Métodos Alternativos%');

-- 3. Instituto Sonorense de la Mujer -> Trabajo Social
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, a.id, 'Prácticas Escolares y Servicio Social en el Instituto Sonorense de la Mujer', 'Áreas de atención y desarrollo social', 'Trabajo Social',
       'Sensibilidad social; habilidades de intervención y acompañamiento; manejo de información confidencial; empatía y trabajo en equipo.',
       5, 'Convenio de Colaboración firmado entre la DCS-UNISON (Departamento de Trabajo Social) y el ISM (08/03/2017, vigencia indefinida) para prácticas escolares y servicio social.',
       'Fortalecer la formación profesional del estudiante de Trabajo Social mediante la participación en los programas y servicios del ISM.',
       'Apoyo en programas de atención a mujeres\nGestión de casos y seguimiento institucional\nElaboración de informes sociales\nApoyo en campañas de prevención y difusión', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur, areas a
WHERE ur.razon_social = 'Instituto Sonorense de la Mujer (ISM)' AND a.programa = 'Trabajo Social'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%Instituto Sonorense de la Mujer%');

-- 4. Fundación Hermosiarte
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, NULL, 'Desarrollo de Cultura de Paz y Solución Pacífica de Conflictos con HERMOSIARTE', 'Programas comunitarios de la Fundación', 'Todas las licenciaturas de la DCS',
       'Interés por el trabajo comunitario y cultural; creatividad; habilidades de organización de eventos; trabajo en equipo.',
       5, 'Convenio General de Colaboración firmado entre la DCS-UNISON y Fundación Hermosiarte Sonora, A.C. (26/06/2017, 5 años) para la incorporación de estudiantes en proyectos de cultura de paz.',
       'Contribuir a los objetivos de HERMOSIARTE mediante la participación de estudiantes en proyectos comunitarios y culturales.',
       'Apoyo en programas comunitarios y culturales\nOrganización de eventos y talleres\nGestión documental y difusión\nElaboración de reportes de impacto', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur
WHERE ur.razon_social = 'Fundación Hermosiarte Sonora, A.C. (HERMOSIARTE)'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%HERMOSIARTE%');

-- 5. Municipio de Hermosillo (EnCausa)
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, a.id, 'Prácticas y Servicio Social en el Programa EnCausa (Municipio de Hermosillo)', 'Dirección General de Desarrollo Social', 'Trabajo Social',
       'Compromiso social; habilidades de intervención comunitaria; capacidad de trabajo en campo; ética profesional.',
       5, 'Convenio Específico firmado entre la DCS-UNISON (Departamento de Trabajo Social) y el Municipio de Hermosillo (27/06/2017, renovación automática) para programas académicos y operativos en el Programa EnCausa.',
       'Participar en los programas académicos, operativos y de vinculación del Programa EnCausa de la Dirección General de Desarrollo Social.',
       'Intervención comunitaria en colonias prioritarias\nApoyo en programas de desarrollo social\nRegistro y análisis de información de campo\nElaboración de informes de actividades', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur, areas a
WHERE ur.razon_social = 'Municipio de Hermosillo, Sonora (Programa EnCausa)' AND a.programa = 'Trabajo Social'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%Programa EnCausa%');

-- 6. Colegio de Sonora (COLSON) -> Derecho
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, a.id, 'Colaboración Académica en el CAEC USON 109 con El COLSON', 'Investigación - Derecho, participación ciudadana, anticorrupción', 'Derecho',
       'Interés por la investigación aplicada; habilidades de análisis y redacción; manejo de fuentes documentales; rigor académico.',
       5, 'Convenio de Colaboración Académica firmado entre el CAEC USON 109 (Departamento de Derecho, DCS-UNISON) y El COLSON (20/08/2017, vigencia indefinida).',
       'Participar en actividades de investigación y colaboración académica del CAEC USON 109 adscrito al Departamento de Derecho.',
       'Apoyo en investigación documental y de campo\nSistematización de información académica\nApoyo en eventos y publicaciones\nElaboración de reportes de avance', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur, areas a
WHERE ur.razon_social = 'Colegio de Sonora (EL COLSON)' AND a.programa = 'Derecho'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%CAEC USON 109%');

-- 7. Secretaría Técnica y de Atención Ciudadana
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, a.id, 'Prácticas Profesionales y Servicio Social en la Secretaría Técnica y de Atención Ciudadana', 'Bufete Jurídico Gratuito y servicios de asesoría', 'Derecho',
       'Conocimientos jurídicos básicos; habilidades de asesoría y atención ciudadana; ética; capacidad de trabajo con usuarios.',
       5, 'Convenio de Colaboración Institucional y Educativa firmado entre la DCS-UNISON (Departamento de Derecho) y la Secretaría (28/06/2017, vigencia indefinida) para SSU, PPU y asesoría jurídica del Bufete.',
       'Brindar apoyo en los servicios de asesoría jurídica del Bufete Jurídico Gratuito y las áreas de atención ciudadana de la dependencia.',
       'Apoyo en asesoría jurídica gratuita\nGestión y seguimiento de expedientes ciudadanos\nApoyo en atención y orientación a la ciudadanía\nElaboración de reportes de servicio', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur, areas a
WHERE ur.razon_social = 'Secretaría Técnica y de Atención Ciudadana, Gobierno del Estado de Sonora' AND a.programa = 'Derecho'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%Secretaría Técnica y de Atención Ciudadana%');

-- 8. Universidad de Arizona
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, a.id, 'Colaboración con la Universidad de Arizona - Investigación Aplicada (Derecho)', 'Proyectos de investigación aplicada y aprendizaje experiencial', 'Derecho',
       'Inglés intermedio-avanzado; interés en investigación aplicada internacional; habilidades de análisis comparativo.',
       3, 'Apéndice del Memorándum de Acuerdo Internacional firmado entre la DCS-UNISON (Departamento de Derecho) y la Universidad de Arizona (08/07/2017, vigencia indefinida).',
       'Involucrar a los estudiantes en proyectos existentes y futuros que enfatizan la investigación aplicada y el aprendizaje experiencial.',
       'Apoyo en proyectos de investigación aplicada\nSistematización de información bilingüe\nColaboración en actividades académicas binacionales\nElaboración de reportes académicos', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur, areas a
WHERE ur.razon_social = 'Universidad de Arizona, EUA' AND a.programa = 'Derecho'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%Universidad de Arizona%');

-- 9. UNAM - Instituto de Investigaciones Sociales
INSERT INTO practicas_proyectos (empresa_id, unidad_receptora_id, area_id, nombre_programa, areas_departamento, licenciatura_target, perfil_deseado, num_practicantes, justificacion, objetivo, plan_trabajo, apoyos, tipo_programa, estado)
SELECT NULL, ur.id, NULL, 'Actividades Académicas y Culturales con el IIS-UNAM', 'Instituto de Investigaciones Sociales', 'Todas las licenciaturas de la DCS',
       'Interés por la investigación social; habilidades de análisis; redacción académica; disciplina autónoma.',
       3, 'Convenio de Colaboración firmado entre la DCS-UNISON y la UNAM - Instituto de Investigaciones Sociales (21/09/2016) para realizar conjuntamente actividades académicas y culturales.',
       'Realizar conjuntamente actividades académicas y culturales en áreas de interés común con el IIS de la UNAM.',
       'Apoyo en proyectos de investigación social\nSistematización y análisis de datos\nApoyo en seminarios y eventos académicos\nElaboración de documentos académicos', '{"beca":"","comida":"","transporte":"","equipo":"","otro":"","ninguno":true}', 'practicas_profesionales', 'aprobado'
FROM unidades_receptoras ur
WHERE ur.razon_social = 'UNAM - Instituto de Investigaciones Sociales'
  AND NOT EXISTS (SELECT 1 FROM practicas_proyectos pp WHERE pp.nombre_programa LIKE '%IIS-UNAM%');
