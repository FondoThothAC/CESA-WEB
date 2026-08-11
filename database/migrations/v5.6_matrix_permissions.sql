-- CESA WEB v5.6 - Matriz de Permisos Extendida
-- Fecha: 2026-06-13

USE cesa_web;

-- 1. Agregar nuevas columnas de permisos granulares a admin_permisos
ALTER TABLE `admin_permisos`
ADD COLUMN `permiso_ia` BOOLEAN DEFAULT FALSE AFTER `consejo_elecciones`,
ADD COLUMN `permiso_wifi` BOOLEAN DEFAULT FALSE AFTER `permiso_ia`;

-- 2. Asegurarse de que el usuario Master tenga todos los permisos activos
UPDATE admin_permisos ap
JOIN usuarios u ON ap.usuario_id = u.id
SET ap.permiso_ia = 1,
    ap.permiso_wifi = 1,
    ap.publicar_anuncios = 1,
    ap.bazar_y_reservaciones = 1,
    ap.bolsa_trabajo = 1,
    ap.roles_social = 1,
    ap.ver_denuncias = 1,
    ap.rol_comunicacion = 1,
    ap.consejo_elecciones = 1
WHERE u.email = 'software@fondothoth.com';
