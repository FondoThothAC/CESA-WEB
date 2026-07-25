'use client';

import { useEffect, useState } from 'react';
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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

    fetch(`${API_URL}/admin/publicidad.php`, {
      headers
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setConfig({
            activo: data.data.activo === 1,
            publisher_id: data.data.publisher_id ?? '',
            interstitial_slot_id: data.data.interstitial_slot_id ?? '',
            frecuencia_diaria: parseInt(data.data.frecuencia_diaria, 10) || 2,
          });
        }
      })
      .catch((e) => {
        console.error('Error fetching ad config:', e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, API_URL]);

  useEffect(() => {
    if (show) {
      if (user || token) {
        onClose?.();
        return;
      }
      if (!loading) {
        if (config) {
          const shown = showInterstitial(config, onClose);
          if (!shown) {
            onClose?.();
          }
        } else {
          onClose?.();
        }
      }
    }
  }, [show, config, loading, showInterstitial, onClose, user, token]);

  return null; // This component handles the ad rendering programmatically via the DOM.
}
