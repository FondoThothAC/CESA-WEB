'use client';

import React, { useState } from 'react';
import { Building, getFloorColor } from '@/lib/campusData';

interface FloorExplorerProps {
  building: Building;
  selectedFloor: number | null;
  onSelectFloor: (floor: number) => void;
  onClose: () => void;
  onNavigate?: () => void; // Callback para abrir el panel de wayfinding
}

/**
 * FloorExplorer — Panel lateral de información de un edificio seleccionado.
 * Muestra: descripción, contacto, horarios, departamentos,
 * selector de pisos y grilla de salones por piso.
 */
export default function FloorExplorer({
  building,
  selectedFloor,
  onSelectFloor,
  onClose,
  onNavigate,
}: FloorExplorerProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const floorColor = getFloorColor(building.floors);

  // Salones del piso seleccionado
  const roomsInFloor = building.rooms.filter((r) => r.floor === selectedFloor);

  // Determinar cuántas columnas en la grilla según cantidad de salones
  const gridCols = roomsInFloor.length <= 4 ? 2 : roomsInFloor.length <= 9 ? 3 : 4;

  return (
    <div className="bg-[#0d1e3d]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm flex flex-col max-h-[85vh]">

      {/* ══ Encabezado del Edificio ══ */}
      <div
        className="px-5 py-4 border-b border-white/5 flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, rgba(13,30,61,0.98) 0%, rgba(${building.floors >= 5 ? '30,25,5' : building.floors >= 3 ? '40,10,10' : '10,15,50'},0.95) 100%)`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badge de nivel */}
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: floorColor, boxShadow: `0 0 8px ${floorColor}80` }}
              />
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#d4a343]">
                Edificio {building.id} · {building.floors} {building.floors === 1 ? 'Nivel' : 'Niveles'}
              </div>
            </div>
            <h3 className="text-base font-black text-[#f6f2eb] leading-tight">
              {building.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e9db0] hover:text-[#f6f2eb] transition-all text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Descripción */}
        {building.description && (
          <p className="text-xs text-[#8e9db0] mt-2 leading-relaxed line-clamp-3">
            {building.description}
          </p>
        )}
      </div>

      {/* ══ Contenido con scroll ══ */}
      <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

        {/* ── Contacto y Horarios ── */}
        {(building.phone || building.hours || building.street) && (
          <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0] mb-2.5">
              Información de Contacto
            </div>
            <div className="space-y-2">
              {building.street && (
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none flex-shrink-0">📍</span>
                  <div>
                    <div className="text-[10px] font-bold text-[#8e9db0] uppercase tracking-wide">Ubicación</div>
                    <div className="text-xs text-[#f6f2eb] mt-0.5">{building.street}</div>
                  </div>
                </div>
              )}
              {building.phone && (
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none flex-shrink-0">📞</span>
                  <div>
                    <div className="text-[10px] font-bold text-[#8e9db0] uppercase tracking-wide">Teléfono</div>
                    <a
                      href={`tel:${building.phone.replace(/\D/g, '')}`}
                      className="text-xs text-[#d4a343] hover:text-[#f0c060] mt-0.5 block transition-colors"
                    >
                      {building.phone}
                    </a>
                  </div>
                </div>
              )}
              {building.hours && (
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none flex-shrink-0">🕐</span>
                  <div>
                    <div className="text-[10px] font-bold text-[#8e9db0] uppercase tracking-wide">Horario de Atención</div>
                    <div className="text-xs text-[#f6f2eb] mt-0.5 leading-relaxed">{building.hours}</div>
                  </div>
                </div>
              )}
              {building.landmark && (
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none flex-shrink-0">🏛️</span>
                  <div>
                    <div className="text-[10px] font-bold text-[#8e9db0] uppercase tracking-wide">Referencia</div>
                    <div className="text-xs text-[#f6f2eb] mt-0.5">{building.landmark}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Departamentos ── */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0] mb-2.5">
            Departamentos
          </div>
          <div className="space-y-1">
            {building.departments.map((dept, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: floorColor }}
                />
                <span className="text-xs font-medium text-[#f6f2eb]">{dept}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Selector de Pisos ── */}
        {building.floors >= 1 && (
          <div className="px-5 py-3 border-b border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0] mb-2.5">
              Explorar Piso
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: building.floors }).map((_, i) => {
                const floor = i + 1;
                const isSelected = selectedFloor === floor;
                const roomCount = building.rooms.filter((r) => r.floor === floor).length;
                return (
                  <button
                    key={floor}
                    onClick={() => onSelectFloor(isSelected ? 0 : floor)}
                    className="group relative flex flex-col items-center px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${floorColor}CC, ${floorColor}88)`
                        : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#091324' : '#f6f2eb',
                      boxShadow: isSelected ? `0 4px 20px ${floorColor}50` : 'none',
                      border: isSelected ? `1px solid ${floorColor}80` : '1px solid transparent',
                    }}
                  >
                    <span>Piso {floor}</span>
                    <span
                      className="text-[9px] font-normal mt-0.5"
                      style={{ opacity: isSelected ? 0.7 : 0.5 }}
                    >
                      {roomCount} sal.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Grilla de Salones por Piso ── */}
        {selectedFloor != null && selectedFloor > 0 && roomsInFloor.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#8e9db0]">
                Planta del Piso {selectedFloor}
              </div>
              <div className="text-[10px] text-[#8e9db0]">
                {roomsInFloor.length} salones
              </div>
            </div>

            {/* Mapa de grilla de pisos */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a1728]">
              {/* Indicador de piso */}
              <div
                className="py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2"
                style={{ backgroundColor: `${floorColor}20`, color: floorColor }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: floorColor }}
                />
                Nivel {selectedFloor} — Edificio {building.id}
              </div>

              {/* Grilla de salones */}
              <div
                className="p-3 grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
              >
                {roomsInFloor.map((room) => {
                  const isHovered = hoveredRoom === room.code;
                  return (
                    <button
                      key={room.code}
                      onMouseEnter={() => setHoveredRoom(room.code)}
                      onMouseLeave={() => setHoveredRoom(null)}
                      className="relative flex flex-col items-center justify-center rounded-lg text-center transition-all duration-150 cursor-pointer py-2 px-1"
                      style={{
                        background: isHovered
                          ? `linear-gradient(135deg, ${floorColor}30, ${floorColor}15)`
                          : 'rgba(255,255,255,0.04)',
                        border: isHovered
                          ? `1px solid ${floorColor}60`
                          : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: isHovered ? `0 2px 12px ${floorColor}30` : 'none',
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      }}
                    >
                      {/* Ícono de puerta */}
                      <div
                        className="w-5 h-6 rounded-sm mb-1 flex items-center justify-center text-[8px]"
                        style={{
                          background: isHovered ? `${floorColor}40` : 'rgba(255,255,255,0.08)',
                          border: isHovered ? `1px solid ${floorColor}80` : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        🚪
                      </div>
                      <div
                        className="text-[9px] font-bold leading-none"
                        style={{ color: isHovered ? floorColor : '#f6f2eb' }}
                      >
                        {room.code}
                      </div>
                      <div className="text-[8px] text-[#8e9db0] mt-0.5 leading-none">
                        Sal. {room.floor * 100 + parseInt(room.code.replace(/\D/g, '').slice(-1)) || 1}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Leyenda del piso */}
              <div className="px-3 pb-3 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: `${floorColor}50`, border: `1px solid ${floorColor}80` }}
                  />
                  <span className="text-[9px] text-[#8e9db0]">Salón disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-white/8 border border-white/10" />
                  <span className="text-[9px] text-[#8e9db0]">Sala general</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Botón de Navegación ── */}
        {onNavigate && (
          <div className="px-5 pb-5">
            <button
              onClick={onNavigate}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #d4a343, #c49230)',
                color: '#091324',
                boxShadow: '0 4px 20px rgba(212,163,67,0.35)',
              }}
            >
              <span>🧭</span>
              Cómo llegar aquí
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
