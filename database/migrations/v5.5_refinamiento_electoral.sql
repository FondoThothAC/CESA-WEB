-- CESA WEB v5.5 - Refinamiento Electoral y Data Science
-- Fecha: 2026-06-12

-- 1. Permiso para Consejo de Elecciones
ALTER TABLE `admin_permisos`
ADD COLUMN `consejo_elecciones` BOOLEAN DEFAULT FALSE AFTER `rol_comunicacion`;

-- 2. Modificaciones a Votaciones
ALTER TABLE `votaciones`
ADD COLUMN `fecha_publicacion_resultados` DATETIME NULL AFTER `fecha_fin`,
ADD COLUMN `actualizaciones_por_hora` BOOLEAN DEFAULT FALSE AFTER `fecha_publicacion_resultados`,
ADD COLUMN `redes_ip_permitidas` TEXT NULL COMMENT 'JSON array de IPs, ej: ["148.225.", "10.0."]' AFTER `actualizaciones_por_hora`;

-- 3. Modificaciones a Votos (De Hash a Encrypted)
-- NOTA: Dado que cambiamos el paradigma de hash (voto_hash) a cifrado reversible (voto_encriptado),
-- vaciamos la tabla (si estuviera en pruebas) para cambiar el esquema.
TRUNCATE TABLE `votos_anonimos`;

ALTER TABLE `votos_anonimos`
DROP INDEX `idx_voto_unico`,
DROP COLUMN `voto_hash`,
ADD COLUMN `voto_encriptado` VARCHAR(512) NOT NULL AFTER `candidato_id`,
ADD UNIQUE KEY `idx_unico_voto_enc` (`votacion_id`, `voto_encriptado`);
