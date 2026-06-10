<?php
/**
 * Offline Fallback - CESA WEB v3.6
 * Archivo: /backend/public/offline.php
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sin Conexión | CESA UNISON</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #0a0a0f; color: white; font-family: 'Inter', sans-serif; }
        .glass-panel { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 32px; }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6 text-center">
    <div class="max-w-md w-full glass-panel p-12 space-y-8 animate-in zoom-in duration-500">
        <div class="text-6xl">📡</div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">Sin Conexión</h1>
        <p class="text-sm text-white/40 uppercase font-black tracking-widest leading-relaxed">Parece que tu búho mensajero se perdió en la tormenta. Conéctate a internet para acceder al ecosistema CESA.</p>
        
        <div class="pt-4">
            <button onclick="window.location.reload()" class="w-full bg-indigo-600 hover:bg-white hover:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Reintentar Conexión</button>
        </div>
        
        <p class="text-[8px] text-white/20 uppercase font-black tracking-widest">CESA WEB v3.6 | UNISON</p>
    </div>

    <script>
        // Si detectamos internet, recargar automáticamente
        window.addEventListener('online', () => window.location.reload());
    </script>
</body>
</html>
