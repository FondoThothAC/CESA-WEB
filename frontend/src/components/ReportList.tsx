'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

interface Reporte {
  id: number;
  asunto: string;
  descripcion: string;
  coordinacion_asignada: string;
  estado: string;
  score: number;
  user_vote: number | null;
  created_at: string;
}

const ReportList = () => {
  const { token } = useAuth();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  useEffect(() => {
    if (!token) return; // Esperar a que el token esté disponible
    fetchReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchReportes = async () => {
    try {
      const baseUrl = API_URL.includes('/api/v1') ? API_URL : `${API_URL}/v1`;
      const res = await fetch(`${baseUrl}/reportes?modo=comunidad`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setReportes(data.data);
    } catch (e) {
      console.error("Error fetching reportes", e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: number, valor: number) => {
    try {
      const res = await fetch(`${API_URL}/reportes.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'votar', id, valor })
      });
      const data = await res.json();
      if (data.success) fetchReportes();
    } catch (e) {
      console.error("Error voting on report", e);
    }
  };

  if (loading) return <div className="text-center py-6 opacity-50">Cargando reportes comunitarios...</div>;

  return (
    <div className="space-y-4">
      {reportes.length === 0 ? (
        <div className="text-center py-8 glass-card opacity-50 italic">No hay reportes públicos actualmente.</div>
      ) : (
        reportes.map((rep) => (
          <div key={rep.id} className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex gap-6 items-center hover:border-red-500/30 transition-all">
            
            {/* Karma Widget */}
            <div className="flex flex-col items-center gap-1 bg-slate-950 p-2 rounded-2xl border border-white/5">
              <button 
                onClick={() => handleVote(rep.id, 1)}
                className={`p-2 rounded-lg transition-all ${rep.user_vote === 1 ? 'text-red-500 bg-red-500/10' : 'text-slate-600 hover:text-white'}`}
              >
                <i className="fas fa-arrow-up text-xs"></i>
              </button>
              <span className={`text-[10px] font-black ${rep.score > 0 ? 'text-red-400' : (rep.score < 0 ? 'text-blue-400' : 'text-slate-600')}`}>
                {rep.score || 0}
              </span>
              <button 
                onClick={() => handleVote(rep.id, -1)}
                className={`p-2 rounded-lg transition-all ${rep.user_vote === -1 ? 'text-red-500 bg-red-500/10' : 'text-slate-600 hover:text-white'}`}
              >
                <i className="fas fa-arrow-down text-xs"></i>
              </button>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-bold text-sm uppercase tracking-tight">{rep.asunto}</h4>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  rep.estado === 'resuelto' ? 'bg-green-500' : (rep.estado === 'en_proceso' ? 'bg-yellow-500' : 'bg-red-600')
                }`}>
                  {rep.estado}
                </span>
              </div>
              <p className="text-slate-400 text-xs line-clamp-2 mb-4">{rep.descripcion}</p>
              <div className="flex gap-4 items-center">
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <i className="fas fa-building mr-1"></i> {rep.coordinacion_asignada}
                 </span>
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <i className="fas fa-calendar-alt mr-1"></i> {new Date(rep.created_at).toLocaleDateString()}
                 </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReportList;
