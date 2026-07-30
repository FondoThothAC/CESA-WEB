'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

const ReportForm = () => {
    const [tipo, setTipo] = useState('docencia');
    const [contenido, setContenido] = useState('');
    const [anonimo, setAnonimo] = useState(true);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { token } = useAuth();
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contenido.trim() || status === 'loading') return;

        setStatus('loading');

        try {
            const baseUrl = API_URL.includes('/api/v1') ? API_URL : `${API_URL}/v1`;
            const res = await fetch(`${baseUrl}/reportes/crear`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ 
                    tipo: 'queja',
                    categoria: tipo, 
                    asunto: `Incidencia en ${tipo}`,
                    descripcion: contenido, 
                    anonimo 
                })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setContenido('');
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-slate-900 border border-green-500/30 p-12 rounded-3xl text-center animate-in zoom-in duration-500">
                <div className="text-6xl mb-6">✅</div>
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">Reporte Recibido</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Tu incidencia ha sido enviada a la Mesa Directiva. Gracias por ayudar a mejorar nuestra comunidad.</p>
                <button 
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-8 py-3 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                >
                    Enviar otro reporte
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
            <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                Buzón de Reportes
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block">Categoría de Incidencia</label>
                    <select 
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-red-500 transition-all font-bold"
                    >
                        <option value="infraestructura">🏗️ Infraestructura (Aulas, baños, etc)</option>
                        <option value="docencia">👨‍🏫 Docencia y Académico</option>
                        <option value="servicios">🍱 Servicios (Cafetería, Internet)</option>
                        <option value="administracion">📁 Trámites y Administración</option>
                        <option value="salud">🏥 Salud y Bienestar</option>
                        <option value="otro">✨ Otro tipo de reporte</option>
                    </select>
                </div>

                <div>
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 block">Descripción Detallada</label>
                    <textarea 
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        placeholder="Describe lo sucedido, lugar, fecha y detalles que ayuden a la Mesa Directiva a resolver el caso..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-red-500 transition-all min-h-[150px] font-medium"
                        required
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-red-600/5 rounded-2xl border border-red-500/10">
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="anonimo" 
                            checked={anonimo}
                            onChange={(e) => setAnonimo(e.target.checked)}
                            className="w-5 h-5 rounded-lg accent-red-600 border-slate-700 bg-slate-800"
                        />
                        <label htmlFor="anonimo" className="text-xs font-black text-white cursor-pointer uppercase">Reporte Anónimo</label>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all disabled:opacity-50"
                >
                    {status === 'loading' ? 'ENVIANDO TICKET...' : 'ENVIAR REPORTE A MESA DIRECTIVA 🚀'}
                </button>
            </form>

            <p className="mt-8 text-[9px] text-slate-600 text-center uppercase font-black leading-relaxed">
                El Buzón de Reportes es una herramienta institucional de la UNISON. <br/>
                Tus datos (o anonimato) están protegidos por la Ley Federal de Protección de Datos Personales.
            </p>
        </div>
    );
};

export default ReportForm;
