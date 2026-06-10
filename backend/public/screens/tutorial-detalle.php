<?php
/**
 * Screen Detail: Industrial Pedimento F4 - CESA v3.9
 * Case Study: Luxury Bag Import (Gucci)
 */
?>
<div class="space-y-6 animate-fade-in px-2 pb-10">
    
    <!-- Back Header -->
    <div class="flex items-center gap-4">
        <button onclick="window.router.navigate('tutoriales')" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <i class="fas fa-arrow-left"></i>
        </button>
        <div>
            <h2 class="text-xl font-bold">Estudio Técnico</h2>
            <p class="text-[10px] text-cesa-gold font-bold uppercase tracking-widest">Pedimento F4: Importación Definitiva</p>
        </div>
    </div>

    <!-- Hero Content -->
    <div class="glass p-6 border-b-4 border-cesa-gold">
        <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">💼</div>
            <div class="text-right">
                <span class="text-[8px] font-bold text-gray-500 uppercase">Estado:</span>
                <div class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Certificado Industrial</div>
            </div>
        </div>
        <h3 class="text-2xl font-bold mb-4 leading-tight">Importación Definitiva: Bolsas de Lujo (F4)</h3>
        <p class="text-sm text-gray-400 leading-relaxed italic">
            "Este estudio analiza la complejidad de importar artículos de lujo hacia México, aplicando tasas arancelarias dinámicas, IEPS y el despacho aduanero automatizado."
        </p>
    </div>

    <!-- Pedimento Data Sheet -->
    <section class="space-y-4">
        <h4 class="text-xs font-bold text-gray-600 uppercase tracking-widest">Ficha Técnica de Despacho</h4>
        
        <div class="glass p-5 space-y-4 font-mono">
            <div class="flex justify-between border-b border-white/5 pb-2 text-[10px]">
                <span class="text-gray-500 uppercase">Clave Pedimento:</span>
                <span class="text-white font-bold uppercase tracking-widest">F4 - CAMBIO DE RÉGIMEN</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2 text-[10px]">
                <span class="text-gray-500 uppercase">Materia:</span>
                <span class="text-white uppercase">50 Unidades - Bolsos de Lujo (Gucci)</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2 text-[10px]">
                <span class="text-gray-500 uppercase">Valor Aduana:</span>
                <span class="text-cesa-gold font-bold">$250,000.00 MXN</span>
            </div>
        </div>
    </section>

    <!-- Tax aggregation Engine -->
    <section class="space-y-4">
        <h4 class="text-xs font-bold text-gray-600 uppercase tracking-widest">Motor de Agregación Fiscal (IEPS + REC)</h4>
        
        <div class="glass overflow-hidden">
            <table class="w-full text-[10px] text-left border-collapse">
                <thead>
                    <tr class="bg-white/5 text-gray-400 uppercase">
                        <th class="p-3 border-b border-white/10">CONCEPTO</th>
                        <th class="p-3 border-b border-white/10 text-right">TASA</th>
                        <th class="p-3 border-b border-white/10 text-right">IMPORTE</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5 font-mono">
                    <tr>
                        <td class="p-3 text-gray-300">IGI (Arancel Importación)</td>
                        <td class="p-3 text-right">15%</td>
                        <td class="p-3 text-right text-white">$37,500.00</td>
                    </tr>
                    <tr>
                        <td class="p-3 text-gray-300">DTA (Derecho Trámite)</td>
                        <td class="p-3 text-right">8 al millar</td>
                        <td class="p-3 text-right text-white">$2,000.00</td>
                    </tr>
                    <tr>
                        <td class="p-3 text-blue-400 font-bold">IEPS (Lujo/Especial)</td>
                        <td class="p-3 text-right">20%</td>
                        <td class="p-3 text-right text-blue-400 font-bold">$50,000.00</td>
                    </tr>
                    <tr>
                        <td class="p-3 text-purple-400 font-bold">REC (Recaudación)</td>
                        <td class="p-3 text-right">Cuota Fija</td>
                        <td class="p-3 text-right text-purple-400 font-bold">$5,000.00</td>
                    </tr>
                    <tr class="bg-cesa-gold/10">
                        <td class="p-3 text-gray-300 font-bold">IVA (Sobre Base+Imp)</td>
                        <td class="p-3 text-right">16%</td>
                        <td class="p-3 text-right text-white font-bold">$55,120.00</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="bg-cesa-navy/50">
                        <td colspan="2" class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Total a Pagar en Aduana</td>
                        <td class="p-4 text-right text-cesa-gold text-lg font-black">$149,620.00</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <p class="text-[9px] text-gray-600 text-center uppercase tracking-widest font-bold">Cálculos sincronizados con CBIT-01 Compliance</p>
    </section>

    <!-- ACTION: OPEN TOOL -->
    <section class="p-2">
        <button onclick="window.location.href='/pedimento/'" 
                class="w-full bg-gradient-to-r from-cesa-gold to-yellow-600 text-cesa-navy p-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition">
            <i class="fas fa-edit text-xl"></i>
            ABRIR HERRAMIENTA DE LLENADO v5
        </button>
        <p class="text-[10px] text-center text-gray-500 mt-3 uppercase font-bold">Optimizado para iPhone 12 Mini & Desktop</p>
    </section>

    <!-- Professional Signature -->
    <section class="glass p-6 text-center border-t-2 border-white/10 mt-10">
        <div class="mb-4">
            <span class="text-[8px] bg-white/10 px-3 py-1 rounded-full text-white font-bold uppercase tracking-widest">Firma de Responsabilidad</span>
        </div>
        <div class="flex flex-col items-center gap-3">
             <div class="w-16 h-1 bg-cesa-gold mb-2 opacity-50"></div>
             <p class="font-serif italic text-xl text-gray-200">Roberto Eduardo Celis Robles</p>
             <p class="text-[10px] text-cesa-gold font-bold uppercase tracking-widest">Director de Procesos Industriales & Tech Compliance</p>
        </div>
        <div class="mt-6 flex justify-center gap-4">
            <button class="bg-white/5 p-3 rounded-xl text-gray-400 hover:text-white transition"><i class="fas fa-file-pdf"></i></button>
            <button class="bg-white/5 p-3 rounded-xl text-gray-400 hover:text-white transition"><i class="fas fa-share-nodes"></i></button>
            <button class="bg-blue-600/20 text-blue-400 px-6 py-3 rounded-xl font-bold text-xs uppercase">Validar QR</button>
        </div>
    </section>

</div>

<script>
    console.log('Pedimento Screen Loaded: F4-Bolsas de Lujo Logic Initialized.');
</script>
