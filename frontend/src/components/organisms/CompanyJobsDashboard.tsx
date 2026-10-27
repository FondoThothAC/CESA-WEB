'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { downloadDocumento } from '@/lib/downloadDoc';

const EMPTY_JOB_FORM = {
  // Unidad Receptora (FP1 sección 1)
  razon_social: '', rfc: '', giro_sector: '', domicilio: '', ciudad: '', cp: '', telefono: '',
  responsable_nombre: '', responsable_puesto: '', responsable_email: '',
  // Proyecto (FP1 secciones 2-7)
  nombre_programa: '', areas_departamento: '', licenciatura_target: '', area_id: '',
  perfil_deseado: '', num_practicantes: 1, justificacion: '', objetivo: '', plan_trabajo: '',
  tipo_programa: 'practicas_profesionales',
  apoyos: { beca: '', comida: '', transporte: '', equipo: '', otro: '', ninguno: false }
};

export default function CompanyJobsDashboard() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal para nuevo registro FP1 (paso único con secciones)
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({ ...EMPTY_JOB_FORM });
  const [savingJob, setSavingJob] = useState(false);

  // Modal acción candidato
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ postulacion_id: 0, estado: 'entrevista', feedback: '', horario_acordado: '' });

  // Modal tutor profesional
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [tutorForm, setTutorForm] = useState({ postulacion_id: 0, no_empleado: '', nombre: '', titulo: 'Dra.', telefono: '', email: '' });

  const fetchProyectos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=mis_proyectos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProyectos(Array.isArray(data.proyectos) ? data.proyectos : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=areas`);
      const data = await res.json();
      if (data.success) setAreas(data.areas);
    } catch (e) { console.error(e); }
  };

  const fetchCandidatos = async (proyectoId: number) => {
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=candidatos&proyecto_id=${proyectoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCandidatos(data.candidatos);
        setSelectedProyecto(proyectoId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) { fetchProyectos(); fetchAreas(); }
  }, [token]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=registrar_empresa`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobForm,
          num_practicantes: parseInt(String(jobForm.num_practicantes)) || 1,
          area_id: jobForm.area_id ? parseInt(jobForm.area_id) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowNewJobModal(false);
        setJobForm({ ...EMPTY_JOB_FORM });
        fetchProyectos();
      } else {
        alert(data.error || 'Error al publicar');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSavingJob(false);
    }
  };

  const handleAccion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=accion_candidato`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowFeedbackModal(false);
        if (selectedProyecto) fetchCandidatos(selectedProyecto);
        fetchProyectos();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleAsignarTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=asignar_tutor`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ postulacion_id: tutorForm.postulacion_id, tutor: tutorForm })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowTutorModal(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const inputCls = "w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-sm text-text-main";
  const labelCls = "text-[10px] text-slate-400 font-bold uppercase tracking-widest";

  if (loading) return <div className="text-text-main text-center py-10 font-bold">Cargando panel de empresa...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter">Panel de Servicio Social y Prácticas</h3>
          <p className="text-xs text-slate-400">Registra tu solicitud (FP1), revisa la fila de candidatos y llena tu cupo</p>
        </div>
        <button onClick={() => setShowNewJobModal(true)} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
          + Nueva Solicitud (FP1)
        </button>
      </div>

      {/* Mis proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {proyectos.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 p-10 rounded-[2.5rem] border border-border bg-bg-card text-center">
            <h4 className="text-text-main font-bold text-lg mb-2">Aún no tienes proyectos</h4>
            <p className="text-slate-400 text-sm">Registra tu primera solicitud con el formulario FP1.</p>
          </div>
        ) : proyectos.map(v => (
          <div key={v.id} className="p-6 rounded-[2.5rem] border border-border bg-bg-card space-y-3">
            <div className="flex justify-between items-start gap-2">
              <h5 className="text-text-main font-bold text-base leading-tight">{v.nombre_programa}</h5>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${
                v.estado === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                v.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' :
                v.estado === 'cupo_lleno' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}>{v.estado?.replace('_', ' ')}</span>
            </div>
            <p className="text-text-muted text-xs">{v.programa ? `Área: ${v.programa}` : ''} • Cupo: {v.aceptados_count}/{v.num_practicantes}</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => fetchCandidatos(v.id)} className="flex-1 bg-indigo-600/80 hover:bg-indigo-500 px-3 py-2.5 rounded-xl text-white font-bold text-[11px] uppercase transition-colors">
                Candidatos ({v.postulaciones_activas})
              </button>
              <button onClick={async () => {
                try {
                  await downloadDocumento(API_URL, token, 'fp1', { proyecto_id: v.id }, `FP1_${v.id}.docx`);
                } catch (e: any) { alert(e.message || 'Error al descargar'); }
              }}
                className="border border-border hover:bg-primary/5 px-3 py-2.5 rounded-xl text-text-main font-bold text-[11px] uppercase transition-colors text-center">
                📄 FP1
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fila de candidatos */}
      {selectedProyecto && (
        <div className="bg-bg-card border border-border rounded-[2.5rem] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-black text-text-main uppercase tracking-tight">Fila de candidatos</h4>
            <button onClick={() => setSelectedProyecto(null)} className="text-text-muted hover:text-text-main text-xs font-bold uppercase">Cerrar ✕</button>
          </div>
          {candidatos.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Aún no hay postulaciones para este proyecto.</p>
          ) : (
            <div className="space-y-3">
              {candidatos.map((c, idx) => (
                <div key={c.id} className="bg-bg-primary border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    c.estado === 'aceptado' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.estado === 'entrevista' ? 'bg-blue-500/20 text-blue-400' :
                    c.estado === 'rechazado' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-slate-300'
                  }`}>{c.estado === 'aceptado' ? '✓' : idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-main font-bold text-sm">{c.estudiante_nombre}</p>
                    <p className="text-text-muted text-xs">{c.estudiante_carrera || 'Sin carrera registrada'} • Exp: {c.expediente || 'N/A'} • {c.creditos_acumulados ?? 0} créditos</p>
                    {c.feedback_empresa && <p className="text-slate-500 text-[11px] italic mt-1">"{c.feedback_empresa}"</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    c.estado === 'aceptado' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.estado === 'entrevista' ? 'bg-blue-500/20 text-blue-400' :
                    c.estado === 'lista_espera' ? 'bg-amber-500/20 text-amber-500' :
                    c.estado === 'rechazado' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-slate-300'
                  }`}>{c.estado?.replace('_', ' ')}</span>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setFeedbackForm({ postulacion_id: c.id, estado: 'entrevista', feedback: c.feedback_empresa || '', horario_acordado: c.horario_acordado || '' }); setShowFeedbackModal(true); }}
                      className="bg-blue-600/80 hover:bg-blue-500 px-3 py-2 rounded-lg text-white text-[10px] font-black uppercase">Entrevistar</button>
                    <button onClick={() => { setFeedbackForm({ postulacion_id: c.id, estado: 'aceptado', feedback: c.feedback_empresa || '', horario_acordado: c.horario_acordado || '' }); setShowFeedbackModal(true); }}
                      className="bg-emerald-600/80 hover:bg-emerald-500 px-3 py-2 rounded-lg text-white text-[10px] font-black uppercase">Aceptar</button>
                    <button onClick={() => { setFeedbackForm({ postulacion_id: c.id, estado: 'lista_espera', feedback: c.feedback_empresa || '', horario_acordado: '' }); setShowFeedbackModal(true); }}
                      className="bg-amber-600/80 hover:bg-amber-500 px-3 py-2 rounded-lg text-white text-[10px] font-black uppercase">Espera</button>
                    <button onClick={() => { setFeedbackForm({ postulacion_id: c.id, estado: 'rechazado', feedback: c.feedback_empresa || '', horario_acordado: '' }); setShowFeedbackModal(true); }}
                      className="bg-red-600/80 hover:bg-red-500 px-3 py-2 rounded-lg text-white text-[10px] font-black uppercase">Rechazar</button>
                    <button onClick={() => { setTutorForm({ postulacion_id: c.id, no_empleado: '', nombre: '', titulo: 'Dra.', telefono: '', email: '' }); setShowTutorModal(true); }}
                      className="border border-border hover:bg-primary/5 px-3 py-2 rounded-lg text-text-main text-[10px] font-black uppercase">Tutor</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Nueva Solicitud FP1 */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateJob} className="bg-bg-secondary border border-border rounded-[2.5rem] p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl">
            <div>
              <h4 className="text-xl font-black text-text-main uppercase tracking-tight">Nueva Solicitud — Formato FP1</h4>
              <p className="text-xs text-slate-400 mt-1">Solicitud de Estudiantes de la Unidad Receptora para Prácticas Profesionales. Requiere aprobación del administrador.</p>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-indigo-400 font-black text-xs uppercase tracking-widest">1. Unidad Receptora</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelCls}>Razón Social *</label><input required value={jobForm.razon_social} onChange={e => setJobForm({...jobForm, razon_social: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>R.F.C.</label><input value={jobForm.rfc} onChange={e => setJobForm({...jobForm, rfc: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Giro o Sector</label><input value={jobForm.giro_sector} onChange={e => setJobForm({...jobForm, giro_sector: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Teléfono</label><input value={jobForm.telefono} onChange={e => setJobForm({...jobForm, telefono: e.target.value})} className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Domicilio</label><input value={jobForm.domicilio} onChange={e => setJobForm({...jobForm, domicilio: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Ciudad</label><input value={jobForm.ciudad} onChange={e => setJobForm({...jobForm, ciudad: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>C.P.</label><input value={jobForm.cp} onChange={e => setJobForm({...jobForm, cp: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Responsable *</label><input value={jobForm.responsable_nombre} onChange={e => setJobForm({...jobForm, responsable_nombre: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Puesto</label><input value={jobForm.responsable_puesto} onChange={e => setJobForm({...jobForm, responsable_puesto: e.target.value})} className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Email del responsable</label><input type="email" value={jobForm.responsable_email} onChange={e => setJobForm({...jobForm, responsable_email: e.target.value})} className={inputCls} /></div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-indigo-400 font-black text-xs uppercase tracking-widest">2. Programa / Proyecto</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2"><label className={labelCls}>Nombre del programa/proyecto *</label><input required value={jobForm.nombre_programa} onChange={e => setJobForm({...jobForm, nombre_programa: e.target.value})} className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Área o Departamento donde se requieren practicantes</label><input value={jobForm.areas_departamento} onChange={e => setJobForm({...jobForm, areas_departamento: e.target.value})} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Programa académico (Área)</label>
                  <select value={jobForm.area_id} onChange={e => setJobForm({...jobForm, area_id: e.target.value})} className={inputCls}>
                    <option value="">Selecciona...</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.programa}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select value={jobForm.tipo_programa} onChange={e => setJobForm({...jobForm, tipo_programa: e.target.value})} className={inputCls}>
                    <option value="practicas_profesionales">Prácticas Profesionales</option>
                    <option value="servicio_social">Servicio Social</option>
                  </select>
                </div>
                <div><label className={labelCls}>Licenciatura objetivo</label><input value={jobForm.licenciatura_target} onChange={e => setJobForm({...jobForm, licenciatura_target: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Número de practicantes *</label><input required type="number" min="1" value={jobForm.num_practicantes} onChange={e => setJobForm({...jobForm, num_practicantes: parseInt(e.target.value) || 1})} className={inputCls} /></div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-indigo-400 font-black text-xs uppercase tracking-widest">3. Perfil, Justificación y Plan</legend>
              <div><label className={labelCls}>Perfil deseado (una habilidad por línea)</label><textarea value={jobForm.perfil_deseado} onChange={e => setJobForm({...jobForm, perfil_deseado: e.target.value})} className={inputCls + " h-24"} /></div>
              <div><label className={labelCls}>Justificación del programa/proyecto</label><textarea value={jobForm.justificacion} onChange={e => setJobForm({...jobForm, justificacion: e.target.value})} className={inputCls + " h-24"} /></div>
              <div><label className={labelCls}>Objetivo del programa/proyecto</label><textarea value={jobForm.objetivo} onChange={e => setJobForm({...jobForm, objetivo: e.target.value})} className={inputCls + " h-20"} /></div>
              <div><label className={labelCls}>Plan de trabajo (una actividad por línea)</label><textarea value={jobForm.plan_trabajo} onChange={e => setJobForm({...jobForm, plan_trabajo: e.target.value})} className={inputCls + " h-28"} /></div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-indigo-400 font-black text-xs uppercase tracking-widest">4. Apoyos</legend>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className={labelCls}>Beca</label><input value={jobForm.apoyos.beca} onChange={e => setJobForm({...jobForm, apoyos: {...jobForm.apoyos, beca: e.target.value}})} className={inputCls} /></div>
                <div><label className={labelCls}>Comida</label><input value={jobForm.apoyos.comida} onChange={e => setJobForm({...jobForm, apoyos: {...jobForm.apoyos, comida: e.target.value}})} className={inputCls} /></div>
                <div><label className={labelCls}>Transporte</label><input value={jobForm.apoyos.transporte} onChange={e => setJobForm({...jobForm, apoyos: {...jobForm.apoyos, transporte: e.target.value}})} className={inputCls} /></div>
                <div><label className={labelCls}>Equipo de seguridad</label><input value={jobForm.apoyos.equipo} onChange={e => setJobForm({...jobForm, apoyos: {...jobForm.apoyos, equipo: e.target.value}})} className={inputCls} /></div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                <input type="checkbox" checked={jobForm.apoyos.ninguno} onChange={e => setJobForm({...jobForm, apoyos: {...jobForm.apoyos, ninguno: e.target.checked}})} className="accent-indigo-500" />
                Ninguno
              </label>
            </fieldset>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNewJobModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-main font-bold text-xs uppercase">Cancelar</button>
              <button type="submit" disabled={savingJob} className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 text-white font-black text-xs uppercase disabled:opacity-50">
                {savingJob ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal acción candidato */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAccion} className="bg-bg-secondary border border-border rounded-[2.5rem] p-8 max-w-md w-full space-y-5 shadow-2xl">
            <h4 className="text-lg font-black text-text-main uppercase tracking-tight">Actualizar candidato</h4>
            <div>
              <label className={labelCls}>Nuevo estado</label>
              <select value={feedbackForm.estado} onChange={e => setFeedbackForm({...feedbackForm, estado: e.target.value})} className={inputCls}>
                <option value="entrevista">Entrevista</option>
                <option value="aceptado">Aceptar</option>
                <option value="lista_espera">Lista de espera</option>
                <option value="rechazado">Rechazar</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Horario acordado (al aceptar)</label>
              <input placeholder="Ej. De 9:00 am a 12:00 pm, lunes a viernes" value={feedbackForm.horario_acordado} onChange={e => setFeedbackForm({...feedbackForm, horario_acordado: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mensaje / feedback</label>
              <textarea value={feedbackForm.feedback} onChange={e => setFeedbackForm({...feedbackForm, feedback: e.target.value})} className={inputCls + " h-24"} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowFeedbackModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-main font-bold text-xs uppercase">Cancelar</button>
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-white font-black text-xs uppercase">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal tutor profesional */}
      {showTutorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAsignarTutor} className="bg-bg-secondary border border-border rounded-[2.5rem] p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div>
              <h4 className="text-lg font-black text-text-main uppercase tracking-tight">Tutor Profesional</h4>
              <p className="text-xs text-slate-400">Datos para el FP2 y la Carta de Asignación de Tutor.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Tratamiento</label>
                <select value={tutorForm.titulo} onChange={e => setTutorForm({...tutorForm, titulo: e.target.value})} className={inputCls}>
                  <option>Dra.</option><option>Dr.</option><option>Mtra.</option><option>Mtro.</option><option>Lic.</option>
                </select>
              </div>
              <div><label className={labelCls}>No. Empleado</label><input value={tutorForm.no_empleado} onChange={e => setTutorForm({...tutorForm, no_empleado: e.target.value})} className={inputCls} /></div>
              <div className="col-span-2"><label className={labelCls}>Nombre completo *</label><input required value={tutorForm.nombre} onChange={e => setTutorForm({...tutorForm, nombre: e.target.value})} className={inputCls} /></div>
              <div><label className={labelCls}>Teléfono</label><input value={tutorForm.telefono} onChange={e => setTutorForm({...tutorForm, telefono: e.target.value})} className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" value={tutorForm.email} onChange={e => setTutorForm({...tutorForm, email: e.target.value})} className={inputCls} /></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowTutorModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-main font-bold text-xs uppercase">Cancelar</button>
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-white font-black text-xs uppercase">Asignar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
