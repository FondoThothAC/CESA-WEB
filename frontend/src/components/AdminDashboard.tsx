'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

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
  const [stats, setStats] = useState<StatsData | null>(null);
  const [health, setHealth] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchHealth();
      const interval = setInterval(() => {
          fetchStats();
          fetchHealth();
      }, 30000); // 30s refresh
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stats.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.analytics);
    } catch (e) { console.error("Error stats", e); }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/health.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHealth(data);
    } catch (e) { console.error("Error health", e); }
  };

  if (!stats) return <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">Sincronizando con Servidores Federales...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8 animate-in fade-in duration-700">
      
      {/* Infrastructure Health Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {health && Object.entries(health.services).map(([name, data]: [string, any]) => (
          <div key={name} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold">{name}</p>
                <p className={`text-xs font-black ${data.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                  {data.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                </p>
             </div>
             {data.latency && <span className="text-[9px] text-slate-600 font-mono italic">{data.latency}</span>}
          </div>
        ))}
      </div>

      {/* Clima Universitario & Mood-o-meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.05)]">
           <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6 opacity-40">Mood Institucional (IA Analysis)</h3>
           <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle 
                        cx="80" cy="80" r="70" fill="none" 
                        stroke="#4f46e5" strokeWidth="12" 
                        strokeDasharray="440" strokeDashoffset={440 - (440 * stats.sentiment.mood_score) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{stats.sentiment.mood_score}%</span>
                    <span className="text-[10px] uppercase text-indigo-400 font-black">Positivo</span>
                 </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                 {[
                    { label: 'Positivos', val: stats.sentiment.positivo, color: 'bg-green-500' },
                    { label: 'Neutros', val: stats.sentiment.neutro, color: 'bg-slate-500' },
                    { label: 'Urgentes/Reportes', val: stats.sentiment.negativo, color: 'bg-red-500' }
                 ].map((item) => (
                    <div key={item.label}>
                       <div className="flex justify-between text-[10px] uppercase font-bold text-white/60 mb-1">
                          <span>{item.label}</span>
                          <span>{item.val}</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full transition-all duration-700`} style={{ width: `${stats.sentiment.positivo > 0 ? (item.val/10)*100 : 0}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="glass p-8 flex flex-col justify-center items-center text-center border-red-500/20">
           <div className="text-4xl mb-4">🚨</div>
           <h4 className="text-white font-black text-3xl">{stats.sentiment.urgentes_detectados}</h4>
           <p className="text-red-400 text-[10px] uppercase font-black tracking-widest mt-2">Casos Críticos Sin Resolver</p>
           <button className="mt-6 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-xl text-[10px] uppercase font-bold text-red-400 hover:bg-red-600/20 transition-all">Priorizar Reportes →</button>
        </div>
      </div>

      {/* IA MONITORING FEED */}
      <div className="glass p-0 border-indigo-500/10 overflow-hidden">
         <div className="p-6 border-b border-white/5 flex justify-between items-center bg-indigo-900/10">
            <h3 className="text-white font-black uppercase text-xs tracking-widest opacity-60">Actividad Reciente del "Búho"</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] italic text-indigo-400">Latencia media: {stats.ia_monitoring.avg_latency_ms}ms</span>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-white/5 text-[10px] uppercase text-white/40">
                  <tr>
                     <th className="px-6 py-3 font-black">Usuario</th>
                     <th className="px-6 py-3 font-black">Habilidad Activada</th>
                     <th className="px-6 py-3 font-black">Timestamp</th>
                     <th className="px-6 py-3 font-black">Estado</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {stats.ia_monitoring.recent_activity.map((a, i) => (
                     <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{a.nombre}</td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded-md text-[10px] font-mono">{a.accion_tipo}</span>
                        </td>
                        <td className="px-6 py-4 text-white/40 text-xs">{new Date(a.created_at).toLocaleTimeString()}</td>
                        <td className="px-6 py-4">
                           <span className="text-green-500 text-[10px] uppercase font-black">Procesado</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Estudiantes', val: stats.comunidad.usuarios_registrados, icon: '🎓' },
            { label: 'Empleos Activos', val: stats.bolsa_trabajo.vacantes_activas, icon: '💼' },
            { label: 'Bazar Units', val: stats.bazar_emprendedor.negocios_activos, icon: '🛍️' },
            { label: 'Muro Social', val: stats.comunidad.actividad_muro, icon: '💬' }
        ].map((kpi) => (
            <div key={kpi.label} className="glass p-6 border-white/5 hover:border-indigo-500/40 transition-all flex flex-col items-center text-center">
                <span className="text-2xl mb-2">{kpi.icon}</span>
                <span className="text-3xl font-black text-white">{kpi.val}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">{kpi.label}</span>
            </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
