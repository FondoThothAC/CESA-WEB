'use client';

import React from 'react';
import { getFloorColor } from '@/lib/campusData';

const legendItems = [
  { floors: 1, label: '1 Nivel', color: getFloorColor(1) },
  { floors: 2, label: '2 Niveles', color: getFloorColor(2) },
  { floors: 3, label: '3 Niveles', color: getFloorColor(3) },
  { floors: 5, label: '5 Niveles', color: getFloorColor(5) },
];

const shapeItems = [
  { shape: 'rect', label: 'Rectangular', icon: '▬' },
  { shape: 'L', label: 'Forma L', icon: '⌐' },
  { shape: 'U', label: 'Forma U', icon: '⊔' },
  { shape: 'T', label: 'Forma T', icon: '┴' },
];

export default function MapLegend() {
  return (
    <div className="bg-[#0d1e3d]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-4 w-full max-w-[240px]">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0] mb-3">Leyenda</div>

      <div className="space-y-2 mb-3">
        {legendItems.map((item) => (
          <div key={item.floors} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: item.color }}></div>
            <span className="text-xs font-medium text-[#f6f2eb]">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-3 mb-3">
        <div className="text-[9px] font-bold uppercase tracking-widest text-[#8e9db0] mb-2">Formas</div>
        <div className="space-y-1.5">
          {shapeItems.map((item) => (
            <div key={item.shape} className="flex items-center gap-2">
              <span className="text-sm text-[#d4a343]">{item.icon}</span>
              <span className="text-[10px] text-[#8e9db0]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 pt-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-1 rounded bg-[#555]"></div>
          <span className="text-[10px] text-[#8e9db0]">Calles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2E7D32]"></div>
          <span className="text-[10px] text-[#8e9db0]">Árboles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#6B6B6B]"></div>
          <span className="text-[10px] text-[#8e9db0]">Estacionamientos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1 rounded bg-[#FFFFFF]"></div>
          <span className="text-[10px] text-[#8e9db0]">Pasos peatonales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#8B4513]"></div>
          <span className="text-[10px] text-[#8e9db0]">Estadios</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#D2B48C]"></div>
          <span className="text-[10px] text-[#8e9db0]">Plazas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#888]"></div>
          <span className="text-[10px] text-[#8e9db0]">Escaleras</span>
        </div>
      </div>
    </div>
  );
}