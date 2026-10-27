-- =====================================================================
-- v8.0_bazar_realtime_and_polish.sql
-- Bazar Emprendedor: bus de eventos en tiempo real + columnas de
-- verificacion que usaba backend/api/admin/bazar.php pero no existian.
-- Aplicar: mysql -h host -u user bazar_cesa < v8.0_bazar_realtime_and_polish.sql
-- =====================================================================

-- 1. Bus de eventos para el streaming SSE (Rust lee esta tabla y difunde)
--    tipos: reserva_creada | reserva_aprobada | reserva_rechazada |
--           puesto_asignado | puesto_liberado | edicion_creada |
--           edicion_archivada | voto_registrado | producto_agregado |
--           logo_actualizado
CREATE TABLE IF NOT EXISTS bazar_eventos (
    id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tipo      VARCHAR(40)  NOT NULL,
    payload   JSON         NULL,
    creado_en TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bazar_eventos_tipo (tipo),
    KEY idx_bazar_eventos_creado (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Auditoria de verificacion de negocios (usada por admin/bazar.php action=verificar)
--    MariaDB 10.x NO soporta ADD COLUMN IF NOT EXISTS de forma fiable; si ya
--    existen las columnas, la linea correspondiente falla y se ignora.
ALTER TABLE emprendimientos
    ADD COLUMN verificado_por INT UNSIGNED NULL AFTER verificado,
    ADD COLUMN fecha_verificacion DATETIME NULL AFTER verificado_por;

-- 3. Catalogo de productos: sin cambios de esquema, solo se conecta la UI.
-- 4. Purga automatica del bus (conserva 10.000 eventos, ~30 ediciones)
DELIMITER //
CREATE EVENT IF NOT EXISTS ev_purga_bazar_eventos
ON SCHEDULE EVERY 1 DAY
DO
    DELETE FROM bazar_eventos WHERE id < (
        SELECT COALESCE(MIN(id),0) FROM (
            SELECT id FROM bazar_eventos ORDER BY id DESC LIMIT 10000
        ) AS top
    );
//
DELIMITER ;

-- Event scheduler debe estar ON en el VPS:
-- SET GLOBAL event_scheduler = ON;
