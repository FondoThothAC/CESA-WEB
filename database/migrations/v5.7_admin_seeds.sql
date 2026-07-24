-- CESA WEB v5.7 - Seeds de Administradores y Permisos de Gobernanza
-- Fecha: 2026-06-13

USE cesa_web;

-- 1. Asegurar la existencia de software@fondothoth.com con rol admin y activo
INSERT INTO usuarios (email, password_hash, nombre_completo, matricula, rol, activo)
VALUES (
    'software@fondothoth.com',
    '$2y$12$7Qv4Jm3h1R6Wpxx5JdYoeO.708v9w31C/vI0FpC8Q3f1/23456789', -- default hash for 'cesa_unison_2026'
    'Soporte Thoth AC',
    '00000000',
    'admin',
    1
)
ON DUPLICATE KEY UPDATE rol = 'admin', activo = 1;

-- 2. Asegurar la existencia de a213203453@unison.mx con rol admin y activo
INSERT INTO usuarios (email, password_hash, nombre_completo, matricula, rol, activo)
VALUES (
    'a213203453@unison.mx',
    '$2y$12$7Qv4Jm3h1R6Wpxx5JdYoeO.708v9w31C/vI0FpC8Q3f1/23456789', -- default hash for 'cesa_unison_2026'
    'Administrador Estudiante',
    '213203453',
    'admin',
    1
)
ON DUPLICATE KEY UPDATE rol = 'admin', activo = 1;

-- 3. Asignar todos los permisos granulares a software@fondothoth.com en admin_permisos
INSERT INTO admin_permisos (
    usuario_id,
    publicar_anuncios,
    bazar_y_reservaciones,
    bolsa_trabajo,
    roles_social,
    ver_denuncias,
    rol_comunicacion,
    consejo_elecciones,
    permiso_ia,
    permiso_wifi
)
SELECT id, 1, 1, 1, 1, 1, 1, 1, 1, 1 FROM usuarios WHERE email = 'software@fondothoth.com'
ON DUPLICATE KEY UPDATE
    publicar_anuncios = 1,
    bazar_y_reservaciones = 1,
    bolsa_trabajo = 1,
    roles_social = 1,
    ver_denuncias = 1,
    rol_comunicacion = 1,
    consejo_elecciones = 1,
    permiso_ia = 1,
    permiso_wifi = 1;

-- 4. Asignar todos los permisos granulares a a213203453@unison.mx en admin_permisos
INSERT INTO admin_permisos (
    usuario_id,
    publicar_anuncios,
    bazar_y_reservaciones,
    bolsa_trabajo,
    roles_social,
    ver_denuncias,
    rol_comunicacion,
    consejo_elecciones,
    permiso_ia,
    permiso_wifi
)
SELECT id, 1, 1, 1, 1, 1, 1, 1, 1, 1 FROM usuarios WHERE email = 'a213203453@unison.mx'
ON DUPLICATE KEY UPDATE
    publicar_anuncios = 1,
    bazar_y_reservaciones = 1,
    bolsa_trabajo = 1,
    roles_social = 1,
    ver_denuncias = 1,
    rol_comunicacion = 1,
    consejo_elecciones = 1,
    permiso_ia = 1,
    permiso_wifi = 1;
