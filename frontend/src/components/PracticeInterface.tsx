'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { BookOpen, AlertCircle, Award, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Question {
  id: number;
  pregunta: string;
  opciones: string[];
  tipo: string;
  respuesta_correcta: string;
  explicacion: string;
}

interface PracticeInterfaceProps {
  skillId: number;
  onClose: () => void;
}

const PracticeInterface: React.FC<PracticeInterfaceProps> = ({ skillId, onClose }) => {
  const [step, setStep] = useState<'loading' | 'practice' | 'summary'>('loading');
  const [habilidad, setHabilidad] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answersLog, setAnswersLog] = useState<Array<{ question: string, selected: string, correct: string, wasCorrect: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    if (token) {
      loadPractice();
    }
  }, [token, skillId]);

  const loadPractice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/skills.php?action=iniciar_practica&habilidad_id=${skillId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHabilidad(data.habilidad);
        setQuestions(data.preguntas);
        setStep('practice');
      } else {
        alert(data.error || "No se pudo cargar la práctica");
        onClose();
      }
    } catch (e) {
      alert("Error de conexión al cargar la práctica");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (hasChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || hasChecked) return;
    
    const currentQ = questions[currentIdx];
    const isCorrect = selectedOption.toLowerCase().trim() === currentQ.respuesta_correcta.toLowerCase().trim();
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    setAnswersLog(prev => [
      ...prev,
      {
        question: currentQ.pregunta,
        selected: selectedOption,
        correct: currentQ.respuesta_correcta,
        wasCorrect: isCorrect
      }
    ]);

    setHasChecked(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setHasChecked(false);
    } else {
      setStep('summary');
    }
  };

  if (step === 'loading') {
    return (
      <div className="fixed inset-0 z-[120] bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Cargando simulador de práctica...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  if (step === 'practice') {
    return (
      <div className="fixed inset-0 z-[120] bg-bg-primary text-text-main flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-10 flex-shrink-0 bg-bg-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg animate-pulse">
              <i className={habilidad?.icono || 'fas fa-graduation-cap'}></i>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight leading-tight">{habilidad?.nombre}</h2>
              <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">Ejercicios de Práctica • CESA Conecta-T</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn-clean px-4 py-2 border border-border rounded-xl text-xs font-black uppercase text-text-muted hover:border-red-500 hover:text-red-500 transition-all"
          >
            Salir
          </button>
        </header>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-border flex-shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full space-y-8 md:space-y-12">
          <div className="w-full text-center md:text-left space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block">
              Pregunta {currentIdx + 1} de {questions.length}
            </span>
            <h3 className="text-2xl md:text-3xl font-black leading-tight">
              {currentQ.pregunta}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {currentQ.opciones.map((opt: string, i: number) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt.toLowerCase().trim() === currentQ.respuesta_correcta.toLowerCase().trim();
              
              let btnClass = "border-border bg-bg-secondary hover:border-text-muted/30";
              if (hasChecked) {
                if (isCorrectOpt) {
                  btnClass = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400";
                } else if (isSelected) {
                  btnClass = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                } else {
                  btnClass = "border-border bg-bg-secondary opacity-50";
                }
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={i}
                  disabled={hasChecked}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${btnClass}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                      isSelected ? 'bg-primary text-white' : 'bg-border text-text-muted'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-bold text-sm md:text-base">{opt}</span>
                  </div>
                  {hasChecked && isCorrectOpt && <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" />}
                  {hasChecked && isSelected && !isCorrectOpt && <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Card */}
          {hasChecked && (
            <div className="w-full clean-card p-6 border-l-4 border-l-primary bg-bg-secondary shadow-lg animate-in slide-in-from-top-4 duration-300">
              <div className="flex gap-3 items-start">
                <BookOpen className="text-primary w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">Retroalimentación Académica</h4>
                  <p className="text-sm text-text-muted font-medium">{currentQ.explicacion || "Respuesta correcta basada en los estándares de evaluación CESA."}</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer Navigation */}
        <footer className="h-24 border-t border-border px-6 md:px-10 flex items-center justify-between bg-bg-secondary flex-shrink-0">
          <div className="text-xs font-bold text-text-muted">
            Habilidad: <span className="text-text-main">{habilidad?.nombre}</span>
          </div>

          <div className="flex gap-4">
            {!hasChecked ? (
              <button
                disabled={!selectedOption}
                onClick={handleCheckAnswer}
                className="bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
              >
                Comprobar
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-green-600/20"
              >
                {currentIdx < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Práctica'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  if (step === 'summary') {
    const successPercentage = Math.round((correctCount / questions.length) * 100);
    const passed = successPercentage >= (habilidad?.nivel_minimo_aprobatorio || 70);

    return (
      <div className="fixed inset-0 z-[120] bg-bg-primary text-text-main flex flex-col animate-in zoom-in-95 duration-300 overflow-y-auto">
        <main className="flex-1 py-12 px-6 max-w-2xl mx-auto w-full flex flex-col justify-center space-y-10">
          {/* Header Summary Card */}
          <div className="clean-card p-10 text-center space-y-6 relative overflow-hidden border border-border shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl ${
              passed ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {passed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Resumen de Práctica</h3>
              <p className="text-text-muted text-xs font-bold uppercase tracking-wider">{habilidad?.nombre}</p>
            </div>

            <div className="space-y-1">
              <div className="text-6xl font-black tracking-tight text-text-main">{successPercentage}%</div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                {correctCount} de {questions.length} respuestas correctas
              </p>
            </div>

            <p className="text-sm text-text-muted max-w-md mx-auto font-medium">
              {passed 
                ? "¡Excelente trabajo! Tienes el nivel requerido para aprobar el examen oficial de certificación y ganar tu micro-credencial digital." 
                : "Te recomendamos seguir repasando los reactivos y las explicaciones antes de intentar la evaluación oficial."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={loadPractice}
                className="px-6 py-3.5 rounded-2xl bg-bg-secondary border border-border text-xs font-black uppercase tracking-wider hover:bg-border transition-all"
              >
                Volver a Practicar
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-3.5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-accent transition-all shadow-lg shadow-primary/30"
              >
                Volver al Panel
              </button>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Desglose de Preguntas</h4>
            <div className="space-y-3">
              {answersLog.map((log, index) => (
                <div key={index} className="p-5 bg-bg-secondary rounded-2xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-black text-text-muted uppercase tracking-wider">Pregunta {index + 1}</p>
                    <p className="text-sm font-bold text-text-main leading-snug">{log.question}</p>
                  </div>
                  <div className="flex md:flex-col items-start gap-2 text-xs font-bold flex-shrink-0">
                    <span className="flex items-center gap-1.5 text-text-muted">
                      Tu respuesta: <span className={log.wasCorrect ? 'text-green-500 font-extrabold' : 'text-red-500 font-extrabold'}>{log.selected}</span>
                    </span>
                    {!log.wasCorrect && (
                      <span className="text-green-500 flex items-center gap-1 mt-1 md:mt-0">
                        Correcta: <span className="font-extrabold">{log.correct}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default PracticeInterface;
