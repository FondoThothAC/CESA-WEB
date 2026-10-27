/**
 * CESA Simplified Router v4.1
 * Optimized for screen transitions and PWA performance.
 * v4.1: History guard (el botón atrás ya NO saca de la app),
 *       replaceState en pantalla inicial y restauración de última pantalla.
 */
class CesaRouter {
    constructor() {
        this.container = document.getElementById('screen-content');
        this.title = document.getElementById('app-title');
        this.titleDesktop = document.getElementById('app-title-desktop');
        this.navItems = document.querySelectorAll('.nav-item');
        this.navItemsDesktop = document.querySelectorAll('.nav-item-desktop');
        this.fab = document.getElementById('fab-action');
        this.currentScreen = null;
        this.exitGuardActive = false;
        this.init();
    }

    init() {
        // Restaurar última pantalla de la sesión (o Home)
        const saved = sessionStorage.getItem('cesa_last_screen');
        const initial = window.location.hash.replace('#', '') || saved || 'home';

        // Registrar la pantalla inicial EN el historial con replaceState:
        // queda como primer entry real, y el guard se activa al intentar salir.
        window.history.replaceState({ screen: initial, guard: true }, '', '#' + initial);
        this.navigate(initial, false);

        // Soporte para botón atrás del móvil / navegador
        window.addEventListener('popstate', (e) => {
            const screen = (e.state && e.state.screen) ? e.state.screen : null;
            if (screen) {
                this.exitGuardActive = false;
                this.navigate(screen, false);
                sessionStorage.setItem('cesa_last_screen', screen);
            } else {
                // Borde del historial: el usuario quiere salir de la app.
                // Re-empujamos la pantalla actual para mantenerlo dentro (comportamiento app nativa).
                if (!this.exitGuardActive) {
                    this.exitGuardActive = true;
                    window.history.pushState({ screen: this.currentScreen || 'home', guard: true }, '', '#' + (this.currentScreen || 'home'));
                    this.showExitToast();
                } else {
                    // Segundo intento seguido: respetamos la salida (cerrar pestaña)
                    window.history.back();
                }
            }
        });
    }

    /** Aviso discreto: "presiona atrás de nuevo para salir" */
    showExitToast() {
        const existing = document.getElementById('cesa-exit-toast');
        if (existing) { existing.remove(); }
        const toast = document.createElement('div');
        toast.id = 'cesa-exit-toast';
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl z-[9999] transition-opacity duration-300';
        toast.textContent = 'Presiona atrás de nuevo para salir';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    async navigate(screen, addToHistory = true) {
        if (this.currentScreen === screen) return;

        // Actualizar UI de la barra de navegación (Mobile)
        this.navItems.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screen);
        });

        // Actualizar UI de la barra lateral (Desktop)
        this.navItemsDesktop.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screen);
            if (btn.dataset.screen === screen) {
                btn.classList.add('active', 'text-cesa-navy', 'dark:text-cesa-gold');
                btn.classList.remove('text-gray-500', 'dark:text-gray-400');
            } else {
                btn.classList.remove('active', 'text-cesa-navy', 'dark:text-cesa-gold');
                btn.classList.add('text-gray-500', 'dark:text-gray-400');
            }
        });

        // Animación de salida
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(10px)';

        try {
            // Cargar de la carpeta /screens/ (Usa ruta absoluta para evitar problemas con slash)
            const response = await fetch(`/pwa/screens/${screen}.php`);
            if (!response.ok) throw new Error('Screen not found');
            
            const html = await response.text();

            setTimeout(() => {
                this.container.innerHTML = html;
                this.container.style.opacity = '1';
                this.container.style.transform = 'translateY(0)';
                
                this.currentScreen = screen;
                this.updateUI(screen);

                if (addToHistory) {
                    window.history.pushState({screen}, '', `#${screen}`);
                    sessionStorage.setItem('cesa_last_screen', screen);
                }
                
                // Re-ejecutar scripts inline que vienen en el HTML cargado
                this.executeInlineScripts();
            }, 150);

        } catch (err) {
            console.error('Error navigating to ' + screen, err);
            this.container.innerHTML = `
                <div class="p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
                    <p class="text-gray-400">Error al conectar con la gobernanza CESA.</p>
                    <button onclick="window.location.reload()" class="mt-4 text-cesa-gold font-bold">Reintentar</button>
                </div>
            `;
            this.container.style.opacity = '1';
        }
    }

    updateUI(screen) {
        // Títulos de sección
        const screenTitles = {
            home: 'CESA <span class="text-cesa-gold">UNISON</span>',
            muro: 'MURO <span class="text-cesa-gold">SOCIAL</span>',
            bazar: 'BAZAR <span class="text-cesa-gold">CESA</span>',
            tutoriales: 'PANELES <span class="text-cesa-gold">PWA</span>',
            perfil: 'MI <span class="text-cesa-gold">PERFIL</span>',
            admin: 'MANDO <span class="text-cesa-gold">DIRECTIVO</span>'
        };
        
        const plainTitle = screenTitles[screen] ? screenTitles[screen].replace(/<[^>]*>?/gm, '') : 'CESA';
        
        if (this.title) this.title.innerHTML = screenTitles[screen] || 'CESA';
        if (this.titleDesktop) this.titleDesktop.innerHTML = plainTitle;

        // Gestión del FAB Contextual
        const fabConfigs = {
            muro: { icon: 'fa-plus', action: 'openCreatePost()' },
            bazar: { icon: 'fa-store', action: 'openRegisterBusiness()' },
            tutorias: { icon: 'fa-chalkboard-teacher', action: 'requestTutoria()' }
        };

        const config = fabConfigs[screen];
        if (config) {
            this.fab.innerHTML = `<i class="fas ${config.icon} text-white text-xl"></i>`;
            this.fab.setAttribute('onclick', config.action);
            this.fab.classList.remove('hidden');
        } else {
            this.fab.classList.add('hidden');
        }
    }

    executeInlineScripts() {
        const scripts = this.container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
}

// Iniciar router globalmente
document.addEventListener('DOMContentLoaded', () => {
    window.router = new CesaRouter();
});
