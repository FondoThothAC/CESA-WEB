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
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/stats.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.analytics);
    } catch (e) {
      console.error("Error stats", e);
    }
  };

  if (!stats) return <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">Cargando Inteligencia Institucional...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8 animate-in fade-in duration-700">
      
      {/* Sentimiento & Mood-o-meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 border-[var(--primary)] shadow-[0_0_50px_rgba(26,115,232,0.1)]">
           <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6 opacity-40">Clima Universitario (Sentiment AI)</h3>
           <div className="flex items-center gap-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle 
                        cx="80" cy="80" r="70" fill="none" 
                        stroke="var(--primary)" strokeWidth="12" 
                        strokeDasharray="440" strokeDashoffset={440 - (440 * stats.sentiment.mood_score) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{stats.sentiment.mood_score}%</span>
                    <span className="text-[10px] uppercase text-[var(--primary)] font-black">Positivo</span>
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 {[
                    { label: 'Positivos', val: stats.sentiment.positivo, color: 'bg-green-500' },
                    { label: 'Neutros', val: stats.sentiment.neutro, color: 'bg-blue-500' },
                    { label: 'Quejas/Negativos', val: stats.sentiment.negativo, color: 'bg-red-500' }
                 ].map((item) => (
                    <div key={item.label}>
                       <div className="flex justify-between text-[10px] uppercase font-bold text-white/60 mb-1">
                          <span>{item.label}</span>
                          <span>{item.val}</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full`} style={{ width: `${(item.val/54)*100}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="glass p-8 flex flex-col justify-center items-center text-center border-red-500/20">
           <div className="text-4xl mb-4">🚨</div>
           <h4 className="text-white font-black text-3xl">{stats.sentiment.urgentes_detectados}</h4>
           <p className="text-red-400 text-[10px] uppercase font-black tracking-widest mt-2">Casos Urgentes Detectados</p>
           <button className="mt-6 text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors">Ver Reportes Prioritarios →</button>
        </div>
      </div>

      {/* Métricas de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Alumnos Activos', val: stats.comunidad.usuarios_registrados, icon: '👥' },
            { label: 'Vacantes en Bolsa', val: stats.bolsa_trabajo.vacantes_activas, icon: '💼' },
            { label: 'Emprendimientos', val: stats.bazar_emprendedor.negocios_activos, icon: '🚀' },
            { label: 'Postulaciones', val: stats.bolsa_trabajo.postulaciones_totales, icon: '📄' }
        ].map((kpi) => (
            <div key={kpi.label} className="glass p-6 border-white/5 group hover:border-[var(--primary)] transition-all">
                <div className="text-2xl mb-4 group-hover:scale-110 transition-transform inline-block">{kpi.icon}</div>
                <div className="text-2xl font-black text-white">{kpi.val}</div>
                <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest">{kpi.label}</div>
            </div>
        ))}
      </div>

      {/* Actividad Bazar */}
      <div className="glass p-8 border-white/5">
         <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6 opacity-40">Impacto Económico (Bazar Emprendedor)</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-black text-white">{stats.bazar_emprendedor.clic_contacto_total}</div>
                    <div className="text-[10px] uppercase text-[var(--accent)] font-black">Interacciones de Venta</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white/60">Top Categorías</div>
                    <div className="flex gap-2">
                       {stats.bazar_emprendedor.categorias_top.map(c => <span key={c} className="text-[9px] uppercase font-bold px-2 py-0.5 bg-white/5 rounded-md">{c}</span>)}
                    </div>
                  </div>
               </div>
               <div className="h-20 flex items-end gap-1">
                  {[40, 70, 45, 90, 65, 80, 55, 100, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-[var(--primary)] opacity-20 hover:opacity-100 transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
               </div>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-6 flex flex-col justify-center">
               <p className="text-white/60 text-xs italic leading-relaxed">
                  "El análisis de datos permite al CESA gestionar recursos basándose en la realidad estudiantil, optimizando la respuesta institucional en un 35% respecto al periodo anterior."
               </p>
               <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]"></div>
                  <div>
                     <p className="text-white text-[10px] font-black uppercase">Roberto Celis</p>
                     <p className="text-white/20 text-[9px] uppercase">Presidente CESA 2026-2028</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
