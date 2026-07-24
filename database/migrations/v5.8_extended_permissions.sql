-- CESA WEB v5.8 - Permisos Extendidos
-- Fecha: 2026-06-13

USE cesa_web;

-- 1. Agregar nuevas columnas a admin_permisos
ALTER TABLE `admin_permisos`
ADD COLUMN `tutorias_asesorias` BOOLEAN DEFAULT FALSE AFTER `permiso_wifi`,
ADD COLUMN `evaluaciones_psicometricas` BOOLEAN DEFAULT FALSE AFTER `tutorias_asesorias`,
ADD COLUMN `skills_cursos` BOOLEAN DEFAULT FALSE AFTER `evaluaciones_psicometricas`;

-- 2. Actualizar permisos para los admins predeterminados (Modo Dios y CESA Presidencia)
UPDATE admin_permisos ap
JOIN usuarios u ON ap.usuario_id = u.id
SET ap.tutorias_asesorias = 1,
    ap.evaluaciones_psicometricas = 1,
    ap.skills_cursos = 1
WHERE u.email IN ('software@fondothoth.com', 'a213203453@unison.mx');
