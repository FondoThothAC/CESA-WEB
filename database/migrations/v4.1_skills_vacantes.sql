-- Integración de Skills Recomendadas en la Bolsa de Trabajo
ALTER TABLE bolsa_vacantes 
ADD COLUMN skill_id INT UNSIGNED NULL AFTER carreras_target,
ADD CONSTRAINT fk_vacante_skill FOREIGN KEY (skill_id) REFERENCES skills_catalogo(id) ON DELETE SET NULL;
