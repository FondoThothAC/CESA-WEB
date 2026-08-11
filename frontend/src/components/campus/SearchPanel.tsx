'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { Building, searchBuildings, searchRooms } from '@/lib/campusData';

interface SearchPanelProps {
  onSelectBuilding: (building: Building) => void;
  onSelectRoom: (building: Building, roomCode: string) => void;
}

export default function SearchPanel({ onSelectBuilding, onSelectRoom }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const buildingResults = useMemo(() => searchBuildings(query), [query]);
  const roomResults = useMemo(() => searchRooms(query), [query]);

  const hasResults = buildingResults.length > 0 || roomResults.length > 0;

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d1e3d]/90 backdrop-blur-md border border-white/10 shadow-xl focus-within:border-[#d4a343]/50 transition-all">
        <Search size={18} className="text-[#8e9db0] flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar edificio, salón o departamento..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent text-[#f6f2eb] placeholder:text-[#8e9db0] outline-none text-sm font-medium"
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="text-[#8e9db0] hover:text-[#f6f2eb] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1e3d]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {buildingResults.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8e9db0]">Edificios</div>
              {buildingResults.slice(0, 5).map((b) => (
                <button
                  key={b.id}
                  onClick={() => { onSelectBuilding(b); setIsOpen(false); setQuery(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#d4a343]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-[#d4a343]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#f6f2eb]">{b.id}: {b.name}</div>
                    <div className="text-xs text-[#8e9db0]">{b.floors} pisos • {b.departments[0]}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {roomResults.length > 0 && (
            <div className="p-2 border-t border-white/5">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8e9db0]">Salones</div>
              {roomResults.slice(0, 8).map((r) => (
                <button
                  key={r.room.code}
                  onClick={() => { onSelectRoom(r.building, r.room.code); setIsOpen(false); setQuery(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#3b82f6]">P{r.room.floor}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#f6f2eb]">{r.room.code}</div>
                    <div className="text-xs text-[#8e9db0]">{r.room.name} • {r.building.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && query && !hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1e3d]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 text-center z-50">
          <div className="text-[#8e9db0] text-sm">No se encontraron resultados para &quot;{query}&quot;</div>
        </div>
      )}
    </div>
  );
}
