'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function StudentJobsDashboard() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const fetchPostulaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/empleos.php?action=mis_postulaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPostulaciones(data.postulaciones);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPostulaciones();
  }, [token]);

  const handleUploadMemoria = async (e: React.ChangeEvent<HTMLInputElement>, postulacionId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('action', 'subir_memoria');
    fd.append('postulacion_id', postulacionId.toString());
    fd.append('memoria', file);

    setUploadingId(postulacionId);
    try {
      const res = await fetch(`${API_URL}/empleos.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert("Memoria subida exitosamente.");
        fetchPostulaciones();
      } else {
        alert(data.error || "Error al subir memoria");
      }
    } catch (err) {
      alert("Error de red");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="text-white text-center py-10 font-bold">Cargando postulaciones...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Mis Postulaciones</h3>
        <p className="text-xs text-slate-400">Gestiona tus aplicaciones de Servicio Social, Prácticas o Empleo.</p>
      </div>

      {postulaciones.length === 0 ? (
        <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-white/10 text-center">
          <h4 className="text-white font-bold text-lg mb-2">No tienes postulaciones activas</h4>
          <p className="text-slate-400 text-sm">Explora la Bolsa de Trabajo para encontrar oportunidades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {postulaciones.map(p => (
            <div key={p.id} className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-black text-lg uppercase tracking-tight">{p.titulo}</h4>
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{p.empresa_nombre}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  p.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' :
                  p.estado === 'aceptado' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' :
                  p.estado === 'visto' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/50' :
                  'bg-red-500/20 text-red-500 border border-red-500/50'
                }`}>
                  {p.estado}
                </span>
              </div>

              {p.feedback_empresa && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Feedback de la Empresa:</p>
                  <p className="text-sm text-slate-300 italic">"{p.feedback_empresa}"</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 space-y-4">
                {p.estado === 'aceptado' && (
                  <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl space-y-3">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase">Entregar Memoria de Prácticas / Servicio</p>
                    {p.memoria_path ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <span>✅ Documento Subido</span>
                        <a href={`${API_URL}${p.memoria_path}`} target="_blank" rel="noreferrer" className="text-indigo-400 underline">Ver Doc</a>
                      </div>
                    ) : (
                      <label className="block w-full bg-indigo-600 hover:bg-indigo-500 text-center py-2 rounded-lg text-white text-xs font-bold cursor-pointer transition-colors">
                        {uploadingId === p.id ? 'Subiendo...' : 'Subir Documento (PDF)'}
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleUploadMemoria(e, p.id)} disabled={uploadingId === p.id} />
                      </label>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-slate-500 text-right">Postulado el: {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
