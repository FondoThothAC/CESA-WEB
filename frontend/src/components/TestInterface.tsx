'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface TestInterfaceProps {
  testId: number;
  onClose: () => void;
  onFinish: () => void;
}

export default function TestInterface({ testId, onClose, onFinish }: TestInterfaceProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    loadTest();
  }, [testId, token]);

  const loadTest = async () => {
    try {
      const res = await fetch(`${API_URL}/tests.php?action=iniciar&test_id=${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTestData(data);
      } else {
        alert(data.error || 'Error al cargar test');
        onClose();
      }
    } catch (e) {
      console.error(e);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-advance after a short delay if it's not the last question
    if (currentIdx < testData.preguntas.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('action', 'guardar');
      formData.append('test_id', testId.toString());
      formData.append('respuestas', JSON.stringify(answers));

      const res = await fetch(`${API_URL}/tests.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        onFinish();
      } else {
        alert(data.error || 'Error al guardar resultados');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!testData) return null;

  const currentQ = testData.preguntas[currentIdx];
  const total = testData.preguntas.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / total) * 100;

  return (
    <div className="fixed inset-0 z-[120] bg-bg-primary text-text-main flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto">
      
      {/* Header */}
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-10 flex-shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm" style={{ backgroundColor: `${testData.test.color_hex}20`, color: testData.test.color_hex }}>
            <i className={testData.test.icono}></i>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight leading-tight">{testData.test.nombre}</h2>
            <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">{testData.test.acronimo} • Psicometría</p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-border flex-shrink-0">
        <div 
          className="h-full transition-all duration-300" 
          style={{ width: `${progress}%`, backgroundColor: testData.test.color_hex || '#4F46E5' }}
        ></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        
        {currentIdx < total ? (
          <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-300" key={currentQ.id}>
            <div className="text-center space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-text-muted">
                Pregunta {currentIdx + 1} de {total}
              </span>
              <h3 className="text-2xl md:text-3xl font-black leading-tight text-text-main">
                {currentQ.pregunta}
              </h3>
            </div>

            <div className="pt-8">
              {currentQ.tipo_respuesta === 'likert_5' && (
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-2">
                    <span>Nada de acuerdo</span>
                    <span>Muy de acuerdo</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 md:gap-4">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => handleSelect(currentQ.id, val)}
                        className={`aspect-square md:aspect-auto md:py-6 rounded-2xl border-2 transition-all font-black text-xl flex items-center justify-center ${
                          answers[currentQ.id] === val
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                            : 'border-border bg-bg-secondary text-text-muted hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.tipo_respuesta === 'likert_7' && (
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-2 text-center">
                    <span className="w-1/3 text-left">Totalmente en desacuerdo</span>
                    <span className="w-1/3 text-center text-[10px] text-text-muted/65">Neutral</span>
                    <span className="w-1/3 text-right">Totalmente de acuerdo</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 md:gap-3">
                    {[1, 2, 3, 4, 5, 6, 7].map(val => (
                      <button
                        key={val}
                        onClick={() => handleSelect(currentQ.id, val)}
                        className={`aspect-square md:aspect-auto md:py-5 rounded-xl border-2 transition-all font-black text-lg flex items-center justify-center ${
                          answers[currentQ.id] === val
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                            : 'border-border bg-bg-secondary text-text-muted hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto text-5xl">
              <i className="fas fa-check"></i>
            </div>
            <h2 className="text-3xl font-black text-text-main">¡Test Completado!</h2>
            <p className="text-text-muted font-medium">Has respondido todas las preguntas ({answeredCount} de {total}). Generando tu perfil psicométrico...</p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 bg-primary hover:bg-accent disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/30"
            >
              {submitting ? 'Guardando Resultados...' : 'Ver Mi Perfil'}
            </button>
          </div>
        )}
        
      </main>

      {/* Footer Nav */}
      <footer className="h-24 border-t border-border px-6 flex items-center justify-between flex-shrink-0 bg-bg-secondary">
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0 || currentIdx >= total}
          className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-main disabled:opacity-0 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </button>

        {currentIdx < total && (
          <button 
            onClick={() => setCurrentIdx(prev => Math.min(total, prev + 1))}
            className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-all flex items-center gap-2"
          >
            Omitir / Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </footer>

    </div>
  );
}
