<?php
/**
 * Panel Admin: Gestión de Skills y Certificaciones
 * CESA UNISON v3.5
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
if (!$auth->isLoggedIn() || !in_array($auth->getUser()['rol'], ['admin', 'mesa_directiva', 'sociedad'])) {
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
    <title>Gestión Skills | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
        body { background: #0A192F; background-image: radial-gradient(circle at top right, #1E3A8A 0%, #0A192F 50%); min-height: 100vh; }
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
    </style>
</head>
<body class="text-white font-sans">

    <!-- Header -->
    <header class="bg-cesa-primary/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6 border-b border-cesa-gold/30">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-4">
                <a href="/admin.php" class="text-gray-400 hover:text-white">
                    <i class="fas fa-arrow-left"></i>
                </a>
                <div class="w-10 h-10 bg-cesa-gold rounded-full flex items-center justify-center text-cesa-primary font-bold">
                    <i class="fas fa-award"></i>
                </div>
                <div>
                    <h1 class="text-lg font-bold">Gestión de Skills</h1>
                    <p class="text-[10px] text-cesa-goldLight uppercase tracking-widest">Certificaciones Digitales</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-xs text-gray-400" id="last-update">
                    <i class="fas fa-clock mr-1"></i> --
                </span>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto p-6">
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="glass-card rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <i class="fas fa-clipboard-check text-blue-400"></i>
                    </div>
                </div>
                <h3 class="text-3xl font-bold" id="stat-evaluaciones">--</h3>
                <p class="text-xs text-gray-400 mt-1">Total Evaluaciones</p>
            </div>
            
            <div class="glass-card rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <i class="fas fa-certificate text-green-400"></i>
                    </div>
                </div>
                <h3 class="text-3xl font-bold" id="stat-certificados">--</h3>
                <p class="text-xs text-gray-400 mt-1">Certificados Emitidos</p>
            </div>
            
            <div class="glass-card rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <i class="fas fa-chart-line text-purple-400"></i>
                    </div>
                </div>
                <h3 class="text-3xl font-bold" id="stat-aprobacion">--%</h3>
                <p class="text-xs text-gray-400 mt-1">Tasa Aprobación</p>
            </div>
            
            <div class="glass-card rounded-2xl p-5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-cesa-gold/20 flex items-center justify-center">
                        <i class="fas fa-calendar text-cesa-gold"></i>
                    </div>
                </div>
                <h3 class="text-3xl font-bold" id="stat-mes">--</h3>
                <p class="text-xs text-gray-400 mt-1">Este Mes</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
            <button onclick="showTab('habilidades')" class="tab-btn px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap" data-tab="habilidades">
                <i class="fas fa-graduation-cap mr-2"></i> Habilidades
            </button>
            <button onclick="showTab('evaluaciones')" class="tab-btn px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap" data-tab="evaluaciones">
                <i class="fas fa-tasks mr-2"></i> Evaluaciones
            </button>
            <button onclick="showTab('certificados')" class="tab-btn px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap" data-tab="certificados">
                <i class="fas fa-award mr-2"></i> Certificados
            </button>
        </div>

        <!-- Tab: Habilidades -->
        <div id="tab-habilidades" class="tab-content">
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="p-5 border-b border-white/5 flex justify-between items-center">
                    <h3 class="font-bold"><i class="fas fa-graduation-cap text-cesa-gold mr-2"></i>Catálogo de Habilidades</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5" id="habilidades-grid">
                    <!-- Se llena con JS -->
                </div>
            </div>
        </div>

        <!-- Tab: Evaluaciones -->
        <div id="tab-evaluaciones" class="tab-content hidden">
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="p-5 border-b border-white/5 flex justify-between items-center flex-wrap gap-4">
                    <h3 class="font-bold"><i class="fas fa-tasks text-blue-400 mr-2"></i>Evaluaciones Recientes</h3>
                    <div class="flex gap-2">
                        <select id="filtro-evaluaciones" onchange="cargarEvaluaciones()" class="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
                            <option value="todas">Todas</option>
                            <option value="pendientes">Pendientes</option>
                            <option value="completadas">Completadas</option>
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="text-[10px] uppercase text-gray-500 bg-white/5">
                            <tr>
                                <th class="px-5 py-3">Alumno</th>
                                <th class="px-5 py-3">Habilidad</th>
                                <th class="px-5 py-3">Estado</th>
                                <th class="px-5 py-3">Resultado</th>
                                <th class="px-5 py-3">Fecha</th>
                            </tr>
                        </thead>
                        <tbody id="evaluaciones-table" class="divide-y divide-white/5">
                            <!-- Se llena con JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tab: Certificados -->
        <div id="tab-certificados" class="tab-content hidden">
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="p-5 border-b border-white/5">
                    <h3 class="font-bold"><i class="fas fa-award text-cesa-gold mr-2"></i>Certificados Emitidos</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="text-[10px] uppercase text-gray-500 bg-white/5">
                            <tr>
                                <th class="px-5 py-3">Alumno</th>
                                <th class="px-5 py-3">Habilidad</th>
                                <th class="px-5 py-3">Nivel</th>
                                <th class="px-5 py-3">UUID</th>
                                <th class="px-5 py-3">Emisión</th>
                                <th class="px-5 py-3">Vence</th>
                            </tr>
                        </thead>
                        <tbody id="certificados-table" class="divide-y divide-white/5">
                            <!-- Se llena con JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script>
        let habilidadesData = [];
        let evaluacionesData = [];
        let certificadosData = [];

        document.addEventListener('DOMContentLoaded', () => {
            showTab('habilidades');
            cargarStats();
            cargarHabilidades();
            cargarEvaluaciones();
            cargarCertificados();
        });

        function showTab(tab) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(el => {
                el.classList.remove('bg-cesa-gold/20', 'text-cesa-gold');
                el.classList.add('text-gray-400');
            });
            
            document.getElementById('tab-' + tab).classList.remove('hidden');
            document.querySelector(`[data-tab="${tab}"]`).classList.add('bg-cesa-gold/20', 'text-cesa-gold');
            document.querySelector(`[data-tab="${tab}"]`).classList.remove('text-gray-400');
        }

        async function cargarStats() {
            try {
                const res = await fetch('/api/skills.php?action=admin_stats');
                const data = await res.json();
                
                if (data.success) {
                    document.getElementById('stat-evaluaciones').textContent = data.stats.total_evaluaciones;
                    document.getElementById('stat-certificados').textContent = data.stats.total_certificados;
                    document.getElementById('stat-aprobacion').textContent = data.stats.tasa_aprobacion + '%';
                    document.getElementById('stat-mes').textContent = data.stats.certificados_mes;
                    document.getElementById('last-update').innerHTML = '<i class="fas fa-clock mr-1"></i>' + new Date().toLocaleTimeString();
                }
            } catch (e) {
                console.error('Error cargando stats:', e);
            }
        }

        async function cargarHabilidades() {
            try {
                const res = await fetch('/api/skills.php?action=listar_habilidades');
                const data = await res.json();
                
                if (data.success) {
                    habilidadesData = data.data;
                    renderizarHabilidades();
                }
            } catch (e) {
                console.error('Error cargando habilidades:', e);
            }
        }

        function renderizarHabilidades() {
            const grid = document.getElementById('habilidades-grid');
            grid.innerHTML = habilidadesData.map(h => `
                <div class="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-${h.color_hex || '#D4AF37'}/50 transition">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center" 
                             style="background: ${h.color_hex || '#D4AF37'}22; color: ${h.color_hex || '#D4AF37'}">
                            <i class="${h.icono || 'fa-certificate'} text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-bold">${h.nombre}</h4>
                            <span class="text-[10px] text-gray-500 uppercase">${h.categoria}</span>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mb-4">${h.descripcion || ''}</p>
                    <div class="flex justify-between text-xs">
                        <span><i class="fas fa-question-circle text-blue-400 mr-1"></i> ${h.total_preguntas || 0} preguntas</span>
                        <span><i class="fas fa-certificate text-green-400 mr-1"></i> ${h.certificados_emitidos || 0} certs</span>
                    </div>
                </div>
            `).join('');
        }

        async function cargarEvaluaciones() {
            const filtro = document.getElementById('filtro-evaluaciones').value;
            
            try {
                const res = await fetch(`/api/skills.php?action=admin_listar&filtro=${filtro}`);
                const data = await res.json();
                
                if (data.success) {
                    evaluacionesData = data.data;
                    renderizarEvaluaciones();
                }
            } catch (e) {
                console.error('Error cargando evaluaciones:', e);
            }
        }

        function renderizarEvaluaciones() {
            const tbody = document.getElementById('evaluaciones-table');
            
            if (evaluacionesData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-5 py-8 text-center text-gray-500">
                            No hay evaluaciones registradas
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = evaluacionesData.map(e => {
                const aprobo = e.estado === 'completada' && parseFloat(e.porcentaje) >= 70; // Debería validar con h.nivel_minimo_aprobatorio
                
                return `
                    <tr class="hover:bg-white/5 transition">
                        <td class="px-5 py-4">
                            <p class="font-bold">${e.nombre_completo}</p>
                            <p class="text-[10px] text-gray-500">${e.matricula}</p>
                        </td>
                        <td class="px-5 py-4">
                            <span class="flex items-center gap-2">
                                <i class="${e.icono}" style="color: ${e.color_hex}"></i>
                                ${e.habilidad}
                            </span>
                        </td>
                        <td class="px-5 py-4">
                            <span class="px-2 py-1 rounded-full text-[10px] font-bold ${
                                e.estado === 'completada' ? 'bg-green-500/20 text-green-400' :
                                e.estado === 'en_proceso' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }">
                                ${e.estado}
                            </span>
                        </td>
                        <td class="px-5 py-4">
                            ${e.estado === 'completada' ? `
                                <span class="font-bold ${aprobo ? 'text-green-400' : 'text-red-400'}">
                                    ${e.porcentaje}%
                                </span>
                            ` : '<span class="text-gray-500">--</span>'}
                        </td>
                        <td class="px-5 py-4 text-gray-400 text-xs">
                            ${new Date(e.created_at).toLocaleDateString()}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        async function cargarCertificados() {
            try {
                const res = await fetch('/api/skills.php?action=admin_listar&filtro=aprobadas');
                const data = await res.json();
                
                if (data.success) {
                    certificadosData = data.data;
                    renderizarCertificados();
                }
            } catch (e) {
                console.error('Error cargando certificados:', e);
            }
        }

        function renderizarCertificados() {
            const tbody = document.getElementById('certificados-table');
            
            if (certificadosData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-5 py-8 text-center text-gray-500">
                            No hay certificados emitidos
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = certificadosData.map(c => {
                const expiro = c.fecha_expiracion && new Date(c.fecha_expiracion) < new Date();
                
                return `
                    <tr class="hover:bg-white/5 transition">
                        <td class="px-5 py-4">
                            <p class="font-bold">${c.nombre_completo}</p>
                            <p class="text-[10px] text-gray-500">${c.matricula}</p>
                        </td>
                        <td class="px-5 py-4">${c.habilidad}</td>
                        <td class="px-5 py-4">
                            <span class="px-2 py-1 rounded-full text-[10px] font-bold bg-cesa-gold/20 text-cesa-gold">
                                ${c.porcentaje >= 90 ? 'EXPERT' : c.porcentaje >= 80 ? 'ADVANCED' : 'CERTIFIED'}
                            </span>
                        </td>
                        <td class="px-5 py-4 font-mono text-xs text-gray-400">${c.uuid || '--'}</td>
                        <td class="px-5 py-4 text-xs">${c.created_at || '--'}</td>
                        <td class="px-5 py-4 text-xs ${expiro ? 'text-red-400' : 'text-gray-400'}">
                            ${c.fecha_expiracion || 'N/A'}
                        </td>
                    </tr>
                `;
            }).join('');
        }
    </script>

</body>
</html>
