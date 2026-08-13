'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Brain, FileText, ChevronRight, CheckCircle2, ArrowLeft, BarChart2 } from 'lucide-react';
import TestInterface from './TestInterface';

interface PsychometricTestsProps {
  onClose?: () => void;
}

export default function PsychometricTests({ onClose }: PsychometricTestsProps) {
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [viewState, setViewState] = useState<'list' | 'testing' | 'result_details'>('list');
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const { token } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    loadTests();
  }, [token]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_URL}/tests.php?action=listar`, {
        headers
      });
      const data = await res.json();
      if (data && data.success) {
        setTests(Array.isArray(data.tests) ? data.tests : []);
        setResults(data.mis_resultados || {});
      }
    } catch (e) {
      console.error('Error al cargar tests psicométricos:', e);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test: any) => {
    setActiveTest(test);
    setViewState('testing');
  };

  const viewResult = (test: any, result: any) => {
    setActiveTest(test);
    setSelectedResult(result);
    setViewState('result_details');
  };

  const handleTestFinish = () => {
    setViewState('list');
    setActiveTest(null);
    loadTests(); // recargar resultados
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (viewState === 'testing' && activeTest) {
    return (
      <TestInterface 
        testId={activeTest.id} 
        onClose={() => setViewState('list')} 
        onFinish={handleTestFinish} 
      />
    );
  }

  if (viewState === 'result_details' && activeTest && selectedResult) {
    // Parseo seguro de resultados_json ya sea objeto o string serializado
    let parsedResultados: Record<string, any> = {};
    if (typeof selectedResult.resultados_json === 'string') {
      try {
        parsedResultados = JSON.parse(selectedResult.resultados_json);
      } catch (e) {
        parsedResultados = {};
      }
    } else if (typeof selectedResult.resultados_json === 'object' && selectedResult.resultados_json !== null) {
      parsedResultados = selectedResult.resultados_json;
    }

    const testColor = activeTest.color_hex || '#4F46E5';

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setViewState('list')}
            className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
          </button>
        </div>

        <div className="clean-card p-8 border border-border shadow-xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg" style={{ backgroundColor: `${testColor}20`, color: testColor }}>
              <i className={activeTest.icono || 'fas fa-brain'}></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-main">{activeTest.nombre}</h2>
              <p className="text-text-muted font-bold text-sm uppercase tracking-widest">{activeTest.acronimo} • Perfil Generado: <span className="text-primary font-black">{selectedResult.perfil_generado || 'Mixto'}</span></p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted border-b border-border pb-2">Desglose Dimensional</h3>
            
            <div className="space-y-4">
              {Object.entries(parsedResultados).map(([dim, score]: [string, any], idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-text-main uppercase text-sm">{dim}</span>
                    <span className="font-black text-primary text-xl">{score}%</span>
                  </div>
                  <div className="h-3 w-full bg-bg-primary rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${Math.min(100, Math.max(0, Number(score) || 0))}%`, 
                        backgroundColor: testColor
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <button 
              onClick={() => startTest(activeTest)}
              className="px-6 py-3 rounded-xl bg-bg-primary border border-border hover:bg-border text-text-main font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Volver a tomar el Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const safeTests = Array.isArray(tests) ? tests : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-text-main">Psicometría y Vocación</h2>
          <p className="text-text-muted text-sm font-medium mt-1">Descubre tu perfil cognitivo, conductual y vocacional.</p>
        </div>
        <Brain className="w-10 h-10 text-primary opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {safeTests.map(test => {
          const result = results ? results[test.id] : null;
          const hasResult = !!result;
          const cardColor = test.color_hex || '#4F46E5';

          return (
            <div key={test.id} className="clean-card p-6 border border-border hover:border-primary/30 transition-all flex flex-col h-full group">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl flex flex-shrink-0 items-center justify-center text-2xl shadow-inner" style={{ backgroundColor: `${cardColor}20`, color: cardColor }}>
                  <i className={test.icono || 'fas fa-brain'}></i>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-bg-primary text-text-muted border border-border">
                      {test.acronimo}
                    </span>
                    {hasResult && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-text-main text-lg leading-tight group-hover:text-primary transition-colors">{test.nombre}</h3>
                  <p className="text-sm text-text-muted line-clamp-2">{test.descripcion}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs font-bold text-text-muted flex items-center gap-2">
                  <i className="far fa-clock"></i> ~{test.duracion_estimada_minutos || 15} min
                </div>
                
                {hasResult ? (
                  <button 
                    onClick={() => viewResult(test, result)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-accent transition-colors"
                  >
                    Ver Perfil <BarChart2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => startTest(test)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-main hover:text-primary transition-colors"
                  >
                    Iniciar Test <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
