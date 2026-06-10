<?php
/**
 * Panel Admin: Bazar v1.0
 */
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';

$auth = new Auth();
$user = $auth->getUser();

if (!$auth->isLoggedIn() || !in_array($user['rol'], ['admin', 'mesa_directiva'])) {
    header('Location: /login.php'); exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Bazar — CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background: #020617; color: #f8fafc; font-family: 'Inter', sans-serif; }
        .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .badge-pend { background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b40; }
        .badge-act { background: #10b98120; color: #10b981; border: 1px solid #10b98140; }
    </style>
</head>
<body class="p-8">
    <div class="max-w-7xl mx-auto">
        <header class="flex justify-between items-center mb-12">
            <div>
                <h1 class="text-4xl font-black uppercase tracking-tighter">Centro de <span class="text-indigo-500">Mando</span></h1>
                <p class="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Moderación de Bazar Emprendedor</p>
            </div>
            <a href="/admin/dashboard.php" class="glass px-6 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition-all">VOLVER</a>
        </header>

        <div class="grid grid-cols-1 gap-6" id="bazar-list">
            <!-- Cargando... -->
        </div>
    </div>

    <script>
        async function loadBazar() {
            const res = await fetch('/api/bazar-admin.php?action=listar');
            const { data } = await res.json();
            const container = document.getElementById('bazar-list');
            
            container.innerHTML = data.map(item => `
                <div class="glass p-6 rounded-3xl flex flex-wrap md:flex-nowrap justify-between items-center gap-6">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-2xl">
                            ${item.nombre_negocio[0]}
                        </div>
                        <div>
                            <h3 class="text-xl font-bold">${item.nombre_negocio}</h3>
                            <p class="text-slate-400 text-xs">${item.emprendedor} • ${item.matricula}</p>
                            <span class="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.verificado == 1 ? 'badge-act' : 'badge-pend'}">
                                ${item.verificado == 1 ? 'Verificado' : 'Pendiente'}
                            </span>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        ${item.verificado == 0 ? `
                            <button onclick="approve(${item.id})" class="bg-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">Aprobar</button>
                        ` : ''}
                        <button onclick="reject(${item.id})" class="bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Rechazar</button>
                        <button onclick="toggleFeatured(${item.id}, ${item.featured == 1 ? 0 : 1})" class="glass px-6 py-2 rounded-xl text-[10px] font-black uppercase">
                            ${item.featured == 1 ? 'Quitar Destacado' : 'Destacar'}
                        </button>
                    </div>
                </div>
            `).join('');
        }

        async function approve(id) {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('action', 'aprobar');
            await fetch('/api/bazar-admin.php', { method: 'POST', body: formData });
            loadBazar();
        }

        async function reject(id) {
            const reason = prompt("Razón del rechazo:");
            if (!reason) return;
            const formData = new FormData();
            formData.append('id', id);
            formData.append('action', 'rechazar');
            formData.append('razon', reason);
            await fetch('/api/bazar-admin.php', { method: 'POST', body: formData });
            loadBazar();
        }

        async function toggleFeatured(id, featured) {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('action', 'destacar');
            formData.append('featured', featured);
            await fetch('/api/bazar-admin.php', { method: 'POST', body: formData });
            loadBazar();
        }

        loadBazar();
    </script>
</body>
</html>
