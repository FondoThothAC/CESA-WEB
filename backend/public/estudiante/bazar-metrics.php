<?php
/**
 * Estudiante: Bazar Metrics v1.0
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
$user = $auth->getUser();

if (!$auth->isLoggedIn()) {
    header('Location: /login.php'); exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Métricas — CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background: #020617; color: #f8fafc; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .gradient-text { background: linear-gradient(to right, #6366f1, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .bar { transition: height 1s ease-in-out; }
    </style>
</head>
<body class="p-8">
    <div class="max-w-6xl mx-auto">
        <header class="mb-12">
            <h1 class="text-4xl font-black uppercase tracking-tighter">Métricas de <span class="gradient-text">Rendimiento</span></h1>
            <p id="negocio-nombre" class="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Cargando datos de tu emprendimiento...</p>
        </header>

        <div id="no-negocio" class="hidden glass p-12 rounded-[40px] text-center">
            <div class="text-6xl mb-6">🛒</div>
            <h2 class="text-2xl font-bold mb-4 text-white">Aún no tienes un negocio registrado</h2>
            <p class="text-slate-400 mb-8">Registra tu emprendimiento en el Bazar para acceder a analíticas avanzadas.</p>
            <a href="/estudiante/bazar.php" class="bg-indigo-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">Registrar Ahora</a>
        </div>

        <div id="metrics-content" class="hidden grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Stats Column -->
            <div class="md:col-span-2 space-y-8">
                <!-- Main KPI Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="glass p-8 rounded-[32px]">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Alcance Total</p>
                        <h2 id="total-views" class="text-5xl font-black">0</h2>
                        <p class="text-green-500 text-[10px] font-bold mt-2 uppercase tracking-widest">+12% ESTE SEMESTRE</p>
                    </div>
                    <div class="glass p-8 rounded-[32px]">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Puntaje de Satisfacción</p>
                        <h2 id="satisfaction" class="text-5xl font-black">0%</h2>
                        <div class="w-full bg-white/5 h-1.5 rounded-full mt-4">
                            <div id="satisfaction-bar" class="h-full bg-indigo-500 rounded-full" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <!-- Views History -->
                <div class="glass p-8 rounded-[40px]">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] mb-8">Tendencia de Visibilidad</h3>
                    <div id="history-chart" class="h-48 flex items-end justify-between gap-2 px-4">
                        <!-- Bars injected by JS -->
                    </div>
                </div>
            </div>

            <!-- AI Sidebar -->
            <div class="space-y-8">
                <div class="glass p-8 rounded-[40px] border-indigo-500/20">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">🤖</div>
                        <h3 class="text-[10px] font-black uppercase tracking-[0.2em]">Sugerencia IA</h3>
                    </div>
                    <p class="text-slate-300 text-sm leading-relaxed" id="ai-suggestion">
                        Analizando el feedback de la comunidad...
                    </p>
                </div>

                <div class="glass p-8 rounded-[40px]">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] mb-6">Temas Clave</h3>
                    <div id="topics-list" class="space-y-4">
                        <!-- Topics injected by JS -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function loadMetrics() {
            const res = await fetch('/api/bazar-metrics.php?action=resumen');
            const data = await res.json();
            
            if (!data.has_negocio) {
                document.getElementById('no-negocio').classList.remove('hidden');
                return;
            }

            document.getElementById('metrics-content').classList.remove('hidden');
            const s = data.summary;
            
            document.getElementById('negocio-nombre').innerText = s.nombre_negocio;
            document.getElementById('total-views').innerText = s.views;
            document.getElementById('satisfaction').innerText = s.satisfaccion + '%';
            document.getElementById('satisfaction-bar').style.width = s.satisfaccion + '%';

            // Render Trends
            const chart = document.getElementById('history-chart');
            const maxViews = Math.max(...data.history.map(h => h.vistas)) || 1;
            chart.innerHTML = data.history.map(h => `
                <div class="flex-1 flex flex-col items-center gap-2">
                    <div class="w-full bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t-lg transition-all bar" style="height: ${(h.vistas / maxViews) * 100}%"></div>
                    <span class="text-[8px] font-bold text-slate-500 uppercase">${h.dia}</span>
                </div>
            `).join('');

            // Render Topics
            const topics = document.getElementById('topics-list');
            topics.innerHTML = data.topics.map(t => `
                <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-400">${t.tema}</span>
                    <span class="font-black text-indigo-400">${t.menciones} menciones</span>
                </div>
            `).join('');

            // AI Logic
            const negative = s.sent_negativo_pct;
            if (negative > 20) {
                document.getElementById('ai-suggestion').innerHTML = "Detectamos comentarios sobre el <span class='text-white font-bold'>precio</span>. Considera crear una promoción de volumen para aumentar el valor percibido.";
            } else if (s.views > 100 && s.sent_total < 5) {
                document.getElementById('ai-suggestion').innerHTML = "Tienes buen tráfico pero poco engagement. ¡Incentiva a tus clientes a dejar una opinión en el muro para generar confianza!";
            } else {
                document.getElementById('ai-suggestion').innerHTML = "Tu negocio mantiene un <span class='text-white font-bold'>sentimiento saludable</span>. Mantén la calidad actual y enfócate en expandir tu alcance a otras facultades.";
            }
        }

        loadMetrics();
    </script>
</body>
</html>
