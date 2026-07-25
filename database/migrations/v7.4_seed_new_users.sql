-- ==========================================================
-- CESA WEB - Migration v7.4: Semilla de Nuevos Usuarios (Arturo, Alexandra, Luisa)
-- Archivo: /database/migrations/v7.4_seed_new_users.sql
-- ==========================================================

USE cesa_web;

-- 1. Arturo (a220207212@unison.mx)
INSERT INTO usuarios (
    email,
    password_hash,
    nombre_completo,
    matricula,
    expediente,
    telefono,
    celular,
    rol,
    activo
)
VALUES (
    'a220207212@unison.mx',
    '$2y$12$7Qv4Jm3h1R6Wpxx5JdYoeO.708v9w31C/vI0FpC8Q3f1/23456789', -- Contraseña predeterminada: CESA_unison_2026!
    'Arturo',
    '220207212',
    '220207212',
    '6623807302',
    '6623807302',
    'mesa_directiva',
    1
)
ON DUPLICATE KEY UPDATE 
    nombre_completo = 'Arturo',
    telefono = '6623807302',
    celular = '6623807302',
    matricula = '220207212',
    expediente = '220207212',
    rol = 'mesa_directiva',
    activo = 1;

-- 2. Alexandra (a222211128@unison.mx)
INSERT INTO usuarios (
    email,
    password_hash,
    nombre_completo,
    matricula,
    expediente,
    telefono,
    celular,
    rol,
    activo
)
VALUES (
    'a222211128@unison.mx',
    '$2y$12$7Qv4Jm3h1R6Wpxx5JdYoeO.708v9w31C/vI0FpC8Q3f1/23456789', -- Contraseña predeterminada: CESA_unison_2026!
    'Alexandra',
    '222211128',
    '222211128',
    '6621730049',
    '6621730049',
    'mesa_directiva',
    1
)
ON DUPLICATE KEY UPDATE 
    nombre_completo = 'Alexandra',
    telefono = '6621730049',
    celular = '6621730049',
    matricula = '222211128',
    expediente = '222211128',
    rol = 'mesa_directiva',
    activo = 1;

-- 3. Luisa (a224220214@unison.mx)
INSERT INTO usuarios (
    email,
    password_hash,
    nombre_completo,
    matricula,
    expediente,
    telefono,
    celular,
    rol,
    activo
)
VALUES (
    'a224220214@unison.mx',
    '$2y$12$7Qv4Jm3h1R6Wpxx5JdYoeO.708v9w31C/vI0FpC8Q3f1/23456789', -- Contraseña predeterminada: CESA_unison_2026!
    'Luisa',
    '224220214',
    '224220214',
    '6623735293',
    '6623735293',
    'mesa_directiva',
    1
)
ON DUPLICATE KEY UPDATE 
    nombre_completo = 'Luisa',
    telefono = '6623735293',
    celular = '6623735293',
    matricula = '224220214',
    expediente = '224220214',
    rol = 'mesa_directiva',
    activo = 1;
