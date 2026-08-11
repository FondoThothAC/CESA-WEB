<?php
/**
 * CESA MASTER SHELL - PWA Entry Point
 * Industrial Version v3.9
 */
require_once __DIR__ . '/../lib/Auth.php';
$user = Auth::getAuthenticatedUser();
$isLoggedIn = (bool)$user;
$userName = $isLoggedIn ? explode(' ', $user['nombre_completo'])[0] : 'Invitado';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0f0f1a">
    <title>CESA UNISON</title>
    
    <link rel="manifest" href="/pwa/manifest.json">
    <link rel="apple-touch-icon" href="/pwa/assets/images/icon-192.png">
    
    <!-- Security CSRF -->
    <meta name="csrf-token" content="<?= $_SESSION['csrf_token'] ?? '' ?>">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        // Configuración de Tailwind para soportar Dark Mode por clase
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        cesa: {
                            navy: '#0F2C59',
                            blue: '#1E3A8A',
                            gold: '#D4AF37',
                            lightBg: '#F8FAFC',
                            darkBg: '#0A192F'
                        }
                    }
                }
            }
        }
    </script>

    <style>
        /* Transiciones suaves para el cambio de tema */
        html { transition: background-color 0.3s ease, color 0.3s ease; scroll-behavior: smooth; }
        
        /* Barra de navegación inferior flotante tipo App Moderna */
        .bottom-nav-container {
            position: fixed;
            bottom: env(safe-area-inset-bottom, 20px);
            left: 50%;
            transform: translateX(-50%);
            width: 95%;
            max-width: 500px;
            z-index: 9999;
        }

        .bottom-nav-pill {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            background-color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .dark .bottom-nav-pill {
            background-color: rgba(15, 44, 89, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        }

        /* Íconos de la barra */
        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            color: #64748b; /* Gris en modo claro */
            transition: all 0.2s ease;
            background: transparent;
            border-radius: 9999px;
        }
        .dark .nav-item { color: #94a3b8; /* Gris azulado en modo oscuro */ }

        /* Estado Activo de los Íconos */
        .nav-item.active {
            background-color: #EFF6FF;
            color: #1E3A8A; /* Azul CESA en modo claro */
        }
        .dark .nav-item.active {
            background-color: rgba(212, 175, 55, 0.2);
            color: #D4AF37; /* Dorado en modo oscuro */
        }

        .nav-item i { font-size: 1.25rem; margin-bottom: 2px; }
        .nav-item span { font-size: 0.65rem; font-weight: 600; }

        /* Desktop Nav Styles */
        .nav-item-desktop { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-item-desktop.active {
            background: #EFF6FF;
            color: #1E3A8A;
        }
        .dark .nav-item-desktop.active {
            background: rgba(212, 175, 55, 0.15);
            color: #D4AF37;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .nav-item-desktop:hover:not(.active) {
            background: rgba(0,0,0,0.05);
            transform: translateX(4px);
        }
        .dark .nav-item-desktop:hover:not(.active) {
            background: rgba(255,255,255,0.05);
        }
    </style>
</head>
<body class="bg-cesa-lightBg text-gray-900 dark:bg-cesa-darkBg dark:text-gray-100 overflow-hidden selection:bg-cesa-gold/30">

    <div class="flex h-screen overflow-hidden">
        <!-- Desktop Sidebar Navigation -->
        <aside id="sidebar" class="hidden lg:flex flex-col w-64 bg-white dark:bg-cesa-navy border-r border-gray-200 dark:border-white/10 transition-colors z-50">
            <div class="p-6">
                <div class="flex items-center gap-3 mb-10">
                    <div class="w-10 h-10 bg-cesa-navy rounded-xl flex items-center justify-center font-bold text-2xl border border-cesa-gold/30">🦉</div>
                    <h1 class="text-xl font-black tracking-tighter dark:text-white uppercase">CESA <span class="text-cesa-gold">WEB</span></h1>
                </div>

                <nav class="space-y-2">
                    <button onclick="window.router.navigate('home')" class="nav-item-desktop active w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all" data-screen="home">
                        <i class="fas fa-home w-5"></i> Dashboard
                    </button>
                    <button onclick="window.router.navigate('muro')" class="nav-item-desktop w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 dark:text-gray-400" data-screen="muro">
                        <i class="fas fa-users w-5"></i> Muro Social
                    </button>
                    <button onclick="window.router.navigate('bazar')" class="nav-item-desktop w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 dark:text-gray-400" data-screen="bazar">
                        <i class="fas fa-store w-5"></i> Bazar CESA
                    </button>
                    <button onclick="window.router.navigate('tutoriales')" class="nav-item-desktop w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 dark:text-gray-400" data-screen="tutoriales">
                        <i class="fas fa-chalkboard-teacher w-5"></i> Tutoriales
                    </button>
                    <button onclick="window.router.navigate('perfil')" class="nav-item-desktop w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all text-gray-500 dark:text-gray-400" data-screen="perfil">
                        <i class="fas fa-user-circle w-5"></i> Mi Perfil
                    </button>
                </nav>
            </div>
            
            <div class="mt-auto p-6">
                <div class="bg-gradient-to-br from-cesa-navy/50 to-cesa-gold/10 p-4 rounded-2xl border border-cesa-gold/20">
                    <p class="text-[10px] font-black text-cesa-gold uppercase tracking-widest mb-1">Status Gobernanza</p>
                    <p class="text-[12px] text-white font-bold mb-3 italic">"Liderando la industria universitaria."</p>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span class="text-[9px] text-gray-400 font-bold uppercase">Nodo CBIT-01 Activo</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0 bg-cesa-lightBg dark:bg-cesa-darkBg transition-colors relative">
            
            <header class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-cesa-navy/90 backdrop-blur-md z-40 transition-colors">
                <div class="flex items-center gap-3 lg:hidden">
                    <div class="w-8 h-8 bg-cesa-navy rounded-lg flex items-center justify-center font-bold text-xl border border-cesa-gold/30">🦉</div>
                    <h1 id="app-title" class="text-lg font-bold tracking-tight bg-gradient-to-r from-cesa-navy to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent uppercase">CESA <span class="text-cesa-gold">UNISON</span></h1>
                </div>
                <div class="hidden lg:block">
                    <h2 id="app-title-desktop" class="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Dashboard Principal</h2>
                </div>
                
                <div class="flex items-center gap-4">
                    <button onclick="toggleTheme()" class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
                        <i id="theme-icon" class="fas fa-moon text-xl"></i>
                    </button>
                    
                    <div id="user-pill" class="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition" onclick="window.router.navigate('perfil')">
                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400"><?= htmlspecialchars($userName) ?></span>
                        <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-cesa-navy to-cesa-gold flex items-center justify-center text-[10px] font-bold text-white">
                            <?= strtoupper(substr($userName, 0, 1)) ?>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Screen Container -->
            <main id="screen-container" class="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
                <div id="screen-content" class="p-4 md:p-8 max-w-7xl mx-auto transition-all duration-300">
                    <!-- Content Injected Here -->
                    <div class="flex flex-col items-center justify-center h-64 text-gray-600 animate-pulse">
                        <i class="fas fa-circle-notch fa-spin text-3xl mb-4"></i>
                        <p class="text-xs font-bold tracking-widest uppercase">Sincronizando Gobernanza...</p>
                    </div>
                </div>
            </main>

            <!-- Bottom Nav (Mobile Only) -->
            <div class="bottom-nav-container lg:hidden">
                <nav id="nav-bar" class="bottom-nav-pill">
                    <button onclick="window.router.navigate('home')" class="nav-item active" data-screen="home">
                        <i class="fas fa-home"></i>
                        <span>Inicio</span>
                    </button>
                    <button onclick="window.router.navigate('muro')" class="nav-item" data-screen="muro">
                        <i class="fas fa-users"></i>
                        <span>Muro</span>
                    </button>
                    <button onclick="window.router.navigate('bazar')" class="nav-item" data-screen="bazar">
                        <i class="fas fa-store"></i>
                        <span>Bazar</span>
                    </button>
                    <button onclick="window.router.navigate('tutoriales')" class="nav-item" data-screen="tutoriales">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <span>Aprende</span>
                    </button>
                    <button onclick="window.router.navigate('perfil')" class="nav-item" data-screen="perfil">
                        <i class="fas fa-user-circle"></i>
                        <span>Perfil</span>
                    </button>
                </nav>
            </div>
        </div>
    </div>

    <!-- Contextual FAB -->
    <button id="fab-action" class="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-cesa-navy to-cesa-gold rounded-full flex items-center justify-center shadow-lg shadow-cesa-navy/50 z-40 transition-transform active:scale-95 hidden">
        <i class="fas fa-plus text-xl text-white"></i>
    </button>

    <!-- Footer Mobile Info -->
    <div class="fixed bottom-16 left-0 right-0 h-1 bg-gradient-to-r from-cesa-navy via-cesa-gold to-cesa-navy opacity-30"></div>

    <!-- Scripts -->
    <script src="/pwa/assets/js/pwa-router.js"></script>
    <script src="/pwa/assets/js/chatbot-global.js"></script>
    
    <script>
        // Lógica de Theme Switcher (Claro por defecto)
        const themeIcon = document.getElementById('theme-icon');
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        
        // Revisar preferencia guardada
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            updateThemeUI(true);
        } else {
            document.documentElement.classList.remove('dark');
            updateThemeUI(false);
        }

        function toggleTheme() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeUI(isDark);
        }

        function updateThemeUI(isDark) {
            if (!themeIcon) return;
            if (isDark) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                if (themeMeta) themeMeta.setAttribute('content', '#0A192F');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                if (themeMeta) themeMeta.setAttribute('content', '#ffffff');
            }
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js').then(reg => {
                    console.log('SW Registered');
                });
            });
        }
    </script>
</body>
</html>
