-- ==========================================================
-- CESA WEB - Migration v6.9: Datos Estudiantiles, Créditos Académicos y Permisos de Auditoría
-- Archivo: /database/migrations/v6.9_student_expediente_credits_and_auditoria.sql
-- ==========================================================

USE cesa_web;

-- 1. Agregar campos de forma individual para tolerancia a fallos
ALTER TABLE `usuarios` ADD COLUMN `expediente` VARCHAR(50) NULL AFTER `matricula`;
ALTER TABLE `usuarios` ADD COLUMN `cp` VARCHAR(10) NULL AFTER `expediente`;
ALTER TABLE `usuarios` ADD COLUMN `celular` VARCHAR(20) NULL AFTER `cp`;
ALTER TABLE `usuarios` ADD COLUMN `creditos_acumulados` INT UNSIGNED DEFAULT 0 AFTER `celular`;
ALTER TABLE `usuarios` ADD COLUMN `creditos_totales_carrera` INT UNSIGNED DEFAULT 400 AFTER `creditos_acumulados`;
ALTER TABLE `usuarios` ADD COLUMN `semestre_calculado` INT UNSIGNED DEFAULT 1 AFTER `creditos_totales_carrera`;

-- 2. Asegurar la columna CURP
ALTER TABLE `usuarios` ADD COLUMN `curp` VARCHAR(20) NULL AFTER `celular`;

-- 3. Índices de optimización
ALTER TABLE `usuarios` ADD INDEX `idx_expediente` (`expediente`);
ALTER TABLE `usuarios` ADD INDEX `idx_creditos` (`creditos_acumulados`);

-- 4. Actualización sembrada de créditos para prueba de cálculo
UPDATE `usuarios` 
SET `creditos_totales_carrera` = 400
WHERE `creditos_totales_carrera` IS NULL OR `creditos_totales_carrera` = 0;

UPDATE `usuarios`
SET `semestre_calculado` = LEAST(8, GREATEST(1, FLOOR((`creditos_acumulados` / `creditos_totales_carrera`) * 8) + 1))
WHERE `creditos_totales_carrera` > 0;
