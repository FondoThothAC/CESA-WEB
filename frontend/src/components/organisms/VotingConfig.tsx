'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function VotingConfig() {
  const { user, token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const [votaciones, setVotaciones] = useState<any[]>([]);
  const [dataScienceLogs, setDataScienceLogs] = useState<any[] | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    carrera_objetivo: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_publicacion_resultados: '',
    redes_ip_permitidas: '["148.225."]' // Default Unison example
  });

  const isMaster = user?.email === 'software@fondothoth.com';
  const isCouncil = user?.consejo_elecciones || user?.rol === 'admin' || user?.rol === 'mesa_directiva';

  useEffect(() => {
    if (isCouncil) fetchVotaciones();
  }, [token, isCouncil]);

  const fetchVotaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/votaciones.php?action=list`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setVotaciones(data.data || []);
      }
    } catch (e) {
      console.error(e);
      setVotaciones([]);
    }
  };

  const createVotacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/votaciones.php?action=create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({
          titulo: '',
          descripcion: '',
          carrera_objetivo: '',
          fecha_inicio: '',
          fecha_fin: '',
          fecha_publicacion_resultados: '',
          redes_ip_permitidas: '["148.225."]'
        });
        fetchVotaciones();
      } else {
        alert(data.error || "Error al crear la votación.");
      }
    } catch (err) {
      alert("Error de red al crear la votación.");
    }
  };

  const fetchResultados = async (votacionId: number) => {
    try {
      const res = await fetch(`${API_URL}/votaciones.php?action=resultados&votacion_id=${votacionId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const resumen = data.data
          .map((c: any) => `${c.nombre_candidato}: ${c.votos} votos`)
          .join('\n');
        alert(`Resultados parciales:\n\n${resumen || 'Sin votos registrados aún.'}`);
      } else {
        alert(data.error || "Los resultados aún no están disponibles.");
      }
    } catch (err) {
      alert("Error de red al consultar resultados.");
    }
  };

  const fetchDecryptLogs = async (votacion_id: number) => {
    try {
      const fd = new FormData();
      fd.append('action', 'datascience_decrypt');
      fd.append('votacion_id', votacion_id.toString());

      const res = await fetch(`${API_URL}/votaciones.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setDataScienceLogs(data.data_science);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error de red");
    }
  };

  if (!isCouncil) return null;

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Consejo de Elecciones</h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Configuración y Auditoría</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {showForm ? 'Cerrar Panel' : 'Nueva Votación'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createVotacion} className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Título</label>
              <input type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" required />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Carrera (Vacío = General)</label>
              <input type="text" value={formData.carrera_objetivo} onChange={e => setFormData({...formData, carrera_objetivo: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Fecha de Inicio</label>
              <input type="datetime-local" value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" required />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Fecha de Cierre</label>
              <input type="datetime-local" value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" required />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Fecha de Publicación de Resultados</label>
              <input type="datetime-local" value={formData.fecha_publicacion_resultados} onChange={e => setFormData({...formData, fecha_publicacion_resultados: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" required />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">IPs de Red Permitidas (JSON Array)</label>
              <input type="text" value={formData.redes_ip_permitidas} onChange={e => setFormData({...formData, redes_ip_permitidas: e.target.value})} placeholder='ej. ["148.225.", "10.0."]' className="w-full bg-black/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono" required />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4">
            Crear Apertura Electoral
          </button>
        </form>
      )}

      {/* Lista de Votaciones Activas para Administrar */}
      <div className="space-y-4">
        <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-widest">Elecciones en Sistema</h3>
        {votaciones.map(v => (
          <div key={v.id} className="bg-black/20 border border-white/5 p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4">
            <div>
              <h4 className="text-white font-bold">{v.titulo}</h4>
              <p className="text-xs text-slate-500">{v.estado} • Inicia: {new Date(v.fecha_inicio).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => fetchResultados(v.id)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
              >Ver Resultados Parciales</button>
              {isMaster && (
                <button 
                  onClick={() => fetchDecryptLogs(v.id)}
                  className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-500/30 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <span>⚠️</span> Extraer AES-256
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visor de Datos Sensibles (Solo Master) */}
      {isMaster && dataScienceLogs && (
        <div className="mt-8 bg-red-950/30 border border-red-500/20 p-6 rounded-2xl overflow-x-auto">
          <h3 className="text-red-500 text-[12px] uppercase font-black tracking-widest mb-4 flex items-center gap-2">
            <span>🚨</span> Módulo Data Science (Nivel Dios)
          </h3>
          <p className="text-xs text-red-200/50 mb-4 font-mono">Los siguientes datos exponen la identidad del estudiante usando la llave maestra AES-256. Uso exclusivo para investigación de datos.</p>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-red-500/20">
                <th className="p-2 text-red-400 font-black">Registro</th>
                <th className="p-2 text-red-400 font-black">Candidato</th>
                <th className="p-2 text-red-400 font-black">Expediente (Descifrado)</th>
                <th className="p-2 text-red-400 font-black">IP Origen</th>
                <th className="p-2 text-red-400 font-black">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {dataScienceLogs.map((log, i) => (
                <tr key={i} className="border-b border-red-500/10 hover:bg-red-500/5">
                  <td className="p-2 text-white/70">{log.id_registro}</td>
                  <td className="p-2 text-white/70">{log.candidato}</td>
                  <td className="p-2 text-emerald-400 font-mono font-bold">{log.expediente_desencriptado}</td>
                  <td className="p-2 text-white/70">{log.ip_origen}</td>
                  <td className="p-2 text-white/50">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setDataScienceLogs(null)} className="mt-4 bg-black border border-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
            Limpiar Pantalla
          </button>
        </div>
      )}
    </div>
  );
}
