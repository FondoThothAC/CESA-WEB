'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function DatosPracticasCard() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [form, setForm] = useState({
    expediente: '', celular: '', creditos_acumulados: '',
    seguro_social_tipo: 'IMSS', seguro_social_num: '', disponibilidad_horario: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/perfil.php`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const d = data.data;
          setForm({
            expediente: d.expediente || '',
            celular: d.celular || '',
            creditos_acumulados: d.creditos_acumulados ? String(d.creditos_acumulados) : '',
            seguro_social_tipo: d.seguro_social_tipo || 'IMSS',
            seguro_social_num: d.seguro_social_num || '',
            disponibilidad_horario: d.disponibilidad_horario || ''
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/perfil.php?action=update`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          creditos_acumulados: form.creditos_acumulados ? parseInt(form.creditos_acumulados) : null
        })
      });
      const data = await res.json();
      alert(data.success ? '✅ Datos guardados. Se usarán para prellenar tu FP2 y Carta de Tutor.' : (data.error || 'Error al guardar'));
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-bg-primary border border-border rounded-xl px-4 py-2.5 text-sm text-text-main";
  const labelCls = "text-[10px] text-slate-400 font-bold uppercase tracking-widest";

  if (loading) return null;

  return (
    <form onSubmit={handleSave} className="bg-bg-card border border-border rounded-[2.5rem] p-6 space-y-4">
      <div>
        <h4 className="text-lg font-black text-text-main uppercase tracking-tight">📋 Mis Datos para Prácticas (FP2)</h4>
        <p className="text-xs text-slate-400">El sistema usará estos datos para prellenar tu Solicitud de Inscripción y la Carta de Tutor.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div><label className={labelCls}>Expediente</label><input value={form.expediente} onChange={e => setForm({...form, expediente: e.target.value})} className={inputCls} /></div>
        <div><label className={labelCls}>Teléfono</label><input value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} className={inputCls} /></div>
        <div><label className={labelCls}>Créditos cursados</label><input type="number" min="0" value={form.creditos_acumulados} onChange={e => setForm({...form, creditos_acumulados: e.target.value})} className={inputCls} /></div>
        <div>
          <label className={labelCls}>Seguridad social</label>
          <select value={form.seguro_social_tipo} onChange={e => setForm({...form, seguro_social_tipo: e.target.value})} className={inputCls}>
            <option value="IMSS">IMSS</option>
            <option value="ISSSTE">ISSSTE</option>
            <option value="ISSSTESON">ISSSTESON</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div><label className={labelCls}>No. Afiliación</label><input value={form.seguro_social_num} onChange={e => setForm({...form, seguro_social_num: e.target.value})} className={inputCls} /></div>
        <div><label className={labelCls}>Disponibilidad horario</label><input placeholder="Ej. 9 am a 12 pm" value={form.disponibilidad_horario} onChange={e => setForm({...form, disponibilidad_horario: e.target.value})} className={inputCls} /></div>
      </div>
      <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-colors">
        {saving ? 'Guardando...' : 'Guardar datos'}
      </button>
    </form>
  );
}
