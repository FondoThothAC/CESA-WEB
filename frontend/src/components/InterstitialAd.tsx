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
  
  // A usuarios autenticados (mesa directiva, estudiantes, etc.) no se les muestra publicidad
  if (user || token) {
    if (show) {
      onClose?.();
    }
    return null;
  }
  const [config, setConfig] = useState<{
    activo: boolean;
    publisher_id: string;
    interstitial_slot_id: string;
    frecuencia_diaria: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
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
    if (show && !loading) {
      if (config) {
        const shown = showInterstitial(config, onClose);
        if (!shown) {
          // If not shown due to limit or inactive, call onClose immediately
          onClose?.();
        }
      } else {
        // If config is not loaded or failed, proceed without ad
        onClose?.();
      }
    }
  }, [show, config, loading, showInterstitial, onClose]);

  return null; // This component handles the ad rendering programmatically via the DOM.
}
