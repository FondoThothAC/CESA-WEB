'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Navigation, Info, X } from 'lucide-react';
import SearchPanel from '@/components/campus/SearchPanel';
import FloorExplorer from '@/components/campus/FloorExplorer';
import WayfindingPanel from '@/components/campus/WayfindingPanel';
import MapLegend from '@/components/campus/MapLegend';
import { Building } from '@/lib/campusData';

// Carga dinámica del mapa 3D (sin SSR por Three.js)
const CampusMap3D = dynamic(() => import('@/components/campus/CampusMap3D'), { ssr: false });

/**
 * MapaPage — Página principal del Mapa Interactivo 3D del Campus UNISON.
 * Orquesta los estados globales de selección, wayfinding y exploración de pisos.
 */
export default function MapaPage() {
  // Estado del edificio seleccionado / resaltado
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [highlightedBuilding, setHighlightedBuilding] = useState<Building | null>(null);

  // Estado del wayfinding
  const [showWayfinding, setShowWayfinding] = useState(false);
  const [wayfindingOrigin, setWayfindingOrigin] = useState<Building | null>(null);

  // Tooltip de ayuda inicial
  const [showHelp, setShowHelp] = useState(true);

  // ── Handlers de edificios ──

  const handleBuildingClick = useCallback((building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setShowWayfinding(false);
    setShowHelp(false);
  }, []);

  const handleSelectFromSearch = useCallback((building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setShowHelp(false);
  }, []);

  const handleSelectRoom = useCallback((building: Building, roomCode: string) => {
    setSelectedBuilding(building);
    // Extraer el piso del código de sala (primer dígito numérico después del ID)
    const floorDigit = parseInt(roomCode.charAt(building.id.length), 10);
    if (!isNaN(floorDigit)) {
      setSelectedFloor(floorDigit);
    }
    setShowHelp(false);
  }, []);

  // ── Handlers de wayfinding ──

  const handleStartWayfinding = useCallback(() => {
    if (selectedBuilding) {
      setShowWayfinding(true);
    }
  }, [selectedBuilding]);

  const handleCloseWayfinding = useCallback(() => {
    setShowWayfinding(false);
    setWayfindingOrigin(null);
  }, []);

  const handleSetWayfindingOrigin = useCallback((building: Building | null) => {
    setWayfindingOrigin(building);
  }, []);

  // ── Handlers de panel de piso ──

  const handleCloseFloorExplorer = useCallback(() => {
    setSelectedBuilding(null);
    setSelectedFloor(null);
  }, []);

  const handleNavigateFromFloor = useCallback(() => {
    if (selectedBuilding) {
      setShowWayfinding(true);
    }
  }, [selectedBuilding]);

  return (
    <main className="min-h-screen bg-[#091324] text-[#f6f2eb] overflow-hidden">

      {/* ══ Barra de navegación superior ══ */}
      <div className="fixed top-0 left-0 right-0 z-50 px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Botón Volver */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-2xl bg-[#0d1e3d]/90 backdrop-blur-md border border-white/10 text-[#f6f2eb] hover:bg-[#0d1e3d] transition-all shadow-xl flex-shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="text-xs md:text-sm font-bold hidden sm:inline">Volver</span>
          </Link>

          {/* Buscador central */}
          <div className="flex-1 mx-2 max-w-md">
            <SearchPanel onSelectBuilding={handleSelectFromSearch} onSelectRoom={handleSelectRoom} />
          </div>

          {/* Botón Cómo llegar */}
          <button
            onClick={handleStartWayfinding}
            disabled={!selectedBuilding}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-2xl bg-[#d4a343] text-[#091324] font-bold text-xs md:text-sm shadow-xl hover:bg-[#d4a343]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title={selectedBuilding ? `Cómo llegar a ${selectedBuilding.name}` : 'Selecciona un edificio primero'}
          >
            <Navigation size={14} />
            <span className="hidden sm:inline">Cómo llegar</span>
          </button>
        </div>
      </div>

      {/* ══ Canvas 3D del mapa ══ */}
      <div className="w-full h-screen">
        <CampusMap3D
          selectedBuilding={selectedBuilding}
          highlightedBuilding={highlightedBuilding}
          onBuildingClick={handleBuildingClick}
          wayfindingOrigin={wayfindingOrigin}
          wayfindingDestination={showWayfinding ? selectedBuilding : null}
        />
      </div>

      {/* ══ Leyenda del mapa (escritorio) ══ */}
      <div className="fixed bottom-4 left-3 md:bottom-6 md:left-4 z-40 hidden md:block">
        <MapLegend />
      </div>

      {/* ══ Panel de Piso del Edificio ══ */}
      {selectedBuilding && !showWayfinding && (
        <div className="fixed top-16 right-3 md:top-20 md:right-4 z-40 w-72 md:w-80">
          <FloorExplorer
            building={selectedBuilding}
            selectedFloor={selectedFloor}
            onSelectFloor={setSelectedFloor}
            onClose={handleCloseFloorExplorer}
            onNavigate={handleNavigateFromFloor}
          />
        </div>
      )}

      {/* ══ Panel de Wayfinding / Cómo Llegar ══ */}
      {showWayfinding && selectedBuilding && (
        <div className="fixed top-16 right-3 md:top-20 md:right-4 z-40 w-72 md:w-80">
          <WayfindingPanel
            from={wayfindingOrigin}
            to={selectedBuilding}
            onClose={handleCloseWayfinding}
            onSetOrigin={handleSetWayfindingOrigin}
          />
        </div>
      )}

      {/* ══ Tooltip de ayuda inicial ══ */}
      {showHelp && !selectedBuilding && (
        <div className="fixed bottom-4 right-3 md:bottom-6 md:right-4 z-40 max-w-xs">
          <div className="bg-[#0d1e3d]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e9db0] hover:text-[#f6f2eb] transition-all"
            >
              <X size={12} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-[#d4a343]" />
              <span className="text-xs font-bold text-[#f6f2eb]">Mapa Interactivo 3D</span>
            </div>
            <p className="text-[10px] text-[#8e9db0] leading-relaxed pr-4">
              <strong className="text-[#f6f2eb]">Haz clic</strong> en cualquier edificio para ver sus pisos y
              salones. Usa la <strong className="text-[#d4a343]">búsqueda</strong> arriba para encontrar tu
              salón rápidamente. <strong className="text-[#f6f2eb]"> Arrastra</strong> para rotar y{' '}
              <strong className="text-[#f6f2eb]">usa la rueda</strong> para acercar.
            </p>
          </div>
        </div>
      )}

      {/* ══ Botón de ayuda en móvil ══ */}
      <div className="fixed bottom-4 left-3 md:hidden z-40">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 rounded-xl bg-[#0d1e3d]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#d4a343] shadow-xl"
        >
          <Info size={16} />
        </button>
      </div>
    </main>
  );
}
