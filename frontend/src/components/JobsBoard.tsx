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
  created_at: string;
}

const JobsBoard = () => {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [filter, setFilter] = useState('todas');
  const [isApplying, setIsApplying] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`http://localhost:8000/empleos.php?modalidad=${filter}`);
      const data = await res.json();
      if (data.success) setVacantes(data.vacantes);
    } catch (e) {
      console.error("Error empleos", e);
    }
  };

  const handleApply = async (jobId: number) => {
    if (!user) {
      alert("Debes iniciar sesión para postularte.");
      return;
    }

    setIsApplying(jobId);
    try {
      const res = await fetch('http://localhost:8000/empleos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacante_id: jobId, usuario_email: user.email })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      }
    } catch (e) {
      alert("Error al enviar postulación");
    } finally {
      setIsApplying(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24">
      {/* Search & Filter */}
      <div className="glass p-6 mb-12 flex flex-wrap gap-4 items-center justify-between border-white/5">
        <div className="flex gap-2">
          {['todas', 'presencial', 'remoto', 'hibrido'].map((mod) => (
            <button
              key={mod}
              onClick={() => setFilter(mod)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === mod 
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white' 
                  : 'border-white/5 text-white/40 hover:text-white'
              }`}
            >
              {mod.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">
          {vacantes.length} Vacantes Disponibles
        </p>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {vacantes.map((job) => (
          <div key={job.id} className="glass p-8 group transition-all hover:bg-white/5 border-white/5 hover:border-[var(--primary)] shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">🏢</span>
                  <div>
                    <h3 className="text-white font-black text-xl leading-tight uppercase tracking-tighter">{job.titulo}</h3>
                    <p className="text-[var(--primary)] text-sm font-bold">{job.empresa_nombre}</p>
                  </div>
                </div>
                
                <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed max-w-2xl">
                  {job.descripcion}
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="glass px-3 py-1 text-[9px] font-black uppercase text-white/60 border-white/10">📍 {job.modalidad}</span>
                  <span className="glass px-3 py-1 text-[9px] font-black uppercase text-white/60 border-white/10">⏰ {job.tipo.replace('_', ' ')}</span>
                  <span className="glass px-3 py-1 text-[9px] font-black uppercase text-[var(--accent)] border-[var(--accent)]/20">💰 {job.sueldo_rango}</span>
                  <span className="glass px-3 py-1 text-[9px] font-black uppercase text-white/40 border-white/5">🎯 {job.carreras_target}</span>
                </div>
              </div>

              <div className="md:text-right flex flex-col justify-between items-end">
                <span className="text-[10px] text-white/20 mb-4">{job.created_at}</span>
                <button 
                  onClick={() => handleApply(job.id)}
                  disabled={isApplying === job.id}
                  className={`btn-primary w-full md:w-auto px-10 py-3 text-xs uppercase tracking-widest font-black ${
                    isApplying === job.id ? 'opacity-50 cursor-wait' : ''
                  }`}
                >
                  {isApplying === job.id ? 'Enviando...' : 'Postularme Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsBoard;
