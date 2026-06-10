<?php
/**
 * Screen: Dashboard de Métricas del Chatbot
 * CESA UNISON v3.9
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
$user = $auth->getUser();

if (!$user || !in_array($user['rol'], ['admin', 'mesa_directiva'])) {
    echo "<div class='p-8 text-center text-red-500 font-bold'>Acceso Denegado. Solo Mando Directivo.</div>";
    exit;
}
?>

<!-- Inyectar Chart.js dinámicamente -->
<script>
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => initChatbotDashboard();
        document.head.appendChild(script);
    } else {
        setTimeout(initChatbotDashboard, 100);
    }
</script>

<div class="space-y-6 animate-slide-in-right pb-24 px-2">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <button onclick="window.router.navigate('admin')" class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition">
                <i class="fas fa-arrow-left"></i>
            </button>
            <div>
                <h2 class="text-xl font-black text-white uppercase tracking-tighter">Gobernanza IA</h2>
                <p class="text-[10px] text-cesa-gold font-bold uppercase tracking-widest flex items-center gap-1">
                    <i class="fas fa-circle text-green-500 text-[8px] animate-pulse"></i> Telemetría Activa
                </p>
            </div>
        </div>
        <button onclick="exportarCSVChatbot()" class="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition">
            <i class="fas fa-download"></i> CSV
        </button>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass p-5 rounded-3xl border-t-4 border-cesa-gold">
            <div class="flex justify-between items-start mb-2">
                <i class="fas fa-comments text-cesa-gold text-xl"></i>
            </div>
            <h3 class="text-3xl font-black text-white" id="m-total">--</h3>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Interacciones</p>
        </div>
        
        <div class="glass p-5 rounded-3xl border-t-4 border-blue-500">
            <div class="flex justify-between items-start mb-2">
                <i class="fas fa-tachometer-alt text-blue-500 text-xl"></i>
            </div>
            <h3 class="text-3xl font-black text-white" id="m-latencia">--<span class="text-sm">ms</span></h3>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Latencia Avg</p>
        </div>
        
        <div class="glass p-5 rounded-3xl border-t-4 border-green-500">
            <div class="flex justify-between items-start mb-2">
                 <i class="fas fa-check-circle text-green-500 text-xl"></i>
            </div>
            <h3 class="text-3xl font-black text-white" id="m-success">--%</h3>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Éxito Respuesta</p>
        </div>
        
        <div class="glass p-5 rounded-3xl border-t-4 border-purple-500">
             <div class="flex justify-between items-start mb-2">
                 <i class="fas fa-bug text-purple-500 text-xl"></i>
            </div>
            <h3 class="text-3xl font-black text-white" id="m-errors">--</h3>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Errores</p>
        </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="glass p-6 rounded-3xl lg:col-span-2">
            <h3 class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4"><i class="fas fa-chart-line text-blue-400"></i> Actividad Semanal</h3>
            <div class="h-48 relative w-full">
                <canvas id="actividadChart"></canvas>
            </div>
        </div>
        
        <div class="glass p-6 rounded-3xl">
            <h3 class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4"><i class="fas fa-network-wired text-purple-400"></i> Nodos Proveedores</h3>
            <div class="h-48 relative w-full flex justify-center">
                <canvas id="proveedoresChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass p-6 rounded-3xl">
            <h3 class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4"><i class="fas fa-clock text-cesa-gold"></i> Congestión Horaria</h3>
            <div class="h-48 relative w-full">
                <canvas id="horasChart"></canvas>
            </div>
        </div>

        <div class="glass p-6 rounded-3xl">
            <h3 class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4"><i class="fas fa-brain text-pink-400"></i> Intenciones Detectadas</h3>
            <div id="intentions-container" class="space-y-3 mt-4">
                <div class="animate-pulse flex space-x-4">
                    <div class="flex-1 space-y-4 py-1">
                        <div class="h-2 bg-white/10 rounded"></div>
                        <div class="h-2 bg-white/10 rounded w-5/6"></div>
                        <div class="h-2 bg-white/10 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    let actividadChartObj = null;
    let proveedoresChartObj = null;
    let horasChartObj = null;

    async function initChatbotDashboard() {
        try {
            const res = await fetch('/api/chatbot-stats.php?action=overview');
            const data = await res.json();
            
            if (data.success) {
                document.getElementById('m-total').textContent = data.metrics.total_messages;
                document.getElementById('m-latencia').innerHTML = `${data.metrics.avg_latency_ms}<span class="text-sm text-gray-500">ms</span>`;
                document.getElementById('m-success').textContent = `${data.metrics.success_rate}%`;
                document.getElementById('m-errors').textContent = data.metrics.error_count;
                
                renderActividad(data.daily_messages);
                renderProveedores(data.providers);
            }

            // Fetch Intenciones
            const resInt = await fetch('/api/chatbot-stats.php?action=intentions');
            const dataInt = await resInt.json();
            if (dataInt.success) {
                renderIntentions(dataInt.intent_categories);
            }

            // Fetch Peak Hours
            const resP = await fetch('/api/chatbot-stats.php?action=peak_hours');
            const dataP = await resP.json();
            if (dataP.success) {
                renderPeakHours(dataP.peak_hours);
            }

        } catch (e) {
            console.error("Error inicializando dashboard IA:", e);
        }
    }

    function renderActividad(data) {
        if (!data || data.length === 0) return;
        const ctx = document.getElementById('actividadChart').getContext('2d');
        if (actividadChartObj) actividadChartObj.destroy();

        actividadChartObj = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date.split('-').slice(1).join('/')),
                datasets: [{
                    label: 'Peticiones',
                    data: data.map(d => d.count),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0F2C59',
                    pointBorderColor: '#D4AF37'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
                }
            }
        });
    }

    function renderProveedores(data) {
        if (!data || data.length === 0) return;
        const ctx = document.getElementById('proveedoresChart').getContext('2d');
        if (proveedoresChartObj) proveedoresChartObj.destroy();

        const colors = { 'local': '#22C55E', 'groq': '#F59E0B', 'gemini': '#8B5CF6' };

        proveedoresChartObj = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.provider.toUpperCase()),
                datasets: [{
                    data: data.map(d => d.total),
                    backgroundColor: data.map(d => colors[d.provider] || '#6B7280'),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { color: '#9CA3AF', font: { size: 10 } } }
                }
            }
        });
    }

    function renderPeakHours(data) {
        const ctx = document.getElementById('horasChart').getContext('2d');
        if (horasChartObj) horasChartObj.destroy();
        
        let hours = Array.from({length: 24}, (_, i) => i);
        let counts = hours.map(h => {
             let d = data.find(item => parseInt(item.hour) === h);
             return d ? parseInt(d.count) : 0;
        });

        horasChartObj = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours.map(h => `${h}h`),
                datasets: [{
                    data: counts,
                    backgroundColor: counts.map(c => c > 5 ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)'),
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#9CA3AF', maxRotation: 90, font: {size: 9} } },
                    y: { display: false }
                }
            }
        });
    }

    function renderIntentions(intentions) {
        const container = document.getElementById('intentions-container');
        const items = Object.entries(intentions).slice(0, 6);
        
        if (items.length === 0) {
            container.innerHTML = "<p class='text-xs text-gray-500 italic'>Suficiente data no recolectada.</p>";
            return;
        }

        const max = Math.max(...items.map(i => i[1]));

        container.innerHTML = items.map(([intent, count]) => `
            <div class="mb-3">
                <div class="flex justify-between text-[10px] uppercase font-bold text-gray-300 mb-1">
                    <span>${intent}</span>
                    <span class="text-cesa-gold">${count} consultas</span>
                </div>
                <div class="w-full bg-white/5 rounded-full h-1.5">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style="width: ${(count/max)*100}%"></div>
                </div>
            </div>
        `).join('');
    }

    function exportarCSVChatbot() {
        window.location.href = '/api/chatbot-stats.php?action=export';
    }
</script>
