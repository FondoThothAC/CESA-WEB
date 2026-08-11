<?php
/**
 * Buzón de Reportes - CESA WEB v3.5
 * Portal Público Estudiantil (Glassmorphism)
 * Archivo: /backend/public/reportar.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';

$auth = new Auth();
$user = $auth->getUser(); 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buzón de Reportes | CESA UNISON</title>
    <?php include __DIR__ . '/includes/pwa-header.php'; ?>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { 
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); 
            color: #ffffff; 
            font-family: 'Inter', sans-serif;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 32px;
        }
        .input-glass {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            transition: all 0.3s ease;
        }
        .input-glass:focus {
            border-color: #6366f1;
            background: rgba(0, 0, 0, 0.4);
            outline: none;
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">

    <div class="max-w-xl w-full glass-panel p-10 space-y-8 animate-in slide-in-from-bottom-10 duration-700 shadow-2xl">
        
        <header class="text-center space-y-2">
            <div class="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">📮</div>
            <h1 class="text-3xl font-black uppercase tracking-tighter">Buzón CESA</h1>
            <p class="text-xs text-white/30 uppercase font-black tracking-widest">Escuchamos tu voz, construimos la solución.</p>
        </header>

        <form id="reportForm" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-[9px] font-black uppercase tracking-widest text-indigo-400">Tipo de Reporte</label>
                    <select name="tipo" class="w-full input-glass p-3 text-sm">
                        <option value="queja">😠 Queja</option>
                        <option value="sugerencia">💡 Sugerencia</option>
                        <option value="felicitacion">🎉 Felicitación</option>
                        <option value="denuncia">⚖️ Denuncia</option>
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="text-[9px] font-black uppercase tracking-widest text-indigo-400">Categoría</label>
                    <select name="categoria" class="w-full input-glass p-3 text-sm">
                        <option value="infraestructura">Infraestructura</option>
                        <option value="docencia">Docencia</option>
                        <option value="servicios">Servicios</option>
                        <option value="salud">Bienestar/Salud</option>
                        <option value="acoso">Seguridad/Acoso</option>
                    </select>
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-indigo-400">Asunto</label>
                <input type="text" name="asunto" maxlength="150" required class="w-full input-glass p-4 text-sm" placeholder="Ej: Falta de luz en biblioteca">
            </div>

            <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-indigo-400">Descripción detallada</label>
                <textarea name="descripcion" rows="5" required class="w-full input-glass p-4 text-sm" placeholder="Explica la situación..."></textarea>
            </div>

            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                    <h4 class="text-xs font-bold">Anonimato Real</h4>
                    <p class="text-[9px] text-white/40 uppercase font-black">Tu identidad no será registrada.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="anonimo" id="anonimoToggle" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            <button type="submit" id="submitBtn" class="w-full bg-indigo-600 hover:bg-white hover:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
                Enviar Reporte Institucional
            </button>
        </form>

        <footer class="text-center">
            <p class="text-[9px] text-white/20 uppercase font-black tracking-widest">Protegido por el sistema de IA Híbrida CESA v3.5</p>
        </footer>

    </div>

    <!-- Success Modal -->
    <div id="successModal" class="fixed inset-0 bg-black/90 hidden items-center justify-center p-4 z-50">
        <div class="glass-panel p-10 text-center max-w-sm space-y-6">
            <div class="text-5xl">✅</div>
            <h2 class="text-2xl font-black uppercase">¡RECIBIDO!</h2>
            <p id="folioText" class="text-sm text-indigo-400 font-mono"></p>
            <p class="text-xs text-white/40">Gracias por ayudar a mejorar la UNISON. La Mesa Directiva revisará tu caso.</p>
            <button onclick="window.location.reload()" class="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase">Volver</button>
        </div>
    </div>

    <script>
        document.getElementById('reportForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const originalText = btn.innerText;
            btn.innerText = 'PROCESANDO...';
            btn.disabled = true;

            const formData = {
                asunto: e.target.asunto.value,
                descripcion: e.target.descripcion.value,
                tipo: e.target.tipo.value,
                categoria: e.target.categoria.value,
                anonimo: document.getElementById('anonimoToggle').checked
            };

            try {
                const res = await fetch('/api/reportes.php?action=crear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.success) {
                    document.getElementById('folioText').innerText = data.message;
                    document.getElementById('successModal').classList.remove('hidden');
                    document.getElementById('successModal').classList.add('flex');
                } else {
                    alert(data.error);
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch (err) {
                alert("Error de conexión");
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>
