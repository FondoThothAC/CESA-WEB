'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function AdminIAConfigTab() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [iaConfigs, setIaConfigs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', provider: '', api_url: '', api_key: '', auth_header: '', is_active: '1', metadata: '{}' });

  const fetchIaConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dynamic_configs.php?action=list&type=ia`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setIaConfigs(data.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchIaConfig();
  }, []);

  const saveIaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('action', 'save');
      fd.append('type', 'ia');
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      const res = await fetch(`${API_URL}/admin/dynamic_configs.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert("Configuración guardada");
        setShowForm(false);
        fetchIaConfig();
      } else {
        alert(data.error || "Error al guardar");
      }
    } catch (e) { alert("Error de red"); }
  };

  const deleteConfig = async (id: number) => {
    if (!confirm("¿Eliminar proveedor?")) return;
    try {
      const fd = new FormData();
      fd.append('action', 'delete');
      fd.append('type', 'ia');
      fd.append('id', String(id));
      await fetch(`${API_URL}/admin/dynamic_configs.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      fetchIaConfig();
    } catch(e) {}
  };

  const isMaster = user?.email === 'software@fondothoth.com';
  const canEdit = isMaster || (user as any)?.permiso_ia;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Misión Control: Motor de IA Híbrido</h3>
          <p className="text-xs text-slate-400">Proveedores de LLMs y configuraciones</p>
        </div>
        {canEdit && (
          <button onClick={() => { setFormData({ id: '', provider: '', api_url: '', api_key: '', auth_header: '', is_active: '1', metadata: '{}' }); setShowForm(!showForm); }} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-white font-bold text-xs">
            {showForm ? 'Cerrar' : '+ Nuevo Proveedor'}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <form onSubmit={saveIaConfig} className="bg-slate-900/60 p-6 border border-emerald-500/30 rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] text-slate-500">Proveedor / Nombre</label><input required type="text" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div><label className="text-[10px] text-slate-500">Endpoint URL</label><input required type="text" value={formData.api_url} onChange={e => setFormData({...formData, api_url: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div><label className="text-[10px] text-slate-500">API Key</label><input type="password" value={formData.api_key} onChange={e => setFormData({...formData, api_key: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div><label className="text-[10px] text-slate-500">Auth Header Format</label><input type="text" value={formData.auth_header} onChange={e => setFormData({...formData, auth_header: e.target.value})} placeholder="Bearer {key}" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div>
              <label className="text-[10px] text-slate-500">Estado</label>
              <select value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white">
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
            <div><label className="text-[10px] text-slate-500">Metadata (JSON)</label><input type="text" value={formData.metadata} onChange={e => setFormData({...formData, metadata: e.target.value})} placeholder='{"default_model": "llama3"}' className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono" /></div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-2 rounded-xl text-xs font-bold">Guardar Proveedor</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {iaConfigs.map(config => (
          <div key={config.id} className={`p-6 rounded-[2.5rem] border ${config.is_active == 1 ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900/60 border-white/10'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h4 className="text-white font-black text-xl uppercase tracking-tighter">{config.provider}</h4>
              <div className={`w-3 h-3 rounded-full ${config.is_active == 1 ? 'bg-green-500' : 'bg-slate-700'}`}></div>
            </div>
            <p className="text-xs text-slate-400 font-mono truncate">{config.api_url}</p>
            {canEdit && (
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button onClick={() => { setFormData({ id: config.id, provider: config.provider, api_url: config.api_url, api_key: '', auth_header: config.auth_header, is_active: String(config.is_active), metadata: config.metadata }); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-[10px] text-white font-bold uppercase">Editar</button>
                <button onClick={() => deleteConfig(config.id)} className="bg-red-900/50 hover:bg-red-800 border border-red-500/30 px-4 py-2 rounded-xl text-[10px] text-red-200 font-bold uppercase">Eliminar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
