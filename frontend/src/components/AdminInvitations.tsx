'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

const AdminInvitations = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<{ invited_count: number; errors: string[] } | null>(null);
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('csv', file);

    try {
      const res = await fetch(`${API_URL}/admin/invite-users.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setResults({
          invited_count: data.invited_count,
          errors: data.errors || []
        });
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass p-8 border-white/5 bg-white/5 rounded-3xl">
        <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <i className="fas fa-file-csv"></i>
          </span>
          Carga Masiva de Estudiantes
        </h3>

        <div className="bg-indigo-500/5 border border-dashed border-indigo-500/20 rounded-2xl p-10 text-center transition-all hover:bg-indigo-500/10 group">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="hidden" 
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <i className="fas fa-cloud-upload-alt text-2xl text-indigo-400"></i>
            </div>
            <p className="text-white font-bold mb-1">
              {file ? file.name : 'Seleccionar Archivo CSV'}
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-black">
              nombre_completo, email, rol, matricula
            </p>
          </label>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] max-w-sm">
            <i className="fas fa-info-circle mr-2 text-indigo-500"></i>
            El sistema enviará automáticamente un correo con credenciales temporales a cada estudiante registrado.
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              !file || status === 'uploading' 
                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-white hover:text-black shadow-xl shadow-indigo-600/20'
            }`}
          >
            {status === 'uploading' ? 'Procesando...' : 'Iniciar Onboarding'}
          </button>
        </div>
      </div>

      {status === 'success' && results && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <div>
              <p className="text-white font-bold">¡Onboarding Completado!</p>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{results.invited_count} Estudiantes Invitados con Éxito</p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="glass p-6 border-red-500/20 bg-red-500/5 rounded-2xl">
              <p className="text-red-400 text-[10px] uppercase font-black tracking-widest mb-4">Conflictos detectados en el CSV</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {results.errors.map((error, idx) => (
                  <div key={idx} className="text-xs text-white/60 bg-black/20 p-2 rounded-lg border border-white/5">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="glass p-6 border-red-500/20 bg-red-500/5 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-400">
            <i className="fas fa-exclamation-triangle text-xl"></i>
          </div>
          <div>
            <p className="text-white font-bold">Error en la carga</p>
            <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Verifica el formato del archivo y tu conexión.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvitations;
