<?php
/**
 * Screen: Bazar Emprendedor - CESA PWA v3.9
 * Includes Leaflet map, Glassmorphism, and Karma rating
 */
require_once __DIR__ . '/../../lib/Auth.php';
$isLoggedIn = Auth::getAuthenticatedUser() !== null;
?>

<!-- Estilos específicos de esta pantalla -->
<style>
    .bazar-card { transition: all 0.3s ease; }
    .bazar-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); }
    .categoria-badge { transition: all 0.2s; }
    .categoria-badge:hover { transform: scale(1.05); }
    #mapa-bazar { height: 350px; border-radius: 12px; z-index: 10; }
</style>

<!-- Inyectar Leaflet CSS dinámicamente si no existe -->
<script>
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
</script>

<div class="space-y-6 animate-fade-in px-2 pb-10">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 class="text-2xl font-bold text-white">Bazar Emprendedor</h2>
            <p class="text-gray-400 mt-1 text-sm">Descubre negocios creados por estudiantes.</p>
        </div>
        <?php if ($isLoggedIn): ?>
            <button onclick="window.router.navigate('mi-negocio')" class="bg-gradient-to-r from-cesa-navy to-cesa-gold py-2 px-4 rounded-xl font-bold flex items-center gap-2 shadow-lg text-xs uppercase tracking-widest text-white active:scale-95 transition">
                <i class="fas fa-store"></i> Mi Negocio
            </button>
        <?php else: ?>
             <a href="/login.php" class="bg-white/10 py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white border border-white/20">Iniciar Sesión</a>
        <?php endif; ?>
    </div>

    <!-- Filtros -->
    <div class="glass p-4">
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="filtros-container">
            <button onclick="filterByCategory('todas', this)" class="categoria-badge active px-4 py-2 rounded-full bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30 text-xs flex-shrink-0">
                 Todas
            </button>
            <?php 
            $categorias = [
                'comida' => 'Comida 🍔', 'productos' => 'Productos 🛍️', 
                'servicios' => 'Servicios 🔧', 'tecnologia' => 'Tech 💻', 
                'arte' => 'Arte 🎨'
            ];
            foreach ($categorias as $key => $name): ?>
                <button onclick="filterByCategory('<?= $key ?>', this)" class="categoria-badge px-4 py-2 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 transition border border-white/10 text-xs flex-shrink-0">
                    <?= $name ?>
                </button>
            <?php endforeach; ?>
        </div>
        <div class="mt-3 relative">
            <input type="text" id="bazar-search" placeholder="Buscar por nombre o descripción..." class="w-full bg-black/30 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-cesa-gold transition" oninput="filterBySearch(this.value)">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>
    </div>

    <!-- Mapa -->
    <div class="glass p-4 relative z-0">
        <h3 class="text-sm font-bold mb-3 flex items-center gap-2 text-white">
            <i class="fas fa-map-marked-alt text-cesa-gold"></i> Mapa de Emprendedores
        </h3>
        <div id="mapa-bazar" class="border border-white/5"></div>
        <div class="absolute inset-0 bg-black/50 z-20 flex items-center justify-center rounded-xl" id="map-loader">
             <i class="fas fa-spinner fa-spin text-cesa-gold text-2xl"></i>
        </div>
    </div>

    <!-- Catálogo -->
    <div>
        <div class="flex justify-between items-center mb-4 px-2">
            <h3 class="text-lg font-bold flex items-center gap-2 text-white">
                <i class="fas fa-store text-green-400"></i> Negocios Activos
            </h3>
            <span class="text-xs text-gray-400 font-bold bg-white/10 px-2 py-1 rounded-md" id="negocios-count">0</span>
        </div>
        
        <div id="negocios-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Renderizado dinámico -->
        </div>
    </div>
</div>

<script>
    let negociosData = [];
    let bazarMap = null;
    let markersGroup = null;

    // Load Leaflet dynamically and initialize
    if (typeof L === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => loadBazarData();
        document.body.appendChild(script);
    } else {
        loadBazarData();
    }

    async function loadBazarData() {
        try {
            const res = await fetch('/api/bazar.php?action=listar');
            const result = await res.json();
            
            if (result.success) {
                negociosData = result.data;
                document.getElementById('negocios-count').innerText = result.total;
                renderCards(negociosData);
                initMap(negociosData);
            }
        } catch (e) {
            console.error("Error cargando bazar:", e);
        }
    }

    function initMap(negocios) {
        document.getElementById('map-loader').classList.add('hidden');
        
        // Destruir mapa anterior si existe para evitar errores en SPA (Map container is already initialized)
        if (bazarMap) {
            bazarMap.off();
            bazarMap.remove();
        }

        bazarMap = L.map('mapa-bazar').setView([29.0822, -110.9584], 15); // UNISON

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap & CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(bazarMap);

        markersGroup = L.featureGroup().addTo(bazarMap);
        updateMapMarkers(negocios);
    }

    function updateMapMarkers(negocios) {
        if (!markersGroup || !bazarMap) return;
        markersGroup.clearLayers();

        let hasMarkers = false;
        negocios.forEach(neg => {
            if (neg.latitud && neg.longitud) {
                hasMarkers = true;
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="bg-cesa-gold text-cesa-navy w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-xs shadow-lg shadow-cesa-gold/50">${neg.categoria.charAt(0).toUpperCase()}</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });

                const marker = L.marker([parseFloat(neg.latitud), parseFloat(neg.longitud)], {icon: icon});
                marker.bindPopup(`
                    <div class="text-center p-1 font-sans">
                        <h4 class="font-bold text-gray-800 text-sm leading-tight">${neg.nombre_negocio}</h4>
                        <p class="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">${neg.categoria}</p>
                        <button onclick="window.router.navigate('bazar-detalle?id=${neg.id}')" class="mt-2 w-full bg-cesa-navy text-white text-[10px] font-bold py-1.5 rounded uppercase">Ver Perfil</button>
                    </div>
                `);
                markersGroup.addLayer(marker);
            }
        });

        if (hasMarkers) {
            setTimeout(() => {
                 bazarMap.fitBounds(markersGroup.getBounds().pad(0.2));
            }, 500); // Allow map to settle in SPA context
        }
    }

    function renderCards(negocios) {
        const container = document.getElementById('negocios-grid');
        if (negocios.length === 0) {
            container.innerHTML = `<div class="glass p-8 text-center text-gray-500 rounded-2xl"><i class="fas fa-box-open text-3xl mb-2 opacity-50"></i><p class="text-xs uppercase tracking-widest font-bold">No hay negocios que coincidan</p></div>`;
            return;
        }

        container.innerHTML = negocios.map(item => `
            <div class="bazar-card glass rounded-2xl p-5 border-l-4 border-cesa-gold cursor-pointer" onclick="window.router.navigate('bazar-detalle?id=${item.id}')">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3">
                         <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cesa-navy to-blue-900 flex items-center justify-center text-white font-black text-lg border border-cesa-gold/30">
                            ${item.nombre_negocio.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-md leading-tight">${item.nombre_negocio}</h4>
                            <p class="text-[9px] text-gray-400 uppercase tracking-widest font-bold">${item.categoria}</p>
                        </div>
                    </div>
                    ${item.destacado ? `<span class="bg-cesa-gold/20 text-cesa-gold px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest"><i class="fas fa-crown"></i> PRO</span>` : ''}
                </div>
                
                <p class="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                    ${item.descripcion}
                </p>
                
                <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center gap-2">
                         <span class="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-md text-[9px] font-bold"><i class="fas fa-eye text-green-500/50"></i> ${item.views || 0}</span>
                         <span class="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md text-[9px] font-bold"><i class="fas fa-star text-blue-500/50"></i> ${item.score || 0} pts</span>
                    </div>
                    <div class="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1">
                        <i class="fas fa-user-circle"></i> ${item.dueno.split(' ')[0]}
                    </div>
                </div>
            </div>
        `).join('');
    }

    function filterByCategory(categoria, btnElement) {
        // Toggle UI
        document.querySelectorAll('.categoria-badge').forEach(b => {
             b.classList.remove('bg-blue-600/20', 'text-blue-300', 'border-blue-500/30', 'active');
             b.classList.add('bg-white/5', 'text-gray-300', 'border-white/10');
        });
        
        btnElement.classList.remove('bg-white/5', 'text-gray-300', 'border-white/10');
        btnElement.classList.add('bg-blue-600/20', 'text-blue-300', 'border-blue-500/30', 'active');

        // Filter Logic
        let filtered = negociosData;
        if (categoria !== 'todas') {
            filtered = negociosData.filter(n => n.categoria === categoria);
        }
        filterBySearch(document.getElementById('bazar-search').value, filtered);
    }

    function filterBySearch(query = '', baseData = null) {
        let q = query.toLowerCase().trim();
        let currentCategory = document.querySelector('.categoria-badge.active')?.textContent.replace(/[^a-zA-Z]/g, '').toLowerCase().trim();
        if (currentCategory === 'todastech') currentCategory = 'tecnologia'; // edge cases etc.. but the logic below avoids this by using dataset/value properly
        
        // Simple robust approach
        let dataToFilter = baseData;
        if (!dataToFilter) {
             const activeCategoryText = document.querySelector('.categoria-badge.active').innerText.toLowerCase();
             const isAll = activeCategoryText.includes('todas');
             dataToFilter = isAll ? negociosData : negociosData.filter(n => activeCategoryText.includes(n.categoria.toLowerCase()));
        }

        const filtered = dataToFilter.filter(n => 
            n.nombre_negocio.toLowerCase().includes(q) || 
            n.descripcion.toLowerCase().includes(q)
        );
        
        renderCards(filtered);
        updateMapMarkers(filtered);
    }
</script>
