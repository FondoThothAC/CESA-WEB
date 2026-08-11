<?php
/**
 * Screen: Tutorías Peer-to-Peer - CESA PWA v2.0
 */
require_once __DIR__ . '/../../lib/Auth.php';
$user = Auth::getAuthenticatedUser();
?>
<div class="space-y-6 animate-slide-in-right">
    
    <!-- Header -->
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold">Tutorías</h2>
            <p class="text-xs text-gray-500">Compañeros ayudando a compañeros.</p>
        </div>
        <button onclick="toggleTutorMode()" id="btn-tutor-mode" class="glass px-4 py-2 text-[10px] font-bold text-purple-400 border-purple-500/30">
            <i class="fas fa-chalkboard-teacher mr-2"></i>Ser Tutor
        </button>
    </div>

    <!-- Buscador -->
    <div class="relative">
        <input type="text" id="search-tutor" placeholder="¿Qué materia necesitas?" 
               class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 focus:border-purple-500 focus:outline-none transition-all">
        <i class="fas fa-graduation-cap absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"></i>
    </div>

    <!-- Tutores Online Now -->
    <section>
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Disponibles ahora
            </h3>
        </div>
        
        <div id="tutors-online" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <!-- Cargado dinámicamente -->
            <div class="min-w-[150px] aspect-square glass flex items-center justify-center animate-pulse">
                <i class="fas fa-user-clock text-gray-700"></i>
            </div>
        </div>
    </section>

    <!-- Mis Sesiones -->
    <section>
        <h3 class="text-sm font-bold mb-4">Mis Sesiones Próximas</h3>
        <div id="my-sessions" class="space-y-3">
            <div class="glass p-4 text-center text-[10px] text-gray-500">
                No tienes sesiones agendadas.
            </div>
        </div>
    </section>
</div>

<script>
    async function loadTutors() {
        try {
            const res = await fetch('/api/tutorias.php?action=list_tutors&online=1');
            const resp = await res.json();
            const container = document.getElementById('tutors-online');
            
            if (resp.success && resp.data.length > 0) {
                container.innerHTML = resp.data.map(tutor => `
                    <div class="min-w-[240px] glass p-4 flex flex-col relative group">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="relative">
                                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-lg">
                                    ${tutor.nombre_completo[0].toUpperCase()}
                                </div>
                                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1a1a2e] rounded-full"></div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-sm leading-tight">${tutor.nombre_completo.split(' ')[0]}</h4>
                                <div class="text-[10px] text-green-400 font-bold">$${tutor.precio_hora}/hr</div>
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap gap-1 mb-4">
                            ${tutor.materias.split(',').slice(0, 2).map(m => `
                                <span class="bg-purple-500/20 text-purple-300 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">${m}</span>
                            `).join('')}
                        </div>
                        
                        <button onclick="solicitarTutoria(${tutor.id})" class="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-xl text-[10px] font-bold transition">
                            Solicitar Sesión
                        </button>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="glass p-8 text-center text-xs text-gray-600 w-full">Ningún tutor conectado en este momento.</div>';
            }
        } catch (e) { console.error(e); }
    }

    async function loadSessions() {
        try {
            const res = await fetch('/api/tutorias.php?action=my_sessions');
            const resp = await res.json();
            const container = document.getElementById('my-sessions');
            
            if (resp.success && resp.data.length > 0) {
                container.innerHTML = resp.data.map(session => `
                    <div class="glass p-4 border-l-4 border-blue-500 flex justify-between items-center">
                        <div>
                            <h4 class="font-bold text-xs">${session.materia_nombre}</h4>
                            <p class="text-[10px] text-gray-500">${session.tutor_nombre}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] font-bold text-blue-400">${session.estado.toUpperCase()}</div>
                            <div class="text-[8px] text-gray-600">${new Date(session.fecha_propuesta).toLocaleDateString()}</div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (e) { console.error(e); }
    }

    window.solicitarTutoria = function(id) {
        alert('Redirigiendo al flujo de solicitud para el tutor #' + id);
    }

    window.toggleTutorMode = async function() {
        const res = await fetch('/api/tutorias.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_availability' })
        });
        const data = await res.json();
        if (data.success) {
            alert('Estado de disponibilidad actualizado');
            loadTutors();
        }
    }

    loadTutors();
    loadSessions();
</script>
