'use client';

import React, { useState, useMemo } from 'react';
import { Navigation, ArrowRight, MapPin, Search, X } from 'lucide-react';
import { Building, getDirections, buildings, searchBuildings } from '@/lib/campusData';

interface WayfindingPanelProps {
  from: Building | null;
  to: Building;
  onClose: () => void;
  onSetOrigin: (building: Building | null) => void;
}

/**
 * WayfindingPanel — Panel de navegación entre edificios del campus.
 * Permite seleccionar un edificio de origen y muestra las instrucciones
 * paso a paso hacia el edificio destino.
 */
export default function WayfindingPanel({ from, to, onClose, onSetOrigin }: WayfindingPanelProps) {
  const [originQuery, setOriginQuery] = useState(from?.name || '');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  // Filtrar edificios de origen (excluye el destino)
  const originResults = useMemo(() => {
    if (!originQuery.trim() || originQuery === from?.name) return [];
    return searchBuildings(originQuery).filter((b) => b.id !== to.id).slice(0, 5);
  }, [originQuery, from, to]);

  const directions = getDirections(from?.id || null, to);

  // Distancia estimada en metros
  const distMeters = from
    ? Math.round(
        Math.sqrt(
          Math.pow(to.position[0] - from.position[0], 2) +
            Math.pow(to.position[2] - from.position[2], 2)
        ) * 12
      )
    : null;

  return (
    <div className="bg-[#0d1e3d]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm">
      {/* Encabezado */}
      <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-[#0d1e3d] to-[#162a4a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4a343]/20 flex items-center justify-center">
              <Navigation size={18} className="text-[#d4a343]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#d4a343]">
                Cómo llegar
              </div>
              <h3 className="text-sm font-bold text-[#f6f2eb]">Ruta al Edificio {to.id}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e9db0] hover:text-[#f6f2eb] transition-all text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Selector de Origen */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0] mb-2">
            Desde
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#22c55e]/50 transition-all">
              <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
              </div>
              <input
                type="text"
                placeholder="Buscar edificio de origen..."
                value={originQuery}
                onChange={(e) => {
                  setOriginQuery(e.target.value);
                  setShowOriginDropdown(true);
                  if (!e.target.value) onSetOrigin(null);
                }}
                onFocus={() => setShowOriginDropdown(true)}
                className="flex-1 bg-transparent text-[#f6f2eb] placeholder:text-[#8e9db0] outline-none text-sm font-medium"
              />
              {originQuery && (
                <button
                  onClick={() => {
                    setOriginQuery('');
                    setShowOriginDropdown(false);
                    onSetOrigin(null);
                  }}
                  className="text-[#8e9db0] hover:text-[#f6f2eb] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown de resultados */}
            {showOriginDropdown && originResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d1e3d]/98 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                {originResults.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSetOrigin(b);
                      setOriginQuery(b.name);
                      setShowOriginDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
                      <MapPin size={12} className="text-[#22c55e]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f6f2eb]">{b.id}: {b.name}</div>
                      <div className="text-[10px] text-[#8e9db0]">{b.floors} pisos</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flecha conectora */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-0.5 h-2 bg-[#8e9db0]/30" />
            <div className="w-0.5 h-2 bg-[#8e9db0]/20" />
            <ArrowRight size={14} className="text-[#d4a343] rotate-90" />
          </div>
          {distMeters && (
            <span className="text-[10px] text-[#8e9db0]">~{distMeters} metros de distancia</span>
          )}
        </div>

        {/* Destino */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0] mb-2">
            Hacia
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#d4a343]/10 border border-[#d4a343]/20">
            <div className="w-5 h-5 rounded-full bg-[#d4a343]/30 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-[#d4a343]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#d4a343]">{to.name}</div>
              {to.street && (
                <div className="text-[10px] text-[#8e9db0] mt-0.5">📍 {to.street}</div>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de ruta activa */}
        {from && (
          <div className="px-3 py-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">
              Ruta activa en el mapa 3D
            </span>
          </div>
        )}

        {/* Instrucciones paso a paso */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0] mb-3">
            Instrucciones
          </div>
          <div className="space-y-2">
            {directions.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#d4a343]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#d4a343]">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#f6f2eb]">{step}</div>
                  {i < directions.length - 1 && (
                    <div className="flex items-center gap-1 mt-1 text-[#8e9db0]">
                      <ArrowRight size={10} />
                      <span className="text-[10px]">Siguiente paso</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer con datos de contacto del destino */}
        {(to.phone || to.hours) && (
          <div className="pt-3 border-t border-white/5 space-y-1">
            {to.phone && (
              <div className="flex items-center gap-2 text-xs text-[#8e9db0]">
                <span>📞</span>
                <span>{to.phone}</span>
              </div>
            )}
            {to.hours && (
              <div className="flex items-center gap-2 text-xs text-[#8e9db0]">
                <span>🕐</span>
                <span>{to.hours}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
