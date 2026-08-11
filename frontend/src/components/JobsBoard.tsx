'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

interface Vacante {
  id: number;
  empresa_nombre: string;
  titulo: string;
  descripcion: string;
  modalidad: 'presencial' | 'remoto' | 'hibrido';
  tipo: 'tiempo_completo' | 'medio_tiempo' | 'practicas';
  sueldo_rango: string;
  carreras_target: string;
  verificada: number;
  postulaciones_count: number;
  ya_postulado: number | null;
  match_score?: number;
  created_at: string;
  enlace_externo?: string;
  contacto?: string;
}

const MODALIDAD_COLORS: Record<string, string> = {
  presencial: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  remoto:     'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  hibrido:    'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

const TIPO_LABELS: Record<string, string> = {
  tiempo_completo: 'Tiempo Completo',
  medio_tiempo:    'Medio Tiempo',
  practicas:       'Prácticas',
};

const JobsBoard = () => {
  const [vacantes, setVacantes]         = useState<Vacante[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('todas');
  const [tipoFilter, setTipoFilter]     = useState('');
  const [applyingId, setApplyingId]     = useState<number | null>(null);
  const [applyMsg, setApplyMsg]         = useState('');
  const [showApplyModal, setShowApplyModal] = useState<Vacante | null>(null);
  const [showPublish, setShowPublish]   = useState(false);
  const [publishing, setPublishing]     = useState(false);
  const [newVacante, setNewVacante]     = useState<any>({
    empresa_nombre: '', titulo: '', descripcion: '',
    modalidad: 'presencial', tipo: 'tiempo_completo',
    sueldo_rango: '', carreras_target: 'todas', skill_id: ''
  });
  const [expandedJobs, setExpandedJobs] = useState<Record<number, boolean>>({});

  const toggleExpandJob = (id: number) => {
    setExpandedJobs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { user, token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const isAdmin = user && (user.rol === 'admin' || user.rol === 'mesa_directiva' || user.rol === 'coordinador_impulso');

  useEffect(() => {
    fetchJobs();
  }, [filter, tipoFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'listar', modalidad: filter });
      if (tipoFilter) params.append('tipo', tipoFilter);
      const res = await fetch(`${API_URL}/empleos.php?${params}`);
      const data = await res.json();
      if (data.success) setVacantes(data.vacantes);
    } catch (e) { console.error('Error empleos', e); }
    finally { setLoading(false); }
  };

  const handleApply = async () => {
    if (!showApplyModal || !token) return;
    setApplyingId(showApplyModal.id);
    try {
      const res = await fetch(`${API_URL}/empleos.php?action=postular`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacante_id: showApplyModal.id, mensaje: applyMsg })
      });
      const data = await res.json();
      if (data.success) {
        setShowApplyModal(null);
        setApplyMsg('');
        fetchJobs();
      } else {
        alert(data.error);
      }
    } catch (e) { alert('Error de conexión'); }
    finally { setApplyingId(null); }
  };

  const handlePublish = async () => {
    if (!token) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/empleos.php?action=publicar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newVacante)
      });
      const data = await res.json();
      if (data.success) {
        setShowPublish(false);
        setNewVacante({ empresa_nombre: '', titulo: '', descripcion: '', modalidad: 'presencial', tipo: 'tiempo_completo', sueldo_rango: '', carreras_target: 'todas' });
        fetchJobs();
      } else {
        alert(data.error);
      }
    } catch (e) { alert('Error al publicar'); }
    finally { setPublishing(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 space-y-10">

      {/* Header Toolbar */}
      <div className="bg-slate-900/60 border border-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['todas', 'presencial', 'remoto', 'hibrido'].map((mod) => (
            <button key={mod}
              onClick={() => setFilter(mod)}
              className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                filter === mod ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
              }`}
            >{mod}</button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="bg-black/40 border border-white/10 text-[9px] font-black uppercase text-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="tiempo_completo">Tiempo Completo</option>
            <option value="medio_tiempo">Medio Tiempo</option>
            <option value="practicas">Prácticas</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => setShowPublish(true)}
              className="bg-indigo-600 hover:bg-white hover:text-black text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <i className="fas fa-plus-circle"></i> Publicar Vacante
            </button>
          )}
        </div>
      </div>

      {/* Banner Banco de Talento Sonorense 2026 */}
      <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 backdrop-blur-xl p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Convocatoria Estatal 2026
          </span>
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter">
            Banco de Talento Sonorense
          </h2>
          <p className="text-white/50 text-xs max-w-xl">
            Sube tu currículum al banco oficial del estado de Sonora y vincúlate con las mejores empresas de la región. Consulta la guía oficial de registro elaborada por la DAE.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <a
            href="https://dae.unison.mx/CONVOCATORIAS/Gui%CC%81a_Completa_de_Registro_Banco_de_Talento_Sonorense_2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-center transition-all"
          >
            <i className="fas fa-file-pdf mr-2 text-red-500"></i> Descargar Guía PDF
          </a>
          <a
            href="https://dae.unison.mx/bolsadetrabajo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-white hover:text-black text-white text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-amber-500/20 transition-all"
          >
            Registrarme Ahora
          </a>
        </div>
      </div>

      {/* Vacantes Counter */}
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          {loading ? 'Cargando...' : `${vacantes.length} Vacante${vacantes.length !== 1 ? 's' : ''} Activa${vacantes.length !== 1 ? 's' : ''}`}
        </h3>
        {!isAdmin && (
          <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Comité Conecta-T CESA • Vinculación 2026</p>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-900/40 border border-white/5 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : vacantes.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="text-5xl opacity-20">💼</div>
          <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">No hay vacantes en esta categoría.</p>
          <p className="text-white/10 text-[9px] italic">Revisa más tarde o activa todas las modalidades.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {vacantes.map((job) => (
            <div key={job.id} className={`group relative bg-slate-900/40 border rounded-[2.5rem] p-8 transition-all duration-300 hover:bg-slate-900/70 hover:shadow-2xl ${
              job.ya_postulado ? 'border-emerald-500/20' : 'border-white/5 hover:border-indigo-500/30'
            }`}>
              {/* Applied badge */}
              {job.ya_postulado && (
                <div className="absolute top-6 right-6 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full z-10">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">
                    <i className="fas fa-check-circle mr-1"></i>Postulado
                  </span>
                </div>
              )}
              {job.match_score === 100 && !job.ya_postulado && (
                <div className="absolute top-6 right-6 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] z-10">
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">
                    <i className="fas fa-star mr-1"></i>Match Perfecto
                  </span>
                </div>
              )}
              {!job.verificada && isAdmin && (
                <div className="absolute top-6 left-6 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">Pendiente de validación</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between gap-6 mt-4">
                <div className="flex-1">
                  {/* Company & Title */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-xl text-indigo-400 font-black flex-shrink-0">
                      {job.empresa_nombre[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xl leading-tight uppercase tracking-tighter">{job.titulo}</h3>
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">{job.empresa_nombre}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-white/50 text-xs leading-relaxed mb-6 space-y-4">
                    <p className={expandedJobs[job.id] ? "whitespace-pre-line" : "line-clamp-3"}>
                      {job.descripcion}
                    </p>
                    {job.contacto && expandedJobs[job.id] && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 font-mono text-[10px] uppercase tracking-wide">
                        <i className="fas fa-info-circle mr-2"></i>Contacto: {job.contacto}
                      </div>
                    )}
                    <button
                      onClick={() => toggleExpandJob(job.id)}
                      className="text-indigo-400 hover:text-white font-bold text-[9px] uppercase tracking-widest block transition-colors mt-2"
                    >
                      {expandedJobs[job.id] ? "Ver menos" : "Leer descripción completa y contacto"}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${MODALIDAD_COLORS[job.modalidad]}`}>
                      <i className="fas fa-map-marker-alt mr-1"></i>{job.modalidad}
                    </span>
                    <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-white/40">
                      <i className="fas fa-clock mr-1"></i>{TIPO_LABELS[job.tipo]}
                    </span>
                    {job.sueldo_rango && (
                      <span className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-amber-400">
                        <i className="fas fa-money-bill-wave mr-1"></i>{job.sueldo_rango}
                      </span>
                    )}
                    {job.carreras_target && job.carreras_target !== 'todas' && (
                      <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-white/20">
                        <i className="fas fa-graduation-cap mr-1"></i>{job.carreras_target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Area */}
                <div className="flex flex-col justify-between items-end gap-4 md:min-w-[160px]">
                  <div className="text-right">
                    <p className="text-[8px] font-mono text-white/20 italic">{new Date(job.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                    {job.postulaciones_count > 0 && (
                      <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mt-1">
                        <i className="fas fa-users mr-1"></i>{job.postulaciones_count} postulante{job.postulaciones_count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {job.enlace_externo ? (
                    <a
                      href={job.enlace_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-amber-500 hover:bg-white hover:text-black text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Ver Oferta Original
                    </a>
                  ) : !job.ya_postulado ? (
                    <button
                      onClick={() => setShowApplyModal(job)}
                      className="w-full bg-indigo-600 hover:bg-white hover:text-black text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      Postularme
                    </button>
                  ) : (
                    <div className="w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center text-emerald-500 bg-emerald-500/5 border border-emerald-500/20">
                      <i className="fas fa-check mr-2"></i>Enviado
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full space-y-8 shadow-2xl">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{showApplyModal.titulo}</h3>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">{showApplyModal.empresa_nombre}</p>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Mensaje de Presentación (Opcional)</label>
              <textarea
                value={applyMsg}
                onChange={(e) => setApplyMsg(e.target.value)}
                placeholder="Cuéntale a la empresa por qué eres el candidato ideal..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white h-36 outline-none focus:border-indigo-500 resize-none transition-all"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowApplyModal(null)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={applyingId !== null}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-white hover:text-black text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {applyingId ? 'Enviando...' : 'Confirmar Postulación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL (Admin only) */}
      {showPublish && isAdmin && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Publicar Vacante</h3>

            <div className="grid grid-cols-2 gap-4">
              {([
                ['empresa_nombre', 'Empresa / Institución', 'text'],
                ['titulo', 'Título del Puesto', 'text'],
                ['sueldo_rango', 'Rango Salarial (ej: $8,000 - $12,000)', 'text'],
                ['carreras_target', 'Carreras Objetivo (o "todas")', 'text'],
                ['skill_id', 'ID Skill Recomendada (opcional)', 'text'],
              ] as const).map(([key, label, type]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</label>
                  <input
                    type="text"
                    value={newVacante[key]}
                    onChange={(e) => setNewVacante((prev: any) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Descripción del Puesto</label>
              <textarea
                value={newVacante.descripcion}
                onChange={(e) => setNewVacante((prev: any) => ({ ...prev, descripcion: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white h-28 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Modalidad</label>
                <select
                  value={newVacante.modalidad}
                  onChange={(e) => setNewVacante((prev: any) => ({ ...prev, modalidad: e.target.value as any }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="presencial">Presencial</option>
                  <option value="remoto">Remoto</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Tipo de Empleo</label>
                <select
                  value={newVacante.tipo}
                  onChange={(e) => setNewVacante((prev: any) => ({ ...prev, tipo: e.target.value as any }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="tiempo_completo">Tiempo Completo</option>
                  <option value="medio_tiempo">Medio Tiempo</option>
                  <option value="practicas">Prácticas</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button onClick={() => setShowPublish(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !newVacante.titulo || !newVacante.empresa_nombre}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-white hover:text-black text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-40"
              >
                {publishing ? 'Publicando...' : 'Publicar Vacante'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default JobsBoard;
