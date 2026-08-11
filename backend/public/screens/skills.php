<?php
/**
 * Pantalla de Skills para Estudiantes
 * Donde ven sus habilidades disponibles y certificados
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
    <title>Skills | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
                            dark: '#0A192F'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background: #0A192F; min-height: 100vh; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="text-white font-sans">

    <header class="bg-cesa-primary/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" class="text-gray-400 hover:text-white">
                <i class="fas fa-arrow-left mr-2"></i>Dashboard
            </a>
            <h1 class="font-bold"><i class="fas fa-award text-cesa-gold mr-2"></i>Skills</h1>
            <div></div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto p-6">
        
        <!-- Mis Certificados -->
        <div class="mb-8">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fas fa-medal text-cesa-gold"></i> Mis Certificados
            </h2>
            <div id="mis-certificados" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="glass-card p-6 text-center text-gray-500 col-span-full">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>Cargando certificados...</p>
                </div>
            </div>
        </div>

        <!-- Habilidades Disponibles -->
        <div>
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fas fa-graduation-cap text-blue-400"></i> Habilidades Disponibles
            </h2>
            <div id="habilidades-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="glass-card p-6 text-center text-gray-500 col-span-full">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>Cargando habilidades...</p>
                </div>
            </div>
        </div>
    </main>

    <script>
        async function cargarDatos() {
            // Cargar habilidades
            try {
                const resH = await fetch('/api/skills.php?action=listar_habilidades');
                const dataH = await resH.json();
                
                if (dataH.success) {
                    renderizarHabilidades(dataH.data);
                }
            } catch (e) {
                console.error('Error:', e);
            }
            
            // Cargar mis certificados
            try {
                const resC = await fetch('/api/skills.php?action=mis_certificados');
                const dataC = await resC.json();
                
                if (dataC.success) {
                    renderizarCertificados(dataC.data);
                }
            } catch (e) {
                console.error('Error:', e);
            }
        }

        function renderizarHabilidades(habilidades) {
            const grid = document.getElementById('habilidades-grid');
            
            if (habilidades.length === 0) {
                grid.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No hay habilidades disponibles</p>';
                return;
            }
            
            grid.innerHTML = habilidades.map(h => `
                <div class="glass-card rounded-2xl p-6 hover:scale-[1.02] transition cursor-pointer" 
                     onclick="window.location.href='/evaluaciones/realizar.php?habilidad_id=${h.id}'">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center" 
                             style="background: ${h.color_hex || '#D4AF37'}22; color: ${h.color_hex || '#D4AF37'}">
                            <i class="${h.icono || 'fa-certificate'} text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">${h.nombre}</h3>
                            <span class="text-[10px] text-gray-500 uppercase tracking-wider">${h.categoria}</span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-400 mb-4">${h.descripcion || 'Sin descripción'}</p>
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-gray-500">
                            <i class="fas fa-percentage mr-1"></i> Min: ${h.nivel_minimo_aprobatorio}%
                        </span>
                        <span class="text-gray-500">
                            <i class="fas fa-clock mr-1"></i> ${h.duracion_minutos} min
                        </span>
                        <span class="bg-cesa-gold/20 text-cesa-gold px-3 py-1 rounded-full font-bold">
                            <i class="fas fa-play mr-1"></i> Iniciar
                        </span>
                    </div>
                </div>
            `).join('');
        }

        function renderizarCertificados(certificados) {
            const container = document.getElementById('mis-certificados');
            
            if (certificados.length === 0) {
                container.innerHTML = `
                    <div class="glass-card p-8 text-center col-span-full">
                        <i class="fas fa-award text-4xl text-gray-600 mb-3"></i>
                        <p class="text-gray-500">Aún no tienes certificados</p>
                        <p class="text-xs text-gray-600 mt-1">Realiza una evaluación para obtener tu primer sello</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = certificados.map(c => `
                <div class="glass-card rounded-2xl overflow-hidden border-l-4" style="border-color: ${c.color_hex || '#D4AF37'}">
                    <div class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <div class="w-12 h-12 rounded-lg flex items-center justify-center" 
                                 style="background: ${c.color_hex || '#D4AF37'}22; color: ${c.color_hex || '#D4AF37'}">
                                <i class="${c.icono || 'fa-certificate'} text-xl"></i>
                            </div>
                            <span class="text-xs font-mono text-gray-500">${c.uuid?.substring(0, 8)}...</span>
                        </div>
                        <h3 class="font-bold mb-1">${c.habilidad_nombre}</h3>
                        <p class="text-[10px] text-gray-500 uppercase mb-3">${c.habilidad_categoria}</p>
                        <div class="flex justify-between items-center">
                            <span class="px-2 py-1 rounded-full text-[10px] font-bold bg-cesa-gold/20 text-cesa-gold">
                                ${c.nivel}
                            </span>
                            <span class="text-xs text-gray-500">${c.porcentaje}%</span>
                        </div>
                        <p class="text-[9px] text-gray-600 mt-3">Emitido: ${c.fecha_emision}</p>
                    </div>
                </div>
            `).join('');
        }

        cargarDatos();
    </script>

</body>
</html>
