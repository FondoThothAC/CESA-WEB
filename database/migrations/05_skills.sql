-- =============================================
-- TABLAS PARA SISTEMA DE SKILLS / CERTIFICADOS
-- =============================================

-- 1. Catálogo de Habilidades (qué se puede certificar)
CREATE TABLE IF NOT EXISTS habilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria ENUM('idiomas', 'ofimatica', 'programacion', 'soft_skills', 'profesional') NOT NULL,
    nivel_minimo_aprobatorio INT DEFAULT 70, -- Porcentaje mínimo para aprobar
    duracion_minutos INT DEFAULT 30, -- Tiempo máximo para completar
    icono VARCHAR(50) DEFAULT 'fa-certificate',
    color_hex VARCHAR(7) DEFAULT '#D4AF37',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Preguntas por Habilidad (banco de preguntas)
CREATE TABLE IF NOT EXISTS preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habilidad_id INT NOT NULL,
    pregunta TEXT NOT NULL,
    tipo ENUM('opcion_multiple', 'verdadero_falso', 'completar') NOT NULL DEFAULT 'opcion_multiple',
    opciones JSON, -- Array de opciones para选择题
    respuesta_correcta VARCHAR(255) NOT NULL,
    explicacion TEXT,
    dificultad ENUM('basico', 'intermedio', 'avanzado') DEFAULT 'intermedio',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE,
    INDEX idx_habilidad (habilidad_id),
    INDEX idx_activo (activo)
);

-- 3. Evaluaciones (intentos de certificación)
CREATE TABLE IF NOT EXISTS evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    habilidad_id INT NOT NULL,
    preguntas_json JSON NOT NULL, -- Array de IDs de preguntas seleccionadas
    respuestas_json JSON, -- Respuestas del usuario
    puntaje_obtenido DECIMAL(5,2) DEFAULT 0,
    porcentaje DECIMAL(5,2) DEFAULT 0,
    estado ENUM('en_proceso', 'completada', 'caduco') DEFAULT 'en_proceso',
    tiempo_inicio DATETIME NOT NULL,
    tiempo_fin DATETIME,
    tiempo_usado_segundos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_habilidad (habilidad_id),
    INDEX idx_estado (estado)
);

-- 4. Certificados Emitidos (Skills verificadas)
CREATE TABLE IF NOT EXISTS certificados_digitales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluacion_id INT NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    habilidad_id INT NOT NULL,
    uuid VARCHAR(36) UNIQUE NOT NULL, -- Identificador único verificable
    hash_verificacion VARCHAR(64) NOT NULL, -- SHA-256 para verificar autenticidad
    nombre_completo VARCHAR(200) NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    habilidad_nombre VARCHAR(100) NOT NULL,
    habilidad_categoria VARCHAR(50) NOT NULL,
    puntaje DECIMAL(5,2) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    nivel ENUM('CERTIFIED', 'ADVANCED', 'EXPERT', 'MASTER') NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_expiracion DATE, -- NULL = no expira
    qr_data TEXT, -- URL para verificar QR
    verificado_publico BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE,
    INDEX idx_uuid (uuid),
    INDEX idx_usuario (usuario_id),
    INDEX idx_hash (hash_verificacion)
);

-- 5. Insertar Habilidades Predefinidas
INSERT IGNORE INTO habilidades (id, nombre, descripcion, categoria, nivel_minimo_aprobatorio, duracion_minutos, icono, color_hex) VALUES
(1, 'Inglés B2', 'Certificación de dominio intermedio-alto del idioma inglés', 'idiomas', 70, 45, 'fa-language', '#3B82F6'),
(2, 'Inglés C1', 'Certificación de dominio avanzado del idioma inglés', 'idiomas', 75, 60, 'fa-language', '#8B5CF6'),
(3, 'Excel Intermedio', 'Hojas de cálculo, fórmulas básicas y tablas dinámicas', 'ofimatica', 70, 40, 'fa-file-excel', '#22C55E'),
(4, 'Excel Avanzado', 'Macros VBA, fórmulas complejas y análisis de datos', 'ofimatica', 75, 50, 'fa-file-excel', '#10B981'),
(5, 'PowerPoint Profesional', 'Presentaciones ejecutivas con animaciones avanzadas', 'ofimatica', 70, 35, 'fa-presentation', '#F59E0B'),
(6, 'Python Básico', 'Fundamentos de programación en Python', 'programacion', 70, 45, 'fa-code', '#6366F1'),
(7, 'Habilidades Blandas', 'Comunicación efectiva, liderazgo y trabajo en equipo', 'soft_skills', 70, 30, 'fa-users', '#EC4899'),
(8, 'Gestión de Proyectos', 'Metodologías ágiles, PMBOK y herramientas de gestión', 'profesional', 75, 40, 'fa-tasks', '#14B8A6');

-- =============================================
-- DATOS DE PRUEBA (Preguntas para Inglés B2)
-- =============================================

-- Primero obtenemos el ID de Inglés B2
SET @ingles_b2_id = 1;

INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(1, @ingles_b2_id, 'Choose the correct option: "She _____ to the store yesterday."', 'opcion_multiple', '["went", "goed", "going", "goes"]', 'went', 'Irregular verb: go → went', 'basico'),
(2, @ingles_b2_id, '"Although he was tired, he _____ the marathon."', 'opcion_multiple', '["completed", "completes", "has completed", "will complete"]', 'completed', 'Past simple for completed actions', 'basico'),
(3, @ingles_b2_id, '"If I _____ more money, I would travel more."', 'opcion_multiple', '["had", "have", "has", "having"]', 'had', 'Third conditional structure', 'intermedio'),
(4, @ingles_b2_id, '"The book _____ by millions of people worldwide."', 'opcion_multiple', '["has been read", "has read", "is reading", "was reading"]', 'has been read', 'Present perfect passive voice', 'intermedio'),
(5, @ingles_b2_id, 'Complete: "By the time we arrive, they _____ dinner."', 'opcion_multiple', '["will have finished", "finished", "have finished", "will finish"]', 'will have finished', 'Future perfect tense', 'avanzado'),
(6, @ingles_b2_id, '"Despite _____ early, the meeting started late."', 'opcion_multiple', '["arriving", "arrive", "arrived", "arrives"]', 'arriving', 'Gerund after preposition', 'intermedio'),
(7, @ingles_b2_id, 'Which sentence uses the subjunctive mood correctly?', 'opcion_multiple', '["It is essential that he arrive on time.", "It is essential that he arrives on time.", "It is essential that he arriving on time.", "It is essential that he to arrive on time."]', 'It is essential that he arrive on time.', 'Subjunctive after essential', 'avanzado'),
(8, @ingles_b2_id, '"Had I known about the traffic, I _____ earlier."', 'opcion_multiple', '["would have left", "would left", "will leave", "left"]', 'would have left', 'Third conditional inversion', 'avanzado'),
(9, @ingles_b2_id, 'True or False: "Fewer" is used with countable nouns.', 'verdadero_falso', '["True", "False"]', 'True', 'Fewer = countable, Less = uncountable', 'basico'),
(10, @ingles_b2_id, '"I wish I _____ this earlier." - Choose the correct tense.', 'opcion_multiple', '["had known", "knew", "know", "would know"]', 'had known', 'Second conditional wish for past', 'intermedio');

-- =============================================
-- PREGUNTAS ADICIONALES (C1, Excel, PPT, Python, Blandas, Proyectos)
-- =============================================

-- Preguntas para Inglés C1 (ID 2)
SET @ingles_c1_id = 2;
INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(11, @ingles_c1_id, 'Choose the correct word: "The manager decided to _____ the contract because of non-performance."', 'opcion_multiple', '["terminate", "expire", "finish", "annul"]', 'terminate', 'Contracts are formally terminated', 'basico'),
(12, @ingles_c1_id, '"She is extremely efficient; she works _____ than anyone else."', 'opcion_multiple', '["harder", "more hard", "hardly", "more harder"]', 'harder', 'Comparative form of fast/hard', 'basico'),
(13, @ingles_c1_id, '"If he had not missed the flight, he _____ presenting right now."', 'opcion_multiple', '["would be", "would have been", "will be", "is"]', 'would be', 'Mixed conditional: past cause, present effect', 'intermedio'),
(14, @ingles_c1_id, '"Rarely _____ such a beautiful performance."', 'opcion_multiple', '["have I seen", "I have seen", "did I saw", "I saw"]', 'have I seen', 'Inversion after negative adverbial "rarely"', 'avanzado'),
(15, @ingles_c1_id, '"The company is on the _____ of bankruptcy."', 'opcion_multiple', '["brink", "verge", "edge", "limit"]', 'brink', 'Idiomatic: "on the brink of bankruptcy"', 'intermedio'),
(16, @ingles_c1_id, '"I would rather you _____ tell anyone about this yet."', 'opcion_multiple', '["didn\'t", "don\'t", "not to", "shouldn\'t"]', 'didn\'t', 'Would rather + subject + past simple for present/future preference', 'intermedio'),
(17, @ingles_c1_id, 'Which of the following describes a "fleeting" moment?', 'opcion_multiple', '["lasting for a very short time", "extremely important", "painful", "colorful"]', 'lasting for a very short time', 'Fleeting means brief or transient', 'basico'),
(18, @ingles_c1_id, '"Under no circumstances _____ this button."', 'opcion_multiple', '["should you press", "you should press", "must you to press", "press you"]', 'should you press', 'Inversion after "under no circumstances"', 'avanzado'),
(19, @ingles_c1_id, 'What is the synonym of "conspicuous"?', 'opcion_multiple', '["noticeable", "hidden", "complex", "ordinary"]', 'noticeable', 'Conspicuous means standing out clearly', 'intermedio'),
(20, @ingles_c1_id, '"She behaved as though she _____ the boss, but she was only an assistant."', 'opcion_multiple', '["were", "is", "has been", "would be"]', 'were', 'Subjunctive after "as though" for unreal situation', 'avanzado');

-- Preguntas para Excel Intermedio (ID 3)
SET @excel_int_id = 3;
INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(21, @excel_int_id, '¿Qué función se utiliza para buscar un valor en la primera columna de una tabla y devolver otro en la misma fila?', 'opcion_multiple', '["BUSCARV", "BUSCARH", "COINCIDIR", "INDICE"]', 'BUSCARV', 'BUSCARV (VLOOKUP) busca verticalmente en la primera columna', 'basico'),
(22, @excel_int_id, '¿Qué símbolo se utiliza para fijar una referencia de celda en una fórmula (ej. $A$1)?', 'opcion_multiple', '["$", "%", "&", "#"]', '$', 'El símbolo $ crea referencias absolutas', 'basico'),
(23, @excel_int_id, '¿Qué hace la función =CONCAT(A1, " ", B1)?', 'opcion_multiple', '["Une el texto de A1 y B1 con un espacio intermedio", "Suma los números de A1 y B1", "Compara si A1 y B1 son iguales", "Multiplica A1 por B1"]', 'Une el texto de A1 y B1 con un espacio intermedio', 'CONCAT concatena/une cadenas de texto', 'basico'),
(24, @excel_int_id, '¿Para qué sirve el "Formato Condicional" en Excel?', 'opcion_multiple', '["Cambiar el aspecto de las celdas según las reglas definidas", "Hacer cálculos más rápidos", "Bloquear celdas con contraseñas", "Exportar datos a PDF"]', 'Cambiar el aspecto de las celdas según las reglas definidas', 'El formato condicional cambia bordes/colores según el valor de la celda', 'basico'),
(25, @excel_int_id, '¿Cuál es el atajo de teclado por defecto en Windows para guardar un archivo en Excel?', 'opcion_multiple', '["Ctrl + G", "Ctrl + S", "Ctrl + A", "Ctrl + C"]', 'Ctrl + G', 'Ctrl + G (Guardar) es el atajo en la versión en español de Excel', 'basico'),
(26, @excel_int_id, '¿Qué función cuenta el número de celdas que cumplen un criterio específico?', 'opcion_multiple', '["CONTAR.SI", "SUMAR.SI", "CONTARA", "CONTAR"]', 'CONTAR.SI', 'CONTAR.SI cuenta celdas según una condición', 'intermedio'),
(27, @excel_int_id, 'En una tabla dinámica, ¿dónde colocarías un campo para agrupar filas de datos?', 'opcion_multiple', '["Área de Filas", "Área de Valores", "Área de Filtros", "Área de Columnas"]', 'Área de Filas', 'El área de Filas organiza las etiquetas horizontalmente', 'basico'),
(28, @excel_int_id, '¿Qué valor devuelve la fórmula =PROMEDIO(10, 20, 30)?', 'opcion_multiple', '["20", "15", "10", "60"]', '20', 'El promedio es (10+20+30)/3 = 20', 'basico'),
(29, @excel_int_id, '¿Qué significa el error #¿NOMBRE? en una fórmula?', 'opcion_multiple', '["Excel no reconoce texto en el nombre de una función", "Se dividió entre cero", "El valor buscado no existe", "La celda está vacía"]', 'Excel no reconoce texto en el nombre de una función', 'Este error aparece cuando se escribe mal el nombre de una función', 'intermedio'),
(30, @excel_int_id, '¿Qué función devuelve la fecha y hora actuales del sistema?', 'opcion_multiple', '["AHORA", "HOY", "FECHA", "DIA"]', 'AHORA', 'AHORA() incluye fecha y hora, HOY() solo fecha', 'intermedio');

-- Preguntas para Excel Avanzado (ID 4)
SET @excel_av_id = 4;
INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(31, @excel_av_id, '¿Cuál es la ventaja de utilizar INDICE y COINCIDIR sobre BUSCARV?', 'opcion_multiple', '["Permite búsquedas hacia la izquierda y es más eficiente", "Suma valores automáticamente", "Es más fácil de escribir", "No requiere que los datos estén ordenados"]', 'Permite búsquedas hacia la izquierda y es más eficiente', 'INDICE + COINCIDIR no depende del orden de las columnas ni de buscar a la derecha', 'intermedio'),
(32, @excel_av_id, '¿Qué pestaña de la cinta de opciones debe activarse para programar Macros en VBA?', 'opcion_multiple', '["Programador / Desarrollador", "Datos", "Vista", "Fórmulas"]', 'Programador / Desarrollador', 'La pestaña Programador contiene las herramientas de macros', 'basico'),
(33, @excel_av_id, '¿Cómo se declara una variable de tipo objeto en VBA Excel?', 'opcion_multiple', '["Dim variable As Object", "Set variable = Object", "Create variable", "Dim variable = New Object"]', 'Dim variable As Object', 'Dim se usa para declarar el tipo de variable en VBA', 'intermedio'),
(34, @excel_av_id, '¿Qué función de matriz dinámica de Excel permite filtrar un rango de datos basado en criterios?', 'opcion_multiple', '["FILTRAR", "BUSCARX", "ORDENAR", "UNICOS"]', 'FILTRAR', 'La función FILTRAR devuelve una matriz dinámica con los datos filtrados', 'intermedio'),
(35, @excel_av_id, '¿Qué herramienta permite realizar análisis de sensibilidad cambiando múltiples variables (ej. optimizar ganancias)?', 'opcion_multiple', '["Solver", "Buscar Objetivo", "Tablas de Datos", "Consolidar"]', 'Solver', 'Solver es el complemento avanzado para optimización de modelos', 'avanzado'),
(36, @excel_av_id, 'En VBA, ¿qué instrucción evita que se actualice la pantalla mientras corre la macro (acelerando el proceso)?', 'opcion_multiple', '["Application.ScreenUpdating = False", "Screen.Show = False", "Application.DisplayAlerts = False", "ActiveWindow.Refresh = False"]', 'Application.ScreenUpdating = False', 'ScreenUpdating = False desactiva el renderizado temporal de pantalla', 'intermedio'),
(37, @excel_av_id, '¿Qué estructura lógica en VBA se utiliza para repetir un bloque de código un número específico de veces?', 'opcion_multiple', '["For...Next", "If...Then", "Select Case", "Do While...Loop"]', 'For...Next', 'For...Next es un bucle contador definido', 'basico'),
(38, @excel_av_id, '¿Para qué sirve el comando "Power Query" en Excel?', 'opcion_multiple', '["Extraer, transformar y cargar datos de diversas fuentes", "Crear gráficos 3D interactivos", "Escribir código de macros de forma automática", "Proteger hojas con encriptación avanzada"]', 'Extraer, transformar y cargar datos de diversas fuentes', 'Power Query es el motor ETL integrado en Excel', 'intermedio'),
(39, @excel_av_id, '¿Cómo se escribe una referencia 3D en Excel para sumar la celda A1 de las pestañas Hoja1 a Hoja3?', 'opcion_multiple', '["=SUMA(Hoja1:Hoja3!A1)", "=SUMA(Hoja1!A1+Hoja3!A1)", "=SUMA(Hoja1..Hoja3!A1)", "=SUMA(Hoja1!A1:Hoja3!A1)"]', '=SUMA(Hoja1:Hoja3!A1)', 'La sintaxis de rango 3D usa dos puntos entre hojas seguido de ! y la celda', 'avanzado'),
(40, @excel_av_id, '¿Cuál de las siguientes es una función para manejar matrices dinámicas y remover duplicados?', 'opcion_multiple', '["UNICOS", "ORDENAR", "FILTRAR", "TRANSPONER"]', 'UNICOS', 'UNICOS extrae valores distintos de un rango', 'basico');

-- Preguntas para PowerPoint Profesional (ID 5)
SET @ppt_id = 5;
INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(41, @ppt_id, '¿Qué herramienta permite crear una transición suave animando el movimiento de objetos de una diapositiva a otra?', 'opcion_multiple', '["Transformación / Morph", "Desvanecer", "Empuje", "Barrido"]', 'Transformación / Morph', 'Transformación (Morph) une y mueve objetos homónimos entre slides', 'basico'),
(42, @ppt_id, '¿Para qué sirve la vista "Patrón de Diapositivas" (Slide Master)?', 'opcion_multiple', '["Controlar el diseño global, fuentes y colores de toda la presentación", "Ver la presentación en pantalla completa", "Editar las imágenes insertadas", "Agregar notas de orador"]', 'Controlar el diseño global, fuentes y colores de toda la presentación', 'El Slide Master define la plantilla jerárquica de la presentación', 'intermedio'),
(43, @ppt_id, '¿Cuál es la regla recomendada "10-20-30" de Guy Kawasaki para presentaciones ejecutivas?', 'opcion_multiple', '["10 diapositivas, 20 minutos, fuente mínima de 30 puntos", "10 temas, 20 diapositivas, 30 minutos", "10 minutos, 20 diapositivas, fuente de 30px", "10 fuentes, 20 colores, 30 imágenes"]', '10 diapositivas, 20 minutos, fuente mínima de 30 puntos', 'Es la regla estándar para pitch de startups de Guy Kawasaki', 'basico'),
(44, @ppt_id, '¿Cómo se pueden agrupar múltiples formas para moverlas juntas?', 'opcion_multiple', '["Ctrl + G", "Ctrl + A", "Ctrl + Alt + G", "Shift + G"]', 'Ctrl + G', 'Ctrl + G agrupa elementos en la mayoría de programas de MS Office', 'basico'),
(45, @ppt_id, '¿Qué panel permite reordenar el orden en que se reproducen las animaciones de un slide?', 'opcion_multiple', '["Panel de Animación", "Panel de Selección", "Diseño de Diapositiva", "Transiciones"]', 'Panel de Animación', 'El Panel de Animación controla tiempos y secuencias de eventos', 'basico'),
(46, @ppt_id, '¿Cómo se asegura que las fuentes personalizadas se vean en otra computadora?', 'opcion_multiple', '["Incrustar las fuentes en el archivo al guardar", "Guardar como PDF únicamente", "Enviar las fuentes en una carpeta ZIP por correo", "Usar solo Arial o Calibri"]', 'Incrustar las fuentes en el archivo al guardar', 'Incrustar fuentes empaqueta las tipografías dentro del archivo .pptx', 'intermedio'),
(47, @ppt_id, '¿Qué hace la herramienta "Combinar Formas" (Merge Shapes)?', 'opcion_multiple', '["Une, fragmenta o intersecta vectores seleccionados", "Agrupa imágenes rasterizadas", "Alinea elementos al centro", "Cambia el color de relleno automáticamente"]', 'Une, fragmenta o intersecta vectores seleccionados', 'Merge Shapes hace operaciones booleanas con vectores', 'intermedio'),
(48, @ppt_id, '¿Cuál es la resolución recomendada por defecto para presentaciones en pantallas modernas?', 'opcion_multiple', '["Panorámica 16:9", "Estándar 4:3", "Cuadrada 1:1", "Vertical 9:16"]', 'Panorámica 16:9', '16:9 es el formato panorámico estándar de pantallas modernas', 'basico'),
(49, @ppt_id, '¿Qué función tienen los desencadenadores (Triggers) de animación?', 'opcion_multiple', '["Iniciar una animación al hacer click en un elemento específico de la diapositiva", "Iniciar la presentación de diapositivas", "Reproducir un video automáticamente", "Cambiar el tema de color"]', 'Iniciar una animación al hacer click en un elemento específico de la diapositiva', 'Los desencadenadores ejecutan animaciones al interactuar con un botón específico', 'avanzado'),
(50, @ppt_id, '¿Cómo se oculta temporalmente una diapositiva sin eliminarla?', 'opcion_multiple', '["Click derecho -> Ocultar diapositiva", "Mover la diapositiva al final", "Click derecho -> Eliminar diapositiva", "Bajar el brillo de la diapositiva a cero"]', 'Click derecho -> Ocultar diapositiva', 'Ocultar diapositiva la omite durante el modo de presentación', 'basico');

-- Preguntas para Python Básico (ID 6)
SET @python_id = 6;
INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(51, @python_id, '¿Cuál es la función en Python para obtener la longitud de una lista?', 'opcion_multiple', '["len()", "length()", "size()", "count()"]', 'len()', 'len() retorna la cantidad de elementos de un iterable', 'basico'),
(52, @python_id, '¿Cómo se define una función en Python?', 'opcion_multiple', '["def mi_funcion():", "function mi_funcion() {", "func mi_funcion()", "void mi_funcion()"]', 'def mi_funcion():', 'def declara funciones seguidas de dos puntos e indentación', 'basico'),
(53, @python_id, '¿Cuál de los siguientes declara un diccionario vacío?', 'opcion_multiple', '["mi_dict = {}", "mi_dict = []", "mi_dict = ()", "mi_dict = dict.empty()"]', 'mi_dict = {}', '{} declara diccionarios (y dict() también)', 'basico'),
(54, @python_id, '¿Qué salida produce print(type(3.14))?', 'opcion_multiple', '["<class \'float\'>", "<class \'double\'>", "<class \'int\'>", "<class \'number\'>"]', '<class \'float\'>', 'Los decimales se representan con la clase float en Python', 'basico'),
(55, @python_id, '¿Cómo se agrega un elemento al final de una lista?', 'opcion_multiple', '["mi_lista.append(elemento)", "mi_lista.add(elemento)", "mi_lista.push(elemento)", "mi_lista.insert(elemento)"]', 'mi_lista.append(elemento)', 'append() añade un elemento al final de la lista', 'basico'),
(56, @python_id, '¿Cuál de las siguientes estructuras controla excepciones en Python?', 'opcion_multiple', '["try / except", "try / catch", "throw / catch", "if / error"]', 'try / except', 'Python usa try...except para la gestión de errores', 'basico'),
(57, @python_id, '¿Qué devuelve la expresión 10 // 3 en Python?', 'opcion_multiple', '["3", "3.3333333333333335", "1", "0"]', '3', 'El operador // realiza división entera', 'intermedio'),
(58, @python_id, '¿Qué palabra reservada se usa para importar una librería externa?', 'opcion_multiple', '["import", "require", "using", "include"]', 'import', 'import carga módulos en el script actual', 'basico'),
(59, @python_id, '¿Cómo se escribe un comentario de una sola línea en Python?', 'opcion_multiple', '["# Este es un comentario", "// Este es un comentario", "/* Este es un comentario */", "<!-- Este es un comentario -->"]', '# Este es un comentario', 'El símbolo # marca comentarios de línea en Python', 'basico'),
(60, @python_id, '¿Qué método se usa para separar un string en una lista de substrings según un delimitador?', 'opcion_multiple', '["split()", "join()", "divide()", "cut()"]', 'split()', 'split() divide un texto según el delimitador especificado', 'intermedio');

-- Preguntas para Habilidades Blandas (ID 7)
SET @soft_id = 7;
INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(61, @soft_id, '¿Qué caracteriza a la "Escucha Activa"?', 'opcion_multiple', '["Prestar atención total al interlocutor, comprendiendo su mensaje y emociones", "Oír mientras se planea qué responder a continuación", "Interrumpir constantemente para dar consejos rápidos", "Hacer muecas de desaprobación discretas"]', 'Prestar atención total al interlocutor, comprendiendo su mensaje y emociones', 'La escucha activa requiere empatía, concentración y validación del emisor', 'basico'),
(62, @soft_id, '¿Qué es la "Empatía"?', 'opcion_multiple', '["La capacidad de identificarse con alguien y compartir sus sentimientos", "Sentir lástima por las desgracias ajenas", "Lograr que todos hagan lo que uno desea", "Aceptar críticas destructivas sin enojarse"]', 'La capacidad de identificarse con alguien y compartir sus sentimientos', 'Empatía es ponerse en el lugar del otro', 'basico'),
(63, @soft_id, 'En resolución de conflictos, ¿qué técnica busca que ambas partes ganen algo (enfoque integrativo)?', 'opcion_multiple', '["Negociación Ganar-Ganar (Win-Win)", "Negociación de Suma Cero", "Evitación del problema", "Imposición autocrática"]', 'Negociación Ganar-Ganar (Win-Win)', 'El modelo colaborativo busca beneficios mutuos integrativos', 'basico'),
(64, @soft_id, '¿Qué es la "Asertividad"?', 'opcion_multiple', '["Expresar opiniones y necesidades de forma clara, directa y respetuosa", "Tener siempre la razón en un debate", "Hablar en voz alta para dominar la conversación", "Evitar el conflicto cediendo a todo"]', 'Expresar opiniones y necesidades de forma clara, directa y respetuosa', 'La asertividad es el punto medio entre la pasividad y la agresividad', 'basico'),
(65, @soft_id, '¿Qué define a un "Líder Democrático"?', 'opcion_multiple', '["Fomenta la participación del equipo y toma decisiones de consenso", "Toma decisiones sin consultar a nadie", "Delega todo el trabajo y no supervisa (laissez-faire)", "Controla rígidamente los horarios de los miembros"]', 'Fomenta la participación del equipo y toma decisiones de consenso', 'El líder democrático involucra y empodera al equipo en las soluciones', 'basico'),
(66, @soft_id, '¿Cómo se le llama a la habilidad para adaptarse rápidamente a nuevos entornos y tecnologías?', 'opcion_multiple', '["Adaptabilidad / Resiliencia", "Perseverancia", "Puntualidad", "Autonomía"]', 'Adaptabilidad / Resiliencia', 'La adaptabilidad permite reaccionar constructivamente ante el cambio', 'basico'),
(67, @soft_id, '¿Qué es el "Feedback Constructivo"?', 'opcion_multiple', '["Retroalimentación enfocada en comportamientos y oportunidades de mejora", "Críticas personales para presionar rendimiento", "Halagos constantes sin señalar áreas débiles", "Ignorar errores para mantener un ambiente feliz"]', 'Retroalimentación enfocada en comportamientos y oportunidades de mejora', 'El feedback constructivo es objetivo, específico y propone acciones futuras', 'basico'),
(68, @soft_id, '¿Qué es el "Síndrome de Burnout"?', 'opcion_multiple', '["Estado de agotamiento físico y mental causado por estrés laboral crónico", "Una fiebre alta de corta duración", "Falta de interés por aprender código nuevo", "Adicción a las redes sociales de la empresa"]', 'Estado de agotamiento físico y mental causado por estrés laboral crónico', 'El burnout es reconocido como enfermedad laboral por estrés prolongado', 'basico'),
(69, @soft_id, '¿Cuál de los siguientes es un obstáculo principal para el trabajo en equipo?', 'opcion_multiple', '["Falta de comunicación clara y objetivos difusos", "Diversidad de ideas", "Reuniones de planificación semanales", "Tener demasiadas herramientas digitales"]', 'Falta de comunicación clara y objetivos difusos', 'Sin claridad en metas ni comunicación, los equipos se desalinean y fallan', 'basico'),
(70, @soft_id, '¿Qué define a la "Inteligencia Emocional"?', 'opcion_multiple', '["Capacidad de reconocer, entender y gestionar las emociones propias y ajenas", "No sentir ninguna emoción bajo presión", "Saber llorar en momentos oportunos", "Poder adivinar los pensamientos de los demás"]', 'Capacidad de reconocer, entender y gestionar las emociones propias y ajenas', 'La inteligencia emocional (según Goleman) incluye autoconciencia y empatía', 'basico');

-- Preguntas para Gestión de Proyectos (ID 8)
SET @proj_id = 8;
INSERT IGNORE INTO preguntas (id, habilidad_id, pregunta, tipo, opciones, respuesta_correcta, explicacion, dificultad) VALUES
(71, @proj_id, '¿Qué metodología se basa en ciclos iterativos de desarrollo llamados "Sprints"?', 'opcion_multiple', '["Scrum", "Cascada / Waterfall", "Kanban", "Seis Sigma"]', 'Scrum', 'Scrum es un framework ágil enfocado en Sprints iterativos', 'basico'),
(72, @proj_id, '¿Qué representa la "Triple Restricción" en gestión de proyectos?', 'opcion_multiple', '["Alcance, Tiempo y Costo", "Recursos, Calidad y Riesgos", "Equipo, Cliente y Proveedor", "Planificación, Ejecución y Cierre"]', 'Alcance, Tiempo y Costo', 'La triple restricción (Scope, Time, Cost) define los límites del proyecto', 'basico'),
(73, @proj_id, '¿Qué diagrama muestra la secuencia de actividades del proyecto en una línea de tiempo horizontal?', 'opcion_multiple', '["Diagrama de Gantt", "Diagrama de Ishikawa", "Diagrama de Flujo", "Tablero Kanban"]', 'Diagrama de Gantt', 'El Diagrama de Gantt grafica el cronograma de tareas del proyecto', 'basico'),
(74, @proj_id, '¿Cuál es el rol de un "Product Owner" en Scrum?', 'opcion_multiple', '["Maximizar el valor del producto y priorizar el Product Backlog", "Facilitar las reuniones diarias del equipo", "Escribir el código y testear las funciones", "Aprobar el presupuesto financiero de la empresa"]', 'Maximizar el valor del producto y priorizar el Product Backlog', 'El Product Owner representa la voz del cliente y prioriza las tareas de negocio', 'intermedio'),
(75, @proj_id, '¿Qué significa la sigla "KPI" en proyectos?', 'opcion_multiple', '["Key Performance Indicator (Indicador Clave de Rendimiento)", "Key Project Integration", "Key Program Improvement", "Key Process Instance"]', 'Key Performance Indicator (Indicador Clave de Rendimiento)', 'Los KPI miden el desempeño y progreso del proyecto', 'basico'),
(76, @proj_id, '¿Qué es la "Ruta Crítica" (Critical Path) de un proyecto?', 'opcion_multiple', '["La secuencia de tareas pendientes que determina la duración mínima del proyecto", "La lista de tareas con mayor presupuesto", "La ruta física que siguen los entregables", "El grupo de tareas que no tienen importancia temporal"]', 'La secuencia de tareas pendientes que determina la duración mínima del proyecto', 'Cualquier retraso en la ruta crítica retrasa el proyecto por completo', 'avanzado'),
(77, @proj_id, '¿Qué herramienta visual utiliza tarjetas en columnas para mapear el flujo de trabajo (Por hacer, En proceso, Hecho)?', 'opcion_multiple', '["Tablero Kanban", "Diagrama de Pareto", "Matriz de Riesgos", "Minutas de Reunión"]', 'Tablero Kanban', 'Kanban visualiza los flujos limitando el Trabajo en Progreso (WIP)', 'basico'),
(78, @proj_id, '¿Para qué sirve el "Acta de Constitución del Proyecto" (Project Charter)?', 'opcion_multiple', '["Autorizar formalmente la existencia del proyecto y definir metas iniciales", "Detallar el código de programación del sistema", "Describir el manual de inducción para nuevos empleados", "Registrar los gastos diarios del equipo"]', 'Autorizar formalmente la existencia del proyecto y definir metas iniciales', 'El Project Charter formaliza el proyecto y da autoridad al Project Manager', 'intermedio'),
(79, @proj_id, 'En metodologías ágiles, ¿cuál es el objetivo de la reunión "Retrospectiva"?', 'opcion_multiple', '["Analizar qué funcionó bien y qué mejorar para el próximo ciclo", "Presentar el demo del producto terminado al cliente", "Asignar las tareas individuales para las próximas horas", "Discutir el aumento de presupuesto trimestral"]', 'Analizar qué funcionó bien y qué mejorar para el próximo ciclo', 'La Retrospectiva busca la mejora continua del equipo al final de cada Sprint', 'basico'),
(80, @proj_id, '¿Qué es un "Stakeholder"?', 'opcion_multiple', '["Cualquier persona o entidad interesada o afectada por el proyecto", "Únicamente el inversionista principal", "El programador del equipo de desarrollo", "El servidor donde se aloja el software"]', 'Cualquier persona o entidad interesada o afectada por el proyecto', 'Los stakeholders son interesados directos e indirectos del proyecto', 'basico');
