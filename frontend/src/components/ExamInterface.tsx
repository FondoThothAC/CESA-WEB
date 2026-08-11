'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

interface Question {
  id: number;
  pregunta: string;
  opciones: string[];
  tipo: string;
}

interface ExamInterfaceProps {
  skillId: number;
  onClose: () => void;
  onFinish: (result: any) => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ skillId, onClose, onFinish }) => {
  const [step, setStep] = useState<'intro' | 'exam' | 'results'>('intro');
  const [examData, setExamData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const startExam = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('action', 'iniciar_evaluacion');
      formData.append('habilidad_id', skillId.toString());

      const res = await fetch(`${API_URL}/skills.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setExamData(data);
        setTimeLeft(data.tiempo_limite || (data.habilidad.duracion_minutos * 60));
        setStep('exam');
      } else {
        alert(data.error || "No se pudo iniciar el examen");
        onClose();
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('action', 'finalizar_evaluacion');
      formData.append('evaluacion_id', examData.evaluacion_id);
      formData.append('respuestas', JSON.stringify(answers));

      const res = await fetch(`${API_URL}/skills.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        onFinish(data);
      } else {
        alert(data.error || "Error al enviar respuestas");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'exam' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (step === 'exam' && timeLeft === 0) {
      submitExam();
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (step === 'intro') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="glass max-w-md w-full p-10 rounded-[2.5rem] border-white/10 text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-3xl text-indigo-400">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Certificación de Habilidades</h2>
          <p className="text-white/60 text-sm">Estás por iniciar una evaluación oficial. Una vez que comiences, el tiempo no se detendrá.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-8 py-3 rounded-2xl bg-white/5 text-white/40 text-xs font-black uppercase hover:bg-white/10 transition-all">Cancelar</button>
            <button onClick={startExam} disabled={loading} className="px-8 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase hover:bg-white hover:text-black transition-all shadow-xl shadow-indigo-600/20">
              {loading ? 'Preparando...' : 'Comenzar Ahora'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = examData.preguntas[currentIdx];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-10">
        <div>
          <h2 className="text-white font-black uppercase text-xs tracking-widest">{examData.habilidad.nombre}</h2>
          <p className="text-[10px] text-white/40 uppercase font-black">Certificación Oficial CESA</p>
        </div>
        <div className={`px-6 py-2 rounded-full font-mono text-xl font-bold ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-indigo-400'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-white/5">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 shadow-[0_0_15px_rgba(79,70,229,1)]" 
          style={{ width: `${((currentIdx + 1) / examData.preguntas.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Main Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center p-10 space-y-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 block">Pregunta {currentIdx + 1} de {examData.preguntas.length}</span>
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">{currentQ.pregunta}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.opciones.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                answers[currentQ.id] === opt
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-white/5 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${answers[currentQ.id] === opt ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/40'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="font-bold">{opt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="h-24 border-t border-white/5 px-10 flex items-center justify-between">
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-0 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i> Anterior
        </button>

        {currentIdx < examData.preguntas.length - 1 ? (
          <button 
            onClick={() => setCurrentIdx(prev => prev + 1)}
            className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
          >
            Siguiente Pregunta <i className="fas fa-arrow-right ml-2"></i>
          </button>
        ) : (
          <button 
            onClick={submitExam}
            disabled={loading}
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all shadow-xl shadow-emerald-600/30"
          >
            {loading ? 'Enviando...' : 'Finalizar Evaluación'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamInterface;
