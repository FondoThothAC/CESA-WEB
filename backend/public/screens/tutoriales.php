<?php
/**
 * Screen: Centro de Aprendizaje CESA v3.9
 * Includes Industrial Pedimento Case Studies.
 */
?>
<div class="space-y-6 animate-fade-in px-2">
    <div class="mb-2">
        <h2 class="text-2xl font-bold text-white">Centro de Aprendizaje</h2>
        <p class="text-sm text-gray-400 mt-1">Guías industriales para la profesionalización estudiantil.</p>
    </div>

    <div class="relative">
        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
        <input type="text" placeholder="Buscar guía (ej. Becas, Pedimento, Bazar...)" 
               class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-cesa-gold transition shadow-inner">
    </div>

    <!-- Featured: Industrial Case Study (Pedimento) -->
    <section class="glass p-5 border-l-4 border-cesa-gold relative overflow-hidden group cursor-pointer" 
             onclick="window.router.navigate('tutorial-detalle?id=pedimento')">
        <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-cesa-gold/5 rounded-full blur-2xl group-hover:bg-cesa-gold/10 transition-all"></div>
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-cesa-gold/20 rounded-2xl flex items-center justify-center text-2xl text-cesa-gold">
                <i class="fas fa-file-contract"></i>
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[8px] bg-cesa-gold text-cesa-navy px-1.5 py-0.5 rounded-full font-bold">PREMIUM</span>
                    <span class="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Aduanas & Comercio</span>
                </div>
                <h4 class="font-bold text-lg leading-tight">Pedimento F4: Bolsas de Lujo</h4>
                <p class="text-xs text-gray-500 mt-1">Estudio técnico sobre importación, IEPS y cálculos fiscales industriales.</p>
            </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase">
            <span>Instructor: Roberto E. Celis R.</span>
            <span class="text-cesa-gold">Entrar <i class="fas fa-arrow-right ml-1"></i></span>
        </div>
    </section>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <!-- Semestre Real -->
        <div class="glass p-4 flex items-center gap-4 hover:bg-white/5 transition cursor-pointer">
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl text-blue-400">
                <i class="fas fa-calculator"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-sm">Cálculo de Semestre Real</h4>
                <p class="text-[10px] text-gray-500">Mide tu progreso académico por créditos UNISON.</p>
            </div>
            <i class="fas fa-chevron-right text-gray-800"></i>
        </div>

        <!-- Bazar Guide -->
        <div class="glass p-4 flex items-center gap-4 hover:bg-white/5 transition cursor-pointer">
            <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-xl text-green-400">
                <i class="fas fa-store"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-sm">Vender en Bazar CESA</h4>
                <p class="text-[10px] text-gray-500">Cómo registrar tu emprendimiento y ganar karma.</p>
            </div>
            <i class="fas fa-chevron-right text-gray-800"></i>
        </div>

        <!-- Digital Certificates -->
        <div class="glass p-4 flex items-center gap-4 hover:bg-white/5 transition cursor-pointer">
            <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-xl text-purple-400">
                <i class="fas fa-award"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-sm">Certificaciones Digitales</h4>
                <p class="text-[10px] text-gray-500">Guía para validar skills y obtener tu UUID.</p>
            </div>
            <i class="fas fa-chevron-right text-gray-800"></i>
        </div>

    </div>

    <!-- Suggestion -->
    <div class="p-6 text-center">
        <p class="text-xs text-gray-600">¿Tienes una guía que compartir?</p>
        <button class="text-cesa-gold font-bold text-xs mt-2 uppercase tracking-tighter">Contactar Mesa Directiva</button>
    </div>
</div>
