-- CESA WEB v6.4 - Actualizar Fotos de Candidatos de Prueba
-- Fecha: 2026-06-29

USE cesa_web;

UPDATE votacion_candidatos SET foto_path = '/candidate_innova.png' WHERE nombre = 'Planilla Innova (Negocios)';
UPDATE votacion_candidatos SET foto_path = '/candidate_fuerza.png' WHERE nombre = 'Planilla Fuerza (Negocios)';
UPDATE votacion_candidatos SET foto_path = '/candidate_azul.png' WHERE nombre = 'Planilla Azul (Psicología)';
UPDATE votacion_candidatos SET foto_path = '/candidate_oro.png' WHERE nombre = 'Planilla Oro (Psicología)';
