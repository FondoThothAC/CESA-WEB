'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function AdminRagKnowledgeTab() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', categoria: 'reglamentos', contenido_texto: '' });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/rag_knowledge.php?action=list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDocs(data.data || []);
      }
    } catch (e) {
      console.error("Error al cargar RAG docs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDocs();
  }, [token]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) return alert("Por favor asigna un título al documento.");
    
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('action', 'create');
      fd.append('titulo', formData.titulo);
      fd.append('categoria', formData.categoria);
      fd.append('contenido_texto', formData.contenido_texto);
      if (file) fd.append('archivo', file);

      const res = await fetch(`${API_URL}/admin/rag_knowledge.php?action=create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert(`Documento RAG guardado e indexado en Markdown (.md). ~${data.tokens} tokens estim.`);
        setFormData({ titulo: '', categoria: 'reglamentos', contenido_texto: '' });
        setFile(null);
        setShowForm(false);
        fetchDocs();
      } else {
        alert(data.error || "Error al subir documento RAG.");
      }
    } catch (e) {
      alert("Error de conexión al servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar este documento del conocimiento de la IA?")) return;
    try {
      const fd = new FormData();
      fd.append('action', 'delete');
      fd.append('id', id.toString());

      const res = await fetch(`${API_URL}/admin/rag_knowledge.php?action=delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        fetchDocs();
      }
    } catch (e) {
      alert("Error al eliminar documento.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>📚 Base de Conocimiento RAG en Markdown (.md)</span>
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Los documentos subidos se convierten automáticamente a formato `.md` para ahorrar tokens y dar respuestas institucionales de máxima precisión.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider"
        >
          {showForm ? 'Cancelar' : '➕ Subir Documento RAG'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="bg-slate-900/90 border border-emerald-500/30 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Nuevo Documento RAG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Título del Documento</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej. Reglamento de Titulación y Cursos de Verano"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold"
              >
                <option value="reglamentos">📜 Reglamentos y Trámites</option>
                <option value="bazar">🏪 Bazar y Emprendimientos</option>
                <option value="servicio_social">🛠️ Servicio Social y Prácticas</option>
                <option value="eventos">🎉 Eventos y Convocatorias</option>
                <option value="general">ℹ️ General Institucional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black text-white/40 block mb-1">Adjuntar Archivo (.txt, .md, .doc, .pdf) Opcional</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white/70"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black text-white/40 block mb-1">O Redactar / Pegar Texto Libre</label>
            <textarea
              rows={5}
              value={formData.contenido_texto}
              onChange={(e) => setFormData({ ...formData, contenido_texto: e.target.value })}
              placeholder="Ingresa aquí los artículos, requisitos, pasos o información que deseas que la IA aprenda..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-widest"
          >
            {submitting ? 'Convertiendo y Procesando RAG...' : '⚡ Convertir a Markdown (.md) y Guardar'}
          </button>
        </form>
      )}

      {/* TABLA DE DOCUMENTOS INDEXADOS */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-white/40">Cargando base de conocimiento RAG...</div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">No hay documentos RAG indexados todavía.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {docs.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{doc.titulo}</span>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase font-black px-2 py-0.5 rounded-full">
                      {doc.categoria}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-1 flex items-center gap-4">
                    <span>Tokens estim: ~{doc.tokens_estimados}</span>
                    <span>Fecha: {new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-bold px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
