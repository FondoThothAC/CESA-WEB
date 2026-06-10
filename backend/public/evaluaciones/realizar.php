<?php
/**
 * Realizar Evaluación de Skill
 * CESA UNISON v3.5
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
if (!$auth->isLoggedIn()) {
    header('Location: /login.php');
    exit;
}

$user = $auth->getUser();
$pdo = getDBConnection();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evaluación de Skill | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        cesa: {
                            primary: '#0F2C59',
                            secondary: '#1E3A8A',
                            gold: '#D4AF37',
                            goldLight: '#F5D17B',
                            dark: '#0A192F'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background: linear-gradient(135deg, #0a192f 0%, #1e293b 100%); min-height: 100vh; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .timer-warning { animation: pulse-red 1s infinite; }
        @keyframes pulse-red { 0%, 100% { background-color: rgba(239, 68, 68, 0.2); } 50% { background-color: rgba(239, 68, 68, 0.4); } }
    </style>
</head>
<body class="text-white font-sans">

    <!-- Header -->
    <header class="bg-cesa-primary/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/screens/skills.php" class="text-gray-400 hover:text-white flex items-center gap-2">
                <i class="fas fa-arrow-left"></i> <span class="hidden sm:inline">Volver a Skills</span>
            </a>
            <div id="habilidad-nombre" class="font-bold text-center flex-1 mx-4">
                <i class="fas fa-spinner fa-spin"></i> Cargando...
            </div>
            <div id="timer" class="bg-cesa-gold/20 text-cesa-gold px-4 py-2 rounded-lg font-mono text-lg">
                --:--
            </div>
        </div>
    </header>

    <!-- Progress bar -->
    <div class="h-1 bg-gray-800">
        <div id="progress-bar" class="h-full bg-cesa-gold transition-all duration-300" style="width: 0%"></div>
    </div>

    <main class="max-w-3xl mx-auto p-6">
        
        <!-- Instrucciones (antes de comenzar) -->
        <div id="instrucciones" class="glass-card rounded-2xl p-8 text-center">
            <div id="skill-icon" class="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl bg-cesa-gold/20 text-cesa-gold">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <h2 id="skill-titulo" class="text-2xl font-bold mb-2">Cargando...</h2>
            <p id="skill-descripcion" class="text-gray-400 mb-6">...</p>
            
            <div class="bg-cesa-dark/50 rounded-xl p-4 mb-6 text-left">
                <h4 class="font-bold text-sm mb-3 text-cesa-gold"><i class="fas fa-info-circle mr-2"></i>Instrucciones</h4>
                <ul class="text-sm text-gray-300 space-y-2">
                    <li>• Lee cada pregunta con atención</li>
                    <li>• Selecciona la respuesta correcta</li>
                    <li>• El tiempo límite es <strong id="tiempo-limite-texto">--</strong></li>
                    <li>• Necesitas <strong id="nivel-minimo-texto">--</strong>% para aprobar</li>
                    <li>• Al aprobar, recibirás un <strong>Certificado Digital</strong></li>
                </ul>
            </div>
            
            <button onclick="comenzarEvaluacion()" class="bg-gradient-to-r from-cesa-gold to-cesa-primary hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold text-lg transition">
                <i class="fas fa-play mr-2"></i> Comenzar Evaluación
            </button>
        </div>

        <!-- Formulario de evaluación (oculto inicialmente) -->
        <div id="evaluacion-form" class="hidden space-y-6">
            
            <!-- Pregunta actual -->
            <div class="glass-card rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs text-gray-500">Pregunta <span id="pregunta-actual">1</span> de <span id="pregunta-total">10</span></span>
                    <span id="puntuacion-badge" class="text-xs bg-cesa-gold/20 text-cesa-gold px-3 py-1 rounded-full">
                        <i class="fas fa-star mr-1"></i> <span id="puntuacion-actual">0</span>/<span id="puntuacion-total">0</span>
                    </span>
                </div>
                
                <h3 id="pregunta-texto" class="text-lg font-medium mb-6 leading-relaxed">
                    Cargando pregunta...
                </h3>
                
                <div id="opciones-container" class="space-y-3">
                    <!-- Opciones se generan dinámicamente -->
                </div>
            </div>
            
            <!-- Navegación -->
            <div class="flex justify-between items-center">
                <button id="btn-anterior" onclick="preguntaAnterior()" class="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-bold transition disabled:opacity-50" disabled>
                    <i class="fas fa-arrow-left mr-2"></i> Anterior
                </button>
                
                <div id="dots-container" class="flex gap-2">
                    <!-- Dots de progreso -->
                </div>
                
                <button id="btn-siguiente" onclick="preguntaSiguiente()" class="bg-cesa-gold text-cesa-dark hover:bg-cesa-goldLight px-6 py-2 rounded-lg font-bold transition">
                    Siguiente <i class="fas fa-arrow-right ml-2"></i>
                </button>
                
                <button id="btn-terminar" onclick="terminarEvaluacion()" class="hidden bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold transition">
                    <i class="fas fa-check mr-2"></i> Terminar
                </button>
            </div>
        </div>
        
        <!-- Resultado (oculto inicialmente) -->
        <div id="resultado-container" class="hidden">
            <div id="resultado-aprobado" class="hidden">
                <div class="glass-card rounded-2xl p-8 text-center border-2 border-cesa-gold/50">
                    <div class="w-24 h-24 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center">
                        <i class="fas fa-trophy text-green-400 text-5xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold mb-2 text-cesa-gold">¡Felicidades! 🎉</h2>
                    <p class="text-gray-400 mb-6">Has aprobado la evaluación</p>
                    
                    <div class="bg-cesa-dark/50 rounded-xl p-6 mb-6">
                        <div class="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p class="text-3xl font-bold text-white" id="resultado-porcentaje">0%</p>
                                <p class="text-xs text-gray-400">Porcentaje</p>
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-white" id="resultado-nivel">--</p>
                                <p class="text-xs text-gray-400">Nivel</p>
                            </div>
                            <div>
                                <p class="text-xl font-bold text-white" id="resultado-aciertos">0/0</p>
                                <p class="text-xs text-gray-400">Respuestas correctas</p>
                            </div>
                            <div>
                                <p class="text-xl font-bold text-white" id="resultado-tiempo">00:00</p>
                                <p class="text-xs text-gray-400">Tiempo usado</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- QR del certificado -->
                    <div class="bg-white rounded-xl p-4 inline-block mb-6">
                        <div id="qr-certificado" class="w-48 h-48"></div>
                        <p class="text-xs text-gray-500 mt-2">Escanea para verificar</p>
                    </div>
                    
                    <p class="text-xs text-gray-500 mb-4" id="resultado-uuid"></p>
                    
                    <a href="/screens/skills.php" class="inline-block bg-cesa-gold text-cesa-dark px-6 py-3 rounded-xl font-bold hover:bg-cesa-goldLight transition">
                        <i class="fas fa-award mr-2"></i> Ver Mis Certificados
                    </a>
                </div>
            </div>
            
            <div id="resultado-reprobado" class="hidden">
                <div class="glass-card rounded-2xl p-8 text-center border border-red-500/30">
                    <div class="w-24 h-24 rounded-full bg-red-500/20 mx-auto mb-6 flex items-center justify-center">
                        <i class="fas fa-times-circle text-red-400 text-5xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold mb-2">No aprobaste esta vez</h2>
                    <p class="text-gray-400 mb-6">Pero no te rindas, puedes intentarlo de nuevo</p>
                    
                    <div class="bg-cesa-dark/50 rounded-xl p-6 mb-6">
                        <p class="text-3xl font-bold text-white mb-2" id="resultado-reprobado-porcentaje">0%</p>
                        <p class="text-sm text-gray-400">Necesitabas <span id="resultado-reprobado-minimo">70</span>% para aprobar</p>
                    </div>
                    
                    <a href="/screens/skills.php" class="inline-block bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-bold transition">
                        <i class="fas fa-arrow-left mr-2"></i> Volver a Skills
                    </a>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Estado global
        let evaluacionData = null;
        let respuestas = {};
        let preguntaIndex = 0;
        let timerInterval = null;
        let tiempoRestante = 0;
        
        // URL del skill a cargar desde query param
        const urlParams = new URLSearchParams(window.location.search);
        const habilidadId = urlParams.get('habilidad_id');
        
        if (!habilidadId) {
            window.location.href = '/screens/skills.php';
        }
        
        // Cargar información del skill
        async function cargarSkill() {
            try {
                const res = await fetch(`/api/skills.php?action=listar_habilidades`);
                const data = await res.json();
                
                if (data.success) {
                    const habilidad = data.data.find(h => h.id == habilidadId);
                    if (habilidad) {
                        document.getElementById('habilidad-nombre').innerHTML = `
                            <i class="${habilidad.icono} mr-2" style="color: ${habilidad.color_hex}"></i>
                            ${habilidad.nombre}
                        `;
                        document.getElementById('skill-titulo').textContent = habilidad.nombre;
                        document.getElementById('skill-descripcion').textContent = habilidad.descripcion;
                        document.getElementById('skill-icon').innerHTML = `<i class="${habilidad.icono}"></i>`;
                        document.getElementById('skill-icon').style.backgroundColor = habilidad.color_hex + '33';
                        document.getElementById('skill-icon').style.color = habilidad.color_hex;
                        document.getElementById('tiempo-limite-texto').textContent = habilidad.duracion_minutos + ' minutos';
                        document.getElementById('nivel-minimo-texto').textContent = habilidad.nivel_minimo_aprobatorio;
                    }
                }
            } catch (e) {
                console.error('Error cargando skill:', e);
            }
        }
        
        cargarSkill();
        
        // Comenzar evaluación
        async function comenzarEvaluacion() {
            try {
                const res = await fetch(`/api/skills.php?action=obtener_evaluacion&habilidad_id=${habilidadId}`);
                const data = await res.json();
                
                if (!data.success) {
                    alert(data.error || 'Error al iniciar evaluación');
                    return;
                }
                
                evaluacionData = data;
                respuestas = {};
                preguntaIndex = 0;
                tiempoRestante = data.tiempo_limite;
                
                // Ocultar instrucciones, mostrar formulario
                document.getElementById('instrucciones').classList.add('hidden');
                document.getElementById('evaluacion-form').classList.remove('hidden');
                document.getElementById('pregunta-total').textContent = data.preguntas.length;
                
                // Iniciar timer
                iniciarTimer();
                
                // Renderizar primera pregunta
                renderizarPregunta();
                crearDots();
                
            } catch (e) {
                alert('Error de conexión');
                console.error(e);
            }
        }
        
        function iniciarTimer() {
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                tiempoRestante--;
                updateTimerDisplay();
                
                if (tiempoRestante <= 60) {
                    document.getElementById('timer').classList.add('timer-warning');
                }
                
                if (tiempoRestante <= 0) {
                    clearInterval(timerInterval);
                    alert('¡Se acabó el tiempo!');
                    terminarEvaluacion();
                }
            }, 1000);
        }
        
        function updateTimerDisplay() {
            const mins = Math.floor(tiempoRestante / 60);
            const secs = tiempoRestante % 60;
            document.getElementById('timer').textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        function crearDots() {
            const container = document.getElementById('dots-container');
            container.innerHTML = '';
            
            evaluacionData.preguntas.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'w-3 h-3 rounded-full bg-gray-600 transition-all';
                dot.id = `dot-${i}`;
                dot.onclick = () => irAPregunta(i);
                container.appendChild(dot);
            });
            
            actualizarDots();
        }
        
        function actualizarDots() {
            evaluacionData.preguntas.forEach((_, i) => {
                const dot = document.getElementById(`dot-${i}`);
                if (i === preguntaIndex) {
                    dot.className = 'w-3 h-3 rounded-full bg-cesa-gold scale-125 transition-all';
                } else if (respuestas[evaluacionData.preguntas[i].id] !== undefined) {
                    dot.className = 'w-3 h-3 rounded-full bg-green-500 transition-all';
                } else {
                    dot.className = 'w-3 h-3 rounded-full bg-gray-600 transition-all';
                }
            });
        }
        
        function renderizarPregunta() {
            const pregunta = evaluacionData.preguntas[preguntaIndex];
            
            document.getElementById('pregunta-actual').textContent = preguntaIndex + 1;
            document.getElementById('pregunta-texto').textContent = pregunta.pregunta;
            
            // Renderizar opciones
            const container = document.getElementById('opciones-container');
            container.innerHTML = '';
            
            pregunta.opciones.forEach((opcion, i) => {
                const isSelected = respuestas[pregunta.id] === opcion;
                const btn = document.createElement('button');
                btn.className = `w-full p-4 rounded-xl text-left transition-all ${
                    isSelected 
                        ? 'bg-cesa-gold/20 border-2 border-cesa-gold text-white' 
                        : 'bg-white/5 border border-white/10 hover:border-white/30 text-gray-300'
                }`;
                btn.innerHTML = `
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full ${isSelected ? 'bg-cesa-gold text-cesa-dark' : 'bg-white/10'} mr-3 font-bold text-sm">
                        ${String.fromCharCode(65 + i)}
                    </span>
                    ${opcion}
                `;
                btn.onclick = () => seleccionarOpcion(pregunta.id, opcion);
                container.appendChild(btn);
            });
            
            // Actualizar navegación
            document.getElementById('btn-anterior').disabled = preguntaIndex === 0;
            
            const isLast = preguntaIndex === evaluacionData.preguntas.length - 1;
            document.getElementById('btn-siguiente').classList.toggle('hidden', isLast);
            document.getElementById('btn-terminar').classList.toggle('hidden', !isLast);
            
            actualizarDots();
            actualizarProgress();
        }
        
        function seleccionarOpcion(preguntaId, opcion) {
            respuestas[preguntaId] = opcion;
            renderizarPregunta();
        }
        
        function preguntaAnterior() {
            if (preguntaIndex > 0) {
                preguntaIndex--;
                renderizarPregunta();
            }
        }
        
        function preguntaSiguiente() {
            if (preguntaIndex < evaluacionData.preguntas.length - 1) {
                preguntaIndex++;
                renderizarPregunta();
            }
        }
        
        function irAPregunta(index) {
            preguntaIndex = index;
            renderizarPregunta();
        }
        
        function actualizarProgress() {
            const contestadas = Object.keys(respuestas).length;
            const total = evaluacionData.preguntas.length;
            const pct = (contestadas / total) * 100;
            document.getElementById('progress-bar').style.width = pct + '%';
            document.getElementById('puntuacion-actual').textContent = contestadas;
            document.getElementById('puntuacion-total').textContent = total;
        }
        
        async function terminarEvaluacion() {
            if (Object.keys(respuestas).length < evaluacionData.preguntas.length) {
                if (!confirm(`Solo has respondido ${Object.keys(respuestas).length} de ${evaluacionData.preguntas.length} preguntas. ¿Deseas terminar de todos modos?`)) {
                    return;
                }
            }
            
            clearInterval(timerInterval);
            
            try {
                const formData = new FormData();
                formData.append('action', 'submintir_evaluacion');
                formData.append('evaluacion_id', evaluacionData.evaluacion_id);
                formData.append('respuestas', JSON.stringify(respuestas));
                
                const res = await fetch('/api/skills.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                
                if (data.success) {
                    mostrarResultado(data);
                } else {
                    alert(data.error || 'Error al procesar evaluación');
                }
            } catch (e) {
                alert('Error de conexión');
                console.error(e);
            }
        }
        
        function mostrarResultado(data) {
            document.getElementById('evaluacion-form').classList.add('hidden');
            document.getElementById('resultado-container').classList.remove('hidden');
            
            if (data.aprobado) {
                document.getElementById('resultado-aprobado').classList.remove('hidden');
                document.getElementById('resultado-reprobado').classList.add('hidden');
                
                document.getElementById('resultado-porcentaje').textContent = data.porcentaje + '%';
                document.getElementById('resultado-nivel').textContent = data.certificado.nivel;
                document.getElementById('resultado-aciertos').textContent = data.aciertos + '/' + data.total;
                document.getElementById('resultado-tiempo').textContent = formatTiempo(data.tiempo_usado);
                document.getElementById('resultado-uuid').textContent = 'ID: ' + data.certificado.uuid;
                
                // Generar QR
                document.getElementById('qr-certificado').innerHTML = '';
                new QRCode(document.getElementById('qr-certificado'), {
                    text: data.certificado.qr_url,
                    width: 192,
                    height: 192
                });
                
            } else {
                document.getElementById('resultado-aprobado').classList.add('hidden');
                document.getElementById('resultado-reprobado').classList.remove('hidden');
                
                document.getElementById('resultado-reprobado-porcentaje').textContent = data.porcentaje + '%';
                document.getElementById('resultado-reprobado-minimo').textContent = data.nivel_minimo;
            }
        }
        
        function formatTiempo(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    </script>

</body>
</html>
