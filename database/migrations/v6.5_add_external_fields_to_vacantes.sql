ALTER TABLE bolsa_vacantes
ADD COLUMN enlace_externo VARCHAR(512) NULL AFTER skill_id,
ADD COLUMN contacto VARCHAR(512) NULL AFTER enlace_externo;
