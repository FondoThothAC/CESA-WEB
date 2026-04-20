'use client';

import React, { useState } from 'react';

const ReportForm = () => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('http://localhost:8000/reportes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporte: text, categoria_manual: category })
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setAiFeedback(data.ia_classification);
        setText('');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      <div className="glass p-10 relative overflow-hidden">
        {/* Privacy Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Conexión Encriptada</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Buzón de <span className="text-[var(--primary)]">Reportes</span></h2>
          <p className="text-[var(--text-muted)] text-sm">Tu voz es fundamental para mejorar la UNISON. Este reporte es 100% anónimo.</p>
        </div>

        {status === 'success' ? (
          <div className="py-12 text-center animate-in zoom-in-95 duration-500">
            <div className="text-6xl mb-6">✅</div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase">Reporte Recibido</h3>
            <p className="text-[var(--text-muted)] mb-8">Gracias por informarnos. Nuestra IA ha clasificado tu reporte como:</p>
            
            <div className="flex justify-center gap-4">
               <div className="glass px-6 py-2 border-[var(--primary)]">
                  <span className="text-[10px] uppercase text-[var(--primary)] block font-bold">Categoría</span>
                  <span className="text-white text-sm font-bold uppercase">{aiFeedback?.categoria || 'General'}</span>
               </div>
               <div className="glass px-6 py-2 border-[var(--accent)]">
                  <span className="text-[10px] uppercase text-[var(--accent)] block font-bold">Prioridad</span>
                  <span className="text-white text-sm font-bold uppercase">{aiFeedback?.prioridad || 'Media'}</span>
               </div>
            </div>

            <button 
              onClick={() => { setStatus('idle'); setAiFeedback(null); }}
              className="btn-primary mt-12 px-10"
            >
              Enviar otro reporte
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-black text-white/40 mb-2 block ml-2">¿Cuál es el área del reporte?</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['General', 'Docencia', 'Salud', 'Infraestructura'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat.toLowerCase())}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      category === cat.toLowerCase() 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-white' 
                        : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-white/40 mb-2 block ml-2">Describe la situación</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ej: Las butacas del aula 102 están dañadas..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-[var(--primary)] min-h-[180px] transition-all"
                required
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase shadow-2xl"
              >
                {status === 'loading' ? 'Procesando con IA...' : 'Enviar Reporte Anónimo 🛡️'}
              </button>
              <p className="text-center text-[9px] text-white/20 mt-6 uppercase tracking-widest">
                Protegido por CESA Security Architecture • Mac Mini M4 Sentiment Engine
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportForm;
