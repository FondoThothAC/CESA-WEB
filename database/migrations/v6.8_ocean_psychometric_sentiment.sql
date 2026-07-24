-- ==========================================================
-- CESA WEB - Migration v6.8: Modelo OCEAN (Big Five) y 7 Emociones Basales
-- ==========================================================

USE cesa_web;

-- 1. Ampliar campos OCEAN en ia_chat_sesiones
ALTER TABLE `ia_chat_sesiones`
ADD COLUMN IF NOT EXISTS `ocean_openness` INT DEFAULT 50 COMMENT 'Apertura a la experiencia (0-100)',
ADD COLUMN IF NOT EXISTS `ocean_conscientiousness` INT DEFAULT 50 COMMENT 'Responsabilidad / Disciplina (0-100)',
ADD COLUMN IF NOT EXISTS `ocean_extraversion` INT DEFAULT 50 COMMENT 'Extraversión (0-100)',
ADD COLUMN IF NOT EXISTS `ocean_agreeableness` INT DEFAULT 50 COMMENT 'Amabilidad / Empatía (0-100)',
ADD COLUMN IF NOT EXISTS `ocean_neuroticism` INT DEFAULT 50 COMMENT 'Neuroticismo / Estrés (0-100)',
ADD COLUMN IF NOT EXISTS `emocion_dominante` VARCHAR(50) DEFAULT 'neutral' COMMENT 'Alegría, Confianza, Ansiedad, Frustración, Curiosidad, Agotamiento, Neutral';

-- 2. Ampliar campos OCEAN en ia_chat_mensajes
ALTER TABLE `ia_chat_mensajes`
ADD COLUMN IF NOT EXISTS `ocean_openness` INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS `ocean_conscientiousness` INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS `ocean_extraversion` INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS `ocean_agreeableness` INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS `ocean_neuroticism` INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS `emocion_primaria` VARCHAR(50) DEFAULT 'neutral';
