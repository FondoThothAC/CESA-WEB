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
      <div class="relative w-[90%] max-w-lg bg-gradient-to-br from-[#12121e] to-[#08080c] border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <!-- Badge -->
        <div class="absolute -top-3 left-8 bg-amber-500 text-black text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-amber-400">
          Anuncio Estudiantil
        </div>

        <!-- Close Button -->
        <button id="cesa-interstitial-close" class="absolute top-4 right-4 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">&times;</button>
        
        <!-- Ad Content Area -->
        <div class="flex flex-col items-center justify-center min-h-[300px] mt-2">
          <!-- Google Ad Container -->
          <div class="w-full h-full flex items-center justify-center">
            <ins class="adsbygoogle"
                 style="display:block; min-width:300px; min-height:250px;"
                 data-ad-client="${config.publisher_id}"
                 data-ad-slot="${config.interstitial_slot_id}"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>
          
          <!-- Fallback Visual Placeholder (if AdBlock blocks the script or ad doesn't load) -->
          <div id="cesa-ad-placeholder" class="absolute inset-8 flex flex-col items-center justify-center text-center pointer-events-none opacity-20 transition-all">
            <span class="text-4xl mb-3">🎓</span>
            <p class="text-white font-black uppercase tracking-[0.15em] text-xs">Cargando Anuncio...</p>
            <p class="text-white/40 text-[10px] mt-1">Patrocinado por CESA UNISON</p>
          </div>
        </div>

        <!-- Bottom details -->
        <div class="mt-6 flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-widest border-t border-white/5 pt-4">
          <span>CESA Digital 2026</span>
          <span id="cesa-ad-timer">Cerrar en 5s</span>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    
    // Fade in
    setTimeout(() => {
      container.style.opacity = '1';
    }, 50);

    // Load adsbygoogle
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      // Hide placeholder if ad loads
      setTimeout(() => {
        const ins = container.querySelector('ins.adsbygoogle');
        if (ins && ins.innerHTML.trim().length > 0) {
          const ph = container.querySelector('#cesa-ad-placeholder') as HTMLElement;
          if (ph) ph.style.opacity = '0';
        }
      }, 1500);
    } catch (e) {
      console.warn("Error running adsbygoogle push:", e);
    }

    let countdown = 5;
    const timerSpan = container.querySelector('#cesa-ad-timer') as HTMLElement;
    const closeBtn = container.querySelector('#cesa-interstitial-close') as HTMLButtonElement;
    closeBtn.disabled = true;
    closeBtn.style.opacity = '0.3';

    const interval = setInterval(() => {
      countdown--;
      if (timerSpan) {
        if (countdown > 0) {
          timerSpan.textContent = `Cerrar en ${countdown}s`;
        } else {
          timerSpan.textContent = 'Listo para cerrar';
          closeBtn.disabled = false;
          closeBtn.style.opacity = '1';
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
      }, 300);
    };

    closeBtn.onclick = () => {
      if (countdown <= 0) {
        closeAd();
      }
    };

    // Force auto-close after 35s maximum
    const autoCloseTimeout = setTimeout(() => {
      closeAd();
    }, 35000);

    return true;
  };

  return { showInterstitial, getTodayCount };
}
