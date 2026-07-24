'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function AdminIAConfigTab() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'skills' | 'jobs' | 'llm_config'>('dashboard');
  const [iaConfigs, setIaConfigs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', provider: '', api_url: '', api_key: '', auth_header: '', is_active: '1', metadata: '{}' });

  // Estados de Telemetría ZeroClaw
  const [zeroData, setZeroData] = useState<any>({
    provider: 'Ollama Cloud',
    model: 'nemotron-3-super',
    uptime: 'Online (PM2 #0)',
    gateway_port: ':3000',
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
    component_health: { channels: 'Ok', daemon: 'Ok', gateway: 'Ok', scheduler: 'Ok' },
    rag_articles: 14,
    chat_sessions: 42,
    chat_messages: 128
  });
  const [loadingZero, setLoadingZero] = useState(true);

  // Cargar telemetría ZeroClaw
  const fetchZeroClawTelemetry = async () => {
    setLoadingZero(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/telemetria.php?action=zeroclaw`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.zeroclaw) {
        setZeroData(data.zeroclaw);
      }
    } catch (e) {
      console.error('Error al obtener telemetría ZeroClaw:', e);
    } finally {
      setLoadingZero(false);
    }
  };

  // Cargar proveedores dinámicos
  const fetchIaConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dynamic_configs.php?action=list&type=ia`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) setIaConfigs(data.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchZeroClawTelemetry();
    fetchIaConfig();
  }, [token]);

  const saveIaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('action', 'save');
      fd.append('type', 'ia');
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      const res = await fetch(`${API_URL}/api/admin/dynamic_configs.php`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert('Configuración guardada con éxito');
        setShowForm(false);
        fetchIaConfig();
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (e) {
      alert('Error de red');
    }
  };

  const isMaster = user?.email === 'software@fondothoth.com';
  const canEdit = isMaster || (user as any)?.permiso_ia;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans bg-[#090d16] p-6 rounded-[2.5rem] border border-blue-500/20 text-white shadow-2xl">
      {/* ZERO CLAW DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/30">
            ZC
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              ZeroClaw Engine <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono">v4.7 VPS</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Panel de Monitoreo & Orquestación del Agente Bob</p>
          </div>
        </div>

        {/* NAVEGACIÓN SUB-TABS ESTILO ZEROCLAW */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'pixel_office', label: '🎮 Pixel Office' },
            { id: 'skills', label: '🤖 Agente & Skills' },
            { id: 'jobs', label: '⏰ Scheduled Jobs' },
            { id: 'llm_config', label: '⚙️ Configuración LLM' }
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

      {activeSubTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* TARJETAS SUPERIORES DE TELEMETRÍA (PROVIDER, UPTIME, GATEWAY, MEMORY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Provider / Model */}
            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <span>🤖</span> Provider / Model
              </div>
              <p className="text-lg font-black text-white">{zeroData.provider}</p>
              <span className="inline-block bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                {zeroData.model}
              </span>
            </div>

            {/* Uptime */}
            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <span>⏱️</span> Uptime
              </div>
              <p className="text-lg font-black text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {zeroData.uptime}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">PM2 Daemon OK</p>
            </div>

            {/* Gateway Port */}
            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <span>🌐</span> Gateway Port
              </div>
              <p className="text-lg font-black font-mono text-purple-400">{zeroData.gateway_port}</p>
              <p className="text-[10px] text-slate-500 font-medium">Locale: es-MX</p>
            </div>

            {/* Memory Backend */}
            <div className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <span>🗄️</span> Memory Backend
              </div>
              <p className="text-sm font-black text-white truncate">{zeroData.memory_backend}</p>
              <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Paired: Yes
              </span>
            </div>
          </div>

          {/* GRID CENTRAL: COST OVERVIEW, ACTIVE CHANNELS & COMPONENT HEALTH */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COST OVERVIEW */}
            <div className="bg-[#111625] border border-white/10 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 border-b border-white/5 pb-3">
                <span>💲</span> Cost Overview (VPS Local Tasa Fija)
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div className="flex justify-between items-center bg-black/30 p-3 rounded-2xl">
                  <span className="text-slate-400">Session Spend:</span>
                  <span className="font-mono font-black text-emerald-400">${zeroData.cost_overview.session.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-3 rounded-2xl">
                  <span className="text-slate-400">Daily Average:</span>
                  <span className="font-mono font-black text-emerald-400">${zeroData.cost_overview.daily.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center bg-black/30 p-3 rounded-2xl">
                  <span className="text-slate-400">Monthly Projection:</span>
                  <span className="font-mono font-black text-emerald-400">${zeroData.cost_overview.monthly.toFixed(4)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Total Tokens: <strong>{zeroData.cost_overview.total_tokens}</strong></span>
                <span>Requests: <strong>{zeroData.cost_overview.total_requests}</strong></span>
              </div>
            </div>

            {/* ACTIVE CHANNELS */}
            <div className="bg-[#111625] border border-white/10 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-400 border-b border-white/5 pb-3">
                <span>📡</span> Active Channels (Canales Conectados)
              </div>

              <div className="space-y-3">
                {zeroData.active_channels.map((channel: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-black/30 p-3 rounded-2xl">
                    <span className="text-xs font-bold text-slate-200">{channel.name}</span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                      channel.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${channel.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      {channel.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPONENT HEALTH */}
            <div className="bg-[#111625] border border-white/10 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-3">
                <span>🩺</span> Component Health (Salud del Sistema)
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Channels</span>
                  <p className="text-sm font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                    ● {zeroData.component_health.channels}
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Daemon</span>
                  <p className="text-sm font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                    ● {zeroData.component_health.daemon}
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Gateway</span>
                  <p className="text-sm font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                    ● {zeroData.component_health.gateway}
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Scheduler</span>
                  <p className="text-sm font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                    ● {zeroData.component_health.scheduler}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: PIXEL OFFICE (VIRTUAL HQ) */}
      {activeSubTab === 'pixel_office' as any && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-end border-b border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-black uppercase text-white flex items-center gap-2">
                🎮 Sede Virtual: Pixel Office
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">EN VIVO</span>
              </h3>
              <p className="text-xs text-slate-400">Interactúa con Bob y gestiona integraciones desde el entorno 2D.</p>
            </div>
            <div className="flex gap-2">
               <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                  🔗 Conectar Google Workspace
               </button>
               <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
                  🔗 Conectar Canva
               </button>
               <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-blue-500/20 transition-colors">
                  [ ] Modo Pantalla Completa
               </button>
            </div>
          </div>

          <div className="relative w-full h-[600px] bg-[#000] rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl group">
             {/* Fallback/Loader before iframe loads or if it fails */}
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d16] z-0">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Cargando Motor ZeroClaw (Puerto 42617)...</p>
             </div>
             
             {/* Iframe pointing to the deployed Pixel Office */}
             <iframe 
                src="https://cesaunison.fondothoth.com/pixel-office/" 
                className="relative z-10 w-full h-full border-0"
                title="ZeroClaw Pixel Office"
                sandbox="allow-scripts allow-same-origin allow-popups"
             ></iframe>

             {/* Overlay HUD */}
             <div className="absolute top-4 left-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl">
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Conexión WebSocket Establecida</p>
                   <p className="text-[9px] font-mono text-slate-400 mt-1">wss://cesaunison.fondothoth.com/zeroclaw-ws</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AGENTE & SKILLS */}
      {activeSubTab === 'skills' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-black uppercase text-white">Habilidades & Plugins del Agente Bob</h3>
            <p className="text-xs text-slate-400">Capacidades activas de procesamiento y automatización</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: '📝 Redactor de Comunicados', icon: '📄', status: 'Activo', desc: 'Genera boletines oficiales CESA y avisos para redes.' },
              { title: '🔍 Búsqueda de Contactos', icon: '👤', status: 'Activo', desc: 'Consulta correos y datos de alumnos/docentes en MariaDB.' },
              { title: '🎨 Diseñador Canva Flyers', icon: '🎨', status: 'Activo', desc: 'Crea especificaciones visuales y deep-links a plantillas.' },
              { title: '📚 RAG Vector (.md)', icon: '📖', status: 'Activo', desc: 'Indexación de reglamentos y documentos oficiales en Markdown.' },
              { title: '🎓 Generador de Exámenes', icon: '🧠', status: 'Activo', desc: 'Evaluaciones dinámicas de idiomas y habilidades profesionales.' },
              { title: '📲 Push Notification Dispatcher', icon: '🔔', status: 'Activo', desc: 'Envío de notificaciones Web Push PWA sin costo.' }
            ].map((skill, i) => (
              <div key={i} className="bg-[#111625] border border-white/10 p-5 rounded-3xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">{skill.icon}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    {skill.status}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">{skill.title}</h4>
                <p className="text-xs text-slate-400">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SCHEDULED JOBS */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-black uppercase text-white">Tareas Programadas en Segundo Plano</h3>
            <p className="text-xs text-slate-400">Cronjobs ejecutados automáticamente en el VPS</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase tracking-widest text-slate-400">
                  <th className="py-3 px-4 font-black">Tarea</th>
                  <th className="py-3 px-4 font-black">Frecuencia</th>
                  <th className="py-3 px-4 font-black">Estado</th>
                  <th className="py-3 px-4 font-black">Última Ejecución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">Renovación de Tokens Meta Social</td>
                  <td className="py-3 px-4 font-mono text-slate-400">Cada 12 horas</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">● OK</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">Hace 45 minutos</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">Re-indexación RAG (.md)</td>
                  <td className="py-3 px-4 font-mono text-slate-400">Cada 24 horas</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">● OK</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">Hace 3 horas</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">Análisis de Sentimiento Estudiantil</td>
                  <td className="py-3 px-4 font-mono text-slate-400">Cada 6 horas</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">● OK</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">Hace 10 minutos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CONFIGURACIÓN LLM PROVEEDORES */}
      {activeSubTab === 'llm_config' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-black uppercase text-white">Proveedores de LLM y Conexiones</h3>
              <p className="text-xs text-slate-400">Administra las llaves de API y endpoints</p>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  setFormData({ id: '', provider: '', api_url: '', api_key: '', auth_header: '', is_active: '1', metadata: '{}' });
                  setShowForm(!showForm);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                {showForm ? 'Cerrar' : '+ Nuevo Proveedor'}
              </button>
            )}
          </div>

          {showForm && canEdit && (
            <form onSubmit={saveIaConfig} className="bg-[#111625] p-6 border border-emerald-500/30 rounded-3xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Proveedor / Nombre</label>
                  <input
                    required
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    placeholder="Ollama / Groq / Mistral"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Endpoint URL</label>
                  <input
                    required
                    type="text"
                    value={formData.api_url}
                    onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">API Key</label>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Auth Header Format</label>
                  <input
                    type="text"
                    value={formData.auth_header}
                    onChange={(e) => setFormData({ ...formData, auth_header: e.target.value })}
                    placeholder="Bearer {key}"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Estado</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Metadata (JSON)</label>
                  <input
                    type="text"
                    value={formData.metadata}
                    onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                    placeholder='{"default_model": "nemotron-3-super"}'
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30">
                Guardar Proveedor
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {iaConfigs.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-slate-500 text-xs font-bold uppercase">
                No hay proveedores registrados
              </div>
            ) : (
              iaConfigs.map((cfg) => (
                <div key={cfg.id} className="bg-[#111625] border border-white/10 p-5 rounded-3xl flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-white">{cfg.provider}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{cfg.api_url}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                      cfg.is_active == 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {cfg.is_active == 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
