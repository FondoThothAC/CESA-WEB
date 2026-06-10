<?php
/**
 * Centro de Notificaciones - CESA WEB v3.5
 * Portal Estudiantil (Glassmorphism)
 * Archivo: /backend/public/notificaciones.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/NotificationManager.php';

$auth = new Auth();
if (!$auth->isLoggedIn()) {
    header('Location: /login.php');
    exit;
}

$user = $auth->getUser();
$pdo = getDBConnection();
$notManager = new NotificationManager($pdo);

$notis = $notManager->getNotifications($user['id'], 50);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificaciones | CESA UNISON</title>
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
        .noti-item {
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .noti-item:hover {
            background: rgba(255, 255, 255, 0.03);
        }
        .noti-unread {
            background: rgba(99, 102, 241, 0.05);
            border-left: 4px solid #6366f1;
        }
    </style>
</head>
<body class="min-h-screen p-4 sm:p-8">

    <div class="max-w-2xl mx-auto space-y-8">
        
        <header class="flex justify-between items-end">
            <div>
                <h1 class="text-4xl font-black uppercase tracking-tighter">Alertas</h1>
                <p class="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Ecosistema CESA 2026-2028</p>
            </div>
            <a href="/muro/" class="text-[10px] font-black uppercase text-white/40 hover:text-white transition-all">← Volver al Muro</a>
        </header>

        <section class="glass-panel overflow-hidden">
            <div class="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <span class="text-[10px] font-black uppercase tracking-widest text-white/60">Recientes</span>
                <button onclick="markAllAsRead()" class="text-[9px] font-black uppercase text-indigo-400 hover:underline">Marcar todo como leído</button>
            </div>

            <div id="notiList">
                <?php if (empty($notis)): ?>
                    <div class="p-20 text-center text-white/10 uppercase font-black tracking_widest">Silencio Institucional</div>
                <?php else: ?>
                    <?php foreach ($notis as $n): ?>
                        <div class="noti-item p-6 flex gap-4 <?= $n['leida'] ? '' : 'noti-unread' ?>">
                            <div class="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                                <i class="fas <?= $n['icono'] ?: 'fa-bell' ?>"></i>
                            </div>
                            <div class="flex-1 space-y-1">
                                <div class="flex justify-between items-start">
                                    <h3 class="text-xs font-bold"><?= htmlspecialchars($n['titulo']) ?></h3>
                                    <span class="text-[9px] text-white/20 font-mono"><?= date('H:i', strtotime($n['created_at'])) ?></span>
                                </div>
                                <p class="text-xs text-white/50 leading-relaxed"><?= htmlspecialchars($n['mensaje']) ?></p>
                                <?php if ($n['url_action']): ?>
                                    <a href="<?= htmlspecialchars($n['url_action']) ?>" class="inline-block pt-2 text-[10px] font-black uppercase text-indigo-400 tracking-widest hover:translate-x-1 transition-transform">Ver detalle →</a>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </section>

        <footer class="text-center opacity-20">
            <p class="text-[8px] font-black uppercase tracking-[0.3em]">Coded by FT Apps for UNISON</p>
        </footer>

    </div>

    <script>
        async function markAllAsRead() {
            try {
                const res = await fetch('/api/notificaciones.php?action=mark_all', { method: 'POST' });
                const data = await res.json();
                if (data.success) window.location.reload();
            } catch (e) { console.error("Error marking read", e); }
        }
    </script>
</body>
</html>
