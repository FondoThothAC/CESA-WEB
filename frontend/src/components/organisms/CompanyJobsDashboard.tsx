'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function CompanyJobsDashboard() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const [vacantes, setVacantes] = useState<any[]>([]);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [selectedVacante, setSelectedVacante] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal para nueva vacante
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({ titulo: '', descripcion: '', modalidad: 'presencial', tipo: 'tiempo_completo', sueldo_rango: '', carreras_target: 'todas' });

  // Modal para ver feedback/estado
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ postulacion_id: 0, estado: 'pendiente', feedback: '' });

  const fetchVacantes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/empleos.php?action=mis_vacantes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVacantes(data.vacantes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidatos = async (vacanteId: number) => {
    try {
      const res = await fetch(`${API_URL}/empleos.php?action=candidatos&vacante_id=${vacanteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCandidatos(data.candidatos);
        setSelectedVacante(vacanteId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) fetchVacantes();
  }, [token]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/empleos.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publicar', ...jobForm })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowNewJobModal(false);
        fetchVacantes();
      } else {
        alert(data.error || 'Error al publicar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/empleos.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'actualizar_estado', ...feedbackForm })
      });
      const data = await res.json();
      if (data.success) {
        alert('Estado actualizado');
        setShowFeedbackModal(false);
        if (selectedVacante) fetchCandidatos(selectedVacante);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (loading) return <div className="text-white text-center py-10 font-bold">Cargando panel de empresa...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Panel de Reclutamiento</h3>
          <p className="text-xs text-slate-400">Gestiona tus vacantes y revisa a los candidatos</p>
        </div>
        <button onClick={() => setShowNewJobModal(true)} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
          + Nueva Vacante
        </button>
      </div>

      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h4 className="text-2xl font-black text-white uppercase mb-6">Publicar Vacante</h4>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black">Título del Puesto</label>
                <input required type="text" value={jobForm.titulo} onChange={e => setJobForm({...jobForm, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black">Descripción (Requisitos, responsabilidades)</label>
                <textarea required value={jobForm.descripcion} onChange={e => setJobForm({...jobForm, descripcion: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-32" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black">Modalidad</label>
                  <select value={jobForm.modalidad} onChange={e => setJobForm({...jobForm, modalidad: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                    <option value="presencial">Presencial</option>
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black">Tipo</label>
                  <select value={jobForm.tipo} onChange={e => setJobForm({...jobForm, tipo: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                    <option value="tiempo_completo">Tiempo Completo</option>
                    <option value="medio_tiempo">Medio Tiempo</option>
                    <option value="practicas">Prácticas / Servicio</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black">Rango Salarial</label>
                  <input type="text" placeholder="Ej. $10,000 - $15,000 MXN o 'No remunerado'" value={jobForm.sueldo_rango} onChange={e => setJobForm({...jobForm, sueldo_rango: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black">Carreras (Opcional)</label>
                  <input type="text" placeholder="todas, LISI, LIA..." value={jobForm.carreras_target} onChange={e => setJobForm({...jobForm, carreras_target: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowNewJobModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-white font-bold text-xs uppercase transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-white font-bold text-xs uppercase transition-colors">Publicar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg">
            <h4 className="text-2xl font-black text-white uppercase mb-6">Actualizar Estado</h4>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black">Decisión</label>
                <select value={feedbackForm.estado} onChange={e => setFeedbackForm({...feedbackForm, estado: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                  <option value="pendiente">Pendiente</option>
                  <option value="visto">Visto / En Proceso</option>
                  <option value="aceptado">Aceptado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black">Feedback (Opcional, visible para el alumno)</label>
                <textarea placeholder="Deja un mensaje sobre los siguientes pasos..." value={feedbackForm.feedback} onChange={e => setFeedbackForm({...feedbackForm, feedback: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-24" />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-white font-bold text-xs uppercase transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-white font-bold text-xs uppercase transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid de Vacantes y Candidatos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Vacantes */}
        <div className="lg:col-span-1 space-y-4">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Tus Vacantes</h4>
          {vacantes.map(v => (
            <div 
              key={v.id} 
              onClick={() => fetchCandidatos(v.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedVacante === v.id ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}
            >
              <h5 className="text-white font-bold text-lg leading-tight mb-1">{v.titulo}</h5>
              <div className="flex justify-between items-center mt-3">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${v.verificada ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {v.verificada ? 'Aprobada' : 'En Revisión'}
                </span>
                <span className="text-xs text-slate-400 font-bold bg-black/50 px-2 py-1 rounded-md">
                  👥 {v.postulaciones_count} Postulantes
                </span>
              </div>
            </div>
          ))}
          {vacantes.length === 0 && (
             <div className="text-slate-500 text-xs italic p-4 bg-slate-900/30 rounded-xl">No has publicado vacantes.</div>
          )}
        </div>

        {/* Lista de Candidatos para la vacante seleccionada */}
        <div className="lg:col-span-2">
          {!selectedVacante ? (
            <div className="bg-slate-900/30 border border-white/5 border-dashed rounded-3xl h-full min-h-[300px] flex items-center justify-center">
              <p className="text-slate-500 text-sm font-bold">Selecciona una vacante para ver sus candidatos</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Candidatos</h4>
                <span className="text-xs text-indigo-400 font-bold">{candidatos.length} encontrados</span>
              </div>
              
              <div className="space-y-4">
                {candidatos.map(c => (
                  <div key={c.id} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 flex-1">
                      <div>
                        <h5 className="text-white font-black text-xl">{c.estudiante_nombre}</h5>
                        <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{c.estudiante_carrera}</p>
                      </div>
                      <p className="text-slate-300 text-sm italic bg-black/30 p-3 rounded-xl border border-white/5">
                        "{c.mensaje_estudiante}"
                      </p>
                      {c.memoria_path && (
                         <div className="mt-2 inline-flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">
                           <span>📄 Memoria Subida</span>
                           <a href={`${API_URL}${c.memoria_path}`} target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">Descargar PDF</a>
                         </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col gap-3 min-w-[150px]">
                      <div className="text-center bg-black/40 py-2 rounded-xl border border-white/5">
                        <p className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Estado</p>
                        <p className={`text-xs font-black uppercase ${
                          c.estado === 'aceptado' ? 'text-emerald-400' :
                          c.estado === 'rechazado' ? 'text-red-400' :
                          c.estado === 'visto' ? 'text-blue-400' : 'text-amber-400'
                        }`}>{c.estado}</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setFeedbackForm({ postulacion_id: c.id, estado: c.estado, feedback: c.feedback_empresa || '' });
                          setShowFeedbackModal(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors text-center w-full"
                      >
                        Gestionar
                      </button>
                    </div>
                  </div>
                ))}
                
                {candidatos.length === 0 && (
                  <div className="text-slate-500 text-sm text-center py-10 bg-slate-900/30 rounded-2xl border border-white/5">
                    Aún no hay postulaciones para esta vacante.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
