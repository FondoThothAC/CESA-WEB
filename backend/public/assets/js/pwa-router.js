/**
 * CESA Simplified Router v3.9
 * Optimized for screen transitions and PWA performance.
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
        this.init();
    }

    init() {
        // Cargar pantalla inicial (Hash o Home)
        const initial = window.location.hash.replace('#', '') || 'home';
        this.navigate(initial, false);

        // Soporte para botón atrás del móvil / navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.screen) {
                this.navigate(e.state.screen, false);
            }
        });
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
