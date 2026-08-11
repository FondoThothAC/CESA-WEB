<?php
/**
 * Screen: Home / Inicio - CESA PWA v4.0 Industrial
 */
require_once __DIR__ . '/../../lib/Auth.php';
$user = Auth::getAuthenticatedUser();
$userName = $user ? explode(' ', $user['nombre_completo'])[0] : 'Estudiante';
?>
<div class="space-y-6 animate-slide-in-right pb-24">
    
    <!-- Welcome Header -->
    <section class="mt-2">
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
            ¡Hola, <span class="text-cesa-gold"><?= htmlspecialchars($userName) ?></span>!
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Propulsando la Comunidad Universitaria.</p>
    </section>

    <!-- Global Mood (Mood-o-meter) -->
    <section class="glass p-5 relative overflow-hidden group border-gray-200 dark:border-white/5">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-cesa-navy/5 rounded-full blur-2xl group-hover:bg-cesa-navy/10 transition-all"></div>
        <div class="flex justify-between items-end mb-4 text-gray-900 dark:text-white">
            <div>
                <h3 class="text-xs font-bold text-cesa-navy dark:text-cesa-gold uppercase tracking-wider">Mood Institucional</h3>
                <p class="text-2xl font-black">Positivo</p>
            </div>
            <div class="text-right">
                <span class="text-4xl">😊</span>
            </div>
        </div>
        <!-- Progress Bar (Sentimiento AI) -->
        <div class="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
            <div class="bg-gradient-to-r from-cesa-navy to-cesa-gold h-full w-[78%]"></div>
        </div>
        <p class="text-[10px] text-gray-500 mt-2 italic shadow-sm">Impulsado por el motor de IA CESA v4.0</p>
    </section>

    <!-- Quick Access Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <button onclick="window.router.navigate('tutorias')" class="glass p-4 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition border-gray-200 dark:border-white/10 group">
            <div class="w-12 h-12 bg-cesa-navy/10 text-cesa-navy dark:text-cesa-gold rounded-2xl flex items-center justify-center text-xl group-active:scale-90 transition">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <span class="font-bold text-[10px] uppercase dark:text-gray-300">Tutorías</span>
        </button>
        <button onclick="window.router.navigate('bazar')" class="glass p-4 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition border-gray-200 dark:border-white/10 group">
            <div class="w-12 h-12 bg-cesa-navy/10 text-cesa-navy dark:text-cesa-gold rounded-2xl flex items-center justify-center text-xl group-active:scale-90 transition">
                <i class="fas fa-store"></i>
            </div>
            <span class="font-bold text-[10px] uppercase dark:text-gray-300">Bazar</span>
        </button>
        <button onclick="window.router.navigate('skills')" class="glass p-4 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition border-gray-200 dark:border-white/10 group">
            <div class="w-12 h-12 bg-cesa-navy/10 text-cesa-navy dark:text-cesa-gold rounded-2xl flex items-center justify-center text-xl group-active:scale-90 transition">
                <i class="fas fa-award"></i>
            </div>
            <span class="font-bold text-[10px] uppercase dark:text-gray-300">Mis Skills</span>
        </button>
        <button onclick="window.router.navigate('perfil')" class="glass p-4 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition border-gray-200 dark:border-white/10 group">
            <div class="w-12 h-12 bg-cesa-navy/10 text-cesa-navy dark:text-cesa-gold rounded-2xl flex items-center justify-center text-xl group-active:scale-90 transition">
                <i class="fas fa-id-card"></i>
            </div>
            <span class="font-bold text-[10px] uppercase dark:text-gray-300">Mi Carnet</span>
        </button>
    </div>

    <!-- Featured Data -->
    <section>
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-black text-xs uppercase tracking-widest text-gray-400">Tendencias</h3>
            <button onclick="window.router.navigate('muro')" class="text-[10px] text-cesa-navy dark:text-cesa-gold font-bold">VER MURO</button>
        </div>
        
        <div id="featured-posts" class="space-y-4">
            <div class="glass p-5 border-gray-100 dark:border-white/5 animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-white/5 w-3/4 rounded-full mb-3"></div>
                <div class="h-3 bg-gray-100 dark:bg-white/5 w-1/2 rounded-full"></div>
            </div>
        </div>
    </section>
</div>

<script>
    // Cargar posts destacados del muro
    fetch('/api/muro.php?limit=2')
        .then(res => res.json())
        .then(resp => {
            if (resp.success && resp.data.length > 0) {
                const container = document.getElementById('featured-posts');
                container.innerHTML = resp.data.map(post => `
                    <div class="glass p-5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer" onclick="window.router.navigate('muro')">
                        <div class="flex items-center gap-2 mb-3">
                            <i class="fas fa-fire text-cesa-gold text-xs"></i>
                            <span class="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Lo más relevante</span>
                        </div>
                        <p class="text-sm text-gray-800 dark:text-gray-100 line-clamp-2">${post.contenido}</p>
                        <div class="mt-4 flex items-center gap-4 text-cesa-navy dark:text-cesa-gold font-bold text-xs uppercase tracking-tighter">
                            <span class="flex items-center gap-1"><i class="fas fa-arrow-up"></i> ${post.score}</span>
                        </div>
                    </div>
                `).join('');
            }
        });
</script>
