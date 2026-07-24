-- ==========================================================
-- CESA WEB - Migration v6.9: Datos Estudiantiles, Créditos Académicos y Permisos de Auditoría
-- Archivo: /database/migrations/v6.9_student_expediente_credits_and_auditoria.sql
-- ==========================================================

USE cesa_web;

-- 1. Agregar campos estructurados a la tabla usuarios si no existen
ALTER TABLE `usuarios`
ADD COLUMN `expediente` VARCHAR(50) NULL AFTER `matricula`,
ADD COLUMN `cp` VARCHAR(10) NULL AFTER `expediente`,
ADD COLUMN `celular` VARCHAR(20) NULL AFTER `cp`,
ADD COLUMN `curp` VARCHAR(20) NULL AFTER `celular`,
ADD COLUMN `creditos_acumulados` INT UNSIGNED DEFAULT 0 AFTER `curp`,
ADD COLUMN `creditos_totales_carrera` INT UNSIGNED DEFAULT 400 AFTER `creditos_acumulados`,
ADD COLUMN `semestre_calculado` INT UNSIGNED DEFAULT 1 AFTER `creditos_totales_carrera`;

-- Agregar índices para optimizar consultas de avisos y segmentación
ALTER TABLE `usuarios`
ADD INDEX `idx_expediente` (`expediente`),
ADD INDEX `idx_curp` (`curp`),
ADD INDEX `idx_creditos` (`creditos_acumulados`);

-- 2. Actualización sembrada de créditos para prueba de cálculo
-- Ejemplo: 200 créditos acumulados de 400 => (200/400)*8 + 1 = 5to Semestre
-- Ejemplo: 199 créditos acumulados de 400 => Math.floor((199/400)*8) + 1 = 4to Semestre
UPDATE `usuarios` 
SET `creditos_totales_carrera` = 400
WHERE `creditos_totales_carrera` IS NULL OR `creditos_totales_carrera` = 0;

UPDATE `usuarios`
SET `semestre_calculado` = LEAST(8, GREATEST(1, FLOOR((`creditos_acumulados` / `creditos_totales_carrera`) * 8) + 1))
WHERE `creditos_totales_carrera` > 0;
