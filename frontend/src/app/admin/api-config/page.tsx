'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function AdminIAConfig() {
  const { token, user } = useAuth();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    provider: 'groq',
    endpoint_url: '',
    api_key: '',
    model_name: '',
    priority: 5,
    is_active: true
  });

  useEffect(() => {
    if (token) fetchConfigs();
  }, [token]);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/config-ia.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setConfigs(data.configs);
    } catch (err) {
      setError('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/admin/config-ia.php', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Configuración guardada');
        fetchConfigs();
      }
    } catch (err) {
      alert('Error al guardar');
    }
  };

  if (user?.rol !== 'admin') return <div className="p-10 text-center">Sin acceso</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">⚙️ Gestión de Ecosistema IA</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-6">Configurar Proveedor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2"
                  value={formData.provider}
                  onChange={e => setFormData({...formData, provider: e.target.value})}
                >
                  <option value="mac_mini">🍎 Mac Mini Local</option>
                  <option value="groq">⚡ Groq Cloud</option>
                  <option value="gemini">💎 Google Gemini</option>
                  <option value="mistral">🌪️ Mistral AI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Endpoint URL</label>
                <input 
                  type="url" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2"
                  placeholder="https://..."
                  value={formData.endpoint_url}
                  onChange={e => setFormData({...formData, endpoint_url: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">API Key (se cifrará)</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2"
                  placeholder="Dejar vacío para no cambiar"
                  value={formData.api_key}
                  onChange={e => setFormData({...formData, api_key: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2"
                    placeholder="llama-3.1"
                    value={formData.model_name}
                    onChange={e => setFormData({...formData, model_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prioridad (1-10)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold mt-4 transition-all">
                Guardar Configuración
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-6">Proveedores Activos</h2>
            <div className="space-y-4">
              {configs.map(cfg => (
                <div key={cfg.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                  <div>
                    <p className="font-bold uppercase">{cfg.provider}</p>
                    <p className="text-xs text-slate-400">{cfg.model_name || 'Modelo por defecto'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${cfg.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {cfg.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-xs text-indigo-400">Prio: {cfg.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
