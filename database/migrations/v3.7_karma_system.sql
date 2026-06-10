-- Migration: Sistema de Karma (v3.7)
-- CESA WEB Industrialized
-- Desc: Migración de Likes simples a Upvotes/Downvotes bidireccionales

-- 1. Crear la nueva tabla de votos
CREATE TABLE IF NOT EXISTS votos_muro (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    valor TINYINT NOT NULL COMMENT '1 para Upvote, -1 para Downvote',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_voto_usuario (publicacion_id, usuario_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones_muro(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Expandir la tabla de publicaciones con métricas de Karma
ALTER TABLE publicaciones_muro 
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN upvotes_count INT UNSIGNED DEFAULT 0,
ADD COLUMN downvotes_count INT UNSIGNED DEFAULT 0;

-- 3. MIGRACIÓN DE DATOS (likes_muro -> votos_muro)
-- Transformamos los likes existentes en votos positivos (+1)
INSERT IGNORE INTO votos_muro (publicacion_id, usuario_id, valor, created_at)
SELECT publicacion_id, usuario_id, 1, created_at FROM likes_muro;

-- 4. ACTUALIZACIÓN INICIAL DE SCORES
-- Sincronizamos los contadores de la tabla principal con los nuevos votos migrados
UPDATE publicaciones_muro p
SET 
    p.upvotes_count = (SELECT COUNT(*) FROM votos_muro v WHERE v.publicacion_id = p.id AND v.valor = 1),
    p.downvotes_count = (SELECT COUNT(*) FROM votos_muro v WHERE v.publicacion_id = p.id AND v.valor = -1),
    p.score = (SELECT COALESCE(SUM(valor), 0) FROM votos_muro v WHERE v.publicacion_id = p.id);

-- 5. OPCIONAL: Limpieza (No eliminamos likes_muro por seguridad hasta validación final)
-- RENAME TABLE likes_muro TO _likes_muro_legacy;
