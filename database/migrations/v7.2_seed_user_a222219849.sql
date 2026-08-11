-- ==========================================================
-- CESA WEB - Migration v7.2: Semilla de Usuario A222219849@unison.mx
-- Archivo: /database/migrations/v7.2_seed_user_a222219849.sql
-- ==========================================================

USE cesa_web;

-- 1. Insertar o actualizar el usuario A222219849@unison.mx con teléfono 6624102866
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
    'a222219849@unison.mx',
    '$2y$12$7Qv4Jm3h1R6Wpxx5JdYoeO.708v9w31C/vI0FpC8Q3f1/23456789', -- Contraseña predeterminada: CESA_unison_2026!
    'Bárbara',
    '222219849',
    '222219849',
    '6624102866',
    '6624102866',
    'mesa_directiva',
    1
)
ON DUPLICATE KEY UPDATE 
    nombre_completo = 'Bárbara',
    telefono = '6624102866',
    celular = '6624102866',
    matricula = '222219849',
    expediente = '222219849',
    rol = 'mesa_directiva',
    activo = 1;
