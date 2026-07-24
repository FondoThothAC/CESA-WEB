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
  mapType?: 'radial_base' | 'doble_pasillo' | 'exterior_perimetral';
  isArchived?: boolean;
  editionTitle?: string;
}

/**
 * BazarSchematicMap v4.0 - Motor de 3 Plantillas de Mapas Geométricos
 * 1. Radial Base (72 puestos)
 * 2. Doble Pasillo (112 puestos a ambos lados del pasillo)
 * 3. Exterior Perimetral (Doble Pasillo + Puestos exteriores bordeando cuadrantes)
 */
const BazarSchematicMap: React.FC<BazarSchematicMapProps> = ({ 
  locations, 
  puestos, 
  selectedPuestoId, 
  onSelectSpot,
  mapType = 'radial_base',
  isArchived = false,
  editionTitle
}) => {
  const [hoveredPuestoId, setHoveredPuestoId] = useState<number | null>(null);

  // Generación dinámica de puntos según la plantilla elegida
  const generateDots = () => {
    const dots: { id: number; x: number; y: number; zona: string }[] = [];
    let currentId = 1;

    // Plantilla 1: Radial Base (72 puestos simples en 8 rayos)
    if (mapType === 'radial_base') {
      const lines = 8;
      const dotsPerLine = 9;
      for (let i = 0; i < lines; i++) {
        const angle = (i * 360) / lines;
        for (let j = 1; j <= dotsPerLine; j++) {
          const distance = 10 + j * 4.2;
          const x = 50 + Math.cos((angle * Math.PI) / 180) * distance;
          const y = 50 + Math.sin((angle * Math.PI) / 180) * distance;
          if (x >= 8 && x <= 92 && y >= 8 && y <= 92) {
            dots.push({ id: currentId++, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, zona: 'radial_simple' });
          }
        }
      }
      return dots;
    }

    // Plantilla 2: Doble Pasillo (Fila DOBLE únicamente en pasillo vertical Norte y Sur; Diagonales y Horizontal son SIMPLES)
    if (mapType === 'doble_pasillo' || mapType === 'exterior_perimetral') {
      const lines = 8;
      const dotsPerLine = 9;
      const offsetDistance = 2.2; // Desplazamiento para la doble fila en pasillo Norte/Sur

      for (let i = 0; i < lines; i++) {
        const angleDeg = (i * 360) / lines;
        const angleRad = angleDeg * (Math.PI / 180);

        // Si es pasillo vertical Norte (90 deg / 270 deg en SVG), hacemos fila doble a la izq y der del pasillo
        const isVerticalNorteSur = Math.abs(Math.cos(angleRad)) < 0.1; // Ángulo vertical (top/bottom)

        if (isVerticalNorteSur) {
          // Fila Doble
          for (let j = 1; j <= dotsPerLine; j++) {
            const distance = 10 + j * 4.2;
            const baseX = 50 + Math.cos(angleRad) * distance;
            const baseY = 50 + Math.sin(angleRad) * distance;

            // Izquierda (-X)
            const xA = baseX - offsetDistance;
            const yA = baseY;
            if (yA >= 8 && yA <= 92) {
              dots.push({ id: currentId++, x: Math.round(xA * 10) / 10, y: Math.round(yA * 10) / 10, zona: 'doble_nortesur_izq' });
            }

            // Derecha (+X)
            const xB = baseX + offsetDistance;
            const yB = baseY;
            if (yB >= 8 && yB <= 92) {
              dots.push({ id: currentId++, x: Math.round(xB * 10) / 10, y: Math.round(yB * 10) / 10, zona: 'doble_nortesur_der' });
            }
          }
        } else {
          // Rayos horizontales y diagonales se quedan SIMPLES
          for (let j = 1; j <= dotsPerLine; j++) {
            const distance = 10 + j * 4.2;
            const x = 50 + Math.cos(angleRad) * distance;
            const y = 50 + Math.sin(angleRad) * distance;
            if (x >= 8 && x <= 92 && y >= 8 && y <= 92) {
              dots.push({ id: currentId++, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, zona: 'simple' });
            }
          }
        }
      }
    }

    // Plantilla 3: Exterior Perimetral (Doble Pasillo N/S + Filas en el pasillo exterior)
    if (mapType === 'exterior_perimetral') {
      const topOuterY = 6;
      const bottomOuterY = 94;
      const leftOuterX = 6;
      const rightOuterX = 94;

      // Fila exterior superior (Norte)
      for (let k = 0; k < 8; k++) {
        dots.push({ id: currentId++, x: 14 + k * 4.2, y: topOuterY, zona: 'exterior_top' });
        dots.push({ id: currentId++, x: 58 + k * 4.2, y: topOuterY, zona: 'exterior_top' });
      }

      // Fila exterior inferior (Sur)
      for (let k = 0; k < 8; k++) {
        dots.push({ id: currentId++, x: 14 + k * 4.2, y: bottomOuterY, zona: 'exterior_bottom' });
        dots.push({ id: currentId++, x: 58 + k * 4.2, y: bottomOuterY, zona: 'exterior_bottom' });
      }

      // Fila exterior izquierda (Oeste)
      for (let k = 0; k < 8; k++) {
        dots.push({ id: currentId++, x: leftOuterX, y: 14 + k * 4.2, zona: 'exterior_left' });
        dots.push({ id: currentId++, x: leftOuterX, y: 58 + k * 4.2, zona: 'exterior_left' });
      }

      // Fila exterior derecha (Este)
      for (let k = 0; k < 8; k++) {
        dots.push({ id: currentId++, x: rightOuterX, y: 14 + k * 4.2, zona: 'exterior_right' });
        dots.push({ id: currentId++, x: rightOuterX, y: 58 + k * 4.2, zona: 'exterior_right' });
      }
    }

    return dots;
  };

  const calculatedDots = generateDots();

  // Usar los puestos pasados o los calculados
  const activePuestos: Puesto[] = puestos && puestos.length > 0 ? puestos : calculatedDots.map((d) => ({
    id: d.id,
    zona: d.zona,
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
      
      {/* Insignia de Archivo Histórico si aplica */}
      {isArchived && (
        <div className="absolute top-3 right-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider z-20 animate-pulse">
          🔒 EDICIÓN ARCHIVADA (HISTORIAL)
        </div>
      )}

      {/* Etiquetas / Calles del Mapa */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#f4eae1] border border-amber-900/10 px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#002147] shadow-sm z-10">
        Calle de la Cultura {editionTitle ? `• ${editionTitle}` : ''}
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

        {/* Pasillos anchos para Mapa 2 y 3 */}
        {mapType !== 'radial_base' && (
          <>
            <rect x="7" y="47" width="86" height="6" fill="#e8dcd0" opacity="0.6" />
            <rect x="47" y="7" width="6" height="86" fill="#e8dcd0" opacity="0.6" />
          </>
        )}

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

        {/* 5. Nodos Disponibles (Círculos Verdes del plano) */}
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
              <circle 
                cx={posX} 
                cy={posY} 
                r="3.5" 
                fill="transparent"
                style={{ pointerEvents: 'all' }}
              />
              {isSelected && (
                <circle 
                  cx={posX} 
                  cy={posY} 
                  r="2.5" 
                  fill="#22c55e"
                  opacity="0.4"
                  className="animate-pulse"
                />
              )}
              <circle 
                cx={posX} 
                cy={posY} 
                r={isSelected ? "1.8" : isHovered ? "1.5" : "1.2"} 
                fill={isSelected ? "#15803d" : "#22c55e"} 
                stroke="#ffffff" 
                strokeWidth={isHovered ? "0.6" : "0.3"}
                className="transition-all duration-200"
              />
              <circle 
                cx={posX - 0.3} 
                cy={posY - 0.3} 
                r="0.3" 
                fill="#ffffff" 
                opacity="0.6" 
              />
              {isHovered && (
                <text 
                  x={posX} 
                  y={posY - 2.2} 
                  fill="#002147" 
                  fontSize="2.2" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  className="drop-shadow-sm font-sans"
                >
                  #{p.id}
                </text>
              )}
            </g>
          );
        })}

        {/* 6. Nodos Ocupados (Círculos Naranjas / Amarillos con Marca de Negocio) */}
        {locations.map((loc) => {
          const puestoDetails = activePuestos.find(p => Number(p.id) === Number(loc.puesto_id)) || {
            id: loc.puesto_id,
            coord_x: 50,
            coord_y: 50
          };
          const isSelected = selectedPuestoId === Number(loc.puesto_id);
          const isHovered = hoveredPuestoId === Number(loc.puesto_id);
          const posX = typeof puestoDetails.coord_x === 'string' ? parseFloat(puestoDetails.coord_x) : puestoDetails.coord_x;
          const posY = typeof puestoDetails.coord_y === 'string' ? parseFloat(puestoDetails.coord_y) : puestoDetails.coord_y;

          return (
            <g
              key={`occupied-${loc.id}-${loc.puesto_id}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPuestoId(Number(loc.puesto_id))}
              onMouseLeave={() => setHoveredPuestoId(null)}
              onClick={() => onSelectSpot && onSelectSpot(puestoDetails as Puesto, loc)}
            >
              <circle 
                cx={posX} 
                cy={posY} 
                r="3.5" 
                fill="transparent"
                style={{ pointerEvents: 'all' }}
              />
              {isSelected && (
                <circle 
                  cx={posX} 
                  cy={posY} 
                  r="2.5" 
                  fill="#f97316"
                  opacity="0.4"
                  className="animate-pulse"
                />
              )}
              <circle 
                cx={posX} 
                cy={posY} 
                r={isSelected ? "1.8" : isHovered ? "1.5" : "1.2"} 
                fill={isSelected ? "#c2410c" : "#f97316"} 
                stroke="#ffffff" 
                strokeWidth={isHovered ? "0.6" : "0.3"}
                className="transition-all duration-200"
              />
              <circle 
                cx={posX - 0.3} 
                cy={posY - 0.3} 
                r="0.3" 
                fill="#ffffff" 
                opacity="0.6" 
              />
              {isHovered && (
                <g>
                  <rect 
                    x={posX - 12} 
                    y={posY - 7} 
                    width="24" 
                    height="5" 
                    rx="1" 
                    fill="#0f172a" 
                    opacity="0.95"
                    stroke="#f97316"
                    strokeWidth="0.2"
                  />
                  <text 
                    x={posX} 
                    y={posY - 3.5} 
                    fill="#ffffff" 
                    fontSize="1.8" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className="font-sans tracking-tight"
                  >
                    {loc.nombre_negocio || `Puesto #${loc.puesto_id}`}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Leyenda Inferior */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-4 text-[9px] font-bold text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>LIBRE ({availablePuestos.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span>OCUPADO ({locations.length})</span>
        </div>
        <div className="text-slate-500 font-mono">
          MAPA: <strong className="text-blue-400 uppercase">{mapType.replace('_', ' ')}</strong>
        </div>
      </div>
    </div>
  );
};

export default BazarSchematicMap;
