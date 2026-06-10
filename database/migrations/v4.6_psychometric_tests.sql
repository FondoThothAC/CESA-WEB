-- =============================================
-- TABLAS PARA MÓDULO DE TESTS PSICOMÉTRICOS Y VOCACIONALES
-- =============================================

CREATE TABLE IF NOT EXISTS tests_psicometricos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    acronimo VARCHAR(20) NOT NULL,
    descripcion TEXT,
    tipo ENUM('personalidad', 'vocacional', 'comportamiento') NOT NULL,
    duracion_estimada_minutos INT DEFAULT 15,
    activo BOOLEAN DEFAULT TRUE,
    icono VARCHAR(50) DEFAULT 'fa-brain',
    color_hex VARCHAR(7) DEFAULT '#8B5CF6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests_dimensiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    nombre_dimension VARCHAR(50) NOT NULL,
    clave VARCHAR(20) NOT NULL, -- ej. 'E' para Extroversion
    descripcion TEXT,
    color_hex VARCHAR(7) DEFAULT '#3B82F6',
    FOREIGN KEY (test_id) REFERENCES tests_psicometricos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tests_preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    dimension_id INT NOT NULL,
    pregunta TEXT NOT NULL,
    tipo_respuesta ENUM('likert_5', 'likert_7', 'opcion_multiple', 'dicotomica') DEFAULT 'likert_5',
    opciones JSON NULL, -- Para opcion_multiple
    inverso BOOLEAN DEFAULT FALSE, -- Si es true, el puntaje likert se invierte
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (test_id) REFERENCES tests_psicometricos(id) ON DELETE CASCADE,
    FOREIGN KEY (dimension_id) REFERENCES tests_dimensiones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tests_resultados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    test_id INT NOT NULL,
    resultados_json JSON NOT NULL, -- Ej: {"E": 80, "I": 20}
    perfil_generado VARCHAR(100), -- Ej: "INTJ" o "El Arquitecto"
    respuestas_brutas JSON, -- Opcional, guarda las respuestas crudas para analisis
    fecha_realizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests_psicometricos(id) ON DELETE CASCADE
);

-- =============================================
-- DATOS INICIALES (Modelos)
-- =============================================

INSERT IGNORE INTO tests_psicometricos (id, nombre, acronimo, descripcion, tipo, duracion_estimada_minutos, icono, color_hex) VALUES
(1, 'Modelo de los Cinco Grandes', 'OCEAN', 'Evalúa cinco dimensiones amplias de la personalidad: Apertura, Responsabilidad, Extraversión, Amabilidad y Neuroticismo.', 'personalidad', 10, 'fa-globe', '#3B82F6'),
(2, 'Test de 16 Personalidades', 'MBTI', 'Clasifica la personalidad en 16 tipos basados en las preferencias cognitivas de Carl Jung.', 'personalidad', 15, 'fa-users', '#8B5CF6'),
(3, 'Evaluación de Comportamiento', 'DISC', 'Analiza cómo interactúas con otros basándose en Dominancia, Influencia, Estabilidad y Cumplimiento.', 'comportamiento', 10, 'fa-chart-pie', '#EC4899'),
(4, 'Inventario de Personalidad', 'HEXACO', 'Similar al modelo OCEAN pero añade un sexto factor: Honestidad-Humildad.', 'personalidad', 15, 'fa-hexagon', '#10B981'),
(5, 'Intereses Vocacionales (Holland)', 'RIASEC', 'Clasifica las vocaciones en 6 áreas: Realista, Investigador, Artístico, Social, Emprendedor y Convencional.', 'vocacional', 12, 'fa-briefcase', '#F59E0B');

-- Ejemplo: Dimensiones y Preguntas para DISC
INSERT IGNORE INTO tests_dimensiones (id, test_id, nombre_dimension, clave, descripcion, color_hex) VALUES
(1, 3, 'Dominancia', 'D', 'Directo, orientado a resultados, firme, de voluntad fuerte y contundente.', '#EF4444'),
(2, 3, 'Influencia', 'I', 'Extrovertido, entusiasta, optimista, animado y comunicativo.', '#EAB308'),
(3, 3, 'Estabilidad', 'S', 'Ecuánime, complaciente, paciente, humilde y con tacto.', '#22C55E'),
(4, 3, 'Cumplimiento', 'C', 'Analítico, reservado, preciso, reservado y sistemático.', '#3B82F6');

-- Algunas preguntas para DISC (usando likert de 5 puntos: 1 Nada de acuerdo -> 5 Muy de acuerdo)
INSERT IGNORE INTO tests_preguntas (test_id, dimension_id, pregunta, tipo_respuesta) VALUES
(3, 1, 'Tomo la iniciativa para resolver problemas rápidamente.', 'likert_5'),
(3, 1, 'Me gustan los desafíos y tomar riesgos.', 'likert_5'),
(3, 2, 'Disfruto interactuar y persuadir a los demás.', 'likert_5'),
(3, 2, 'Me gusta ser el centro de atención en los eventos sociales.', 'likert_5'),
(3, 3, 'Prefiero un ambiente predecible y seguir rutinas.', 'likert_5'),
(3, 3, 'Soy paciente y prefiero ayudar a otros a mantener la calma.', 'likert_5'),
(3, 4, 'Me aseguro de revisar todos los detalles antes de tomar una decisión.', 'likert_5'),
(3, 4, 'Sigo las reglas y procedimientos estrictamente.', 'likert_5');
