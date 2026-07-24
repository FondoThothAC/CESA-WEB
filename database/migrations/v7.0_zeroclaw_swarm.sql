-- ==========================================================
-- CESA WEB - Migration v7.0: ZeroClaw Multi-Agent Swarm & Board Meetings
-- Archivo: /database/migrations/v7.0_zeroclaw_swarm.sql
-- ==========================================================

-- 1. Tabla de Sub-Agentes del Swarm
CREATE TABLE IF NOT EXISTS `zeroclaw_agents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_agente` VARCHAR(100) NOT NULL,
  `encargado_nombre` VARCHAR(100) NOT NULL,
  `usuario_id` INT NULL,
  `eje_trabajo` VARCHAR(150) NOT NULL,
  `color_hex` VARCHAR(20) DEFAULT '#3b82f6',
  `avatar_sprite` VARCHAR(100) DEFAULT 'agent_male_1',
  `telegram_chat_id` VARCHAR(100) NULL,
  `canal_notificacion` ENUM('telegram', 'email', 'ambos') DEFAULT 'telegram',
  `prompt_personalidad` TEXT NULL,
  `req_aprobacion` TINYINT(1) DEFAULT 1,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Tareas Programadas (Cronjobs por Agente)
CREATE TABLE IF NOT EXISTS `zeroclaw_agent_jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `agent_id` INT NOT NULL,
  `titulo_tarea` VARCHAR(255) NOT NULL,
  `frecuencia_label` VARCHAR(100) NOT NULL,
  `cron_expression` VARCHAR(100) NOT NULL,
  `tipo_accion` ENUM('recordatorio', 'reporte_eje', 'flyer_canva', 'comunicado_borrador', 'junta_expertos') NOT NULL,
  `detalles_json` TEXT NULL,
  `ultima_ejecucion` DATETIME NULL,
  `proxima_ejecucion` DATETIME NULL,
  `activa` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`agent_id`) REFERENCES `zeroclaw_agents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Borradores en Pendiente de Aprobación (Canva / Comunicados)
CREATE TABLE IF NOT EXISTS `zeroclaw_pending_approvals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `agent_id` INT NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `contenido_preview` TEXT NOT NULL,
  `media_url` VARCHAR(512) NULL,
  `estado` ENUM('pendiente', 'aprobado', 'rechazado', 'cambios_solicitados') DEFAULT 'pendiente',
  `feedback_humano` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`agent_id`) REFERENCES `zeroclaw_agents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabla de Minutas / Sesiones de "Mesa de Expertos" (Juntas de Agentes)
CREATE TABLE IF NOT EXISTS `zeroclaw_meeting_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha_sesion` DATETIME NOT NULL,
  `tipo_sesion` ENUM('martes_sincro', 'jueves_sincro', 'extraordinaria') DEFAULT 'martes_sincro',
  `total_interacciones` INT DEFAULT 12,
  `resumen_ejecutivo` TEXT NOT NULL,
  `acuerdos_json` TEXT NULL,
  `telegram_sent` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- SEEDS INICIALES: 8 Miembros de Mesa Directiva + Agente Líder BOB
-- ==========================================================
INSERT IGNORE INTO `zeroclaw_agents` (`id`, `nombre_agente`, `encargado_nombre`, `eje_trabajo`, `color_hex`, `avatar_sprite`, `prompt_personalidad`, `req_aprobacion`, `activo`) VALUES
(1, 'Bob Prime', 'Mesa Directiva (General)', 'Coordinación Swarm & Presidencia', '#6366f1', 'agent_leader', 'Eres Bob, el agente líder del CESA UNISON. Coordinas las tareas de todos los agentes.', 1, 1),
(2, 'Atlas', 'Arturo', 'Emprendimiento & Bazar Estudiantil', '#f59e0b', 'agent_male_1', 'Especialista en impulsar micronegocios, asignación de espacios del Bazar CESA y convocatorias emprendedoras.', 1, 1),
(3, 'Aria', 'Ángela', 'Comunicaciones, Redes & Canva', '#ec4899', 'agent_female_1', 'Encargada del diseño institucional en Canva, redacción de copys para Instagram/Facebook y difusión masiva.', 1, 1),
(4, 'Orión', 'Oscar', 'Deportes & Torneos Universitario', '#10b981', 'agent_male_2', 'Organizador de ligas interfacultades, carreras atléticas y vinculación deportiva.', 1, 1),
(5, 'Minerva', 'Mariana', 'Asuntos Académicos & Tutorías', '#8b5cf6', 'agent_female_2', 'Gestión de asesorías pares, banco de apuntes, simulación EXANI y trámites escolares.', 1, 1),
(6, 'Aurora', 'Alexandra', 'Bienestar Estudiantil & Salud', '#14b8a6', 'agent_female_3', 'Supervisión de salud mental, becas de comedor y campañas de atención psicosocial.', 1, 1),
(7, 'Lyra', 'Bárbara', 'Cultura & Gaceta CESA', '#f43f5e', 'agent_female_4', 'Edición de la Gaceta CESA, talleres culturales y eventos artísticos del campus.', 1, 1),
(8, 'Cleo', 'Christian', 'Finanzas & Tesorería CESA', '#eab308', 'agent_male_3', 'Control presupuestal, auditoría transparente de recursos y compras de logística.', 1, 1),
(9, 'Nova', 'Luisa', 'Relaciones Externas & Convenios', '#06b6d4', 'agent_female_5', 'Alianzas con empresas, descuentos estudiantiles en comercios y visitas industriales.', 1, 1);

-- Seed de Tareas Cron por defecto
INSERT IGNORE INTO `zeroclaw_agent_jobs` (`id`, `agent_id`, `titulo_tarea`, `frecuencia_label`, `cron_expression`, `tipo_accion`, `detalles_json`, `activa`) VALUES
(1, 1, 'Mesa de Expertos (Junta Semanal)', 'Martes y Jueves 09:00 AM', '0 9 * * 2,4', 'junta_expertos', '{"max_interacciones": 12, "enviar_telegram_cco": true}', 1),
(2, 2, 'Reporte de Espacios del Bazar', 'Cada Lunes 10:00 AM', '0 10 * * 1', 'reporte_eje', '{"eje": "bazar"}', 1),
(3, 3, 'Renovación de Diseños en Canva', 'Cada Miércoles 04:00 PM', '0 16 * * 3', 'flyer_canva', '{"plantilla": "boletin_semanal"}', 1),
(4, 5, 'Sincronización de Banco de Tutorías', 'Cada Viernes 02:00 PM', '0 14 * * 5', 'recordatorio', '{"target": "asesores"}', 1);
