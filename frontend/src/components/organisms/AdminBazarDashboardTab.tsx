'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import BazarSchematicMap from '../BazarSchematicMap';

interface SpotData {
  puesto_id: number;
  zona: string;
  coord_x: number;
  coord_y: number;
  disponible: number;
  activo: number;
  emprendimiento_id: number | null;
  nombre_negocio: string | null;
  categoria: string | null;
  descripcion: string | null;
  instagram: string | null;
  whatsapp: string | null;
  responsable: string | null;
  matricula: string | null;
}

interface AdConfig {
  activo: boolean;
  publisher_id: string;
  banner_slot_id: string;
  interstitial_slot_id: string;
  frecuencia_diaria: number;
}

interface BazarLog {
  id: number;
  usuario_id: number;
  accion: string;
  descripcion: string;
  ip_address: string;
  created_at: string;
  usuario_nombre: string | null;
  usuario_email: string | null;
  matricula: string | null;
}

export default function AdminBazarDashboardTab() {
  const { token, user } = useAuth();
  const isMaster = user?.email === 'software@fondothoth.com' || user?.email === 'a213203453@unison.mx';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Estados de Publicidad (Ads)
  const [adConfig, setAdConfig] = useState<AdConfig>({
    activo: true,
    publisher_id: 'ca-pub-3940256099942544',
    banner_slot_id: '6300978111',
    interstitial_slot_id: '1033173712',
    frecuencia_diaria: 2
  });
  const [adLoading, setAdLoading] = useState(true);
  const [adSaving, setAdSaving] = useState(false);
  const [adMessage, setAdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados de Bazar & Lugares
  const [puestosData, setPuestosData] = useState<SpotData[]>([]);
  const [bazarStats, setBazarStats] = useState({
    total_puestos: 72,
    ocupados: 0,
    libres: 72,
    porcentaje_ocupacion: 0
  });
  const [edicionActiva, setEdicionActiva] = useState<any>(null);
  const [loadingPuestos, setLoadingPuestos] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [filterZona, setFilterZona] = useState<string>('todas');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'ocupados' | 'libres'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Ediciones y Plantillas de Mapa
  const [edicionesList, setEdicionesList] = useState<any[]>([]);
  const [selectedEdicionId, setSelectedEdicionId] = useState<number | null>(null);
  const [mapTypeOverride, setMapTypeOverride] = useState<'radial_base' | 'doble_pasillo' | 'exterior_perimetral' | null>(null);
  const [showNewEditionModal, setShowNewEditionModal] = useState(false);
  const [newEditionForm, setNewEditionForm] = useState({
    nombre: '',
    mapa_tipo: 'radial_base',
    fecha_inicio: dateToYMD(new Date()),
    fecha_fin: dateToYMD(new Date(Date.now() + 3 * 86400000))
  });

  function dateToYMD(d: Date) {
    return d.toISOString().split('T')[0];
  }

  // Modales y Auditoría
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [assigningPuestoId, setAssigningPuestoId] = useState<number | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [bazarLogs, setBazarLogs] = useState<BazarLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 1. Cargar Configuración de Publicidad
  const fetchAdConfig = async () => {
    setAdLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/publicidad.php`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAdConfig({
          activo: Boolean(data.data.activo),
          publisher_id: data.data.publisher_id || 'ca-pub-3940256099942544',
          banner_slot_id: data.data.banner_slot_id || '6300978111',
          interstitial_slot_id: data.data.interstitial_slot_id || '1033173712',
          frecuencia_diaria: Number(data.data.frecuencia_diaria) || 2
        });
      }
    } catch (e) {
      console.error('Error al obtener configuración de publicidad:', e);
    } finally {
      setAdLoading(false);
    }
  };

  // 2. Guardar Configuración de Publicidad
  const handleSaveAdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdSaving(true);
    setAdMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/publicidad.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(adConfig)
      });
      const data = await res.json();
      if (data.success) {
        setAdMessage({ type: 'success', text: '¡Configuración de Publicidad guardada con éxito!' });
      } else {
        setAdMessage({ type: 'error', text: data.error || 'Error al guardar la publicidad.' });
      }
    } catch (e: any) {
      setAdMessage({ type: 'error', text: e.message || 'Error de conexión.' });
    } finally {
      setAdSaving(false);
    }
  };

  // 3. Cargar Lugares y Puestos del Bazar (por edición activa o seleccionada del historial)
  const fetchPuestos = async (edId?: number | null) => {
    setLoadingPuestos(true);
    try {
      const targetId = edId !== undefined ? edId : selectedEdicionId;
      const url = targetId 
        ? `${API_URL}/api/bazar-admin.php?action=puestos_status&edicion_id=${targetId}`
        : `${API_URL}/api/bazar-admin.php?action=puestos_status`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setPuestosData(data.puestos || []);
        setBazarStats(data.stats || { total_puestos: 72, ocupados: 0, libres: 72, porcentaje_ocupacion: 0 });
        setEdicionActiva(data.edicion || null);
      }
    } catch (e) {
      console.error('Error al obtener lugares del bazar:', e);
    } finally {
      setLoadingPuestos(false);
    }
  };

  // 3b. Cargar Lista de Ediciones (Histórico & Activas)
  const fetchEdiciones = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bazar-admin.php?action=ediciones_list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setEdicionesList(data.ediciones || []);
      }
    } catch (e) {}
  };

  // Crear Nueva Edición con Plantilla de Mapa elegida
  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('action', 'crear_edicion');
      fd.append('nombre', newEditionForm.nombre);
      fd.append('mapa_tipo', newEditionForm.mapa_tipo);
      fd.append('fecha_inicio', newEditionForm.fecha_inicio);
      fd.append('fecha_fin', newEditionForm.fecha_fin);

      const res = await fetch(`${API_URL}/api/bazar-admin.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Nueva Edición activada correctamente con el mapa elegido!');
        setShowNewEditionModal(false);
        setSelectedEdicionId(data.id);
        fetchEdiciones();
        fetchPuestos(data.id);
      } else {
        alert(data.error || 'Error al activar edición');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  // Archivar Edición Activa
  const handleArchiveEdition = async (edId: number) => {
    if (!confirm('¿Seguro que deseas cerrar y archivar esta edición? Quedará congelada en el historial permanente y los datos no se perderán.')) return;
    try {
      const fd = new FormData();
      fd.append('action', 'archivar_edicion');
      fd.append('edicion_id', String(edId));

      const res = await fetch(`${API_URL}/api/bazar-admin.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert('Edición congelada y guardada en el Historial Permanente.');
        fetchEdiciones();
        fetchPuestos();
      }
    } catch (e) {}
  };

  // 4. Cargar Emprendimientos Registrados
  const fetchBusinesses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bazar-admin.php?action=listar`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setAllBusinesses(data.data || []);
      }
    } catch (e) {
      console.error('Error al obtener lista de negocios:', e);
    }
  };

  // 5. Cargar Logs de Auditoría
  const fetchBazarLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_URL}/api/bazar-admin.php?action=logs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setBazarLogs(data.data || []);
      }
    } catch (e) {
      console.error('Error al cargar logs de auditoría:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAdConfig();
    fetchPuestos();
    fetchEdiciones();
    fetchBusinesses();
    fetchBazarLogs();
  }, [token]);

  // 6. Asignar puesto
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningPuestoId || !selectedBusinessId) return;

    try {
      const formData = new FormData();
      formData.append('action', 'asignar_puesto');
      formData.append('id', selectedBusinessId);
      formData.append('puesto_id', assigningPuestoId.toString());

      const res = await fetch(`${API_URL}/api/bazar-admin.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAssigningPuestoId(null);
        setSelectedBusinessId('');
        fetchPuestos();
        fetchBusinesses();
        fetchBazarLogs();
      } else {
        alert(data.error || 'Error al asignar puesto');
      }
    } catch (e) {
      console.error('Error al asignar puesto:', e);
    }
  };

  // 7. Liberar puesto
  const handleFreePuesto = async (puestoId: number) => {
    if (!confirm(`¿Estás seguro de liberar el Puesto #${puestoId}?`)) return;

    try {
      const formData = new FormData();
      formData.append('action', 'liberar_puesto');
      formData.append('puesto_id', puestoId.toString());

      const res = await fetch(`${API_URL}/api/bazar-admin.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        fetchPuestos();
        fetchBusinesses();
        fetchBazarLogs();
      } else {
        alert(data.error || 'Error al liberar puesto');
      }
    } catch (e) {
      console.error('Error al liberar puesto:', e);
    }
  };

  // Adaptación de puestos y locaciones para BazarSchematicMap
  const formattedPuestos = puestosData.map((p) => ({
    id: p.puesto_id,
    zona: p.zona,
    coord_x: p.coord_x,
    coord_y: p.coord_y,
    disponible: p.emprendimiento_id ? 0 : 1,
    activo: p.activo
  }));

  const occupiedLocations = puestosData
    .filter((p) => p.emprendimiento_id !== null)
    .map((p) => ({
      id: p.emprendimiento_id,
      puesto_id: p.puesto_id,
      nombre_negocio: p.nombre_negocio,
      categoria: p.categoria,
      descripcion: p.descripcion,
      instagram: p.instagram,
      whatsapp: p.whatsapp
    }));

  // Filtrado de la tabla de puestos
  const filteredPuestos = puestosData.filter((p) => {
    if (filterZona !== 'todas' && p.zona.toLowerCase() !== filterZona.toLowerCase()) {
      return false;
    }
    if (filterEstado === 'ocupados' && !p.emprendimiento_id) return false;
    if (filterEstado === 'libres' && p.emprendimiento_id) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchPuesto = p.puesto_id.toString().includes(q);
      const matchNegocio = p.nombre_negocio?.toLowerCase().includes(q);
      const matchResponsable = p.responsable?.toLowerCase().includes(q);
      const matchMatricula = p.matricula?.toLowerCase().includes(q);
      const matchZona = p.zona?.toLowerCase().includes(q);
      return matchPuesto || matchNegocio || matchResponsable || matchMatricula || matchZona;
    }

    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏪</span>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                Dashboard de Bazar & Publicidad (Ads)
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Gestión en tiempo real de los 72 lugares de la Calle de la Cultura y Auditoría CESA
              </p>
            </div>
          </div>
        </div>

        {edicionActiva && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <p className="text-[9px] uppercase font-black text-emerald-400 tracking-widest">Edición Activa</p>
              <p className="text-xs font-black text-white">{edicionActiva.nombre}</p>
            </div>
          </div>
        )}
      </div>

      {/* TARJETAS DE KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Puestos Totales</p>
          <p className="text-3xl font-black text-white mt-2">{bazarStats.total_puestos}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Calle de la Cultura</p>
        </div>

        <div className="bg-slate-900/60 border border-amber-500/20 p-6 rounded-3xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Puestos Ocupados</p>
          <p className="text-3xl font-black text-amber-500 mt-2">{bazarStats.ocupados}</p>
          <p className="text-[10px] text-amber-400/70 font-bold uppercase mt-1">Negocios Asignados</p>
        </div>

        <div className="bg-slate-900/60 border border-emerald-500/20 p-6 rounded-3xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Puestos Libres</p>
          <p className="text-3xl font-black text-emerald-500 mt-2">{bazarStats.libres}</p>
          <p className="text-[10px] text-emerald-400/70 font-bold uppercase mt-1">Disponibles para reserva</p>
        </div>

        <div className="bg-slate-900/60 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">% Ocupación</p>
          <p className="text-3xl font-black text-indigo-400 mt-2">{bazarStats.porcentaje_ocupacion}%</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-700"
              style={{ width: `${bazarStats.porcentaje_ocupacion}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: CONFIGURACIÓN DE PUBLICIDAD (ADS) - EXCLUSIVO MASTER ADMIN */}
      {isMaster && (
        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-amber-500/20 backdrop-blur-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">
                  Configuración de Publicidad (Google AdMob / AdSense)
                </h4>
                <p className="text-xs text-slate-400">Control global de banners en Bazar y anuncios interstitial en simuladores</p>
              </div>
            </div>
            <span
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                adConfig.activo
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-red-500/20 border-red-500 text-red-400'
              }`}
            >
              {adConfig.activo ? '● ADS ACTIVOS' : '○ ADS INACTIVOS'}
            </span>
          </div>

          {adMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-wider ${
                adMessage.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                  : 'bg-red-500/20 border border-red-500 text-red-300'
              }`}
            >
              {adMessage.text}
            </div>
          )}

          {adLoading ? (
            <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest">
              Cargando configuración de anuncios...
            </div>
          ) : (
            <form onSubmit={handleSaveAdConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Switch Activar */}
              <div className="md:col-span-2 flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-black text-white uppercase">Estado General de Publicidad</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Al desactivar, no se renderizará ningún anuncio en el sitio web ni app</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdConfig({ ...adConfig, activo: !adConfig.activo })}
                  className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                    adConfig.activo ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                      adConfig.activo ? 'right-1' : 'left-1'
                    }`}
                  ></span>
                </button>
              </div>

              {/* Publisher ID */}
              <div>
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-2">
                  Publisher ID (AdMob / AdSense)
                </label>
                <input
                  type="text"
                  value={adConfig.publisher_id}
                  onChange={(e) => setAdConfig({ ...adConfig, publisher_id: e.target.value })}
                  placeholder="ca-pub-3940256099942544"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* Banner Slot ID */}
              <div>
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-2">
                  Banner Ad Slot ID (Bazar)
                </label>
                <input
                  type="text"
                  value={adConfig.banner_slot_id}
                  onChange={(e) => setAdConfig({ ...adConfig, banner_slot_id: e.target.value })}
                  placeholder="6300978111"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* Interstitial Slot ID */}
              <div>
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-2">
                  Interstitial Slot ID (Pantalla Completa Examen)
                </label>
                <input
                  type="text"
                  value={adConfig.interstitial_slot_id}
                  onChange={(e) => setAdConfig({ ...adConfig, interstitial_slot_id: e.target.value })}
                  placeholder="1033173712"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* Frecuencia Diaria */}
              <div>
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-2">
                  Frecuencia Máxima Diaria por Usuario
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={adConfig.frecuencia_diaria}
                  onChange={(e) => setAdConfig({ ...adConfig, frecuencia_diaria: Number(e.target.value) || 2 })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={adSaving}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {adSaving ? 'Guardando Publicidad...' : 'Guardar Cambios de Publicidad'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* SECCIÓN 2: MAPA ESQUEMÁTICO EN VIVO CON PLANTILLAS Y HISTORIAL */}
      <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>📍</span> Mapa Interactivo de Puestos (Calle de la Cultura)
              {edicionActiva?.estado === 'archivada' && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-mono font-black">
                  🔒 ARCHIVADA
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">
              Plantilla de Mapa: <strong className="text-blue-400 uppercase font-mono">{edicionActiva?.mapa_tipo || 'radial_base'}</strong>
              {edicionActiva?.fecha_inicio && ` • Fechas: ${edicionActiva.fecha_inicio} al ${edicionActiva.fecha_fin}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Conmutador de Plantilla de Mapa en Vivo */}
            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setMapTypeOverride('radial_base')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  (mapTypeOverride || edicionActiva?.mapa_tipo || 'radial_base') === 'radial_base'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Radial Base
              </button>
              <button
                type="button"
                onClick={() => setMapTypeOverride('doble_pasillo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  (mapTypeOverride || edicionActiva?.mapa_tipo) === 'doble_pasillo'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Doble Pasillo
              </button>
              <button
                type="button"
                onClick={() => setMapTypeOverride('exterior_perimetral')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  (mapTypeOverride || edicionActiva?.mapa_tipo) === 'exterior_perimetral'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Exterior Perimetral
              </button>
            </div>

            {/* Selector de Historial de Ediciones */}
            <select
              value={selectedEdicionId || edicionActiva?.id || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setSelectedEdicionId(val);
                fetchPuestos(val);
              }}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-bold"
            >
              <option value="">-- Edición 12 de Agosto de 2026 --</option>
              {edicionesList.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.nombre} ({ed.estado === 'archivada' ? 'Archivada' : 'Activa'})
                </option>
              ))}
            </select>

            {/* Acciones de Edición */}
            {edicionActiva?.estado === 'activa' && (
              <button
                onClick={() => handleArchiveEdition(edicionActiva.id)}
                className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl border border-amber-600/30 transition-colors"
              >
                🔒 Cerrar & Archivar Edición
              </button>
            )}

            <button
              onClick={() => {
                setNewEditionForm({
                  nombre: `Bazar CESA Edición ${new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' })}`,
                  mapa_tipo: 'radial_base',
                  fecha_inicio: dateToYMD(new Date()),
                  fecha_fin: dateToYMD(new Date(Date.now() + 3 * 86400000))
                });
                setShowNewEditionModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              + Crear Nueva Edición del Bazar
            </button>
          </div>
        </div>

        {loadingPuestos ? (
          <div className="text-center py-16 text-slate-500 text-xs font-bold uppercase tracking-widest">
            Cargando puestos del mapa...
          </div>
        ) : (
          <BazarSchematicMap
            puestos={formattedPuestos}
            locations={occupiedLocations}
            mapType={mapTypeOverride || edicionActiva?.mapa_tipo || 'radial_base'}
            isArchived={edicionActiva?.estado === 'archivada'}
            editionTitle={edicionActiva?.nombre}
            onSelectSpot={(puesto) => {
              const full = puestosData.find((p) => p.puesto_id === puesto.id);
              if (full) setSelectedSpot(full);
            }}
          />
        )}
      </div>

      {/* MODAL CREAR NUEVA EDICIÓN CON PLANTILLA DE MAPA */}
      {showNewEditionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateEdition} className="bg-[#111625] border border-amber-500/30 p-6 rounded-3xl w-full max-w-lg space-y-4">
            <h3 className="text-lg font-black uppercase text-white border-b border-white/10 pb-3">
              Crear Nueva Edición del Bazar
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nombre de la Edición</label>
                <input
                  required
                  type="text"
                  value={newEditionForm.nombre}
                  onChange={(e) => setNewEditionForm({ ...newEditionForm, nombre: e.target.value })}
                  placeholder="ej. Edición Día del Estudiante - Septiembre 2026"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Plantilla de Mapa Geométrico</label>
                <select
                  value={newEditionForm.mapa_tipo}
                  onChange={(e) => setNewEditionForm({ ...newEditionForm, mapa_tipo: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none font-bold"
                >
                  <option value="radial_base">📍 Mapa 1: Base Radial (72 puestos en cruz/diagonal)</option>
                  <option value="doble_pasillo">📍 Mapa 2: Doble Pasillo Ancho (112 puestos a ambos lados)</option>
                  <option value="exterior_perimetral">📍 Mapa 3: Exterior Perimetral (176 puestos con pasillo exterior)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Fecha Inicio</label>
                  <input
                    required
                    type="date"
                    value={newEditionForm.fecha_inicio}
                    onChange={(e) => setNewEditionForm({ ...newEditionForm, fecha_inicio: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Fecha Cierre / Fin</label>
                  <input
                    required
                    type="date"
                    value={newEditionForm.fecha_fin}
                    onChange={(e) => setNewEditionForm({ ...newEditionForm, fecha_fin: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowNewEditionModal(false)}
                className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-5 py-2 rounded-xl shadow-lg shadow-amber-500/20"
              >
                Activar Edición & Mapa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECCIÓN 3: TABLA DETALLADA DE LUGARES & PUESTOS */}
      <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>📋</span> Lista y Administración de Lugares
            </h4>
            <p className="text-xs text-slate-400">Asigna, reubica o libera los espacios físicos del bazar</p>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador */}
            <input
              type="text"
              placeholder="Buscar por puesto, negocio o alumno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-amber-500 outline-none w-56"
            />

            {/* Filtro Zona */}
            <select
              value={filterZona}
              onChange={(e) => setFilterZona(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
            >
              <option value="todas">Todas las Zonas</option>
              <option value="norte">Norte</option>
              <option value="sur">Sur</option>
              <option value="este">Este</option>
              <option value="oeste">Oeste</option>
              <option value="noreste">Noreste</option>
              <option value="noroeste">Noroeste</option>
              <option value="sureste">Sureste</option>
              <option value="suroeste">Suroeste</option>
            </select>

            {/* Filtro Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
            >
              <option value="todos">Todos los Estados</option>
              <option value="ocupados">Ocupados</option>
              <option value="libres">Libres</option>
            </select>
          </div>
        </div>

        {/* TABLA DE PUESTOS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-400">
                <th className="py-4 px-4 font-black">Puesto #</th>
                <th className="py-4 px-4 font-black">Zona</th>
                <th className="py-4 px-4 font-black">Estado</th>
                <th className="py-4 px-4 font-black">Emprendimiento Asignado</th>
                <th className="py-4 px-4 font-black">Responsable</th>
                <th className="py-4 px-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
              {filteredPuestos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 uppercase text-xs font-bold">
                    No se encontraron puestos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filteredPuestos.map((p) => (
                  <tr key={p.puesto_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-white">#{p.puesto_id}</td>
                    <td className="py-4 px-4 uppercase font-bold text-[10px] text-slate-400">{p.zona}</td>
                    <td className="py-4 px-4">
                      {p.emprendimiento_id ? (
                        <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                          Ocupado
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                          Libre
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {p.nombre_negocio ? (
                        <div>
                          <p>{p.nombre_negocio}</p>
                          <p className="text-[10px] text-slate-500 font-normal">{p.categoria}</p>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {p.responsable ? (
                        <div>
                          <p className="text-slate-200">{p.responsable}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.matricula}</p>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {p.emprendimiento_id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setAssigningPuestoId(p.puesto_id)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            Reubicar
                          </button>
                          <button
                            onClick={() => handleFreePuesto(p.puesto_id)}
                            className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            Liberar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningPuestoId(p.puesto_id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                        >
                          Asignar Negocio
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 4: AUDITORÍA DE CAMBIOS (IP, FECHA, HORA Y USUARIOS) */}
      <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>🔒</span> Auditoría de Modificaciones de Puestos
            </h4>
            <p className="text-xs text-slate-400">
              Registro histórico con marca de tiempo, dirección IP y usuario responsable
            </p>
          </div>
          <button
            onClick={fetchBazarLogs}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
          >
            Actualizar Logs
          </button>
        </div>

        {loadingLogs ? (
          <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest">
            Cargando auditoría...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-400">
                  <th className="py-3 px-4 font-black">Fecha y Hora</th>
                  <th className="py-3 px-4 font-black">Usuario Admin</th>
                  <th className="py-3 px-4 font-black">Acción</th>
                  <th className="py-3 px-4 font-black">Detalle</th>
                  <th className="py-3 px-4 font-black font-mono">Dirección IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {bazarLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 uppercase text-xs font-bold">
                      No hay registros de auditoría de puestos recientes
                    </td>
                  </tr>
                ) : (
                  bazarLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{log.usuario_nombre || 'Admin'}</div>
                        <div className="text-[9px] text-slate-500 font-mono">{log.usuario_email || log.matricula || ''}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] uppercase font-black text-amber-400">
                        {log.accion}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">
                        {log.descripcion}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-indigo-400">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE ASIGNACIÓN DE PUESTO */}
      {assigningPuestoId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="text-base font-black text-white uppercase">
                Asignar Negocio al Puesto #{assigningPuestoId}
              </h4>
              <button
                onClick={() => {
                  setAssigningPuestoId(null);
                  setSelectedBusinessId('');
                }}
                className="text-slate-400 hover:text-white font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                  Seleccionar Emprendimiento
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="">-- Elige un negocio registrado --</option>
                  {allBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre_negocio} ({b.emprendedor} - {b.categoria})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAssigningPuestoId(null);
                    setSelectedBusinessId('');
                  }}
                  className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DEL PUESTO SELECCIONADO DESDE EL MAPA */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Detalles del Lugar</span>
                <h4 className="text-xl font-black text-white uppercase">Puesto #{selectedSpot.puesto_id}</h4>
              </div>
              <button onClick={() => setSelectedSpot(null)} className="text-slate-400 hover:text-white font-bold text-xl">
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 font-bold uppercase">Zona Calle de la Cultura:</span>
                <span className="text-white font-mono font-black uppercase">{selectedSpot.zona}</span>
              </div>

              <div className="flex justify-between bg-black/40 p-3 rounded-xl">
                <span className="text-slate-400 font-bold uppercase">Estado:</span>
                {selectedSpot.emprendimiento_id ? (
                  <span className="text-amber-400 font-black uppercase">Ocupado</span>
                ) : (
                  <span className="text-emerald-400 font-black uppercase">Libre</span>
                )}
              </div>

              {selectedSpot.emprendimiento_id ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Emprendimiento Asignado</p>
                  <p className="text-base font-black text-white">{selectedSpot.nombre_negocio}</p>
                  <p className="text-slate-300">{selectedSpot.descripcion}</p>
                  <div className="pt-2 border-t border-amber-500/10 flex justify-between text-[10px] text-slate-400">
                    <span>Responsable: <strong className="text-white">{selectedSpot.responsable}</strong></span>
                    <span>Matrícula: <strong className="text-white">{selectedSpot.matricula}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                  <p className="text-xs text-emerald-400 font-bold uppercase">Este espacio está libre y listo para asignarse.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {selectedSpot.emprendimiento_id && (
                <button
                  onClick={() => {
                    const pid = selectedSpot.puesto_id;
                    setSelectedSpot(null);
                    handleFreePuesto(pid);
                  }}
                  className="bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white border border-red-500/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase"
                >
                  Liberar Puesto
                </button>
              )}
              <button
                onClick={() => {
                  const pid = selectedSpot.puesto_id;
                  setSelectedSpot(null);
                  setAssigningPuestoId(pid);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20"
              >
                {selectedSpot.emprendimiento_id ? 'Reubicar Negocio' : 'Asignar Negocio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
