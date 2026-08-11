-- =========================================================================
-- MIGRACIÓN: SEMBRADO DE BATERÍA COMPLETA DE 214 PREGUNTAS V4.7
-- Archivo: database/migrations/v4.7_seed_psychometric_tests.sql
-- =========================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Limpieza de preguntas y dimensiones previas
DELETE FROM tests_preguntas;
DELETE FROM tests_dimensiones;

-- Asegurar que los 5 tests existan con nombres genéricos sin marcas comerciales
INSERT INTO tests_psicometricos (id, nombre, acronimo, descripcion, tipo, duracion_estimada_minutos, icono, color_hex, activo) VALUES
(1, 'Inventario de Personalidad', 'IP-G', 'Evalúa cinco dimensiones fundamentales para comprender tus tendencias de comportamiento, adaptación y temperamento.', 'personalidad', 15, 'fa-globe', '#3B82F6', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), acronimo=VALUES(acronimo), descripcion=VALUES(descripcion), icono=VALUES(icono), color_hex=VALUES(color_hex), activo=1;

INSERT INTO tests_psicometricos (id, nombre, acronimo, descripcion, tipo, duracion_estimada_minutos, icono, color_hex, activo) VALUES
(2, 'Evaluación de Preferencias Personales', 'EPP', 'Identifica tus preferencias en la toma de decisiones, asimilación de información y estilos de aprendizaje.', 'personalidad', 15, 'fa-users', '#8B5CF6', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), acronimo=VALUES(acronimo), descripcion=VALUES(descripcion), icono=VALUES(icono), color_hex=VALUES(color_hex), activo=1;

INSERT INTO tests_psicometricos (id, nombre, acronimo, descripcion, tipo, duracion_estimada_minutos, icono, color_hex, activo) VALUES
(3, 'Evaluación de Comportamiento', 'EVC', 'Analiza tus estilos de conducta y reacción en entornos laborales, académicos y de trabajo colaborativo.', 'comportamiento', 10, 'fa-chart-pie', '#EC4899', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), acronimo=VALUES(acronimo), descripcion=VALUES(descripcion), icono=VALUES(icono), color_hex=VALUES(color_hex), activo=1;

INSERT INTO tests_psicometricos (id, nombre, acronimo, descripcion, tipo, duracion_estimada_minutos, icono, color_hex, activo) VALUES
(4, 'Inventario de Personalidad Expandido', 'IP-E', 'Evalúa rasgos adicionales de comportamiento interpersonal, honestidad social, humildad y tenacidad.', 'personalidad', 20, 'fa-cube', '#10B981', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), acronimo=VALUES(acronimo), descripcion=VALUES(descripcion), icono=VALUES(icono), color_hex=VALUES(color_hex), activo=1;

INSERT INTO tests_psicometricos (id, nombre, acronimo, descripcion, tipo, duracion_estimada_minutos, icono, color_hex, activo) VALUES
(5, 'Inventario de Intereses Vocacionales', 'IIV', 'Clasifica tus preferencias de actividades y campos profesionales para guiar tu desarrollo académico e intelectual.', 'vocacional', 15, 'fa-briefcase', '#F59E0B', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), acronimo=VALUES(acronimo), descripcion=VALUES(descripcion), icono=VALUES(icono), color_hex=VALUES(color_hex), activo=1;


-- =========================================================================
-- DIMENSIONES
-- =========================================================================

-- OCEAN (id=1)
INSERT INTO tests_dimensiones (id, test_id, nombre_dimension, clave, descripcion, color_hex) VALUES
(5, 1, 'Apertura a la Experiencia', 'O', 'Curiosidad intelectual, imaginación y aprecio por el arte.', '#3B82F6'),
(6, 1, 'Responsabilidad', 'C', 'Autodisciplina, organización, orden y orientación al logro.', '#10B981'),
(7, 1, 'Extraversión', 'E', 'Sociabilidad, asertividad, entusiasmo y búsqueda de estímulos.', '#F59E0B'),
(8, 1, 'Amabilidad', 'A', 'Empatía, altruismo, confianza y disposición a ayudar.', '#EC4899'),
(9, 1, 'Neuroticismo', 'N', 'Inestabilidad emocional, tendencia a la preocupación o estrés.', '#EF4444');

-- MBTI (id=2)
INSERT INTO tests_dimensiones (id, test_id, nombre_dimension, clave, descripcion, color_hex) VALUES
(10, 2, 'Extraversión', 'E', 'Enfoque de energía en el mundo exterior de personas y cosas.', '#3B82F6'),
(11, 2, 'Introversión', 'I', 'Enfoque de energía en el mundo interno de ideas y reflexiones.', '#6366F1'),
(12, 2, 'Sensación', 'S', 'Percepción a través de hechos observables y detalles concretos.', '#10B981'),
(13, 2, 'Intuición', 'N', 'Percepción a través de relaciones, patrones y posibilidades futuras.', '#8B5CF6'),
(14, 2, 'Pensamiento', 'T', 'Toma de decisiones mediante análisis lógico y racional objetivo.', '#EF4444'),
(15, 2, 'Sentimiento', 'F', 'Toma de decisiones mediante valores personales e impacto humano.', '#EC4899'),
(16, 2, 'Juicio', 'J', 'Preferencia por la organización, planificación y cierre rápido.', '#F59E0B'),
(17, 2, 'Percepción', 'P', 'Preferencia por la espontaneidad, adaptabilidad y opciones abiertas.', '#6B7280');

-- DISC (id=3)
INSERT INTO tests_dimensiones (id, test_id, nombre_dimension, clave, descripcion, color_hex) VALUES
(1, 3, 'Dominancia', 'D', 'Directo, orientado a resultados, firme, de voluntad fuerte y contundente.', '#EF4444'),
(2, 3, 'Influencia', 'I', 'Extrovertido, entusiasta, optimista, animado y comunicativo.', '#EAB308'),
(3, 3, 'Estabilidad', 'S', 'Ecuánime, complaciente, paciente, humilde y con tacto.', '#22C55E'),
(4, 3, 'Cumplimiento', 'C', 'Analítico, reservado, preciso, reservado y sistemático.', '#3B82F6');

-- HEXACO (id=4)
INSERT INTO tests_dimensiones (id, test_id, nombre_dimension, clave, descripcion, color_hex) VALUES
(18, 4, 'Honestidad-Humildad', 'H', 'Sinceridad, justicia, evitación de la codicia y modestia.', '#10B981'),
(19, 4, 'Emocionalidad', 'E', 'Sensibilidad, temor, ansiedad y sentimentalismo.', '#EF4444'),
(20, 4, 'Extraversión', 'X', 'Autoestima social, audacia social, sociabilidad y vitalidad.', '#3B82F6'),
(21, 4, 'Afabilidad', 'A', 'Tolerancia, paciencia, gentileza y flexibilidad.', '#F59E0B'),
(22, 4, 'Diligencia', 'C', 'Organización, perfeccionismo, prudencia y tenacidad.', '#8B5CF6'),
(23, 4, 'Apertura a la Experiencia', 'O', 'Apreciación estética, curiosidad, creatividad y originalidad.', '#EC4899');

-- RIASEC (id=5)
INSERT INTO tests_dimensiones (id, test_id, nombre_dimension, clave, descripcion, color_hex) VALUES
(24, 5, 'Realista', 'R', 'Prefiere herramientas, máquinas y trabajo en el mundo físico.', '#EF4444'),
(25, 5, 'Investigador', 'I', 'Prefiere resolver problemas analíticos y científicos.', '#3B82F6'),
(26, 5, 'Artístico', 'A', 'Prefiere la creación estética, música e imaginación libre.', '#EC4899'),
(27, 5, 'Social', 'S', 'Prefiere ayudar, enseñar y cuidar de otros.', '#22C55E'),
(28, 5, 'Emprendedor', 'E', 'Prefiere liderar, negociar, persuadir y asumir riesgos.', '#F59E0B'),
(29, 5, 'Convencional', 'C', 'Prefiere seguir normas, ordenar datos y administrar.', '#6B7280');


-- =========================================================================
-- PREGUNTAS (1 A 214)
-- =========================================================================

-- 1) HEXACO-like (Preguntas 1 a 60)
-- H (1-10)
INSERT INTO tests_preguntas (id, test_id, dimension_id, pregunta, tipo_respuesta, inverso) VALUES
(1, 4, 18, 'Devolvería una billetera extraviada con dinero sin esperar recompensa.', 'likert_5', 0),
(2, 4, 18, 'Siento que merezco privilegios que la mayoría no tiene.', 'likert_5', 1),
(3, 4, 18, 'Me incomodaría recibir un cumplido que sé que no merezco.', 'likert_5', 0),
(4, 4, 18, 'En algunas situaciones, está bien engañar para lograr mis objetivos.', 'likert_5', 1),
(5, 4, 18, 'Evito alardear de mis logros para no parecer arrogante.', 'likert_5', 0),
(6, 4, 18, 'Si un sistema me cobrara de menos por error, no lo notificaría.', 'likert_5', 1),
(7, 4, 18, 'Denunciaría a un compañero que descubra haciendo trampa, aunque sea amigo.', 'likert_5', 0),
(8, 4, 18, 'Creo que tengo derecho a un mejor trato por mi talento.', 'likert_5', 1),
(9, 4, 18, 'Me resulta incómodo estar con personas que presumen de estatus.', 'likert_5', 0),
(10, 4, 18, 'Reportaría un abuso de información privilegiada aunque me perjudique.', 'likert_5', 0),
-- E (11-20)
(11, 4, 19, 'Las películas tristes me afectan profundamente.', 'likert_5', 0),
(12, 4, 19, 'Rara vez me siento ansioso ante situaciones inciertas.', 'likert_5', 1),
(13, 4, 19, 'Hablar de mis sentimientos con desconocidos me resulta sencillo.', 'likert_5', 0),
(14, 4, 19, 'Frente al peligro, mantengo la calma con facilidad.', 'likert_5', 1),
(15, 4, 19, 'Necesito consuelo cuando algo me sale mal.', 'likert_5', 0),
(16, 4, 19, 'Casi nunca me preocupo por cosas pequeñas.', 'likert_5', 1),
(17, 4, 19, 'Lloro con relativa facilidad ante escenas emotivas.', 'likert_5', 0),
(18, 4, 19, 'No suelo sentir miedo ante situaciones nuevas.', 'likert_5', 1),
(19, 4, 19, 'Me involucro emocionalmente con los problemas de mis amigos cercanos.', 'likert_5', 0),
(20, 4, 19, 'Logro mantener la compostura en emergencias.', 'likert_5', 1),
-- X (21-30)
(21, 4, 20, 'Me siento cómodo siendo el centro de atención en reuniones.', 'likert_5', 0),
(22, 4, 20, 'Prefiero actividades solitarias a fiestas con mucha gente.', 'likert_5', 1),
(23, 4, 20, 'Iniciar conversaciones con desconocidos me resulta sencillo.', 'likert_5', 0),
(24, 4, 20, 'La idea de hablar en público me genera mucha incomodidad.', 'likert_5', 1),
(25, 4, 20, 'Disfruto de eventos con mucha gente y energía.', 'likert_5', 0),
(26, 4, 20, 'Suelo preferir quedarme en casa antes que salir con mucha gente.', 'likert_5', 1),
(27, 4, 20, 'Tengo facilidad para animar a un grupo apagado.', 'likert_5', 0),
(28, 4, 20, 'Me agota estar rodeado de personas por períodos largos.', 'likert_5', 1),
(29, 4, 20, 'Me siento con energía después de estar con amigos.', 'likert_5', 0),
(30, 4, 20, 'Prefiero observar antes que participar activamente en una reunión.', 'likert_5', 1),
-- A (31-40)
(31, 4, 21, 'Trato con respeto a las personas incluso cuando no estoy de acuerdo.', 'likert_5', 0),
(32, 4, 21, 'Me cuesta trabajo perdonar a quienes me han ofendido.', 'likert_5', 1),
(33, 4, 21, 'Suelo ceder en discusiones para mantener la armonía.', 'likert_5', 0),
(34, 4, 21, 'Tiendo a ser bastante crítico con los demás.', 'likert_5', 1),
(35, 4, 21, 'Coopero incluso con personas que no me agradan.', 'likert_5', 0),
(36, 4, 21, 'Me resulta difícil hacer favores sin esperar algo a cambio.', 'likert_5', 1),
(37, 4, 21, 'Evito confrontaciones, aunque tenga razón.', 'likert_5', 0),
(38, 4, 21, 'Cuando alguien me hace un favor, siento que me debe algo.', 'likert_5', 1),
(39, 4, 21, 'Disculparme cuando me equivoco me sale con naturalidad.', 'likert_5', 0),
(40, 4, 21, 'A veces soy más brusco de lo necesario al decir lo que pienso.', 'likert_5', 1),
-- C (41-50)
(41, 4, 22, 'Sigo mis planes incluso cuando aparecen imprevistos.', 'likert_5', 0),
(42, 4, 22, 'A menudo dejo tareas importantes para último momento.', 'likert_5', 1),
(43, 4, 22, 'Me esfuerzo por hacer las cosas con precisión, no solo terminarlas.', 'likert_5', 0),
(44, 4, 22, 'Pierdo objetos con frecuencia por descuido.', 'likert_5', 1),
(45, 4, 22, 'Cumplo mis compromisos aunque me resulten incómodos.', 'likert_5', 0),
(46, 4, 22, 'Me cuesta mantener el orden en mi espacio de trabajo.', 'likert_5', 1),
(47, 4, 22, 'Reviso varias veces mi trabajo antes de considerarlo terminado.', 'likert_5', 0),
(48, 4, 22, 'Postergar tareas me sale con facilidad.', 'likert_5', 1),
(49, 4, 22, 'Soy de las personas que llegan puntuales a las citas.', 'likert_5', 0),
(50, 4, 22, 'Me distraigo con facilidad cuando trabajo en algo aburrido.', 'likert_5', 1),
-- O (51-60)
(51, 4, 23, 'Disfruto aprendiendo sobre temas que no conozco.', 'likert_5', 0),
(52, 4, 23, 'Prefiero ideas concretas antes que especulaciones abstractas.', 'likert_5', 1),
(53, 4, 23, 'Me atrae explorar perspectivas poco convencionales.', 'likert_5', 0),
(54, 4, 23, 'La poesía y el arte me resultan poco interesantes.', 'likert_5', 1),
(55, 4, 23, 'Me gusta resolver problemas que requieren pensamiento original.', 'likert_5', 0),
(56, 4, 23, 'Me aburre discutir teorías filosóficas.', 'likert_5', 1),
(57, 4, 23, 'Siento curiosidad por personas de culturas muy distintas a la mía.', 'likert_5', 0),
(58, 4, 23, 'Prefiero rutinas conocidas antes que probar cosas nuevas.', 'likert_5', 1),
(59, 4, 23, 'Me atrae indagar en cómo funcionan las cosas a nivel profundo.', 'likert_5', 0),
(60, 4, 23, 'Las discusiones intelectuales me parecen una pérdida de tiempo.', 'likert_5', 1);


-- 2) OCEAN / Big Five (Preguntas 61 a 110)
-- O (61-70)
INSERT INTO tests_preguntas (id, test_id, dimension_id, pregunta, tipo_respuesta, inverso) VALUES
(61, 1, 5, 'Tengo una imaginación muy activa.', 'likert_5', 0),
(62, 1, 5, 'Prefiero variedad a rutina.', 'likert_5', 0),
(63, 1, 5, 'Me gusta reflexionar sobre problemas abstractos.', 'likert_5', 0),
(64, 1, 5, 'La poesía y el teatro me resultan poco atractivos.', 'likert_5', 1),
(65, 1, 5, 'Tengo muchos intereses distintos.', 'likert_5', 0),
(66, 1, 5, 'Evito deliberadamente profundizar en teorías filosóficas.', 'likert_5', 1),
(67, 1, 5, 'Me cuesta trabajo entender metáforas y figuras literarias.', 'likert_5', 1),
(68, 1, 5, 'Disfruto de actividades que desafían mi forma de pensar.', 'likert_5', 0),
(69, 1, 5, 'La innovación me atrae más que lo tradicional.', 'likert_5', 0),
(70, 1, 5, 'Pierdo interés rápido en conversaciones superficiales.', 'likert_5', 1),
-- C (71-80)
(71, 1, 6, 'Siempre termino lo que empiezo.', 'likert_5', 0),
(72, 1, 6, 'Dejo mi habitación desordenada con frecuencia.', 'likert_5', 1),
(73, 1, 6, 'Hago las cosas de forma metódica y organizada.', 'likert_5', 0),
(74, 1, 6, 'A menudo pospongo decisiones importantes.', 'likert_5', 1),
(75, 1, 6, 'Cumplo puntualmente con mis obligaciones.', 'likert_5', 0),
(76, 1, 6, 'Me cuesta volver al trabajo tras una pausa.', 'likert_5', 1),
(77, 1, 6, 'Reviso mis tareas varias veces antes de darlas por terminadas.', 'likert_5', 0),
(78, 1, 6, 'Tiendo a ser algo descuidado en los detalles.', 'likert_5', 1),
(79, 1, 6, 'Planifico con tiempo antes de actuar.', 'likert_5', 0),
(80, 1, 6, 'Me distraigo con facilidad cuando la tarea es repetitiva.', 'likert_5', 1),
-- E (81-90)
(81, 1, 7, 'Me resulta fácil conocer gente nueva.', 'likert_5', 0),
(82, 1, 7, 'Prefiero quedarme en casa a salir a una fiesta.', 'likert_5', 1),
(83, 1, 7, 'Hablo con varias personas en una reunión con naturalidad.', 'likert_5', 0),
(84, 1, 7, 'Me siento incómodo siendo el centro de atención.', 'likert_5', 1),
(85, 1, 7, 'Disfruto de reuniones con mucha gente.', 'likert_5', 0),
(86, 1, 7, 'La idea de conocer extraños me resulta agotadora.', 'likert_5', 1),
(87, 1, 7, 'Tomo la iniciativa en conversaciones grupales.', 'likert_5', 0),
(88, 1, 7, 'Evito llamar la atención sobre mí.', 'likert_5', 1),
(89, 1, 7, 'Tengo un círculo amplio de conocidos.', 'likert_5', 0),
(90, 1, 7, 'Me siento apagado después de socializar por largo tiempo.', 'likert_5', 1),
-- A (91-100)
(91, 1, 8, 'Trato a los demás con respeto y consideración.', 'likert_5', 0),
(92, 1, 8, 'Tiendo a ser distante y frío con desconocidos.', 'likert_5', 1),
(93, 1, 8, 'Me preocupo genuinamente por el bienestar de los otros.', 'likert_5', 0),
(94, 1, 8, 'Me cuesta confiar en las intenciones de los demás.', 'likert_5', 1),
(95, 1, 8, 'Disculpo con facilidad a quienes me han ofendido.', 'likert_5', 0),
(96, 1, 8, 'Suelo ser bastante escéptico del prójimo.', 'likert_5', 1),
(97, 1, 8, 'Ayudo a otros aunque no me lo pidan.', 'likert_5', 0),
(98, 1, 8, 'Pienso que la mayoría de la gente actúa por interés propio.', 'likert_5', 1),
(99, 1, 8, 'Me resulta sencillo ponerme en el lugar del otro.', 'likert_5', 0),
(100, 1, 8, 'Tiendo a sospechar de los motivos de quienes me rodean.', 'likert_5', 1),
-- N (101-110)
(101, 1, 9, 'Me preocupo por muchas cosas.', 'likert_5', 0),
(102, 1, 9, 'Rara vez me siento melancólico.', 'likert_5', 1),
(103, 1, 9, 'Me altero con facilidad.', 'likert_5', 0),
(104, 1, 9, 'Mantengo el control bajo presión.', 'likert_5', 1),
(105, 1, 9, 'Siento ansiedad ante situaciones nuevas.', 'likert_5', 0),
(106, 1, 9, 'Mi estado de ánimo es bastante estable.', 'likert_5', 1),
(107, 1, 9, 'Me irrito con frecuencia por cosas pequeñas.', 'likert_5', 0),
(108, 1, 9, 'Reacciono de forma calmada ante los problemas.', 'likert_5', 1),
(109, 1, 9, 'Tiemblo ante la idea de un fracaso personal.', 'likert_5', 0),
(110, 1, 9, 'Rara vez experimento cambios bruscos de humor.', 'likert_5', 1);


-- 3) DISC-like (Preguntas 111 a 134)
-- D (111-116)
INSERT INTO tests_preguntas (id, test_id, dimension_id, pregunta, tipo_respuesta, inverso) VALUES
(111, 3, 1, 'Tiendo a tomar la iniciativa cuando el grupo no se decide.', 'likert_5', 0),
(112, 3, 1, 'Disfruto asumir retos difíciles.', 'likert_5', 0),
(113, 3, 1, 'Prefiero persuadir antes que negociar a largo plazo.', 'likert_5', 0),
(114, 3, 1, 'Evito los conflictos directos cuando puedo.', 'likert_5', 1),
(115, 3, 1, 'Tomo decisiones con rapidez, incluso con información incompleta.', 'likert_5', 0),
(116, 3, 1, 'Me siento incómodo cuando tengo que ejercer autoridad.', 'likert_5', 1),
-- I (117-122)
(117, 3, 2, 'Me resulta fácil ganarme la confianza de desconocidos.', 'likert_5', 0),
(118, 3, 2, 'Disfruto motivar a otros en proyectos conjuntos.', 'likert_5', 0),
(119, 3, 2, 'Hablo con entusiasmo sobre temas que me interesan.', 'likert_5', 0),
(120, 3, 2, 'Prefiero observar antes que participar en una conversación grupal.', 'likert_5', 1),
(121, 3, 2, 'Expreso mis emociones con facilidad.', 'likert_5', 0),
(122, 3, 2, 'Me cuesta transmitir entusiasmo al contar algo.', 'likert_5', 1),
-- S (123-128)
(123, 3, 3, 'Prefiero entornos predecibles a entornos cambiantes.', 'likert_5', 0),
(124, 3, 3, 'Me incomodan los cambios bruscos de plan.', 'likert_5', 1),
(125, 3, 3, 'Soy de las personas que mantienen la calma en crisis.', 'likert_5', 0),
(126, 3, 3, 'Disfruto asumir tareas nuevas con poca preparación.', 'likert_5', 1),
(127, 3, 3, 'Tiendo a ser paciente con personas de ritmo más lento.', 'likert_5', 0),
(128, 3, 3, 'Me aburre la rutina prolongada.', 'likert_5', 1),
-- C (129-134)
(129, 3, 4, 'Reviso los detalles antes de tomar una decisión.', 'likert_5', 0),
(130, 3, 4, 'Me siento cómodo actuando por intuición más que por datos.', 'likert_5', 1),
(131, 3, 4, 'Sigo procedimientos establecidos aunque vea atajos mejores.', 'likert_5', 0),
(132, 3, 4, 'Prefiero la velocidad a la precisión en tareas críticas.', 'likert_5', 1),
(133, 3, 4, 'Analizo pros y contras antes de actuar.', 'likert_5', 0),
(134, 3, 4, 'Me frustran los procesos muy estructurados.', 'likert_5', 1);


-- 4) RIASEC (Preguntas 135 a 182)
-- R (135-142)
INSERT INTO tests_preguntas (id, test_id, dimension_id, pregunta, tipo_respuesta, inverso) VALUES
(135, 5, 24, 'Reparar un electrodoméstico averiado.', 'likert_5', 0),
(136, 5, 24, 'Operar maquinaria o herramientas manuales.', 'likert_5', 0),
(137, 5, 24, 'Realizar trabajo físico al aire libre.', 'likert_5', 0),
(138, 5, 24, 'Construir objetos con mis manos.', 'likert_5', 0),
(139, 5, 24, 'Seguir instrucciones técnicas paso a paso.', 'likert_5', 0),
(140, 5, 24, 'Trabajar con animales o en agricultura.', 'likert_5', 0),
(141, 5, 24, 'Hacer senderismo o actividades de aventura.', 'likert_5', 0),
(142, 5, 24, 'Mantener y limpiar equipos mecánicos.', 'likert_5', 0),
-- I (143-150)
(143, 5, 25, 'Resolver problemas de lógica o matemáticas.', 'likert_5', 0),
(144, 5, 25, 'Investigar las causas de un fenómeno.', 'likert_5', 0),
(145, 5, 25, 'Leer artículos científicos por curiosidad.', 'likert_5', 0),
(146, 5, 25, 'Analizar datos para encontrar patrones.', 'likert_5', 0),
(147, 5, 25, 'Diseñar experimentos controlados.', 'likert_5', 0),
(148, 5, 25, 'Estudiar un tema a fondo antes de opinar.', 'likert_5', 0),
(149, 5, 25, 'Plantear hipótesis y comprobarlas.', 'likert_5', 0),
(150, 5, 25, 'Trabajar en un laboratorio.', 'likert_5', 0),
-- A (151-158)
(151, 5, 26, 'Escribir textos creativos (cuentos, poesía, guiones).', 'likert_5', 0),
(152, 5, 26, 'Tocar un instrumento o cantar.', 'likert_5', 0),
(153, 5, 26, 'Dibujar, pintar o crear piezas visuales.', 'likert_5', 0),
(154, 5, 26, 'Diseñar la estética de un producto o espacio.', 'likert_5', 0),
(155, 5, 26, 'Improvisar soluciones originales a problemas.', 'likert_5', 0),
(156, 5, 26, 'Expresar emociones a través del arte.', 'likert_5', 0),
(157, 5, 26, 'Asistir a exposiciones o conciertos.', 'likert_5', 0),
(158, 5, 26, 'Innovar en mi forma de comunicar ideas.', 'likert_5', 0),
-- S (159-166)
(159, 5, 27, 'Enseñar o explicar conceptos a otros.', 'likert_5', 0),
(160, 5, 27, 'Escuchar activamente los problemas de alguien.', 'likert_5', 0),
(161, 5, 27, 'Organizar actividades para una comunidad.', 'likert_5', 0),
(162, 5, 27, 'Acompañar a personas en momentos difíciles.', 'likert_5', 0),
(163, 5, 27, 'Trabajar en equipo para ayudar a otros.', 'likert_5', 0),
(164, 5, 27, 'Mediar en conflictos entre personas.', 'likert_5', 0),
(165, 5, 27, 'Voluntariar en causas sociales.', 'likert_5', 0),
(166, 5, 27, 'Asesorar a alguien en su desarrollo personal.', 'likert_5', 0),
-- E (167-174)
(167, 5, 28, 'Liderar un equipo hacia una meta.', 'likert_5', 0),
(168, 5, 28, 'Persuadir a otros para que se unan a un proyecto.', 'likert_5', 0),
(169, 5, 28, 'Tomar decisiones bajo presión.', 'likert_5', 0),
(170, 5, 28, 'Competir para alcanzar resultados medibles.', 'likert_5', 0),
(171, 5, 28, 'Iniciar un negocio propio.', 'likert_5', 0),
(172, 5, 28, 'Negociar acuerdos que beneficien a mi equipo.', 'likert_5', 0),
(173, 5, 28, 'Plantear objetivos ambiciosos y cumplirlos.', 'likert_5', 0),
(174, 5, 28, 'Motivar a otros con mi visión.', 'likert_5', 0),
-- C (175-182)
(175, 5, 29, 'Organizar archivos y mantener datos al día.', 'likert_5', 0),
(176, 5, 29, 'Seguir procedimientos claros y detallados.', 'likert_5', 0),
(177, 5, 29, 'Trabajar con hojas de cálculo y reportes.', 'likert_5', 0),
(178, 5, 29, 'Cumplir plazos estrictos con precisión.', 'likert_5', 0),
(179, 5, 29, 'Catalogar o clasificar información.', 'likert_5', 0),
(180, 5, 29, 'Verificar que un proceso cumpla las normas.', 'likert_5', 0),
(181, 5, 29, 'Llevar un registro ordenado de actividades.', 'likert_5', 0),
(182, 5, 29, 'Usar sistemas estandarizados para tareas administrativas.', 'likert_5', 0);


-- 5) MBTI-like (Preguntas 183 a 214)
-- EI (183-190)
INSERT INTO tests_preguntas (id, test_id, dimension_id, pregunta, tipo_respuesta, inverso) VALUES
(183, 2, 10, 'Disfruto estar rodeado de gente la mayor parte del tiempo.', 'likert_5', 0),
(184, 2, 11, 'Necesito tiempo a solas para recargar energía.', 'likert_5', 0),
(185, 2, 10, 'Pienso mejor hablando con alguien que en silencio.', 'likert_5', 0),
(186, 2, 11, 'Prefiero reflexionar internamente antes de opinar.', 'likert_5', 0),
(187, 2, 10, 'Las reuniones sociales me resultan estimulantes.', 'likert_5', 0),
(188, 2, 11, 'Las reuniones sociales me agotan más de lo que me energizan.', 'likert_5', 0),
(189, 2, 10, 'Conecto ideas nuevas hablándolas en voz alta.', 'likert_5', 0),
(190, 2, 11, 'Conecto ideas nuevas escribiéndolas o pensando en silencio.', 'likert_5', 0),
-- SN (191-198)
(191, 2, 12, 'Me fío más de hechos concretos que de corazonadas.', 'likert_5', 0),
(192, 2, 13, 'Me atraen las posibilidades futuras más que el presente inmediato.', 'likert_5', 0),
(193, 2, 12, 'Prefiero instrucciones paso a paso antes que descripciones generales.', 'likert_5', 0),
(194, 2, 13, 'Disfruto imaginando cómo podrían ser las cosas en cinco años.', 'likert_5', 0),
(195, 2, 12, 'Aprendo mejor con ejemplos prácticos que con teorías abstractas.', 'likert_5', 0),
(196, 2, 13, 'Me interesan más las conexiones entre ideas que los datos aislados.', 'likert_5', 0),
(197, 2, 12, 'Confío en mi experiencia previa para decidir.', 'likert_5', 0),
(198, 2, 13, 'Confío en mi intuición incluso sin evidencia clara.', 'likert_5', 0),
-- TF (199-206)
(199, 2, 14, 'Decido priorizando la lógica y la coherencia.', 'likert_5', 0),
(200, 2, 15, 'Decido considerando cómo se sentirán los afectados.', 'likert_5', 0),
(201, 2, 14, 'Discutir ideas me resulta más natural que discutir valores.', 'likert_5', 0),
(202, 2, 15, 'Valoro la armonía del grupo por encima de tener la razón.', 'likert_5', 0),
(203, 2, 14, 'Tiendo a ser directo aunque pueda parecer frío.', 'likert_5', 0),
(204, 2, 15, 'Tiendo a suavizar el mensaje para no herir sensibilidades.', 'likert_5', 0),
(205, 2, 14, 'Me convencen los argumentos consistentes, aunque duelan.', 'likert_5', 0),
(206, 2, 15, 'Me convencen las historias y los casos humanos.', 'likert_5', 0),
-- JP (207-214)
(207, 2, 16, 'Planifico con antelación y me cuesta improvisar.', 'likert_5', 0),
(208, 2, 17, 'Me siento cómodo adaptándome sobre la marcha.', 'likert_5', 0),
(209, 2, 16, 'Me gusta cerrar temas y tener listas claras.', 'likert_5', 0),
(210, 2, 17, 'Prefiero dejar opciones abiertas hasta el último momento.', 'likert_5', 0),
(211, 2, 16, 'Me siento más cómodo con horarios estructurados.', 'likert_5', 0),
(212, 2, 17, 'Prefiero la espontaneidad al orden rígido.', 'likert_5', 0),
(213, 2, 16, 'Cumplo plazos con holgura porque planifico con tiempo.', 'likert_5', 0),
(214, 2, 17, 'Suelo cumplir los plazos por el esfuerzo del último momento.', 'likert_5', 0);

SET FOREIGN_KEY_CHECKS = 1;
