'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function VotingSystem() {
  const [votaciones, setVotaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expediente, setExpediente] = useState('');
  
  // Para emisión de voto
  const [selectedVotacion, setSelectedVotacion] = useState<any>(null);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [selectedCandidato, setSelectedCandidato] = useState<number | null>(null);
  const [votingPhase, setVotingPhase] = useState<'verificar' | 'seleccionar' | 'confirmar' | 'exito' | 'resultados'>('verificar');
  const [errorMsg, setErrorMsg] = useState('');

  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    fetchVotacionesActivas();
  }, [token]);

  const fetchVotacionesActivas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/votaciones.php`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setVotaciones(data.data);
      }
    } catch (e) {
      console.error("Error al cargar votaciones", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVotacion = (v: any) => {
    setSelectedVotacion(v);
    
    // Si la votación está finalizada o es admin auditor, mostrar resultados
    if (v.estado === 'finalizada' || (user?.rol === 'admin' && v.estado === 'activa')) {
      fetchResultados(v.id);
    } else {
      setVotingPhase('verificar');
    }
  };

  const fetchResultados = async (id: number) => {
    setVotingPhase('resultados');
    try {
      const res = await fetch(`${API_URL}/votaciones.php?action=resultados&votacion_id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCandidatos(data.data);
      }
    } catch (e) {
      console.error("Error resultados", e);
    }
  };

  const verifyExpediente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!expediente) return;
    
    try {
      const fd = new FormData();
      fd.append('action', 'verificar');
      fd.append('votacion_id', selectedVotacion.id.toString());
      fd.append('expediente', expediente);

      const res = await fetch(`${API_URL}/votaciones.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      
      if (data.success) {
        setCandidatos(data.data);
        setVotingPhase('seleccionar');
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg("Error de conexión al verificar expediente.");
    }
  };

  const submitVote = async () => {
    if (!selectedCandidato || !selectedVotacion) return;
    
    try {
      const fd = new FormData();
      fd.append('action', 'votar');
      fd.append('votacion_id', selectedVotacion.id.toString());
      fd.append('expediente', expediente);
      fd.append('candidato_id', selectedCandidato.toString());

      const res = await fetch(`${API_URL}/votaciones.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      
      if (data.success) {
        setVotingPhase('exito');
      } else {
        setErrorMsg(data.error);
        setVotingPhase('verificar');
      }
    } catch (e) {
      setErrorMsg("Error al enviar el voto.");
      setVotingPhase('verificar');
    }
  };

  if (loading) return <div className="text-center py-20 text-white/40 uppercase font-black tracking-widest animate-pulse">Cargando Sistema Electoral...</div>;

  // Si no hay votación seleccionada, mostrar la lista
  if (!selectedVotacion) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="border-b border-white/5 pb-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Sistema de Votaciones Estudiantiles</h2>
          <p className="text-indigo-400 text-[10px] uppercase font-black tracking-widest mt-1">Transparencia y Privacidad</p>
        </div>

        {votaciones.length === 0 ? (
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-10 text-center">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">No hay procesos electorales activos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {votaciones.map(v => (
              <div key={v.id} onClick={() => handleSelectVotacion(v)} className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${v.estado === 'activa' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    {v.estado}
                  </span>
                  {v.estado === 'activa' && <span className="text-xs bg-indigo-600 px-3 py-1 rounded-xl font-black shadow-lg shadow-indigo-600/20">VOTAR</span>}
                </div>
                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">{v.titulo}</h3>
                <p className="text-slate-500 text-xs mb-4 line-clamp-2">{v.descripcion}</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Cierre: {new Date(v.fecha_fin).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Flujo de votación seleccionado
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={() => { setSelectedVotacion(null); setVotingPhase('verificar'); setExpediente(''); setSelectedCandidato(null); setErrorMsg(''); }}
        className="text-[10px] uppercase font-black text-slate-500 hover:text-white transition-colors"
      >
        ← Volver a Procesos
      </button>

      <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mb-8">
          <h2 className="text-3xl font-black text-white leading-tight">{selectedVotacion.titulo}</h2>
          <p className="text-slate-400 text-xs mt-2">{selectedVotacion.descripcion}</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 animate-in shake">
            <p className="text-red-400 text-[10px] uppercase font-black tracking-widest text-center">{errorMsg}</p>
          </div>
        )}

        {votingPhase === 'verificar' && (
          <form onSubmit={verifyExpediente} className="space-y-6">
            <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
              <label className="text-[10px] uppercase font-black text-indigo-400 tracking-widest block mb-4 text-center">
                Validación de Identidad
              </label>
              <input 
                type="text" 
                value={expediente}
                onChange={(e) => setExpediente(e.target.value)}
                placeholder="Ingresa tu Expediente (Ej. 22010101)"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-lg font-mono text-white focus:border-indigo-500 outline-none transition-all"
                required
              />
              <p className="text-[8px] text-slate-500 text-center mt-3 uppercase tracking-widest leading-relaxed">
                El voto es estrictamente <span className="text-emerald-400 font-bold">secreto y anónimo</span>.<br/> 
                El expediente se utiliza únicamente para validar tu elegibilidad (Padrón activo) y generar un token criptográfico unidireccional (Hash) para evitar doble votación.
              </p>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
              Verificar Elegibilidad
            </button>
          </form>
        )}

        {votingPhase === 'seleccionar' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <h4 className="text-[10px] uppercase font-black text-emerald-400 tracking-widest text-center">Expediente Validado. Selecciona tu candidato.</h4>
            <div className="grid gap-4">
              {candidatos.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedCandidato(c.id)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${selectedCandidato === c.id ? 'bg-indigo-600/20 border-indigo-500' : 'bg-black/30 border-white/5 hover:border-white/20'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCandidato === c.id ? 'border-indigo-400' : 'border-slate-600'} flex-shrink-0`}>
                    {selectedCandidato === c.id && <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>}
                  </div>
                  {c.foto_path && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10">
                      <img src={c.foto_path} alt={c.nombre_candidato} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h5 className="text-white font-black text-lg">{c.nombre_candidato}</h5>
                    <p className="text-slate-400 text-xs">{c.planillas_o_info}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => { if(selectedCandidato) setVotingPhase('confirmar'); }}
              disabled={!selectedCandidato}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all"
            >
              Continuar
            </button>
          </div>
        )}

        {votingPhase === 'confirmar' && (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center text-4xl mx-auto border border-indigo-500/30">
              🗳️
            </div>
            <h4 className="text-xl font-black text-white uppercase">Confirmar Voto</h4>
            <p className="text-slate-400 text-sm">
              Estás a punto de emitir tu voto para:<br/>
              <span className="text-indigo-400 font-bold text-lg mt-2 block">
                {candidatos.find(c => c.id === selectedCandidato)?.nombre_candidato}
              </span>
            </p>
            <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">
                Esta acción es irreversible. Una vez emitido el voto, no podrás cambiarlo ni volver a votar.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setVotingPhase('seleccionar')} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Cancelar
              </button>
              <button onClick={submitVote} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white shadow-lg shadow-emerald-600/20">
                Emitir Voto
              </button>
            </div>
          </div>
        )}

        {votingPhase === 'exito' && (
          <div className="space-y-6 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto shadow-2xl shadow-emerald-500/40">
              ✓
            </div>
            <div>
              <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Voto Registrado</h4>
              <p className="text-emerald-400 text-[10px] uppercase font-black tracking-widest mt-2">Cifrado con éxito (SHA-512)</p>
            </div>
            <p className="text-slate-400 text-sm">Tu voto ha sido depositado en la urna criptográfica de manera anónima y segura. Gracias por participar en la democracia estudiantil.</p>
            <button onClick={() => { setSelectedVotacion(null); setExpediente(''); }} className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-4">
              Volver al inicio
            </button>
          </div>
        )}

        {votingPhase === 'resultados' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] uppercase font-black text-indigo-400 tracking-widest">Auditoría de Resultados</h4>
              {selectedVotacion.estado === 'activa' && <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-amber-500/30">En Curso</span>}
            </div>
            
            <div className="space-y-6">
              {candidatos.map((c, i) => {
                const total = candidatos.reduce((acc, curr) => acc + curr.votos, 0);
                const pct = total === 0 ? 0 : Math.round((c.votos / total) * 100);
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">{c.nombre_candidato}</span>
                      <span className="text-indigo-400">{c.votos} Votos ({pct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 delay-${i*100}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-indigo-900/20 p-5 rounded-2xl border border-indigo-500/20">
               <p className="text-[9px] uppercase text-indigo-400 font-black tracking-widest mb-1">Nota de Auditoría</p>
               <p className="text-[10px] text-slate-400">Estos resultados se calculan haciendo un COUNT() sobre la tabla de votos_anonimos, la cual solo contiene tokens SHA-512. Es matemáticamente imposible rastrear un voto a un estudiante.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
