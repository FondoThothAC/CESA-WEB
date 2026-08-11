-- Migración V6.1 - Job Applications and Practice Reports
-- Permite a los estudiantes subir memorias de prácticas y a las empresas aceptar/rechazar.

ALTER TABLE postulaciones
ADD COLUMN IF NOT EXISTS memoria_path VARCHAR(255) DEFAULT NULL AFTER cv_path,
ADD COLUMN IF NOT EXISTS feedback_empresa TEXT DEFAULT NULL AFTER mensaje_estudiante,
ADD COLUMN IF NOT EXISTS calificacion TINYINT(1) DEFAULT NULL AFTER feedback_empresa;

-- Si la Foreign Key original de postulaciones apuntaba a 'vacantes' en lugar de 'bolsa_vacantes', 
-- no lo corregiremos aquí para no romper datos, pero asumimos que el id vacante_id hace match.
