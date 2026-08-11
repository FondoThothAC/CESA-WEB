<?php
/**
 * Panel de Gestión de Usuarios - CESA WEB v3.6
 * Estética: Premium Glassmorphism
 * Archivo: /backend/public/admin/usuarios.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/CSRF.php';

$auth = new Auth();
if (!$auth->isLoggedIn() || !$auth->hasRole('admin')) {
    header('Location: /login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Usuarios | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { 
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); 
            color: #ffffff; 
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
        }
        .glass-card { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            border-radius: 24px;
        }
        .status-active { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .status-banned { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .status-pending { background: rgba(234, 179, 8, 0.2); color: #facc15; }
        
        input, select {
            background: rgba(0, 0, 0, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            transition: all 0.3s ease;
        }
        input:focus, select:focus {
            border-color: #6366f1 !important;
            background: rgba(0, 0, 0, 0.4) !important;
            outline: none;
        }
    </style>
</head>
<body class="p-4 sm:p-8">

    <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-4xl font-black uppercase tracking-tighter">Gestión de Usuarios</h1>
                <p class="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Control de acceso y roles v3.6</p>
            </div>
            <a href="/admin" class="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                <i class="fas fa-arrow-left mr-2"></i> Volver al Portal
            </a>
        </div>

        <!-- Filtros -->
        <div class="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-2xl">
            <div class="space-y-1">
                <label class="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Buscador</label>
                <input type="text" id="search-q" placeholder="Nombre o email..." class="w-full rounded-xl px-4 py-3 text-sm">
            </div>
            <div class="space-y-1">
                <label class="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Rol</label>
                <select id="filter-rol" class="w-full rounded-xl px-4 py-3 text-sm">
                    <option value="todos">Todos</option>
                    <option value="admin">Administrador</option>
                    <option value="mesa_directiva">Mesa Directiva</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="empresa">Empresa</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Coordinación</label>
                <select id="filter-coord" class="w-full rounded-xl px-4 py-3 text-sm">
                    <option value="todos">Todas</option>
                    <option value="integral">Integral</option>
                    <option value="la_red">La Red</option>
                    <option value="raices">Raíces</option>
                    <option value="impulso">Impulso</option>
                    <option value="humano">Humano</option>
                </select>
            </div>
            <div class="flex items-end">
                <button onclick="cargarUsuarios()" class="w-full bg-indigo-600 hover:bg-white hover:text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                    <i class="fas fa-sync mr-2"></i> Actualizar
                </button>
            </div>
        </div>

        <!-- Tabla -->
        <div class="glass-card overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-white/5">
                        <tr class="text-[10px] font-black uppercase tracking-widest text-white/40">
                            <th class="px-6 py-5">Usuario</th>
                            <th class="px-6 py-5">Rol</th>
                            <th class="px-6 py-5">Coordinación</th>
                            <th class="px-6 py-5">Estado</th>
                            <th class="px-6 py-5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="user-table-body" class="divide-y divide-white/5">
                        <!-- Cargado por JS -->
                    </tbody>
                </table>
            </div>
        </div>

    </div>

    <!-- Modal de Edición -->
    <div id="edit-modal" class="fixed inset-0 bg-black/90 hidden items-center justify-center p-4 z-50 backdrop-blur-xl">
        <div class="glass-card w-full max-w-lg p-10 space-y-8 animate-in zoom-in duration-300">
            <div class="flex justify-between items-center">
                <h3 class="text-2xl font-black uppercase tracking-tighter">Gestionar Permisos</h3>
                <button onclick="cerrarModal()" class="text-white/40 hover:text-white text-2xl">&times;</button>
            </div>

            <form id="form-edit-user" class="space-y-6">
                <input type="hidden" name="csrf_token" value="<?= generateCSRFToken() ?>">
                <input type="hidden" name="id" id="edit-id">

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-[9px] font-black uppercase tracking-widest text-indigo-400">Rol Institucional</label>
                        <select name="rol" id="edit-rol" required class="w-full rounded-xl px-4 py-4 text-sm">
                            <option value="estudiante">Estudiante</option>
                            <option value="mesa_directiva">Mesa Directiva</option>
                            <option value="sociedad">Sociedad Alumnos</option>
                            <option value="admin">Administrador</option>
                            <option value="empresa">Empresa</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[9px] font-black uppercase tracking-widest text-indigo-400">Coordinación</label>
                        <select name="coordinacion" id="edit-coord" class="w-full rounded-xl px-4 py-4 text-sm">
                            <option value="general">Ninguna / General</option>
                            <option value="integral">Integral</option>
                            <option value="la_red">La Red</option>
                            <option value="raices">Raíces</option>
                            <option value="impulso">Impulso</option>
                            <option value="humano">Humano</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-3">
                    <label class="text-[9px] font-black uppercase tracking-widest text-indigo-400">Estado de Cuenta</label>
                    <div class="flex gap-6">
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="estado" value="activo" class="sr-only peer">
                            <div class="w-4 h-4 rounded-full border-2 border-white/20 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all"></div>
                            <span class="text-[10px] font-black uppercase tracking-widest peer-checked:text-indigo-400">Activo</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="estado" value="baneado" class="sr-only peer">
                            <div class="w-4 h-4 rounded-full border-2 border-white/20 peer-checked:border-red-500 peer-checked:bg-red-500 transition-all"></div>
                            <span class="text-[10px] font-black uppercase tracking-widest peer-checked:text-red-400">Baneado</span>
                        </label>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="submit" class="flex-1 bg-indigo-600 hover:bg-white hover:text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Guardar Cambios
                    </button>
                    <button type="button" onclick="confirmarEliminar()" class="px-8 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white py-5 rounded-2xl transition-all">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', cargarUsuarios);

        async function cargarUsuarios() {
            const q = document.getElementById('search-q').value;
            const rol = document.getElementById('filter-rol').value;
            const coord = document.getElementById('filter-coord').value;
            const tbody = document.getElementById('user-table-body');

            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-white/20">Cargando base de datos...</td></tr>';

            try {
                const res = await fetch(`/api/admin_users.php?action=listar&q=${q}&rol=${rol}&coordinacion=${coord}`);
                const data = await res.json();

                if (data.success) {
                    tbody.innerHTML = '';
                    if (data.data.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-20 text-center text-white/20">No se encontraron registros</td></tr>';
                        return;
                    }

                    data.data.forEach(user => {
                        const row = document.createElement('tr');
                        row.className = 'hover:bg-white/5 transition group';
                        row.innerHTML = `
                            <td class="px-6 py-6">
                                <div class="text-sm font-bold">${user.nombre_completo}</div>
                                <div class="text-[10px] text-white/30 font-mono">${user.email}</div>
                            </td>
                            <td class="px-6 py-6">
                                <span class="text-[9px] font-black uppercase px-3 py-1 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-600/20">${user.rol}</span>
                            </td>
                            <td class="px-6 py-6 text-xs text-white/60">
                                ${user.coordinacion || '—'}
                            </td>
                            <td class="px-6 py-6">
                                <span class="text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                                    user.estado === 'activo' ? 'status-active' : 
                                    user.estado === 'baneado' ? 'status-banned' : 'status-pending'
                                }">
                                    ${user.estado}
                                </span>
                            </td>
                            <td class="px-6 py-6 text-right">
                                <button onclick="abrirModal(${user.id}, '${user.rol}', '${user.coordinacion}', '${user.estado}')" 
                                        class="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition group-hover:translate-x-[-10px] inline-block">
                                    Editar →
                                </button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            } catch (err) { console.error(err); }
        }

        function abrirModal(id, rol, coord, estado) {
            document.getElementById('edit-id').value = id;
            document.getElementById('edit-rol').value = rol;
            document.getElementById('edit-coord').value = coord || 'general';
            document.querySelectorAll('input[name="estado"]').forEach(r => r.checked = (r.value === estado));
            document.getElementById('edit-modal').classList.remove('hidden');
            document.getElementById('edit-modal').classList.add('flex');
        }

        function cerrarModal() {
            document.getElementById('edit-modal').classList.add('hidden');
            document.getElementById('edit-modal').classList.remove('flex');
        }

        document.getElementById('form-edit-user').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            formData.append('action', 'actualizar');

            try {
                const res = await fetch('/api/admin_users.php', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    cerrarModal();
                    cargarUsuarios();
                } else alert(data.error);
            } catch (err) { alert('Error de red'); }
        });

        async function confirmarEliminar() {
            if (!confirm("¿Seguro que deseas banear/eliminar este usuario?")) return;
            const id = document.getElementById('edit-id').value;
            const csrf = document.querySelector('input[name="csrf_token"]').value;
            
            const formData = new FormData();
            formData.append('action', 'eliminar');
            formData.append('id', id);
            formData.append('metodo', 'ban');
            formData.append('csrf_token', csrf);

            try {
                const res = await fetch('/api/admin_users.php', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    cerrarModal();
                    cargarUsuarios();
                } else alert(data.error);
            } catch (err) { alert('Error de red'); }
        }
    </script>
</body>
</html>
