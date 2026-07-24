'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function AdminSocialTab() {
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [socialConfigs, setSocialConfigs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', plataforma: '', url_perfil: '', client_id: '', client_secret: '', tokens_json: '{}', is_active: '1' });

  const fetchSocialConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dynamic_configs.php?action=list&type=social`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSocialConfigs(data.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchSocialConfig();
  }, []);

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('action', 'save');
      fd.append('type', 'social');
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
        fetchSocialConfig();
      } else {
        alert(data.error || "Error al guardar");
      }
    } catch (e) { alert("Error de red"); }
  };

  const deleteConfig = async (id: number) => {
    if (!confirm("¿Eliminar plataforma social?")) return;
    try {
      const fd = new FormData();
      fd.append('action', 'delete');
      fd.append('type', 'social');
      fd.append('id', String(id));
      await fetch(`${API_URL}/admin/dynamic_configs.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      fetchSocialConfig();
    } catch(e) {}
  };

  const isMaster = user?.email === 'software@fondothoth.com';
  const canEdit = isMaster || user?.roles_social;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Control de Ecosistema Social</h3>
          <p className="text-xs text-slate-400">Gestiona las redes sociales y conexiones a APIs de Meta</p>
        </div>
        {canEdit && (
          <button onClick={() => { setFormData({ id: '', plataforma: '', url_perfil: '', client_id: '', client_secret: '', tokens_json: '{}', is_active: '1' }); setShowForm(!showForm); }} className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-xl text-white font-bold text-xs">
            {showForm ? 'Cerrar' : '+ Nueva Red Social'}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <form onSubmit={saveConfig} className="bg-slate-900/60 p-6 border border-pink-500/30 rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] text-slate-500">Plataforma (Ej. Instagram)</label><input required type="text" value={formData.plataforma} onChange={e => setFormData({...formData, plataforma: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div><label className="text-[10px] text-slate-500">URL del Perfil</label><input type="text" value={formData.url_perfil} onChange={e => setFormData({...formData, url_perfil: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div><label className="text-[10px] text-slate-500">Client ID / Phone ID</label><input type="text" value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div><label className="text-[10px] text-slate-500">Client Secret / API Token</label><input type="password" value={formData.client_secret} onChange={e => setFormData({...formData, client_secret: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white" /></div>
            <div>
              <label className="text-[10px] text-slate-500">Estado</label>
              <select value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white">
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
            <div><label className="text-[10px] text-slate-500">Tokens / Metadatos (JSON)</label><input type="text" value={formData.tokens_json} onChange={e => setFormData({...formData, tokens_json: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono" /></div>
          </div>
          <button type="submit" className="bg-pink-600 hover:bg-pink-500 text-white w-full py-2 rounded-xl text-xs font-bold">Guardar Configuración</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {socialConfigs.map(config => (
          <div key={config.id} className={`p-6 rounded-[2.5rem] border ${config.is_active == 1 ? 'bg-pink-900/20 border-pink-500/50' : 'bg-slate-900/60 border-white/10'} space-y-4`}>
            <div className="flex justify-between items-center">
              <h4 className="text-white font-black text-xl uppercase tracking-tighter">{config.plataforma}</h4>
              <div className={`w-3 h-3 rounded-full ${config.is_active == 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            {config.url_perfil && <p className="text-xs text-slate-400 font-mono truncate">{config.url_perfil}</p>}
            {canEdit && (
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button onClick={() => { setFormData({ id: config.id, plataforma: config.plataforma, url_perfil: config.url_perfil || '', client_id: config.client_id || '', client_secret: '', tokens_json: config.tokens_json || '{}', is_active: String(config.is_active) }); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-[10px] text-white font-bold uppercase">Editar</button>
                <button onClick={() => deleteConfig(config.id)} className="bg-red-900/50 hover:bg-red-800 border border-red-500/30 px-4 py-2 rounded-xl text-[10px] text-red-200 font-bold uppercase">Eliminar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
