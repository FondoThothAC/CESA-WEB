<?php
/**
 * Screen: Admin Dashboard (Mando Directivo)
 * Official CESA Identity v3.9
 * Navy Blue (#0F2C59) + Gold (#D4AF37)
 */
require_once __DIR__ . '/../../lib/Auth.php';
$user = Auth::getAuthenticatedUser();

if (!$user || ($user['rol'] !== 'admin' && $user['rol'] !== 'mesa_directiva')) {
    echo "
    <div class='flex flex-col items-center justify-center py-20 px-8 text-center'>
        <div class='w-20 h-20 bg-red-900/10 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6 border border-red-500/20'>
            <i class='fas fa-shield-halved'></i>
        </div>
        <h2 class='text-2xl font-black text-white tracking-tight uppercase'>Acceso Restringido</h2>
        <p class='text-gray-500 mt-2 text-sm'>Este cuadrante está reservado para el <span class='text-cesa-gold font-bold'>Mando Directivo</span> y Mesa de Gobernanza.</p>
        <button onclick=\"window.router.navigate('home')\" class='mt-8 bg-white/5 border border-white/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest'>Volver al Inicio</button>
    </div>";
    exit;
}
?>

<div class="space-y-8 animate-fade-in px-2 pb-20">
    
    <!-- Hero Header -->
    <section class="relative overflow-hidden glass p-8 border-b-4 border-cesa-gold rounded-[2rem]">
        <div class="absolute -right-10 -top-10 w-44 h-44 bg-cesa-gold/5 rounded-full blur-3xl"></div>
        <div class="flex items-center gap-4 mb-6 relative">
            <div class="w-16 h-16 bg-gradient-to-br from-cesa-navy to-blue-900 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-cesa-gold/30">🦉</div>
            <div>
                <h2 class="text-3xl font-black tracking-tighter uppercase leading-none text-white">Mando <span class="text-cesa-gold">Directivo</span></h2>
                <p class="text-[10px] font-bold text-blue-400 mt-2 tracking-[0.2em] uppercase">Consejo Estudiantil UNISON • Est 2012</p>
                <div class="flex gap-1 mt-1">
                    <i class="fas fa-star text-[8px] text-cesa-gold"></i>
                    <i class="fas fa-star text-[8px] text-cesa-gold"></i>
                    <i class="fas fa-star text-[8px] text-cesa-gold"></i>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/20 p-4 rounded-2xl border border-white/5">
                <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Status Sistema</p>
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/30"></span>
                    <span class="text-xs font-bold text-white uppercase tracking-tighter">Operativo</span>
                </div>
            </div>
            <div class="bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer active:scale-95 transition-all outline-none" onclick="window.router.navigate('chatbot-metrics')">
                <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Gobernanza AI</p>
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30"></span>
                    <span class="text-xs font-bold text-white uppercase tracking-tighter">Telemetría <i class="fas fa-chevron-right text-[8px] text-blue-400 ml-1"></i></span>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Stats GRID -->
    <div class="grid grid-cols-2 gap-4">
        <div class="glass p-5 flex flex-col items-center justify-center gap-2 group transition-all active:scale-95">
            <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl text-cesa-gold shadow-inner"><i class="fas fa-users"></i></div>
            <div class="text-center">
                <p class="text-2xl font-black text-white">5,234</p>
                <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">Miembros</p>
            </div>
        </div>
        <div class="glass p-5 flex flex-col items-center justify-center gap-2 group transition-all active:scale-95">
            <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl text-blue-400 shadow-inner"><i class="fas fa-bolt"></i></div>
            <div class="text-center">
                <p class="text-2xl font-black text-white">1.2k</p>
                <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">Interacciones</p>
            </div>
        </div>
    </div>
    
    <div class="mt-4 glass p-4 flex items-center justify-between group active:scale-95 transition-all cursor-pointer rounded-2xl border-l-4 border-cesa-gold" onclick="window.router.navigate('bazar-gestion')">
         <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-cesa-gold"><i class="fas fa-store"></i></div>
             <div>
                 <h4 class="text-sm font-bold text-white uppercase">Moderación Bazar</h4>
                 <p class="text-[9px] text-gray-500 uppercase tracking-widest">Aprobar o rechazar negocios</p>
             </div>
         </div>
         <i class="fas fa-chevron-right text-white/30 group-hover:text-cesa-gold transition-colors"></i>
    </div>

    <!-- AI Management Panel -->
    <section class="space-y-4">
        <div class="flex justify-between items-center px-1">
            <h3 class="text-xs font-bold text-gray-600 uppercase tracking-widest">Sincronización de Cerebros</h3>
            <span class="text-[10px] text-cesa-gold font-bold">ACTUALIZADO</span>
        </div>
        <div class="glass p-6 space-y-4">
            <div class="relative">
                <input type="password" placeholder="Groq Cloud Master" class="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-12 text-xs focus:border-cesa-gold outline-none transition-all placeholder:text-gray-700">
                <i class="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"></i>
            </div>
            <div class="relative">
                 <input type="password" placeholder="Gemini Gouvernance" class="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-12 text-xs focus:border-cesa-gold outline-none transition-all placeholder:text-gray-700">
                 <i class="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"></i>
            </div>
            <button class="w-full bg-cesa-navy border border-cesa-gold/30 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-black/50 hover:bg-cesa-gold hover:text-cesa-navy transition-all duration-300">
                Sincronizar Inteligencia
            </button>
        </div>
    </section>

    <!-- Zonda de Revocación (Moderation) -->
    <section class="space-y-4">
        <h3 class="text-xs font-bold text-red-900/60 uppercase tracking-widest px-1">Zonda de Revocación</h3>
        <div id="reported-posts" class="space-y-3">
             <!-- Placeholder Content -->
             <div class="glass p-4 border-l-4 border-red-500/30 flex items-center justify-between opacity-50">
                <div>
                    <h4 class="text-[10px] font-bold text-gray-300">Post #3412 - Marcado por Sentiment AI</h4>
                    <p class="text-[9px] text-gray-600 mt-1">Nivel de Ofensa: 88%</p>
                </div>
                <button class="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition hover:bg-red-500 hover:text-white">Revocar</button>
             </div>
             <div class="glass p-4 border-l-4 border-red-500/30 flex items-center justify-between opacity-50">
                <div>
                    <h4 class="text-[10px] font-bold text-gray-300">Auth #091 - Intento de Fuerza Bruta</h4>
                    <p class="text-[9px] text-gray-600 mt-1">IP: 187.xx.xx.xx</p>
                </div>
                <button class="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition hover:bg-red-500 hover:text-white">Bloquear</button>
             </div>
        </div>
    </section>

    <!-- Footer Security -->
    <div class="p-10 text-center">
        <i class="fas fa-lock text-gray-800 text-2xl mb-4"></i>
        <p class="text-[9px] text-gray-700 uppercase font-black tracking-[0.2em]">CBIT-01 Industrial Standard • AES-256 AES-RSA Sincronizado</p>
    </div>

</div>

<script>
    console.log('Mando Directivo Loaded: Unified Governance Initialized.');
</script>
