'use client';

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, Bell, Download, Smartphone, X } from 'lucide-react';

/**
 * InstallPrompt - CESA PWA & Notification Prompt
 * Handles detection of browser/OS and displays custom installation & notification prompts.
 */
export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isSafari: false,
    isChrome: false,
    isInApp: false,
    isStandalone: false
  });

  useEffect(() => {
    // 1. Detect Device & Browser Details
    const ua = typeof window !== 'undefined' ? window.navigator.userAgent || '' : '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (typeof window !== 'undefined' && window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid;
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg|OPR/.test(ua);
    const isChrome = /Chrome|CriOS/.test(ua) && !/Edg|OPR/.test(ua);
    const isInApp = /(FBAN|FBAV|Instagram|Twitter|TikTok|Snapchat)/.test(ua);
    const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

    setDeviceInfo({
      isIOS,
      isAndroid,
      isMobile,
      isSafari,
      isChrome,
      isInApp,
      isStandalone
    });

    // 2. Load Notification Permission State
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // 3. Check Persistence (Dismissal)
    const lastDismissed = typeof window !== 'undefined' ? localStorage.getItem('cesa_prompt_dismissed') : null;
    const now = Date.now();
    const shouldShowBasedOnDismissal = !lastDismissed || (now - parseInt(lastDismissed, 10)) > 7 * 24 * 60 * 60 * 1000; // 7 days expiration

    // 4. Determine if prompt should be shown
    const needsNotifications = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default';
    const canBeInstalled = !isStandalone;

    if (shouldShowBasedOnDismissal && (needsNotifications || canBeInstalled)) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to beforeinstallprompt event (Android / Desktop Chrome / Edge)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const lastDismissed = localStorage.getItem('cesa_prompt_dismissed');
      const now = Date.now();
      const shouldShowBasedOnDismissal = !lastDismissed || (now - parseInt(lastDismissed, 10)) > 7 * 24 * 60 * 60 * 1000;
      
      if (shouldShowBasedOnDismissal && !window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Trigger browser notification permission request
  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Las notificaciones no son compatibles con este navegador.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('¡Notificaciones Activas!', {
          body: 'Recibirás avisos de CESA directamente en tu dispositivo.',
          icon: '/logo-cesa.jpg'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Trigger PWA installation
  const handleInstallApp = async () => {
    if (deviceInfo.isStandalone) return;

    if (deviceInfo.isIOS) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      if (deviceInfo.isInApp) {
        alert('Para instalar la aplicación, abre esta web usando el navegador nativo (Safari en iOS o Chrome en Android).');
      } else if (deviceInfo.isChrome) {
        alert('Haz clic en el icono de instalación (flecha hacia abajo o tres puntos) en la barra de direcciones de Chrome para instalar.');
      } else if (deviceInfo.isSafari) {
        alert('En Safari macOS, ve a Archivo -> Añadir al Dock... para instalar la aplicación en tu escritorio.');
      } else {
        alert('Busca la opción "Añadir a pantalla de inicio" o "Instalar aplicación" en el menú de tu navegador.');
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('cesa_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* PWA / Notification Floating Banner */}
      <div className="fixed bottom-28 md:bottom-10 right-6 left-6 md:left-auto md:w-96 z-[3000] animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[28px] blur-md opacity-25"></div>
        
        <div className="relative glass p-6 border border-border rounded-[24px] bg-bg-secondary backdrop-blur-xl text-text-main shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg shadow-lg shadow-primary/20 text-white">
                🚀
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider leading-tight text-primary">Únete a la app</h4>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Instalación y Alertas</p>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center text-text-muted hover:text-primary"
            >
              <X size={14} />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-text-main/80 font-medium mb-5 leading-relaxed">
            Instala la aplicación en tu {deviceInfo.isMobile ? 'pantalla de inicio' : 'escritorio'} y activa las notificaciones para estar al tanto de convocatorias, bazar de emprendedores y avisos del CESA.
          </p>

          {/* Detection / Browser Info Badge */}
          <div className="mb-5 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-3 py-2 rounded-xl">
            <span className="flex items-center gap-1">
              <Smartphone size={10} /> {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Escritorio'}
            </span>
            <span className="opacity-40">•</span>
            <span>
              {deviceInfo.isSafari ? 'Safari' : deviceInfo.isChrome ? 'Chrome' : 'Navegador'}
            </span>
            {deviceInfo.isInApp && (
              <>
                <span className="opacity-40">•</span>
                <span className="text-red-500">In-App</span>
              </>
            )}
          </div>

          {/* Action Call to Action */}
          <div className="flex flex-col gap-2">
            {!deviceInfo.isStandalone && (
              <button 
                onClick={handleInstallApp}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <Download size={14} /> Instalar en {deviceInfo.isMobile ? 'Inicio' : 'Escritorio'}
              </button>
            )}

            {notificationPermission !== 'granted' && (
              <button 
                onClick={handleRequestNotifications}
                className="w-full bg-bg-secondary hover:bg-primary/5 border border-border text-primary py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Bell size={14} className="text-accent" /> Activar Notificaciones
              </button>
            )}

            <button 
              onClick={handleDismiss}
              className="w-full text-center py-2 text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Guide Sheet Overlay */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[4000] flex items-end justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowIosGuide(false)}></div>
          
          <div className="relative w-full max-w-md bg-bg-secondary border border-border rounded-t-[32px] p-8 text-text-main shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-black uppercase tracking-wider text-primary">Instalar en tu iPhone / iPad</h4>
              <button 
                onClick={() => setShowIosGuide(false)}
                className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-6 mb-8 text-xs">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-text-main">Presiona el botón de "Compartir" en Safari</p>
                  <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                    Búscalo en la barra de navegación de tu iPhone (un icono de un cuadrado con una flecha hacia arriba <Share size={12} className="text-primary" />).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-text-main">Selecciona "Agregar a inicio"</p>
                  <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1 font-medium">
                    Desplázate hacia abajo por el menú que aparece y pulsa sobre la opción <strong>"Agregar al inicio"</strong> o <strong>"A la pantalla de inicio"</strong> (<PlusSquare size={12} className="text-primary" />).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-text-main">Confirma y disfruta</p>
                  <p className="text-[10px] text-text-muted mt-1">
                    Presiona "Agregar" en la esquina superior derecha. La aplicación se añadirá a tu pantalla de inicio como una app nativa.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification alert note */}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 items-center mb-6">
              <div className="text-accent text-lg">💡</div>
              <p className="text-[10px] text-text-main/80 font-medium">
                <strong>Nota:</strong> En iOS, es necesario agregar la aplicación a la pantalla de inicio para que puedas activar y recibir notificaciones push en tu dispositivo.
              </p>
            </div>

            <button 
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-primary hover:bg-primary/95 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary/20"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
