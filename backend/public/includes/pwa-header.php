<?php
/**
 * PWA Global Header - CESA WEB v3.6
 * Archivo: /backend/public/includes/pwa-header.php
 */
?>
<!-- Manifest & Theme -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6366f1">

<!-- iOS Specific -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CESA">
<link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png">

<!-- Native Feel Viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">

<!-- PWA Registration & Install Logic -->
<script>
  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/pwa/sw.js')
        .then(reg => console.log('[PWA] SW Registrado:', reg.scope))
        .catch(err => console.log('[PWA] Error SW:', err));
    });
  }

  // Lógica de Instalación Personalizada
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar banner después de un pequeño delay
    setTimeout(() => {
        const banner = document.getElementById('pwa-install-banner');
        if (banner && !localStorage.getItem('pwa_dismissed')) {
            banner.classList.remove('hidden');
            banner.classList.add('flex');
        }
    }, 5000);
  });

  async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        document.getElementById('pwa-install-banner').classList.add('hidden');
    }
    deferredPrompt = null;
  }

  function dismissPWA() {
    document.getElementById('pwa-install-banner').classList.add('hidden');
    localStorage.setItem('pwa_dismissed', 'true');
  }
</script>

<!-- Custom Install Banner (Glassmorphism) -->
<div id="pwa-install-banner" class="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm glass-panel p-6 shadow-2xl z-50 hidden animate-in slide-in-from-bottom-10 border border-white/10" style="background: rgba(10,10,15,0.9); backdrop-filter: blur(20px); border-radius: 24px;">
    <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-indigo-600/30">📱</div>
        <div class="flex-1 space-y-1">
            <h4 class="text-sm font-black uppercase tracking-tighter">Instala la App CESA</h4>
            <p class="text-[10px] text-white/50 leading-tight">Accede rápido al muro y recibe alertas en tiempo real sin salir de tu inicio.</p>
            <div class="flex gap-2 pt-3">
                <button onclick="installPWA()" class="flex-1 bg-white text-black py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">Instalar</button>
                <button onclick="dismissPWA()" class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest">Ahora no</button>
            </div>
        </div>
    </div>
</div>
