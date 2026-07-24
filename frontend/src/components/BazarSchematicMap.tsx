'use client';

import React, { useState } from 'react';

interface Puesto {
  id: number;
  zona: string;
  coord_x: string | number;
  coord_y: string | number;
  disponible: number | boolean;
  activo: number | boolean;
}

interface BazarSchematicMapProps {
  locations: any[]; // Puestos ocupados por negocios activos
  puestos: Puesto[]; // Catálogo completo de puestos
  selectedPuestoId?: number | null;
  onSelectSpot?: (puesto: Puesto, business: any | null) => void;
}

/**
 * BazarSchematicMap v3.1 - Layout Esquematizado de la Calle de la Cultura (UNISON)
 * Dibuja los 72 puntos radiales directamente desde la base de datos para asegurar consistencia
 * y sincronía al reservar o ver la información de los stands.
 * Optimizado para evitar la vibración / flickering al pasar el cursor o usar touch.
 */
const BazarSchematicMap: React.FC<BazarSchematicMapProps> = ({ 
  locations, 
  puestos, 
  selectedPuestoId, 
  onSelectSpot 
}) => {
  const [hoveredPuestoId, setHoveredPuestoId] = useState<number | null>(null);

  // Lógica de generación local para fallback (en caso de que falle la carga de la API)
  const baseDots: { id: string; x: number; y: number }[] = [];
  const lines = 8;
  const dotsPerLine = 10;
  
  for (let i = 0; i < lines; i++) {
    const angle = (i * 360) / lines;
    for (let j = 2; j <= dotsPerLine; j++) {
      const distance = j * 4.2;
      const x = 50 + Math.cos((angle * Math.PI) / 180) * distance;
      const y = 50 + Math.sin((angle * Math.PI) / 180) * distance;
      if (x >= 8 && x <= 92 && y >= 8 && y <= 92) {
        baseDots.push({ id: `base-${i}-${j}`, x, y });
      }
    }
  }

  // Si no se han cargado los puestos de la base de datos, usamos los calculados localmente
  const activePuestos: Puesto[] = puestos && puestos.length > 0 ? puestos : baseDots.map((d, index) => ({
    id: index + 1,
    zona: 'radial',
    coord_x: d.x,
    coord_y: d.y,
    disponible: 1,
    activo: 1
  }));

  // Separar los puestos disponibles
  const availablePuestos = activePuestos.filter(p => {
    return !locations.some(loc => Number(loc.puesto_id) === Number(p.id));
  });

  return (
    <div className="relative w-full aspect-square bg-[#121720] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl p-4 md:p-8 flex items-center justify-center">
      
      {/* Etiquetas / Calles del Mapa */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#f4eae1] border border-amber-900/10 px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#002147] shadow-sm z-10">
        Calle de la Cultura
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">
        Av. Sonora
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">
        Av. de la Universidad
      </div>

      {/* SVG Canvas */}
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-[32px] overflow-hidden shadow-inner">
        
        {/* 1. Fondo de Arena / Calles (Beige/Tan) */}
        <rect width="100" height="100" fill="#f4eae1" />

        {/* 2. Cuadrantes del Campus (Verde Claro / Grisáceo) */}
        <rect x="10" y="10" width="36" height="36" rx="6" fill="#c5d3cd" />
        <rect x="54" y="10" width="36" height="36" rx="6" fill="#c5d3cd" />
        <rect x="10" y="54" width="36" height="36" rx="6" fill="#c5d3cd" />
        <rect x="54" y="54" width="36" height="36" rx="6" fill="#c5d3cd" />

        {/* 3. Caminos de Arena que cortan a través de los cuadrantes (Cruz y Diagonales) */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="#f4eae1" strokeWidth="4" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#f4eae1" strokeWidth="4" />
        <line x1="10" y1="10" x2="90" y2="90" stroke="#f4eae1" strokeWidth="4.2" />
        <line x1="90" y1="10" x2="10" y2="90" stroke="#f4eae1" strokeWidth="4.2" />

        {/* 4. Rotonda Central de la Plaza del Estudiante */}
        <circle cx="50" cy="50" r="10" fill="#f4eae1" />
        <circle cx="50" cy="50" r="6" fill="#e28f83" stroke="#002147" strokeWidth="0.6" />
        
        {/* Logo oficial de CESA en el centro de la rotonda */}
        <clipPath id="logoClip">
          <circle cx="50" cy="50" r="6" />
        </clipPath>
        <image href="/logo-cesa.jpg" x="44" y="44" width="12" height="12" clipPath="url(#logoClip)" />

        {/* 5. Nodos Disponibles (Círculos Verdes del plano original) */}
        {availablePuestos.map(p => {
          const isSelected = selectedPuestoId === p.id;
          const isHovered = hoveredPuestoId === p.id;
          const posX = typeof p.coord_x === 'string' ? parseFloat(p.coord_x) : p.coord_x;
          const posY = typeof p.coord_y === 'string' ? parseFloat(p.coord_y) : p.coord_y;

          return (
            <g
              key={`available-${p.id}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPuestoId(p.id)}
              onMouseLeave={() => setHoveredPuestoId(null)}
              onClick={() => onSelectSpot && onSelectSpot(p, null)}
            >
              {/* Hit target invisible para interacción táctil y hover estable */}
              <circle 
                cx={posX} 
                cy={posY} 
                r="3.5" 
                fill="transparent"
                style={{ pointerEvents: 'all' }}
              />
              {/* Aura de Selección */}
              {isSelected && (
                <circle 
                  cx={posX} 
                  cy={posY} 
                  r="2.5" 
                  fill="#22c55e"
                  opacity="0.4"
                  className="animate-pulse"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {/* Círculo Principal */}
              <circle 
                cx={posX} 
                cy={posY} 
                r={isSelected || isHovered ? "1.4" : "0.9"} 
                fill="#22c55e" 
                stroke="#002147"
                strokeWidth="0.2"
                className="transition-all duration-300"
                opacity="0.95"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* 6. Nodos Ocupados / Emprendedores Activos (Oro CESA con destello) */}
        {locations.map(loc => {
          const isSelected = selectedPuestoId === Number(loc.puesto_id);
          const isHovered = hoveredPuestoId === Number(loc.puesto_id);
          const posX = typeof loc.x === 'string' ? parseFloat(loc.x) : loc.x || 50;
          const posY = typeof loc.y === 'string' ? parseFloat(loc.y) : loc.y || 50;
          
          // Encontrar puesto correspondiente
          const puestoDetails = activePuestos.find(p => Number(p.id) === Number(loc.puesto_id)) || {
            id: Number(loc.puesto_id),
            zona: 'Bazar',
            coord_x: posX,
            coord_y: posY,
            disponible: 0,
            activo: 1
          };

          return (
            <g 
              key={`occupied-${loc.id}`} 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPuestoId(Number(loc.puesto_id))}
              onMouseLeave={() => setHoveredPuestoId(null)}
              onClick={() => onSelectSpot && onSelectSpot(puestoDetails, loc)}
            >
              {/* Hit target invisible para interacción táctil y hover estable */}
              <circle 
                cx={posX} 
                cy={posY} 
                r="4.0" 
                fill="transparent"
                style={{ pointerEvents: 'all' }}
              />
              {/* Aura / Glow de selección */}
              <circle 
                cx={posX} 
                cy={posY} 
                r={isSelected || isHovered ? "3.2" : "2.2"} 
                fill="#C5A059"
                opacity={isSelected ? "0.6" : (isHovered ? "0.4" : "0.2")}
                className="transition-all duration-300"
                style={{ pointerEvents: 'none' }}
              />
              
              {/* Círculo Principal */}
              <circle 
                cx={posX} 
                cy={posY} 
                r={isSelected || isHovered ? "1.4" : "1.0"} 
                fill="#C5A059" 
                stroke="#002147"
                strokeWidth="0.3"
                className="transition-all duration-300" 
                style={{ pointerEvents: 'none' }}
              />
              
              {/* Efecto de pulso activo */}
              <circle 
                cx={posX} 
                cy={posY} 
                r={isSelected || isHovered ? "2.2" : "1.6"} 
                fill="none"
                stroke="#C5A059"
                strokeWidth="0.2"
                className="animate-ping opacity-70"
                style={{ pointerEvents: 'none' }}
              />

              {/* Popover flotante rápido en hover */}
              {isHovered && (
                <foreignObject x={posX > 50 ? posX - 32 : posX + 2} y={posY - 12} width="30" height="11" style={{ pointerEvents: 'none' }}>
                  <div className="bg-[#0c0d12]/95 border border-[#C5A059]/40 p-1.5 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-[1.8px] uppercase tracking-tighter truncate">{loc.nombre_negocio}</span>
                      <span className="text-[#C5A059] font-bold text-[1.4px] uppercase tracking-widest mt-0.5 truncate">{loc.categoria}</span>
                    </div>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>

      {/* Leyenda del Mapa */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#0c0d12]/90 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10 shadow-lg z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
          <span className="text-[7.5px] uppercase font-black text-slate-400 tracking-wider">Libre</span>
        </div>
        <div className="w-px h-3 bg-white/10"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
          <span className="text-[7.5px] uppercase font-black text-[#C5A059] tracking-wider">Ocupado</span>
        </div>
      </div>

    </div>
  );
};

export default BazarSchematicMap;
