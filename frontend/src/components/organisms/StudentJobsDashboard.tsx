'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { downloadDocumento } from '@/lib/downloadDoc';

interface Postulacion {
  id: number;
  estado: string;
  [key: string]: any;
}

async function confirmarDescarga(): Promise<'temporal' | 'definitiva' | null> {
  return new Promise((resolve) => {
    const r = window.prompt('Tipo de baja:\nEscribe "T" para TEMPORAL o "D" para DEFINITIVA:', 'T');
    if (!r) return resolve(null);
    resolve(r.trim().toUpperCase().startsWith('D') ? 'definitiva' : 'temporal');
  });
}

export default function StudentJobsDashboard() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const fetchPostulaciones = async () => {
    setLoading(true);
    try {
      // Usa el endpoint nuevo de prácticas; si falla, hace fallback al de bolsa
      let data: any = null;
      try {
        const resP = await fetch(`${API_URL}/practicas.php?action=mis_postulaciones`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        data = await resP.json();
      } catch {}
      if (data?.success) {
        setPostulaciones(Array.isArray(data.postulaciones) ? data.postulaciones : []);
      } else {
        const res = await fetch(`${API_URL}/empleos.php?action=mis_postulaciones`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data2 = await res.json();
        if (data2.success) setPostulaciones(Array.isArray(data2.postulaciones) ? data2.postulaciones : []);
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

  const handleDownload = async (postulacionId: number, tipo: 'fp2' | 'carta_tutor' | 'fpp3' | 'fpp4' | 'fpp5', extras: Record<string, number> = {}) => {
    try {
      if (tipo === 'fpp5') {
        const t = await confirmarDescarga();
        if (!t) return;
        await downloadDocumento(API_URL, token, 'fpp5', { postulacion_id: postulacionId, tipo: t === 'definitiva' ? 1 : 0 } as any, `FPP5_BAJA_${postulacionId}.docx`);
        return;
      }
      await downloadDocumento(API_URL, token, tipo, { postulacion_id: postulacionId, ...extras } as any,
        `${tipo.toUpperCase()}_${postulacionId}.docx`);
    } catch (e: any) {
      alert(e.message || 'Error al descargar');
    }
  };

  const handleConcluir = async (p: Postulacion) => {
    const horas = window.prompt('¿Cuántas horas realizaste en total?', '480');
    if (horas === null) return;
    try {
      const res = await fetch(`${API_URL}/practicas.php?action=concluir_practicas`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ postulacion_id: p.id, horas_realizadas: parseInt(horas) || 0 })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPostulaciones();
      } else {
        alert(data.error || 'Error');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  if (loading) return <div className="text-text-main text-center py-10 font-bold">Cargando postulaciones...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div>
        <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter">Mis Postulaciones</h3>
        <p className="text-xs text-slate-400">Servicio Social, Prácticas Profesionales y Empleo — seguimiento de fila de espera.</p>
      </div>

      {postulaciones.length === 0 ? (
        <div className="p-10 rounded-[2.5rem] border border-border bg-bg-card text-center">
          <h4 className="text-text-main font-bold text-lg mb-2">No tienes postulaciones activas</h4>
          <p className="text-slate-400 text-sm">Explora los proyectos de Servicio Social y Prácticas Profesionales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {postulaciones.map(p => {
            const esPractica = !!p.nombre_programa; // viene de practicas.php
            const aceptados = p.aceptados_count ?? 0;
            const cupo = p.num_practicantes ?? 1;
            return (
            <div key={p.id} className="p-6 rounded-[2.5rem] border border-border bg-bg-card space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-text-main font-black text-lg uppercase tracking-tight">{p.nombre_programa || p.titulo}</h4>
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{p.razon_social || p.empresa_nombre}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  p.estado === 'aceptado' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' :
                  p.estado === 'entrevista' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                  p.estado === 'lista_espera' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' :
                  p.estado === 'visto' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/50' :
                  p.estado === 'rechazado' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                  'bg-white/10 text-slate-300 border border-white/20'
                }`}>
                  {p.estado?.replace('_', ' ')}
                </span>
              </div>

              {/* Fila de espera (solo proyectos de prácticas) */}
              {esPractica && !['aceptado', 'rechazado'].includes(p.estado) && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl flex items-center gap-4">
                  <div className="text-3xl font-black text-indigo-400">#{p.posicion_fila ?? '-'}</div>
                  <div>
                    <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Posición en la fila</p>
                    <p className="text-xs text-slate-400">Cupo: {aceptados}/{cupo} aceptados • La empresa entrevista y elige libremente</p>
                  </div>
                </div>
              )}

              {p.feedback_empresa && (
                <div className="bg-bg-primary p-4 rounded-xl border border-border">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Feedback de la Empresa:</p>
                  <p className="text-sm text-slate-300 italic">"{p.feedback_empresa}"</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 space-y-4">
                {/* Documentos oficiales cuando fue aceptado en prácticas */}
                {esPractica && (p.estado === 'aceptado' || p.estado === 'concluido') && (
                  <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl space-y-3">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase">Documentos oficiales UNISON</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleDownload(p.id, 'fp2').catch(() => {})}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-lg text-white text-xs font-black uppercase tracking-wider transition-colors">
                        📄 FP2
                      </button>
                      <button onClick={() => handleDownload(p.id, 'carta_tutor').catch(() => {})}
                        className="flex-1 border border-indigo-500/50 hover:bg-indigo-500/20 px-4 py-2.5 rounded-lg text-indigo-300 text-xs font-black uppercase tracking-wider transition-colors">
                        ✉️ Carta Tutor
                      </button>
                      <button onClick={() => handleDownload(p.id, 'fpp3').catch(() => {})}
                        className="flex-1 border border-indigo-500/50 hover:bg-indigo-500/20 px-4 py-2.5 rounded-lg text-indigo-300 text-xs font-black uppercase tracking-wider transition-colors">
                        📊 FPP-3 Parcial
                      </button>
                      {p.estado === 'concluido' ? (
                        <button onClick={() => handleDownload(p.id, 'fpp4').catch(() => {})}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-lg text-white text-xs font-black uppercase tracking-wider transition-colors">
                          🏁 FPP-4 Final
                        </button>
                      ) : (
                        <button onClick={() => handleConcluir(p)}
                          className="flex-1 bg-emerald-600/80 hover:bg-emerald-500 px-4 py-2.5 rounded-lg text-white text-xs font-black uppercase tracking-wider transition-colors">
                          Concluir prácticas
                        </button>
                      )}
                      <button onClick={() => handleDownload(p.id, 'fpp5').catch(() => {})}
                        className="w-full border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg text-red-400 text-[10px] font-black uppercase tracking-wider transition-colors">
                        Solicitar baja (FPP-5)
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">El FP2 y reportes vienen prellenados con tus datos; completa lo que falte y firma.</p>
                  </div>
                )}

                {p.estado === 'aceptado' && (
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl space-y-3">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">Entregar Memoria de Prácticas / Servicio</p>
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
          );})}
        </div>
      )}
    </div>
  );
}
