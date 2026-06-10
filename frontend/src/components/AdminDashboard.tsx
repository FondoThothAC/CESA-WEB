'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import AdminInvitations from './AdminInvitations';

interface StatsData {
  sentiment: {
    positivo: number; neutro: number; negativo: number; urgentes_detectados: number; mood_score: number;
  };
  bolsa_trabajo: { vacantes_activas: number; postulaciones_totales: number; empresas_aliadas: number; };
  bazar_emprendedor: { negocios_activos: number; categorias_top: string[]; clic_contacto_total: number; };
  comunidad: { usuarios_registrados: number; actividad_muro: number; carreras_activas: number; };
  ia_monitoring: {
    avg_latency_ms: number;
    recent_activity: Array<{ nombre: string; accion_tipo: string; created_at: string; metadata: any }>;
  };
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'moderacion' | 'directorio' | 'vacantes' | 'ia_config' | 'invitaciones' | 'acceso' | 'social' | 'modo_dios'>('kpis');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [accessResult, setAccessResult] = useState<any>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [pendingBazar, setPendingBazar] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [pendingVacancies, setPendingVacancies] = useState<any[]>([]);
  const [iaConfigs, setIaConfigs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { token, user } = useAuth();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Estados del Panel Social
  const [socialConfig, setSocialConfig] = useState<any>(null);
  const [socialLoading, setSocialLoading] = useState(true);
  const [igFormData, setIgFormData] = useState({
    client_id: '',
    client_secret: '',
    page_id: '',
    instagram_business_id: ''
  });
  const [waFormData, setWaFormData] = useState({
    phone_number_id: '',
    waba_id: '',
    access_token: '',
    verify_token: ''
  });
  const [testPublishing, setTestPublishing] = useState(false);
  const [testPostData, setTestPostData] = useState({
    image_url: '',
    caption: ''
  });

  // Estados del Modo Dios (Publicidad)
  const [adConfig, setAdConfig] = useState({
    activo: false,
    publisher_id: '',
    banner_slot_id: '',
    interstitial_slot_id: '',
    frecuencia_diaria: 2
  });
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'social') {
        setActiveTab('social');
      }
      if (params.get('connected') === 'true') {
        alert('¡Instagram conectado con éxito!');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (params.get('error')) {
        alert('Error al conectar Instagram: ' + params.get('error'));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      if (activeTab === 'kpis') {
         fetchStats();
         fetchHealth();
      } else if (activeTab === 'moderacion') {
        fetchModerationData();
      } else if (activeTab === 'directorio') {
        fetchDirectory();
      } else if (activeTab === 'vacantes') {
        fetchVacancies();
      } else if (activeTab === 'ia_config') {
        fetchIaConfig();
      } else if (activeTab === 'social') {
        fetchSocialConfig();
      } else if (activeTab === 'modo_dios') {
        fetchAdConfig();
      }
    }
  }, [token, activeTab, searchQuery]);

  const fetchAdConfig = async () => {
    setAdLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/publicidad.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAdConfig({
          activo: data.data.activo == 1,
          publisher_id: data.data.publisher_id || '',
          banner_slot_id: data.data.banner_slot_id || '',
          interstitial_slot_id: data.data.interstitial_slot_id || '',
          frecuencia_diaria: parseInt(data.data.frecuencia_diaria) || 2
        });
      }
    } catch (e) {
      console.error("Error al obtener publicidad_config", e);
    } finally {
      setAdLoading(false);
    }
  };

  const handleSaveAdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/publicidad.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adConfig)
      });
      const data = await res.json();
      if (data.success) {
        alert("Configuración de publicidad guardada con éxito.");
        fetchAdConfig();
      } else {
        alert(data.error || "Error al guardar la configuración de publicidad.");
      }
    } catch (e) {
      alert("Error de conexión con el backend.");
    } finally {
      setAdLoading(false);
    }
  };

  const fetchSocialConfig = async () => {
    setSocialLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/social/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSocialConfig(data);
        if (data.instagram) {
          setIgFormData({
            client_id: data.instagram.client_id || '',
            client_secret: '',
            page_id: data.instagram.page_id || '',
            instagram_business_id: data.instagram.instagram_business_id || ''
          });
        }
        if (data.whatsapp) {
          setWaFormData({
            phone_number_id: data.whatsapp.phone_number_id || '',
            waba_id: data.whatsapp.waba_id || '',
            access_token: '',
            verify_token: data.whatsapp.verify_token || ''
          });
        }
      }
    } catch (e) {
      console.error('Error fetching social config', e);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSaveSocial = async (platform: 'instagram' | 'whatsapp', data: any) => {
    try {
      const res = await fetch(`${API_URL}/api/social/config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform, ...data })
      });
      const resData = await res.json();
      if (resData.success) {
        alert('Configuración guardada correctamente.');
        fetchSocialConfig();
      } else {
        alert('Error al guardar la configuración.');
      }
    } catch (err) {
      alert('Error de conexión.');
    }
  };

  const handleTestPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPostData.image_url) return alert('Por favor ingresa la URL de la imagen.');
    setTestPublishing(true);
    try {
      const res = await fetch(`${API_URL}/api/social/instagram/post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPostData)
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Publicación exitosa en Instagram! ID: ' + data.media_id);
        setTestPostData({ image_url: '', caption: '' });
      } else {
        alert('Error al publicar: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión con la API social.');
    } finally {
      setTestPublishing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stats.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.analytics);
    } catch (e) { console.error("Error stats", e); }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/health.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHealth(data);
    } catch (e) { console.error("Error health", e); }
  };

  const fetchModerationData = async () => {
     try {
        const resB = await fetch(`${API_URL}/api/admin/bazar.php?action=listar`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataB = await resB.json();
        if (dataB.success) setPendingBazar(dataB.data);

        const resR = await fetch(`${API_URL}/api/reportes.php?action=moderacion`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataR = await resR.json();
        if (dataR.success) setReports(dataR.data.filter((r: any) => r.estado === 'nuevo' || r.estado === 'asignado'));
     } catch (e) { console.error("Error moderation fetch", e); }
  };

  const fetchDirectory = async () => {
     try {
        const res = await fetch(`${API_URL}/api/admin/usuarios.php?q=${searchQuery}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setDirectory(data.data);
     } catch (e) {}
  };

  const fetchVacancies = async () => {
     try {
        const res = await fetch(`${API_URL}/api/admin/empleos.php?action=listar`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setPendingVacancies(data.data.filter((v: any) => !v.verificada));
     } catch (e) {}
  };

  const fetchIaConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/config.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setIaConfigs(data.data);
    } catch (e) {}
  };

  const handleAccessValidation = async (qrData: string) => {
    setAccessLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/acceso.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qr_data: qrData })
      });
      const data = await res.json();
      setAccessResult(data);
    } catch (e) {
      alert("Error de conexión con el validador");
    } finally {
      setAccessLoading(false);
    }
  };

  const handleModeration = async (type: 'bazar' | 'reporte' | 'vacante' | 'user', id: number, action: string, extra = {}) => {
     const formData = new FormData();
     formData.append('id', id.toString());
     formData.append('action', action);
     Object.entries(extra).forEach(([k, v]) => formData.append(k, v as string));

     const endpoint = (type === 'user') ? '/api/admin/usuarios.php' : '/api/admin/moderacion.php';

     try {
        const res = await fetch(`${API_URL}${endpoint}`, {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${token}` },
           body: formData
        });
        const data = await res.json();
        if (data.success) {
           if (type === 'bazar' || type === 'reporte') fetchModerationData();
           if (type === 'vacante') fetchVacancies();
           if (type === 'user') fetchDirectory();
        }
     } catch (e) { alert("Error al procesar"); }
  };

  const saveIaConfig = async (config: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/config.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        alert("IA Configurada correctamente");
        fetchIaConfig();
      }
    } catch (e) { alert("Error al guardar IA Config"); }
  };

  if (!stats) return <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">Sincronizando Gobernanza...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8 animate-in fade-in duration-700">
      
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-6">
         {[
            { id: 'kpis', label: 'Analytics', color: 'bg-indigo-600' },
            { id: 'moderacion', label: `Moderación (${reports.length + pendingBazar.length})`, color: 'bg-red-600' },
            { id: 'vacantes', label: `Bolsa (${pendingVacancies.length})`, color: 'bg-green-600' },
            { id: 'directorio', label: 'Usuarios', color: 'bg-slate-700' },
            { id: 'ia_config', label: 'Motor IA (Setup)', color: 'bg-purple-600' },
            { id: 'social', label: 'Panel Social', color: 'bg-pink-600' },
            { id: 'invitaciones', label: 'Onboarding (CSV)', color: 'bg-indigo-600 border border-indigo-500' },
            { id: 'acceso', label: 'Control de Acceso (QR)', color: 'bg-emerald-600' }
         ].map((t) => (
            <button 
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={`text-[9px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all ${activeTab === t.id ? `${t.color} text-white shadow-lg` : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800'}`}
            >
               {t.label}
            </button>
         ))}
         {user?.email === 'software@fondothoth.com' && (
            <button 
               onClick={() => setActiveTab('modo_dios')}
               className={`text-[9px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all ${activeTab === 'modo_dios' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900/50 text-amber-500 border border-amber-500/30 hover:bg-slate-800'}`}
            >
               ⚡ MODO DIOS (Ads)
            </button>
         )}
      </div>

      {activeTab === 'kpis' && (
         <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {health && Object.entries(health.services).map(([name, data]: [string, any]) => (
               <div key={name} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xl">
                  <div>
                     <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest">{name}</p>
                     <p className={`text-xs font-black ${data.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                        {data.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                     </p>
                  </div>
                  {data.latency && <span className="text-[9px] text-slate-600 font-mono italic">{data.latency}ms</span>}
               </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-slate-900/40 p-10 rounded-[2.5rem] border border-indigo-500/10 backdrop-blur-3xl shadow-2xl">
                  <h3 className="text-white font-black uppercase text-[10px] tracking-widest mb-8 opacity-40">Mood Institucional (IA)</h3>
                  <div className="flex flex-col md:flex-row items-center gap-12">
                     <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="88" cy="88" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
                           <circle 
                              cx="88" cy="88" r="80" fill="none" 
                              stroke="url(#gradMood)" strokeWidth="14" 
                              strokeDasharray="502" strokeDashoffset={502 - (502 * stats.sentiment.mood_score) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                           />
                           <defs>
                              <linearGradient id="gradMood" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor="#4f46e5" />
                                 <stop offset="100%" stopColor="#818cf8" />
                               </linearGradient>
                           </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-5xl font-black text-white">{stats.sentiment.mood_score}%</span>
                           <span className="text-[9px] uppercase text-indigo-400 font-black tracking-widest mt-1">Status: Óptimo</span>
                        </div>
                     </div>
                     <div className="flex-1 w-full space-y-6">
                        {[{ label: 'Aceptación Estudiantil', val: stats.sentiment.positivo, color: 'bg-indigo-500' },
                          { label: 'Indiferencia/Neutral', val: stats.sentiment.neutro, color: 'bg-slate-600' },
                          { label: 'Conflictos Pendientes', val: stats.sentiment.negativo, color: 'bg-red-500' }
                        ].map((item) => (
                           <div key={item.label} className="space-y-2">
                              <div className="flex justify-between text-[8px] uppercase font-black text-slate-500 tracking-widest">
                                 <span>{item.label}</span>
                                 <span className="text-white">{item.val} casos</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className={`${item.color} h-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]`} style={{ width: `${(item.val / 10) * 100}%` }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div className="bg-red-600/5 p-10 rounded-[2.5rem] border border-red-500/20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center text-3xl mb-6 animate-pulse">📢</div>
                  <h4 className="text-white font-black text-4xl mb-1">{stats.sentiment.urgentes_detectados}</h4>
                  <p className="text-red-400 text-[10px] uppercase font-black tracking-widest mb-8">Crisis en Resolución</p>
                  <button onClick={() => setActiveTab('moderacion')} className="w-full bg-red-600 hover:bg-white hover:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Atender Incidentes</button>
               </div>
            </div>
         </>
      )}

      {activeTab === 'moderacion' && (
         <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Buzón de Incidencias Institucionales</h3>
               <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-950 border-b border-white/5">
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Tipo / Folio</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Asunto / Contenido / IA</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Comité Asignado</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {reports.map((rep) => (
                           <tr key={rep.id} className="hover:bg-white/[0.02]">
                              <td className="px-8 py-6">
                                 <span className="text-white font-black text-xs block">#{rep.id} {rep.tipo}</span>
                                 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    rep.prioridad === 'urgente' || rep.prioridad === 'critica' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                                 }`}>{rep.prioridad}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-white text-xs font-bold mb-1 flex items-center gap-2">
                                   {rep.asunto}
                                   {rep.requiere_atencion_humana === 1 && (
                                     <span className="bg-red-600/25 border border-red-500 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                       ⚠️ REQUIERE REVISIÓN HUMANA
                                     </span>
                                   )}
                                 </p>
                                 <p className="text-slate-400 text-[10px] max-w-md line-clamp-2">{rep.descripcion}</p>
                                 {rep.analisis_ia && (
                                   <div className="mt-2 text-[9px] text-slate-300 bg-indigo-950/20 border border-indigo-900/30 px-3 py-1.5 rounded-xl max-w-md">
                                     <span className="font-black text-indigo-400 uppercase tracking-widest text-[7px] block mb-0.5">Análisis IA de Delegación:</span>
                                     {rep.analisis_ia}
                                   </div>
                                 )}
                              </td>
                              <td className="px-8 py-6">
                                 <span className="bg-slate-950 text-slate-400 border border-white/5 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl block w-max">
                                    🏛️ {rep.coordinacion_asignada || 'sin asignar'}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => {
                                    const res = prompt("Respuesta para el reporte:");
                                    if(res) handleModeration('reporte', rep.id, 'resolver_reporte', { respuesta: res, estado: 'resuelto' });
                                 }} className="bg-white text-black px-6 py-2 rounded-xl text-[9px] font-black uppercase">Atender</button>
                              </td>
                           </tr>
                        ))}
                        {reports.length === 0 && (
                           <tr><td colSpan={4} className="px-8 py-10 text-center text-white/20 text-[9px] uppercase font-black tracking-widest">No hay reportes nuevos</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Bazar Emprendedor (Pendientes / Karma)</h3>
               <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-950 border-b border-white/5">
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Negocio / Emprendedor</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Karma / Reputación</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {pendingBazar.map((prod) => (
                           <tr key={prod.id} className="hover:bg-white/[0.02]">
                              <td className="px-8 py-6">
                                 <span className="text-white font-black text-xs block">{prod.nombre_negocio}</span>
                                 <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest italic">Por: {prod.emprendedor}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="text-center">
                                       <p className="text-[10px] font-black text-indigo-400">{prod.karma_score || 0}</p>
                                       <p className="text-[7px] uppercase font-black text-slate-600 tracking-widest">Karma</p>
                                    </div>
                                    <div className="w-px h-6 bg-white/5"></div>
                                    <div className="text-center">
                                       <p className={`text-[10px] font-black ${prod.reputation_score >= 70 ? 'text-green-500' : 'text-amber-500'}`}>{prod.reputation_score || '--'}%</p>
                                       <p className="text-[7px] uppercase font-black text-slate-600 tracking-widest">IA Repo</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex gap-2 justify-end">
                                    {!prod.verificado ? (
                                       <button 
                                          onClick={() => handleModeration('bazar', prod.id, 'verificar_negocio')}
                                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase"
                                       >
                                          Verificar
                                       </button>
                                    ) : (
                                       <span className="text-emerald-500 text-[8px] font-black uppercase border border-emerald-500/20 px-3 py-1 rounded-lg">Live</span>
                                    ) }
                                    <button 
                                       onClick={() => handleModeration('bazar', prod.id, 'rechazar_negocio')}
                                       className="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-red-500/20"
                                    >
                                       Ocultar
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {pendingBazar.length === 0 && (
                           <tr><td colSpan={3} className="px-8 py-10 text-center text-white/20 text-[9px] uppercase font-black tracking-widest">No hay negocios pendientes de revisión</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'ia_config' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Misión Control: Motor de IA Híbrido</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['mac_mini', 'groq', 'gemini'].map(provider => {
                const config = iaConfigs.find(c => c.provider === provider) || { provider, endpoint_url: '', model_name: '', is_active: 1 };
                return (
                  <div key={provider} className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-black text-xl uppercase tracking-tighter">{provider.replace('_', ' ')}</h4>
                      <div className={`w-3 h-3 rounded-full ${config.is_active ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Endpoint URL</label>
                        <input 
                          type="text" 
                          defaultValue={config.endpoint_url}
                          placeholder="https://..."
                          onBlur={(e) => saveIaConfig({...config, endpoint_url: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Model Name</label>
                        <input 
                          type="text" 
                          defaultValue={config.model_name}
                          placeholder="llama3-8b-8192"
                          onBlur={(e) => saveIaConfig({...config, model_name: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">API KEY (Cifrada en tránsito)</label>
                        <input 
                          type="password" 
                          placeholder="••••••••••••••••"
                          onBlur={(e) => e.target.value && saveIaConfig({...config, api_key: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
           </div>
        </div>
      )}

      {activeTab === 'directorio' && (
         <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Directorio Institucional</h3>
               <input 
                  type="text" 
                  placeholder="Buscar alumno o correo..."
                  className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-indigo-500 outline-none w-full md:w-96 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-950 border-b border-white/5">
                        <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Identidad</th>
                        <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Correo</th>
                        <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Rol</th>
                        <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black text-right">Control</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {directory.map((u) => (
                        <tr key={u.id} className={`hover:bg-white/[0.02] ${!u.active ? 'opacity-30' : ''}`}>
                           <td className="px-8 py-6">
                              <span className="text-white font-black text-sm block">{u.nombre_completo}</span>
                              <span className="text-indigo-400 text-[8px] font-black uppercase tracking-tighter">{u.carrera}</span>
                           </td>
                           <td className="px-8 py-6 text-slate-400 text-xs font-mono">{u.email}</td>
                           <td className="px-8 py-6">
                              <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-slate-700 text-slate-500">
                                 {u.rol}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex gap-2 justify-end">
                                 <button onClick={() => {
                                    const nr = prompt("Nuevo rol:", u.rol);
                                    if(nr) handleModeration('user', u.id, 'update_role', { rol: nr });
                                 }} className="p-2 bg-slate-800 rounded-xl text-white">⚙️</button>
                                 <button onClick={() => handleModeration('user', u.id, 'toggle_active', { active: u.active ? 0 : 1 })} className="p-2 bg-red-600/10 text-red-500 rounded-xl">
                                    {u.active ? 'BAN' : 'ACT'}
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'invitaciones' && (
        <AdminInvitations />
      )}

      {activeTab === 'acceso' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Validador de Identidad Digital</h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                 <div className="space-y-2">
                    <h4 className="text-white font-bold text-lg">Escanear o Ingresar Código</h4>
                    <p className="text-slate-500 text-xs">Pega el código QR dinámico o usa la cámara (vía PWA en móvil) para validar al alumno.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <textarea 
                       placeholder="Ingresa los datos del QR aquí..."
                       className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-xs text-white h-40 focus:border-emerald-500 outline-none font-mono"
                       onBlur={(e) => e.target.value && handleAccessValidation(e.target.value)}
                    ></textarea>
                    <button 
                       disabled={accessLoading}
                       className="w-full bg-emerald-600 hover:bg-white hover:text-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                       {accessLoading ? 'Sincronizando con CESA...' : 'Validar Identidad Manualmente'}
                    </button>
                 </div>
              </div>

              {accessResult && (
                 <div className={`p-10 rounded-[2.5rem] border animate-in zoom-in duration-300 ${accessResult.success ? 'bg-emerald-500/10 border-emerald-500' : 'bg-red-500/10 border-red-500'}`}>
                    {accessResult.success ? (
                       <div className="space-y-8 text-center">
                          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-xl shadow-emerald-500/20">
                             <i className="fas fa-check"></i>
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{accessResult.student.nombre_completo}</h4>
                             <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">{accessResult.student.carrera} • Acceso Válido</p>
                          </div>
                          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                             <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Estado: Activo institucionalmente</p>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-8 text-center">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-xl shadow-red-600/20">
                             <i className="fas fa-times"></i>
                          </div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tighter">Acceso Denegado</h4>
                          <p className="text-red-400 text-xs">{accessResult.error}</p>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Control de Ecosistema Social</h3>

          {socialLoading ? (
            <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">Cargando Ajustes de Redes Sociales...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-pink-500/10 space-y-6 flex flex-col justify-between shadow-2xl animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                      📷 Instagram Business
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${socialConfig?.instagram?.connected ? 'bg-green-500/25 border border-green-500 text-green-500' : 'bg-red-500/25 border border-red-500 text-red-500'}`}>
                      {socialConfig?.instagram?.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSocial('instagram', igFormData); }} className="space-y-4">
                    <div>
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Facebook App ID</label>
                      <input 
                        type="text" 
                        value={igFormData.client_id}
                        onChange={(e) => setIgFormData({...igFormData, client_id: e.target.value})}
                        placeholder="Ingresa App ID"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-pink-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Facebook App Secret</label>
                      <input 
                        type="password" 
                        value={igFormData.client_secret}
                        onChange={(e) => setIgFormData({...igFormData, client_secret: e.target.value})}
                        placeholder={socialConfig?.instagram?.has_secret ? '••••••••••••••••' : 'Ingresa App Secret'}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-pink-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Facebook Page ID</label>
                        <input 
                          type="text" 
                          value={igFormData.page_id}
                          onChange={(e) => setIgFormData({...igFormData, page_id: e.target.value})}
                          placeholder="Page ID"
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-pink-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">IG Business Account ID</label>
                        <input 
                          type="text" 
                          value={igFormData.instagram_business_id}
                          onChange={(e) => setIgFormData({...igFormData, instagram_business_id: e.target.value})}
                          placeholder="Auto-detectado al conectar"
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-pink-500 outline-none"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                      Guardar Credenciales
                    </button>
                  </form>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-4">
                  <a 
                    href="/api/social/instagram/login" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-center block py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-pink-500/10"
                  >
                    🚀 Conectar con Meta / Instagram
                  </a>

                  {socialConfig?.instagram?.connected && (
                    <form onSubmit={handleTestPublish} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3">
                      <p className="text-[8px] uppercase font-black text-indigo-400 tracking-widest">Publicación de Prueba</p>
                      <input 
                        type="url" 
                        placeholder="URL de la imagen (debe ser pública)" 
                        value={testPostData.image_url}
                        onChange={(e) => setTestPostData({...testPostData, image_url: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Pie de foto..." 
                        value={testPostData.caption}
                        onChange={(e) => setTestPostData({...testPostData, caption: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                      />
                      <button 
                        type="submit" 
                        disabled={testPublishing}
                        className="w-full bg-pink-600 hover:bg-pink-500 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        {testPublishing ? 'Publicando...' : 'Publicar a Instagram'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-emerald-500/10 space-y-6 flex flex-col justify-between shadow-2xl animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                      💬 WhatsApp Cloud API
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${socialConfig?.whatsapp?.has_token ? 'bg-green-500/25 border border-green-500 text-green-500' : 'bg-red-500/25 border border-red-500 text-red-500'}`}>
                      {socialConfig?.whatsapp?.has_token ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSocial('whatsapp', waFormData); }} className="space-y-4">
                    <div>
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Phone Number ID</label>
                      <input 
                        type="text" 
                        value={waFormData.phone_number_id}
                        onChange={(e) => setWaFormData({...waFormData, phone_number_id: e.target.value})}
                        placeholder="Phone Number ID"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">WhatsApp Business Account ID (WABA ID)</label>
                      <input 
                        type="text" 
                        value={waFormData.waba_id}
                        onChange={(e) => setWaFormData({...waFormData, waba_id: e.target.value})}
                        placeholder="WABA ID"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Webhook Verify Token</label>
                      <input 
                        type="text" 
                        value={waFormData.verify_token}
                        onChange={(e) => setWaFormData({...waFormData, verify_token: e.target.value})}
                        placeholder="cesa_unison_2026"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Permanent Access Token (System User)</label>
                      <textarea 
                        value={waFormData.access_token}
                        onChange={(e) => setWaFormData({...waFormData, access_token: e.target.value})}
                        placeholder={socialConfig?.whatsapp?.has_token ? '••••••••••••••••••••••••••••••••' : 'Ingresa token permanente de Meta'}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white h-24 focus:border-emerald-500 outline-none font-mono"
                      ></textarea>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all">
                      Guardar Configuración WhatsApp
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'modo_dios' && user?.email === 'software@fondothoth.com' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              ⚡ Modo Dios: Configuración de Publicidad
            </h3>
            <span className="bg-amber-500/20 border border-amber-500 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-xl">
              GOD MODE ACTIVE
            </span>
          </div>

          {adLoading ? (
            <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">
              Sincronizando Publicidad...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de Configuración de Anuncios */}
              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-amber-500/10 space-y-6">
                <form onSubmit={handleSaveAdConfig} className="space-y-6">
                  {/* Switch Activo */}
                  <div className="flex justify-between items-center bg-black/30 p-5 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-xs font-black text-white uppercase">Estado de Publicidad</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Activar o desactivar anuncios en la plataforma</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdConfig({ ...adConfig, activo: !adConfig.activo })}
                      className={`w-14 h-8 rounded-full transition-all duration-300 relative ${adConfig.activo ? 'bg-amber-500' : 'bg-slate-800'}`}
                    >
                      <span className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 ${adConfig.activo ? 'right-1' : 'left-1'}`}></span>
                    </button>
                  </div>

                  {/* Publisher ID */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Google AdMob / AdSense Publisher ID</label>
                    <input
                      type="text"
                      value={adConfig.publisher_id}
                      onChange={(e) => setAdConfig({ ...adConfig, publisher_id: e.target.value })}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  {/* Banner Slot ID */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Banner Ad Unit / Slot ID (Bazar)</label>
                    <input
                      type="text"
                      value={adConfig.banner_slot_id}
                      onChange={(e) => setAdConfig({ ...adConfig, banner_slot_id: e.target.value })}
                      placeholder="9876543210"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  {/* Interstitial Slot ID */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Interstitial Ad Unit / Slot ID (Pantalla Completa)</label>
                    <input
                      type="text"
                      value={adConfig.interstitial_slot_id}
                      onChange={(e) => setAdConfig({ ...adConfig, interstitial_slot_id: e.target.value })}
                      placeholder="1234567890"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  {/* Frecuencia Diaria */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Frecuencia Máxima de Pantalla Completa (Veces al día)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={adConfig.frecuencia_diaria}
                      onChange={(e) => setAdConfig({ ...adConfig, frecuencia_diaria: parseInt(e.target.value) || 2 })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10"
                  >
                    Guardar Cambios de Publicidad
                  </button>
                </form>
              </div>

              {/* Guía informativa de integración */}
              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-white/10 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-base uppercase">Guía de Publicidad y AdMob</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Esta configuración expone los parámetros de publicidad mediante la base de datos de forma dinámica.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                    <li>Los banners se renderizan al fondo del Bazar con el slot especificado.</li>
                    <li>Los anuncios de pantalla completa (Interstitial) se activarán en el simulador de examen cada 10 preguntas.</li>
                    <li>La frecuencia diaria se calcula por sesión local de usuario mediante LocalStorage para evitar saturación de la experiencia estudiantil.</li>
                  </ul>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-amber-500 tracking-widest mb-1">Nota del Sistema</p>
                  <p className="text-[10px] text-slate-500">Solo cuentas con privilegios de escritura en esta configuración al estar logueado como software@fondothoth.com.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
