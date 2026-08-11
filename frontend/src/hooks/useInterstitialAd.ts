import { useState, useEffect } from 'react';

type AdConfig = {
  activo: boolean;
  publisher_id: string;
  interstitial_slot_id: string;
  frecuencia_diaria: number;
};

export function useInterstitialAd() {
  const [adsScriptLoaded, setAdsScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if script is already present
    const existing = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existing) {
      setAdsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => setAdsScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Keep script loaded once initialized
    };
  }, []);

  const getFrequencyKey = () => {
    return `cesa_interstitial_ads_${new Date().toISOString().slice(0, 10)}`;
  };

  const getTodayCount = () => {
    if (typeof window === 'undefined') return 0;
    const val = localStorage.getItem(getFrequencyKey());
    return val ? parseInt(val, 10) : 0;
  };

  const incrementCount = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getFrequencyKey(), (getTodayCount() + 1).toString());
  };

  const canShowAd = (config: AdConfig): boolean => {
    if (!config.activo) return false;
    const today = getTodayCount();
    return today < config.frecuencia_diaria;
  };

  const showInterstitial = (config: AdConfig, onClose?: () => void) => {
    if (!canShowAd(config)) {
      onClose?.();
      return false;
    }

    // Create a sleek full-screen modal container matching CESA's visual style
    const container = document.createElement('div');
    container.id = `cesa-interstitial-container`;
    
    // Premium CESA UI Styling (Glassmorphism, dark blur, sleek close button, high z-index)
    container.className = 'fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0a0f]/90 backdrop-blur-md transition-all duration-300';
    container.style.opacity = '0';

    container.innerHTML = `
      <div class="relative w-[90%] max-w-lg bg-gradient-to-br from-[#12121e] to-[#08080c] border border-amber-500/20 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <!-- Badge -->
        <div class="absolute -top-3 left-8 bg-amber-500 text-black text-[9px] font-black tracking-[0.2em] uppercase px-3.5 py-1 rounded-full border border-amber-400 shadow-lg shadow-amber-500/20">
          Anuncio Estudiantil CESA
        </div>

        <!-- Close Button (Siempre accesible) -->
        <button id="cesa-interstitial-close" class="absolute top-5 right-5 text-white/60 hover:text-amber-400 transition-all bg-white/10 hover:bg-amber-500/20 hover:border-amber-500/40 border border-transparent w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl z-10 cursor-pointer">&times;</button>
        
        <!-- Ad Content Area -->
        <div class="flex flex-col items-center justify-center min-h-[280px] mt-4 relative">
          <!-- Google Ad Container -->
          ${config.publisher_id && config.interstitial_slot_id ? `
            <div class="w-full flex items-center justify-center">
              <ins class="adsbygoogle"
                   style="display:block; min-width:300px; min-height:250px;"
                   data-ad-client="${config.publisher_id}"
                   data-ad-slot="${config.interstitial_slot_id}"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
            </div>
          ` : ''}
          
          <!-- Fallback Visual Placeholder CESA -->
          <div id="cesa-ad-placeholder" class="flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl w-full">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30 flex items-center justify-center mb-4 shadow-inner">
              <span class="text-3xl">🏛️</span>
            </div>
            <h4 class="text-white font-black text-base uppercase tracking-tight">Consejo Estudiantil UNISON</h4>
            <p class="text-amber-400 text-xs font-bold mt-1">Gestión Institucional 2026 - 2028</p>
            <p class="text-slate-400 text-xs mt-3 max-w-xs leading-relaxed">
              Impulsando la representación digital, emprendimientos y actividades de los estudiantes de la Universidad de Sonora.
            </p>
            <a href="https://cesaunison.fondothoth.com" target="_blank" rel="noopener noreferrer" class="mt-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all">
              Conocer más programas →
            </a>
          </div>
        </div>

        <!-- Bottom details -->
        <div class="mt-6 flex justify-between items-center text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest border-t border-white/5 pt-4">
          <span>CESA Digital 2026</span>
          <span id="cesa-ad-timer">Cerrar en 3s</span>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    
    // Fade in
    setTimeout(() => {
      container.style.opacity = '1';
    }, 50);

    // Load adsbygoogle if configured
    if (config.publisher_id && config.interstitial_slot_id) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setTimeout(() => {
          const ins = container.querySelector('ins.adsbygoogle');
          if (ins && ins.innerHTML.trim().length > 0) {
            const ph = container.querySelector('#cesa-ad-placeholder') as HTMLElement;
            if (ph) ph.style.display = 'none';
          }
        }, 1200);
      } catch (e) {
        console.warn("Error running adsbygoogle push:", e);
      }
    }

    let countdown = 3;
    const timerSpan = container.querySelector('#cesa-ad-timer') as HTMLElement;
    const closeBtn = container.querySelector('#cesa-interstitial-close') as HTMLButtonElement;

    const interval = setInterval(() => {
      countdown--;
      if (timerSpan) {
        if (countdown > 0) {
          timerSpan.textContent = `Cerrar en ${countdown}s`;
        } else {
          timerSpan.textContent = 'Clic en (X) para cerrar';
          clearInterval(interval);
        }
      }
    }, 1000);

    const closeAd = () => {
      clearInterval(interval);
      container.style.opacity = '0';
      setTimeout(() => {
        if (container.parentNode) {
          container.remove();
        }
        incrementCount();
        onClose?.();
      }, 200);
    };

    closeBtn.onclick = () => {
      closeAd();
    };

    // Force auto-close after 10s maximum
    const autoCloseTimeout = setTimeout(() => {
      closeAd();
    }, 10000);

    return true;
  };

  return { showInterstitial, getTodayCount };
}
