<?php
/**
 * CESA PWA - App Shell
 * Entry point for the Single Page Application.
 */
require_once __DIR__ . '/../lib/Auth.php';
$user = Auth::getAuthenticatedUser();
$isLoggedIn = (bool)$user;
$userName = $isLoggedIn ? explode(' ', $user['nombre_completo'])[0] : 'Invitado';
$userRole = $isLoggedIn ? $user['rol'] : 'invitado';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0f0f1a">
    <title>CESA UNISON</title>
    
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/assets/images/icon-192.png">
    
    <!-- Icons & Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom SPA Styles -->
    <link rel="stylesheet" href="/assets/css/pwa.css">
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        dark: '#0f0f1a',
                        glass: 'rgba(30, 30, 46, 0.6)',
                    }
                }
            }
        }
    </script>
</head>
<body class="dark bg-dark text-white selection:bg-blue-500/30">

<div id="app-shell">
    <!-- Static Header -->
    <header class="app-header">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <i class="fas fa-graduation-cap text-white"></i>
            </div>
            <h1 id="header-title" class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CESA
            </h1>
        </div>
        
        <div class="flex items-center gap-4">
            <?php if ($isLoggedIn): ?>
            <button onclick="window.pwaRouter.navigate('notificaciones')" class="relative p-2 text-gray-400 hover:text-white transition">
                <i class="fas fa-bell text-lg"></i>
                <span id="notif-badge" class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full hidden"></span>
            </button>
            <button onclick="window.pwaRouter.navigate('perfil')" class="flex items-center gap-2 group">
                <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white/10 overflow-hidden flex items-center justify-center font-bold text-xs">
                    <?= strtoupper(substr($userName, 0, 1)) ?>
                </div>
            </button>
            <?php else: ?>
            <a href="/login.php" class="text-sm font-bold text-blue-400">Entrar</a>
            <?php endif; ?>
        </div>
    </header>

    <!-- Dynamic Content Container -->
    <main id="main-content" class="px-4 pt-6">
        <!-- Content loaded by pwa-router.js -->
        <div class="flex items-center justify-center h-full">
            <div class="animate-pulse text-blue-400">Cargando plataforma...</div>
        </div>
    </main>

    <!-- Floating Action Button (Contextual) -->
    <button id="fab-action" onclick="handleFab()" class="fab">
        <i class="fas fa-plus text-xl"></i>
    </button>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
        <button onclick="window.pwaRouter.navigate('home')" class="nav-item" data-screen="home">
            <i class="fas fa-house-chimney text-xl mb-1"></i>
            <span class="text-[10px] font-medium font-sans">Inicio</span>
        </button>
        <button onclick="window.pwaRouter.navigate('muro')" class="nav-item" data-screen="muro">
            <i class="fas fa-users text-xl mb-1"></i>
            <span class="text-[10px] font-medium font-sans">Muro</span>
        </button>
        <button onclick="window.pwaRouter.navigate('tutorias')" class="nav-item" data-screen="tutorias">
            <i class="fas fa-chalkboard-teacher text-xl mb-1"></i>
            <span class="text-[10px] font-medium font-sans">Tutorías</span>
        </button>
        <button onclick="window.pwaRouter.navigate('bazar')" class="nav-item" data-screen="bazar">
            <i class="fas fa-shopping-bag text-xl mb-1"></i>
            <span class="text-[10px] font-medium font-sans">Bazar</span>
        </button>
        <?php if ($userRole === 'admin' || $userRole === 'mesa_directiva'): ?>
        <button onclick="window.pwaRouter.navigate('admin')" class="nav-item" data-screen="admin">
            <i class="fas fa-user-shield text-xl mb-1"></i>
            <span class="text-[10px] font-medium font-sans">Admin</span>
        </button>
        <?php else: ?>
        <button onclick="window.pwaRouter.navigate('perfil')" class="nav-item" data-screen="perfil">
            <i class="fas fa-circle-user text-xl mb-1"></i>
            <span class="text-[10px] font-medium font-sans">Perfil</span>
        </button>
        <?php endif; ?>
    </nav>
</div>

<!-- Scripts -->
<script src="/assets/js/pwa-router.js"></script>
<script>
    function handleFab() {
        const current = window.pwaRouter.currentScreen;
        if (current === 'muro') {
            openCreatePostModal();
        } else if (current === 'tutorias') {
            openRequestTutoriaModal();
        } else if (current === 'bazar') {
            window.location.href = '#crear-negocio';
        } else {
            console.log('No FAB action for ' + current);
        }
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('Cesa SW registrado');
            }).catch(err => {
                console.log('Error registro SW:', err);
            });
        });
    }
</script>

</body>
</html>
