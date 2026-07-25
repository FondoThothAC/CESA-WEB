-- ==========================================================
-- CESA WEB - Migration v7.3: Semilla de Usuario Mariana (A221216515@unison.mx)
-- Archivo: /database/migrations/v7.3_seed_user_a221216515.sql
-- ==========================================================

USE cesa_web;

-- 1. Insertar o actualizar a Mariana (a221216515@unison.mx) con teléfono 6624052630
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
    'a221216515@unison.mx',
    '$2y$12$7Qv4Jm3h1R6Wpxx5JdYoeO.708v9w31C/vI0FpC8Q3f1/23456789', -- Contraseña predeterminada: CESA_unison_2026!
    'Mariana',
    '221216515',
    '221216515',
    '6624052630',
    '6624052630',
    'mesa_directiva',
    1
)
ON DUPLICATE KEY UPDATE 
    nombre_completo = 'Mariana',
    telefono = '6624052630',
    celular = '6624052630',
    matricula = '221216515',
    expediente = '221216515',
    rol = 'mesa_directiva',
    activo = 1;
