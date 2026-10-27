'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import PixelOfficeCanvas from './PixelOfficeCanvas';

export default function AdminIAConfigTab() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'pixel_office' | 'swarm' | 'jobs' | 'approvals' | 'llm_config'>('dashboard');

  // Estados del Swarm de Agentes
  const [agents, setAgents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loadingSwarm, setLoadingSwarm] = useState(false);

  // Modal Agente Form
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState({
    id: '',
    nombre_agente: '',
    encargado_nombre: '',
    eje_trabajo: '',
    color_hex: '#3b82f6',
    telegram_chat_id: '',
    canal_notificacion: 'telegram',
    prompt_personalidad: '',
    req_aprobacion: '1',
    activo: '1'
  });

  // Modal Job Form (Cron Manager)
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    id: '',
    agent_id: '',
    titulo_tarea: '',
    frecuencia_label: 'Cada Martes y Jueves 09:00 AM',
    cron_expression: '0 9 * * 2,4',
    tipo_accion: 'reporte_eje',
    detalles_json: '{}',
    activa: '1'
  });

  // Telemetría ZeroClaw
  const [zeroData, setZeroData] = useState<any>({
    provider: 'Ollama Cloud',
    model: 'nemotron-3-super',
    uptime: 'Online (PM2 #0)',
    gateway_port: ':42617',
    memory_backend: 'MariaDB + RAG Vector (.md)',
    memory_paired: true,
    cost_overview: { session: 0, daily: 0, monthly: 0, total_tokens: 15420, total_requests: 128 },
    active_channels: [
      { name: 'Telegram (@CesaUnisonBot)', active: true },
      { name: 'Web Widget Chat', active: true },
      { name: 'PWA Push Notifications', active: true },
      { name: 'Email / SMTP', active: true },
      { name: 'Meta Social Orchestrator', active: true }
    ],
    component_health: { channels: 'Ok', daemon: 'Ok', gateway: 'Ok', scheduler: 'Ok' }
  });

  // Cargar datos del Swarm
  const fetchSwarmData = async () => {
    setLoadingSwarm(true);
    try {
      // Agentes
      const resA = await fetch(`${API_URL}/admin/zeroclaw_swarm.php?action=list_agents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const dataA = await resA.json();
      if (dataA.success) setAgents(dataA.agents || []);

      // Jobs
      const resJ = await fetch(`${API_URL}/admin/zeroclaw_swarm.php?action=list_jobs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const dataJ = await resJ.json();
      if (dataJ.success) setJobs(dataJ.jobs || []);

      // Approvals
      const resApp = await fetch(`${API_URL}/admin/zeroclaw_swarm.php?action=list_approvals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const dataApp = await resApp.json();
      if (dataApp.success) setApprovals(dataApp.approvals || []);
    } catch (e) {
      console.error('Error al cargar datos del Swarm:', e);
    } finally {
      setLoadingSwarm(false);
    }
  };

  useEffect(() => {
    fetchSwarmData();
  }, [token]);

  // Guardar Sub-Agente
  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('action', 'save_agent');
      Object.entries(agentForm).forEach(([k, v]) => fd.append(k, String(v)));

      const res = await fetch(`${API_URL}/admin/zeroclaw_swarm.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert('Agente guardado con éxito');
        setShowAgentModal(false);
        fetchSwarmData();
      } else {
        alert(data.error || 'Error al guardar agente');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  // Guardar Tarea Cron
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('action', 'save_job');
      Object.entries(jobForm).forEach(([k, v]) => fd.append(k, String(v)));

      const res = await fetch(`${API_URL}/admin/zeroclaw_swarm.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert('Tarea programada con éxito');
        setShowJobModal(false);
        fetchSwarmData();
      } else {
        alert(data.error || 'Error al guardar tarea');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  // Toggle o Eliminar Job
  const handleToggleJob = async (id: number) => {
    try {
      const fd = new FormData();
      fd.append('action', 'toggle_job');
      fd.append('id', String(id));
      await fetch(`${API_URL}/admin/zeroclaw_swarm.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      fetchSwarmData();
    } catch (e) {}
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm('¿Eliminar esta tarea programada?')) return;
    try {
      const fd = new FormData();
      fd.append('action', 'delete_job');
      fd.append('id', String(id));
      await fetch(`${API_URL}/admin/zeroclaw_swarm.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      fetchSwarmData();
    } catch (e) {}
  };

  // Accionar Aprobación
  const handleActionApproval = async (id: number, estado: string) => {
    const feedback = prompt(`Ingresa un comentario o instrucción para ${estado}:`) || '';
    try {
      const fd = new FormData();
      fd.append('action', 'action_approval');
      fd.append('id', String(id));
      fd.append('estado', estado);
      fd.append('feedback', feedback);

      const res = await fetch(`${API_URL}/admin/zeroclaw_swarm.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert(`Estado actualizado a ${estado}`);
        fetchSwarmData();
      }
    } catch (e) {}
  };

  // Simular Junta de Mesa de Expertos
  const handleRunMeeting = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/zeroclaw_swarm.php?action=run_meeting`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        alert(`Junta completada: ${data.resumen}`);
        fetchSwarmData();
      }
    } catch (e) {}
  };

  const isMaster = user?.email === 'software@fondothoth.com' || user?.email === 'a213203453@unison.mx';
  const canEdit = isMaster;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans bg-[#090d16] p-6 rounded-[2.5rem] border border-blue-500/20 text-white shadow-2xl">
      {/* HEADER ZEROCLAW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/30">
            ZC
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              ZeroClaw Engine <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono">v7.0 Swarm</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Orquestador de Sub-Agentes CESA UNISON & Mesa de Expertos</p>
          </div>
        </div>

        {/* NAVEGACIÓN SUB-TABS */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'pixel_office', label: '🎮 Pixel Office (2D)' },
            { id: 'swarm', label: `👥 Sub-Agentes (${agents.length})` },
            { id: 'jobs', label: `⏰ Tareas Cron (${jobs.length})` },
            { id: 'approvals', label: `📥 Aprobaciones (${approvals.filter(a => a.estado === 'pendiente').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. DASHBOARD GENERAL */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">🤖 Motor / Modelo</span>
              <p className="text-lg font-black text-white">{zeroData.provider}</p>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                {zeroData.model}
              </span>
            </div>

            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">⏱️ Estado Servicio</span>
              <p className="text-lg font-black text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {zeroData.uptime}
              </p>
              <p className="text-[10px] text-slate-500">Puerto Listener: :42617</p>
            </div>

            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">👥 Swarm Activo</span>
              <p className="text-lg font-black text-purple-400">{agents.length} Sub-Agentes</p>
              <p className="text-[10px] text-slate-500">Mesa Directiva CESA</p>
            </div>

            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">💲 Costo Adicional</span>
              <p className="text-lg font-black text-emerald-400">$0.00 USD</p>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Tasa Fija local VPS
              </span>
            </div>
          </div>

          <div className="bg-[#111625] border border-white/10 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <span>📡</span> Canales de Difusión & Notificaciones en CCO
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {zeroData.active_channels.map((ch: any, idx: number) => (
                <div key={idx} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{ch.name}</span>
                  <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. VISOR PIXEL OFFICE 2D */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'pixel_office' && (
        <PixelOfficeCanvas
          agentsList={agents}
          onTriggerMeeting={fetchSwarmData}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. SUB-AGENTES DEL SWARM (MESA DIRECTIVA & ÁREAS) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'swarm' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/10 pb-4 gap-3">
            <div>
              <h3 className="text-lg font-black uppercase text-white">Swarm de Sub-Agentes de la Mesa Directiva</h3>
              <p className="text-xs text-slate-400">Cada miembro de la Mesa Directiva tiene un sub-agente asignado</p>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  setAgentForm({
                    id: '',
                    nombre_agente: '',
                    encargado_nombre: '',
                    eje_trabajo: '',
                    color_hex: '#3b82f6',
                    telegram_chat_id: '',
                    canal_notificacion: 'telegram',
                    prompt_personalidad: '',
                    req_aprobacion: '1',
                    activo: '1'
                  });
                  setShowAgentModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-600/30"
              >
                + Agregar Nuevo Agente / Área
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((ag) => (
              <div key={ag.id} className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: ag.color_hex || '#3b82f6' }}></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md" style={{ backgroundColor: ag.color_hex || '#3b82f6' }}>
                      {ag.nombre_agente[0]}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">{ag.nombre_agente}</h4>
                      <p className="text-xs text-blue-400 font-bold">Encargado: {ag.encargado_nombre}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${ag.activo == 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {ag.activo == 1 ? '● Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-black">Eje de Trabajo</span>
                  <p className="text-xs text-slate-300 font-medium">{ag.eje_trabajo}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                  <span>Tareas Activas: <strong>{ag.total_jobs || 0}</strong></span>
                  <span>Aprobación: <strong>{ag.req_aprobacion == 1 ? 'Requerida' : 'Directa'}</strong></span>
                </div>

                {canEdit && (
                  <button
                    onClick={() => {
                      setAgentForm({
                        id: ag.id,
                        nombre_agente: ag.nombre_agente,
                        encargado_nombre: ag.encargado_nombre,
                        eje_trabajo: ag.eje_trabajo,
                        color_hex: ag.color_hex || '#3b82f6',
                        telegram_chat_id: ag.telegram_chat_id || '',
                        canal_notificacion: ag.canal_notificacion || 'telegram',
                        prompt_personalidad: ag.prompt_personalidad || '',
                        req_aprobacion: String(ag.req_aprobacion ?? 1),
                        activo: String(ag.activo ?? 1)
                      });
                      setShowAgentModal(true);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2 rounded-xl border border-white/10 transition-colors"
                  >
                    ✏️ Editar Agente / Eje
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. GESTOR CRON INTERACTIVO (TAREAS PROGRAMADAS) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/10 pb-4 gap-3">
            <div>
              <h3 className="text-lg font-black uppercase text-white">Tareas Programadas del Swarm (Cron Manager)</h3>
              <p className="text-xs text-slate-400">Programa tareas automáticas por agente sin escribir código</p>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  setJobForm({
                    id: '',
                    agent_id: agents[0]?.id || '',
                    titulo_tarea: '',
                    frecuencia_label: 'Cada Martes y Jueves 09:00 AM',
                    cron_expression: '0 9 * * 2,4',
                    tipo_accion: 'reporte_eje',
                    detalles_json: '{}',
                    activa: '1'
                  });
                  setShowJobModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30"
              >
                + Nueva Tarea Programada
              </button>
            )}
          </div>

          <div className="overflow-x-auto bg-[#111625] border border-white/10 rounded-3xl p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-400">
                  <th className="py-3 px-4 font-black">Tarea</th>
                  <th className="py-3 px-4 font-black">Agente / Encargado</th>
                  <th className="py-3 px-4 font-black">Frecuencia</th>
                  <th className="py-3 px-4 font-black">Tipo Acción</th>
                  <th className="py-3 px-4 font-black">Estado</th>
                  <th className="py-3 px-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {jobs.map((jb) => (
                  <tr key={jb.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-white">{jb.titulo_tarea}</td>
                    <td className="py-3 px-4">
                      <span className="text-blue-400 font-bold block">{jb.nombre_agente}</span>
                      <span className="text-[10px] text-slate-400">({jb.encargado_nombre})</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{jb.frecuencia_label}</td>
                    <td className="py-3 px-4">
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {jb.tipo_accion}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold text-[10px] ${jb.activa == 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {jb.activa == 1 ? '● ACTIVA' : '○ Inactiva'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleJob(jb.id)}
                        className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10"
                      >
                        {jb.activa == 1 ? 'Pausar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(jb.id)}
                        className="text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2.5 py-1 rounded-lg border border-red-500/30"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. PENDIENTES DE APROBACIÓN (CANVA / COMUNICADOS) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'approvals' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-black uppercase text-white">Bandeja de Aprobaciones Pendientes</h3>
            <p className="text-xs text-slate-400">Borradores generados por los sub-agentes esperando el Visto Bueno del encargado</p>
          </div>

          <div className="space-y-4">
            {approvals.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No hay borradores pendientes de aprobación en este momento.
              </div>
            ) : (
              approvals.map((ap) => (
                <div key={ap.id} className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {ap.tipo}
                      </span>
                      <h4 className="text-base font-black text-white mt-2">{ap.titulo}</h4>
                      <p className="text-xs text-slate-400">Generado por <strong>{ap.nombre_agente}</strong> para <strong>{ap.encargado_nombre}</strong></p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                      ap.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      ap.estado === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ap.estado}
                    </span>
                  </div>

                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 font-mono">
                    {ap.contenido_preview}
                  </div>

                  {ap.estado === 'pendiente' && (
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        onClick={() => handleActionApproval(ap.id, 'cambios_solicitados')}
                        className="bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 text-xs font-bold px-4 py-2 rounded-xl border border-amber-600/30"
                      >
                        ✏️ Solicitar Cambios
                      </button>
                      <button
                        onClick={() => handleActionApproval(ap.id, 'rechazado')}
                        className="bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-bold px-4 py-2 rounded-xl border border-red-600/30"
                      >
                        ✕ Rechazar
                      </button>
                      <button
                        onClick={() => handleActionApproval(ap.id, 'aprobado')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg shadow-emerald-600/30"
                      >
                        ✓ Aprobar & Publicar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL FORMULARIO AGENTE */}
      {/* ---------------------------------------------------- */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveAgent} className="bg-[#111625] border border-blue-500/30 p-6 rounded-3xl w-full max-w-lg space-y-4">
            <h3 className="text-lg font-black uppercase text-white border-b border-white/10 pb-3">
              {agentForm.id ? 'Editar Sub-Agente' : 'Nuevo Sub-Agente / Área'}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nombre del Agente</label>
                <input
                  required
                  type="text"
                  value={agentForm.nombre_agente}
                  onChange={(e) => setAgentForm({ ...agentForm, nombre_agente: e.target.value })}
                  placeholder="ej. Atlas"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Encargado (Miembro)</label>
                <input
                  required
                  type="text"
                  value={agentForm.encargado_nombre}
                  onChange={(e) => setAgentForm({ ...agentForm, encargado_nombre: e.target.value })}
                  placeholder="ej. Arturo"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Eje de Trabajo / Área</label>
                <input
                  required
                  type="text"
                  value={agentForm.eje_trabajo}
                  onChange={(e) => setAgentForm({ ...agentForm, eje_trabajo: e.target.value })}
                  placeholder="ej. Emprendimiento & Bazar Estudiantil"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Color Distintivo</label>
                <input
                  type="color"
                  value={agentForm.color_hex}
                  onChange={(e) => setAgentForm({ ...agentForm, color_hex: e.target.value })}
                  className="w-full h-9 bg-black/60 border border-white/10 rounded-xl p-1 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Aprobación Humana</label>
                <select
                  value={agentForm.req_aprobacion}
                  onChange={(e) => setAgentForm({ ...agentForm, req_aprobacion: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="1">Sí (Requerir Visto Bueno)</option>
                  <option value="0">No (Publicación Directa)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-600/30"
              >
                Guardar Agente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL FORMULARIO TAREA CRON */}
      {/* ---------------------------------------------------- */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveJob} className="bg-[#111625] border border-emerald-500/30 p-6 rounded-3xl w-full max-w-lg space-y-4">
            <h3 className="text-lg font-black uppercase text-white border-b border-white/10 pb-3">
              Nueva Tarea Programada (Cron)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Agente Asignado</label>
                <select
                  value={jobForm.agent_id}
                  onChange={(e) => setJobForm({ ...jobForm, agent_id: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre_agente} ({a.encargado_nombre} - {a.eje_trabajo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Título de la Tarea</label>
                <input
                  required
                  type="text"
                  value={jobForm.titulo_tarea}
                  onChange={(e) => setJobForm({ ...jobForm, titulo_tarea: e.target.value })}
                  placeholder="ej. Reporte semanal del Bazar"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Frecuencia (Legible)</label>
                  <input
                    required
                    type="text"
                    value={jobForm.frecuencia_label}
                    onChange={(e) => setJobForm({ ...jobForm, frecuencia_label: e.target.value })}
                    placeholder="ej. Cada Lunes 10:00 AM"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Tipo de Acción</label>
                  <select
                    value={jobForm.tipo_accion}
                    onChange={(e) => setJobForm({ ...jobForm, tipo_accion: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="reporte_eje">Reporte de Eje</option>
                    <option value="flyer_canva">Generar Canva Flyer</option>
                    <option value="comunicado_borrador">Borrador Comunicado</option>
                    <option value="recordatorio">Recordatorio</option>
                    <option value="junta_expertos">Junta Mesa de Expertos</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg shadow-emerald-600/30"
              >
                Programar Tarea
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
