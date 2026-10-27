'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useInterstitialAd } from '@/hooks/useInterstitialAd';

type Props = {
  show?: boolean;
  onClose?: () => void;
};

export default function InterstitialAd({ show = false, onClose }: Props) {
  const { user, token } = useAuth();
  const { showInterstitial } = useInterstitialAd();
  
  const [config, setConfig] = useState<{
    activo: boolean;
    publisher_id: string;
    interstitial_slot_id: string;
    frecuencia_diaria: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api/v1';

  useEffect(() => {
    // Si el usuario está autenticado, no cargar ni mostrar publicidad
    if (user || token) {
      setLoading(false);
      return;
    }
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/publicidad/adsense`, {
      headers
    })
      .then((r) => (r.ok ? r.json() : { success: false }))
      .then((data) => {
        if (data.success && data.data) {
          setConfig({
            activo: data.data.activo === 1 || data.data.activo === true,
            publisher_id: data.data.publisher_id ?? '',
            interstitial_slot_id: data.data.interstitial_slot_id ?? '',
            frecuencia_diaria: Number(data.data.frecuencia_diaria) || 2,
          });
        }
      })
      .catch((e) => {
        console.error('Error fetching ad config:', e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, token, API_URL]);

  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!show) {
      // Reiniciar al ocultarse para permitir una nueva impresión en la siguiente señal
      triggeredRef.current = false;
      return;
    }
    if (triggeredRef.current) return;

    if (user || token) {
      triggeredRef.current = true;
      onClose?.();
      return;
    }
    if (!loading) {
      triggeredRef.current = true;
      if (config) {
        const shown = showInterstitial(config, onClose);
        if (!shown) {
          onClose?.();
        }
      } else {
        onClose?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, config, loading, user, token]);

  return null; // Componente que maneja la renderización de anuncios programáticamente en el DOM.
}
