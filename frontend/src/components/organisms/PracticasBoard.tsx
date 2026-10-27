'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { downloadDocumento } from '@/lib/downloadDoc';

interface Proyecto {
  id: number;
  nombre_programa: string;
  razon_social: string;
  licenciatura_target: string;
  areas_departamento: string;
  num_practicantes: number;
  postulaciones_activas: number;
  aceptados_count: number;
  estado: string;
  tipo_programa: string;
  perfil_deseado: string;
  objetivo: string;
  justificacion: string;
  plan_trabajo: string;
  responsable_nombre: string;
  responsable_puesto: string;
  responsable_email: string;
  giro_sector: string;
  ciudad: string;
  programa: string;
  ya_postulado: number | null;
  mi_estado: string | null;
}

interface Area {
  id: number;
  division: string;
  programa: string;
}

export default function PracticasBoard() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaFilter, setAreaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selected, setSelected] = useState<Proyecto | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=areas`);
      const data = await res.json();
      if (data.success) setAreas(data.areas);
    } catch (e) { console.error(e); }
  };

  const fetchProyectos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'proyectos' });
      if (areaFilter) params.append('area_id', areaFilter);
      if (tipoFilter) params.append('tipo', tipoFilter);
      const res = await fetch(`${API_URL}/practicas.php?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) setProyectos(data.proyectos || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAreas(); }, []);
  useEffect(() => { fetchProyectos(); }, [areaFilter, tipoFilter, token]);

  const handlePostular = async () => {
    if (!selected) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=postular`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyecto_id: selected.id, mensaje })
      });
      const data = await res.json();
      alert(data.success ? data.message : (data.error || 'Error al postular'));
      if (data.success) {
        setSelected(null);
        setMensaje('');
        fetchProyectos();
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setPosting(false);
    }
  };

  const TIPO_LABELS: Record<string, string> = {
    'practicas_profesionales': 'Prácticas Profesionales',
    'servicio_social': 'Servicio Social'
  };

  const cardCls = "bg-bg-card border border-border rounded-[2rem] hover:border-primary/40 transition-all flex flex-col";
  const chipBase = "px-3 py-1 rounded-full text-[9px] font-black uppercase border";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter">Servicio Social y Prácticas Profesionales</h3>
          <p className="text-text-muted text-xs mt-1">Convenios UNISON • Explora los proyectos y postúlate (requiere iniciar sesión)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
            className="bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-text-main">
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.programa}</option>)}
          </select>
          <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}
            className="bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-text-main">
            <option value="">Ambos tipos</option>
            <option value="practicas_profesionales">Prácticas Profesionales</option>
            <option value="servicio_social">Servicio Social</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-text-main text-center py-10 font-bold">Cargando proyectos...</div>
      ) : proyectos.length === 0 ? (
        <div className={cardCls + " p-10 text-center"}>
          <h4 className="text-text-main font-bold text-lg mb-2">No hay proyectos disponibles</h4>
          <p className="text-text-muted text-sm">Las unidades receptoras están registrando sus proyectos. Revisa pronto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proyectos.map(p => {
            const isExpanded = expanded === p.id;
            return (
              <div key={p.id} className={cardCls}>
                <div className="p-6 pb-0 flex justify-between items-start gap-2">
                  <span className={`${chipBase} ${
                    p.tipo_programa === 'servicio_social'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30'
                  }`}>
                    {TIPO_LABELS[p.tipo_programa] || p.tipo_programa}
                  </span>
                  {p.estado === 'cupo_lleno' && (
                    <span className={`${chipBase} bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30`}>
                      Cupo lleno
                    </span>
                  )}
                </div>

                <div className="p-6 pt-3 flex flex-col flex-1">
                  <h4 className="text-text-main font-black text-base leading-tight mb-1">{p.nombre_programa}</h4>
                  <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">{p.razon_social}</p>
                  {p.licenciatura_target && (
                    <p className="text-text-muted text-[11px] mb-2">🎯 {p.licenciatura_target}</p>
                  )}

                  {/* Resumen corto (siempre visible) */}
                  {p.objetivo && !isExpanded && (
                    <p className="text-text-muted text-xs leading-relaxed line-clamp-2 mb-3">{p.objetivo}</p>
                  )}

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="space-y-3 mb-4 text-xs">
                      {p.giro_sector && (
                        <div>
                          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Giro / Sector</p>
                          <p className="text-text-main">{p.giro_sector}</p>
                        </div>
                      )}
                      {p.areas_departamento && (
                        <div>
                          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Área / Departamento</p>
                          <p className="text-text-main">{p.areas_departamento}</p>
                        </div>
                      )}
                      {p.perfil_deseado && (
                        <div>
                          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Perfil deseado</p>
                          <ul className="list-disc list-inside text-text-main space-y-0.5">
                            {p.perfil_deseado.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                          </ul>
                        </div>
                      )}
                      {p.justificacion && (
                        <div>
                          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Justificación</p>
                          <p className="text-text-main leading-relaxed">{p.justificacion}</p>
                        </div>
                      )}
                      {p.objetivo && (
                        <div>
                          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Objetivo</p>
                          <p className="text-text-main leading-relaxed">{p.objetivo}</p>
                        </div>
                      )}
                      {p.plan_trabajo && (
                        <div>
                          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Plan de trabajo</p>
                          <ul className="list-disc list-inside text-text-main space-y-0.5">
                            {p.plan_trabajo.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                          </ul>
                        </div>
                      )}
                      {(p.responsable_nombre || p.responsable_email) && (
                        <div>
                          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Responsable de la unidad</p>
                          <p className="text-text-main">{p.responsable_nombre} {p.responsable_puesto ? `— ${p.responsable_puesto}` : ''}</p>
                          {p.responsable_email && <p className="text-primary break-all">{p.responsable_email}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-text-muted font-bold uppercase mt-auto mb-4">
                    <span>👥 Cupo: {p.aceptados_count}/{p.num_practicantes}</span>
                    <span>📋 {p.postulaciones_activas} en fila</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Botón expandir/colapsar */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="w-full border border-border hover:bg-primary/5 px-4 py-2 rounded-xl text-text-main font-bold text-[10px] uppercase tracking-widest transition-all">
                      {isExpanded ? '▲ Ver menos' : '▼ Ver más detalles'}
                    </button>

                    {p.ya_postulado ? (
                      <div className="bg-primary/5 border border-border rounded-xl p-3 text-center">
                        <span className={`text-[11px] font-black uppercase ${
                          p.mi_estado === 'aceptado' ? 'text-emerald-600 dark:text-emerald-400' :
                          p.mi_estado === 'rechazado' ? 'text-red-600 dark:text-red-400' :
                          p.mi_estado === 'lista_espera' ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
                        }`}>
                          Ya postulado: {p.mi_estado === 'aceptado' ? '¡Aceptado! Descarga tu FP2 en Mis Postulaciones' : p.mi_estado}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => user ? setSelected(p) : window.location.href = '/login'}
                        disabled={p.estado !== 'aprobado'}
                        className="w-full bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all">
                        {p.estado === 'cupo_lleno' ? 'Cupo lleno' : (user ? 'Postularme' : 'Inicia sesión para postularte')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal postulación */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border rounded-[2.5rem] p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <h4 className="text-xl font-black text-text-main uppercase tracking-tight">Postularme: {selected.nombre_programa}</h4>
            <p className="text-text-muted text-xs">
              Al postularte entras a la <strong className="text-text-main">fila de espera</strong>. La unidad receptora entrevistará
              a los candidatos y aceptará hasta {selected.num_practicantes} practicante(s). Si el cupo se llena
              recibirás una notificación.
            </p>
            <textarea
              placeholder="Mensaje para la unidad receptora (opcional): por qué te interesa el proyecto..."
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-sm text-text-main h-28"
            />
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 border border-border rounded-xl py-3 text-text-main font-bold text-xs uppercase">Cancelar</button>
              <button onClick={handlePostular} disabled={posting} className="flex-1 bg-primary hover:opacity-90 rounded-xl py-3 text-white font-black text-xs uppercase disabled:opacity-50">
                {posting ? 'Enviando...' : 'Enviar postulación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
