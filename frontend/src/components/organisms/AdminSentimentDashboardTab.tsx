'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function AdminSentimentDashboardTab() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [attentionStudents, setAttentionStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [personalProfile, setPersonalProfile] = useState<any>(null);
  const [personalLoading, setPersonalLoading] = useState(false);

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/sentiment_stats.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGlobalStats(data.metricas_globales);
        setAttentionStudents(data.alumnos_atencion || []);
      }
    } catch (e) {
      console.error("Error al cargar estadísticas globales de sentimiento", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalStats = async (studentId: number) => {
    setSelectedStudentId(studentId);
    setPersonalLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/sentiment_stats.php?usuario_id=${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPersonalProfile(data);
      }
    } catch (e) {
      console.error("Error al cargar perfil personal de sentimiento", e);
    } finally {
      setPersonalLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGlobalStats();
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/80 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span>🧠 Perfil Psicológico & OCEAN Big Five (Sentimiento Estudiantil)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mapeo multidimensional OCEAN (Apertura, Responsabilidad, Extraversión, Amabilidad, Neuroticismo/Estrés) y 7 Emociones Basales.
          </p>
        </div>
        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-black px-4 py-2 rounded-2xl mt-4 md:mt-0">
          🔒 Acceso Reservado Admin
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/30 uppercase tracking-widest font-black">
          Calculando radar psicométrico OCEAN de la universidad...
        </div>
      ) : (
        <>
          {/* MATRIZ OCEAN COLECTIVA (BIG FIVE) */}
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span>🌊 Mapeo Institucional OCEAN (Big Five)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-black/30 border border-cyan-500/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-black text-cyan-400 block mb-1">💡 Apertura (Openness)</span>
                <span className="text-2xl font-black text-white">{globalStats?.ocean_global?.openness || 50}%</span>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-cyan-400" style={{ width: `${globalStats?.ocean_global?.openness || 50}%` }}></div>
                </div>
              </div>

              <div className="bg-black/30 border border-blue-500/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-black text-blue-400 block mb-1">📋 Responsabilidad (C)</span>
                <span className="text-2xl font-black text-white">{globalStats?.ocean_global?.conscientiousness || 50}%</span>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-blue-400" style={{ width: `${globalStats?.ocean_global?.conscientiousness || 50}%` }}></div>
                </div>
              </div>

              <div className="bg-black/30 border border-amber-500/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-black text-amber-400 block mb-1">⚡ Extraversión (E)</span>
                <span className="text-2xl font-black text-white">{globalStats?.ocean_global?.extraversion || 50}%</span>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-amber-400" style={{ width: `${globalStats?.ocean_global?.extraversion || 50}%` }}></div>
                </div>
              </div>

              <div className="bg-black/30 border border-emerald-500/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-black text-emerald-400 block mb-1">🤝 Amabilidad (Agreeableness)</span>
                <span className="text-2xl font-black text-white">{globalStats?.ocean_global?.agreeableness || 50}%</span>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-400" style={{ width: `${globalStats?.ocean_global?.agreeableness || 50}%` }}></div>
                </div>
              </div>

              <div className="bg-black/30 border border-rose-500/20 p-4 rounded-2xl">
                <span className="text-[9px] uppercase font-black text-rose-400 block mb-1">⚠️ Neuroticismo / Estrés (N)</span>
                <span className="text-2xl font-black text-white">{globalStats?.ocean_global?.neuroticism || 30}%</span>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-rose-500" style={{ width: `${globalStats?.ocean_global?.neuroticism || 30}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LISTA DE ALUMNOS CON TENSIÓN DETECTADA */}
            <div className="lg:col-span-1 bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>⚠️ Monitoreo Preventivo por Alumnos</span>
              </h3>
              <p className="text-[10px] text-slate-500">Haz clic en un alumno para revisar su perfil OCEAN e historia psicométrica.</p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {attentionStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No hay alertas de tensión registradas.</p>
                ) : (
                  attentionStudents.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => fetchPersonalStats(st.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                        selectedStudentId === st.id ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold truncate max-w-[170px]">{st.nombre_completo}</p>
                        <p className="text-[9px] text-slate-500 font-mono">Exp: {st.matricula || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                          Estrés: {st.score_estres}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ANÁLISIS INDIVIDUAL PERSONAL CON MODELO OCEAN */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-6">
              {!selectedStudentId ? (
                <div className="text-center py-20 text-slate-500 text-xs font-medium">
                  👈 Selecciona a un alumno para visualizar su perfil OCEAN y 7 Emociones Basales.
                </div>
              ) : personalLoading ? (
                <div className="text-center py-20 text-white/30 uppercase tracking-widest font-black text-xs">
                  Cargando perfil OCEAN del estudiante...
                </div>
              ) : personalProfile ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-lg font-black text-white uppercase">{personalProfile.estudiante.nombre_completo}</h4>
                      <p className="text-xs text-slate-400 font-mono">{personalProfile.estudiante.email} • Exp: {personalProfile.estudiante.matricula || 'N/A'}</p>
                    </div>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-black uppercase px-3 py-1 rounded-xl">
                      {personalProfile.metricas.diagnostico}
                    </span>
                  </div>

                  {/* Barras OCEAN del Alumno */}
                  <div className="space-y-3 bg-black/30 border border-white/5 p-4 rounded-2xl">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">Perfil OCEAN de Personalidad Estudiantil</h5>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-cyan-400 block">Apertura</span>
                        <span className="text-sm font-black text-white">{personalProfile.metricas.ocean.openness}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-blue-400 block">Responsabilidad</span>
                        <span className="text-sm font-black text-white">{personalProfile.metricas.ocean.conscientiousness}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-amber-400 block">Extraversión</span>
                        <span className="text-sm font-black text-white">{personalProfile.metricas.ocean.extraversion}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-emerald-400 block">Amabilidad</span>
                        <span className="text-sm font-black text-white">{personalProfile.metricas.ocean.agreeableness}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-rose-400 block">Estrés (N)</span>
                        <span className="text-sm font-black text-white">{personalProfile.metricas.ocean.neuroticism}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Historial de Mensajes Analizados */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">Historial Psicométrico Registrado</h5>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {personalProfile.historial.map((msg: any, idx: number) => (
                        <div key={idx} className="bg-black/40 border border-white/5 p-3.5 rounded-2xl space-y-1.5">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Emoción Primaria: {msg.emocion_primaria || 'Neutral'} (Estrés: {msg.ocean_neuroticism}%)
                            </span>
                            <span className="text-slate-500">{new Date(msg.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed font-mono">"{msg.contenido}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
