'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  exaniQuestions, 
  Question 
} from '@/lib/exaniQuestions';
import { 
  ArrowLeft, 
  Clock, 
  GraduationCap, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  BookOpen, 
  RotateCcw, 
  Award, 
  Sparkles, 
  AlertCircle,
  Eye,
  Settings,
  ChevronDown
} from 'lucide-react';
import InterstitialAd from '@/components/InterstitialAd';

interface ShuffledQuestion {
  id: number;
  originalId: number;
  section: string;
  q: string;
  visual: string | null;
  shuffledOpts: string[];
  newCorrectIdx: number;
  expl: string;
  context: {
    title: string;
    content: string;
  } | null;
}

const SPONSORED_ADS = [
  {
    brand: "Disney+",
    tagline: "Historias únicas en un solo lugar",
    description: "Disfruta de las mejores películas, series y documentales de Disney, Pixar, Marvel, Star Wars y National Geographic. Suscríbete hoy y experimenta el mejor entretenimiento en streaming.",
    actionUrl: "https://www.disneyplus.com",
    cta: "Suscribirse Ahora",
    logoColor: "text-blue-400",
    bgClass: "from-[#020617] via-[#0b1329] to-[#1e1b4b] border-blue-500/30",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    gradientText: "from-blue-400 via-indigo-200 to-white",
  },
  {
    brand: "Fiesta Rewards",
    tagline: "El programa de lealtad que te conoce",
    description: "Viaja con estilo y obtén recompensas exclusivas en más de 180 hoteles en México. Acumula puntos y redímelos por noches gratis, experiencias gourmet y catálogos de lujo.",
    actionUrl: "https://www.fiestarewards.com",
    cta: "Registrarse Gratis",
    logoColor: "text-amber-400",
    bgClass: "from-[#0a0500] via-[#1c0f00] to-[#2e1a00] border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    gradientText: "from-amber-400 via-yellow-200 to-white",
  },
  {
    brand: "Mouser Electronics",
    tagline: "El distribuidor de componentes líder",
    description: "Encuentra la gama de componentes electrónicos y semiconductores más grande del mundo lista para envío rápido. Diseñado para ingenieros, creadores y makers en todo el mundo.",
    actionUrl: "https://www.mouser.com",
    cta: "Explorar Componentes",
    logoColor: "text-cyan-400",
    bgClass: "from-[#0f172a] via-[#1e293b] to-[#0f172a] border-cyan-500/30",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    gradientText: "from-cyan-400 via-teal-200 to-white",
  }
];

export default function ExaniSimulator({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [mode, setMode] = useState<'simulacion' | 'estudio'>('simulacion');
  const [examSize, setExamSize] = useState<number>(30); // 30, 60, or full (103)
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // { questionIndex: chosenShuffledOptionIndex }
  const [confirmedAnswers, setConfirmedAnswers] = useState<Record<number, boolean>>({}); // for Study Mode to show details
  
  // Custom font size for reading contexts
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  
  // Timer state (seconds)
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Review mode states
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  // Interstitial Ad states
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAdQuestionIdxRef = useRef(-1);

  // Shuffling utility (Fisher-Yates)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Global setups: MathJax injection and hiding PWA bottom nav
  useEffect(() => {
    // Hide bottom nav if it exists (sandwich menu fix)
    const bottomNav = document.querySelector('.bottom-nav-container');
    if (bottomNav) {
      (bottomNav as HTMLElement).style.display = 'none';
    }

    // Inject MathJax if not present
    if (typeof window !== 'undefined' && !(window as any).MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      if (bottomNav) {
        (bottomNav as HTMLElement).style.display = '';
      }
    };
  }, []);

  // Trigger MathJax typeset when active question changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).MathJax) {
        try {
          (window as any).MathJax.typesetPromise();
        } catch (err) {
          console.error("MathJax error:", err);
        }
      }
    }, 150); // slight delay to allow React to mount elements
    return () => clearTimeout(timeoutId);
  }, [currentIdx, step, isReviewMode, reviewIdx, answers, confirmedAnswers]);


  // Start exam
  const startExam = (selectedMode: 'simulacion' | 'estudio', size: number) => {
    setMode(selectedMode);
    setExamSize(size);
    
    // 1. Shuffle all questions
    const allQuestions = [...exaniQuestions];
    let selectedQuestions: Question[] = [];

    // To preserve context groups (e.g. TEXTO 1, TEXTO 2, etc.), we group questions by context
    // and shuffle the contexts/individual questions, or just select questions.
    // For EXANI diagnostic, grouping questions with same contexts together is vital.
    const contextGroups: Record<string, Question[]> = {};
    const standaloneQuestions: Question[] = [];

    allQuestions.forEach(q => {
      if (q.context) {
        const key = q.context.title;
        if (!contextGroups[key]) contextGroups[key] = [];
        contextGroups[key].push(q);
      } else {
        standaloneQuestions.push(q);
      }
    });

    // Shuffle the items
    const shuffledStandalone = shuffleArray(standaloneQuestions);
    const shuffledContextKeys = shuffleArray(Object.keys(contextGroups));

    // Combine them randomly
    const combinedBlocks: (Question | Question[])[] = [
      ...shuffledStandalone,
      ...shuffledContextKeys.map(key => contextGroups[key])
    ];
    
    const shuffledBlocks = shuffleArray(combinedBlocks);
    
    // Flatten and limit to the target size
    const flattened: Question[] = [];
    for (const block of shuffledBlocks) {
      if (Array.isArray(block)) {
        // If we add this block of reading questions, it might exceed the limit.
        // We add them anyway if we are below the limit to avoid splitting a context.
        if (flattened.length < size) {
          flattened.push(...block);
        }
      } else {
        if (flattened.length < size) {
          flattened.push(block);
        }
      }
      if (flattened.length >= size) break;
    }

    // Cut off exactly at the limit (or slightly over if we don't want to break reading groups,
    // but exactly size is cleaner for score tracking). Let's slice to exact size.
    const finalSelection = flattened.slice(0, size);

    // 2. Shuffle choices for each question
    const processed: ShuffledQuestion[] = finalSelection.map((q, idx) => {
      const optsWithIndex = q.opts.map((opt, oIdx) => ({ opt, originalIdx: oIdx }));
      const shuffledOptsWithIdx = shuffleArray(optsWithIndex);
      const shuffledOpts = shuffledOptsWithIdx.map(x => x.opt);
      const newCorrectIdx = shuffledOptsWithIdx.findIndex(x => x.originalIdx === q.ans);

      return {
        id: idx,
        originalId: q.id,
        section: q.section,
        q: q.q,
        visual: q.visual,
        shuffledOpts,
        newCorrectIdx,
        expl: q.expl,
        context: q.context
      };
    });

    setShuffledQuestions(processed);
    setAnswers({});
    setConfirmedAnswers({});
    setCurrentIdx(0);
    setIsReviewMode(false);
    
    // Set timer: 3 hours for full simulation, 1.5 minutes per question for others
    if (selectedMode === 'simulacion') {
      const duration = size === 30 ? 45 * 60 : size === 60 ? 90 * 60 : 180 * 60; // seconds
      setTimeLeft(duration);
      setIsTimerActive(true);
    } else {
      setTimeLeft(0);
      setIsTimerActive(false);
    }
    
    setStep('quiz');
  };

  // Timer countdown hook
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (isTimerActive && timeLeft === 0) {
      // Auto-submit when timer hits 0
      handleSubmitExam();
    }
  }, [isTimerActive, timeLeft]);

  // Handle option select
  const handleSelectOption = (optIdx: number) => {
    if (isReviewMode) return;
    if (mode === 'estudio' && confirmedAnswers[currentIdx]) return; // locked after confirm

    setAnswers(prev => ({
      ...prev,
      [currentIdx]: optIdx
    }));

    // Check if we have just answered a question that is a multiple of 10 (10th, 20th, ...)
    if ((currentIdx + 1) % 10 === 0 && currentIdx > lastAdQuestionIdxRef.current) {
      setShowInterstitialAd(true);
      lastAdQuestionIdxRef.current = currentIdx;
    }

  };

  // Handle confirmation in Study Mode
  const handleConfirmStudyAnswer = () => {
    if (answers[currentIdx] === undefined) return;
    setConfirmedAnswers(prev => ({
      ...prev,
      [currentIdx]: true
    }));
  };

  // Submit exam
  const handleSubmitExam = () => {
    setIsTimerActive(false);
    setShowConfirmSubmit(false);
    setStep('results');
  };

  // Navigate with interstitial ads interception
  const navigateToQuestion = (nextIdx: number) => {
    setCurrentIdx(nextIdx);
  }

  // Get score calculation
  const getResultsMetrics = () => {
    let correctCount = 0;
    const sectionStats: Record<string, { total: number; correct: number }> = {};

    shuffledQuestions.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.newCorrectIdx;
      
      // Calculate section group
      let cleanSection = 'Otros';
      if (q.section.includes('1.')) cleanSection = 'Pensamiento Matemático';
      else if (q.section.includes('2.')) cleanSection = 'Comprensión Lectora';
      else if (q.section.includes('3.')) cleanSection = 'Redacción Indirecta';
      else if (q.section.includes('4.')) cleanSection = 'Inglés';
      else if (q.section.includes('5.')) cleanSection = 'Refuerzo General';

      if (!sectionStats[cleanSection]) {
        sectionStats[cleanSection] = { total: 0, correct: 0 };
      }
      sectionStats[cleanSection].total++;

      if (isCorrect) {
        correctCount++;
        sectionStats[cleanSection].correct++;
      }
    });

    const percentage = shuffledQuestions.length > 0 ? (correctCount / shuffledQuestions.length) * 100 : 0;
    
    return {
      total: shuffledQuestions.length,
      correct: correctCount,
      percentage: Math.round(percentage * 100) / 100,
      sectionStats
    };
  };

  // Formatting utility for timer
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const hStr = hrs > 0 ? `${hrs}:` : '';
    const mStr = mins < 10 && hrs > 0 ? `0${mins}:` : `${mins}:`;
    const sStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${hStr}${mStr}${sStr}`;
  };

  // Font size multiplier mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-xs leading-relaxed';
      case 'lg': return 'text-lg leading-relaxed';
      case 'xl': return 'text-xl leading-relaxed';
      default: return 'text-sm md:text-base leading-relaxed';
    }
  };

  const results = step === 'results' ? getResultsMetrics() : null;
  const currentQuestion = shuffledQuestions[currentIdx];

  return (
    <div className="w-full min-h-[80vh] flex flex-col font-sans select-none animate-in fade-in duration-500 pb-20">
      
      {/* ========================================== */}
      {/* 1. INTRO / CONFIGURATION STEP */}
      {/* ========================================== */}
      {step === 'intro' && (
        <div className="max-w-3xl mx-auto w-full px-4 py-8">
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6 text-sm font-bold uppercase tracking-wider group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver a Cursos
          </button>
          
          <div className="glass border-t-4 border-t-accent rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <GraduationCap size={32} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Comité Conecta-T CESA</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text-main leading-tight">
                  Simulador de Examen <span className="text-primary italic">EXANI-II</span>
                </h2>
              </div>
            </div>

            <p className="text-text-muted mb-8 leading-relaxed font-medium">
              Prepárate para el examen de admisión EXANI-II de CENEVAL. Nuestra base de datos combina reactivos diagnósticos y reales de Pensamiento Matemático, Comprensión Lectora, Redacción Indirecta e Inglés. Cada intento genera un orden de reactivos y opciones único para evitar la memorización.
            </p>

            {/* Config: Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Simulation Mode */}
              <div 
                onClick={() => setMode('simulacion')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between group ${mode === 'simulacion' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10 scale-[1.02]' : 'bg-white/5 border-border hover:border-primary/50'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mode === 'simulacion' ? 'bg-primary text-white shadow-md' : 'bg-white/10 text-text-muted'}`}>
                    <Clock size={20} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${mode === 'simulacion' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-muted'}`}>
                    Tiempo Límite
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-lg text-text-main mb-1">Modo Simulación</h3>
                  <p className="text-xs text-text-muted leading-relaxed font-medium">
                    Simula la prueba real. Con cronómetro, sin retroalimentación inmediata. Resultados y explicaciones al finalizar.
                  </p>
                </div>
              </div>

              {/* Study Mode */}
              <div 
                onClick={() => setMode('estudio')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between group ${mode === 'estudio' ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10 scale-[1.02]' : 'bg-white/5 border-border hover:border-accent/50'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mode === 'estudio' ? 'bg-accent text-white shadow-md' : 'bg-white/10 text-text-muted'}`}>
                    <HelpCircle size={20} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${mode === 'estudio' ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-muted'}`}>
                    Práctica Guiada
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-lg text-text-main mb-1">Modo Estudio</h3>
                  <p className="text-xs text-text-muted leading-relaxed font-medium">
                    Práctica a tu propio ritmo. Sin temporizador. Conoce si tu respuesta es correcta y visualiza la explicación detallada al instante.
                  </p>
                </div>
              </div>
            </div>

            {/* Config: Size Selection */}
            <div className="mb-8">
              <h4 className="font-black text-xs uppercase tracking-widest text-text-muted mb-3">Cantidad de Reactivos</h4>
              <div className="flex gap-4">
                {[
                  { value: 30, label: 'Examen Rápido', desc: '30 preguntas' },
                  { value: 60, label: 'Examen Medio', desc: '60 preguntas' },
                  { value: 120, label: 'Simulador Real', desc: '120 preguntas' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExamSize(opt.value)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-center transition-all ${examSize === opt.value ? 'bg-text-main text-bg-primary border-text-main font-black shadow-md' : 'bg-white/5 border-border hover:bg-white/10 text-text-main font-semibold'}`}
                  >
                    <div className="text-xs">{opt.label}</div>
                    <div className={`text-[9px] mt-0.5 ${examSize === opt.value ? 'text-bg-primary/70' : 'text-text-muted'}`}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => startExam(mode, examSize)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-accent transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 group active:scale-95"
            >
              Iniciar Examen
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            </button>

            {/* Instructions Footer */}
            <div className="mt-8 pt-6 border-t border-border flex items-center gap-3 text-text-muted">
              <AlertCircle size={16} className="text-accent flex-shrink-0" />
              <p className="text-[10px] font-semibold leading-normal">
                Para el correcto renderizado de fórmulas complejas y diagramas matemáticos, asegúrate de mantener una conexión estable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. QUIZ STEP */}
      {/* ========================================== */}
      {step === 'quiz' && currentQuestion && (
        <div className="w-full flex flex-col h-full">
          {/* Top Fixed Header */}
          <header className="fixed top-0 left-0 w-full bg-bg-primary/90 backdrop-blur-md border-b border-border py-4 px-6 md:px-10 z-40 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (confirm("¿Seguro que deseas salir del examen? Tu progreso se perderá.")) {
                    setStep('intro');
                    setIsTimerActive(false);
                  }
                }} 
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center border border-border"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 className="font-black text-sm text-text-main flex items-center gap-2">
                  <span>EXANI-II Simulator</span>
                  <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {mode === 'simulacion' ? 'Simulación' : 'Estudio'}
                  </span>
                </h3>
                <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase mt-0.5">
                  {currentQuestion.section}
                </p>
              </div>
            </div>

            {/* Progress Bar & Indicators */}
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex-1 md:w-48 text-right hidden sm:block">
                <span className="text-xs text-text-muted font-bold">
                  Reactivo <strong className="text-text-main font-black">{currentIdx + 1}</strong> de {shuffledQuestions.length}
                </span>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1 border border-border/30">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / shuffledQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Countdown Timer */}
              {mode === 'simulacion' && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl text-red-500 font-mono font-black text-sm">
                  <Clock size={16} className="animate-pulse" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}

              {/* Finish Button */}
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="btn-clean-primary !py-2.5 !px-4 text-xs font-black uppercase tracking-wider flex-shrink-0"
              >
                Terminar
              </button>
            </div>
          </header>

          {/* Main Quiz Area (with top offset for header) */}
          <div className="flex-1 pt-24 md:pt-20 container mx-auto px-4 md:px-8 max-w-7xl flex flex-col lg:flex-row gap-6 mt-4">
            
            {/* Left side: Reading Context (If present) */}
            {currentQuestion.context ? (
              <div className="flex-1 lg:max-w-[50%] flex flex-col gap-4">
                <div className="glass rounded-3xl p-6 shadow-xl border border-border flex-1 flex flex-col min-h-[300px] lg:max-h-[650px] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <span className="text-xs font-black uppercase text-accent tracking-widest flex items-center gap-2">
                      <BookOpen size={14} />
                      Lectura de Contexto
                    </span>
                    
                    {/* Font controls */}
                    <div className="flex gap-2 items-center">
                      <Settings size={12} className="text-text-muted" />
                      <div className="bg-white/5 rounded-xl border border-border p-0.5 flex gap-1 text-[9px] font-black">
                        {(['sm', 'base', 'lg', 'xl'] as const).map(sz => (
                          <button
                            key={sz}
                            onClick={() => setFontSize(sz)}
                            className={`px-2 py-1 rounded-lg transition-colors uppercase ${fontSize === sz ? 'bg-text-main text-bg-primary' : 'text-text-muted hover:text-text-main'}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Context Text Content */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <h4 className="text-lg font-black text-text-main mb-4">{currentQuestion.context.title}</h4>
                    <p 
                      className={`${getFontSizeClass()} text-text-main/90 font-medium`}
                      dangerouslySetInnerHTML={{ __html: currentQuestion.context.content }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Right side / Main content: Question & Options */}
            <div className="flex-1 flex flex-col gap-4 min-w-[320px]">
              
              {/* Question Card */}
              <div className="glass rounded-3xl p-6 md:p-8 shadow-xl border border-border flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-xl">
                      Pregunta {currentIdx + 1}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold">
                      Original ID: #{currentQuestion.originalId}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-base md:text-xl font-bold text-text-main mb-6 leading-normal">
                    {currentQuestion.q}
                  </h3>

                  {/* Visual Aid / SVGs / Tables */}
                  {currentQuestion.visual && (
                    <div 
                      className="visual-container bg-white/5 border border-dashed border-border rounded-2xl p-4 mb-6 flex justify-center items-center overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.visual }}
                    />
                  )}

                  {/* Option Buttons */}
                  <div className="space-y-3">
                    {currentQuestion.shuffledOpts.map((opt, oIdx) => {
                      const isSelected = answers[currentIdx] === oIdx;
                      const isConfirmed = confirmedAnswers[currentIdx];
                      const isCorrect = oIdx === currentQuestion.newCorrectIdx;

                      let btnStyle = "bg-white/5 border-border text-text-main hover:bg-white/10";
                      let labelStyle = "bg-white/10 text-text-muted";

                      if (isSelected) {
                        btnStyle = "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5";
                        labelStyle = "bg-primary text-white";
                      }

                      // Apply validation styles in study mode
                      if (mode === 'estudio' && isConfirmed) {
                        if (isCorrect) {
                          btnStyle = "bg-green-500/10 border-green-500 text-green-500 shadow-lg shadow-green-500/5";
                          labelStyle = "bg-green-500 text-white";
                        } else if (isSelected) {
                          btnStyle = "bg-red-500/10 border-red-500 text-red-500 shadow-lg shadow-red-500/5";
                          labelStyle = "bg-red-500 text-white";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={mode === 'estudio' && isConfirmed}
                          onClick={() => handleSelectOption(oIdx)}
                          className={`w-full text-left py-3.5 px-4 rounded-2xl border text-sm md:text-base font-semibold flex items-center transition-all ${btnStyle} group`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs mr-4 transition-all flex-shrink-0 ${labelStyle}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {mode === 'estudio' && isConfirmed && isCorrect && (
                            <Check size={16} className="text-green-500 ml-2" />
                          )}
                          {mode === 'estudio' && isConfirmed && isSelected && !isCorrect && (
                            <X size={16} className="text-red-500 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Study Mode Explanation Display */}
                {mode === 'estudio' && answers[currentIdx] !== undefined && (
                  <div className="mt-6 border-t border-border/50 pt-6 animate-in slide-in-from-bottom-2 duration-300">
                    {!confirmedAnswers[currentIdx] ? (
                      <button
                        onClick={handleConfirmStudyAnswer}
                        className="w-full py-3 bg-accent text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg active:scale-95"
                      >
                        Confirmar Respuesta
                      </button>
                    ) : (
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-xs md:text-sm text-text-main/90 font-medium">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider mb-2 text-xs">
                          <Eye size={14} />
                          Explicación Diagnóstica:
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{currentQuestion.expl}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex justify-between items-center gap-4 mt-2">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => navigateToQuestion(currentIdx - 1)}
                  className="px-6 py-3.5 rounded-2xl bg-white/5 border border-border text-text-main font-black text-xs uppercase hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>

                {currentIdx < shuffledQuestions.length - 1 ? (
                  <button
                    onClick={() => navigateToQuestion(currentIdx + 1)}
                    className="px-6 py-3.5 rounded-2xl bg-text-main text-bg-primary font-black text-xs uppercase hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    Siguiente
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-6 py-3.5 rounded-2xl bg-primary text-white font-black text-xs uppercase hover:bg-accent transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Finalizar Examen
                    <Check size={16} />
                  </button>
                )}
              </div>

              {/* Quick Question Map (Inline under Quiz view) */}
              <div className="glass rounded-3xl p-6 border border-border mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Mapa de Navegación
                  </span>
                  <div className="flex items-center gap-3 text-[9px] font-bold text-text-muted">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/15"></span> Pendiente</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Respondida</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {shuffledQuestions.map((q, idx) => {
                    const isAnswered = answers[idx] !== undefined;
                    const isActive = currentIdx === idx;
                    
                    let statusClass = "bg-white/5 border-border hover:bg-white/15 text-text-muted";
                    if (isAnswered) statusClass = "bg-primary border-primary text-white";
                    if (isActive) statusClass = "border-accent ring-2 ring-accent/30 text-accent font-black bg-white/10";

                    return (
                      <button
                        key={idx}
                        onClick={() => navigateToQuestion(idx)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black transition-all ${statusClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Confirm Submit Dialog Overlay */}
          {showConfirmSubmit && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass border-t-4 border-t-red-500 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-black text-text-main mb-2">¿Finalizar esta prueba?</h3>
                <p className="text-sm text-text-muted mb-6 font-medium leading-relaxed">
                  Estás a punto de terminar el examen. Se computarán tus resultados finales y no podrás realizar más ediciones en esta sesión.
                  {Object.keys(answers).length < shuffledQuestions.length && (
                    <span className="block mt-2 font-bold text-red-500">
                      * Tienes {shuffledQuestions.length - Object.keys(answers).length} reactivos sin contestar.
                    </span>
                  )}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 py-3 border border-border rounded-xl text-xs font-black uppercase text-text-main hover:bg-white/5 transition-colors"
                  >
                    Seguir Editando
                  </button>
                  <button
                    onClick={handleSubmitExam}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase transition-colors shadow-lg shadow-red-500/20"
                  >
                    Sí, Finalizar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================== */}
      {/* 3. RESULTS & DIAGNOSTIC STEP */}
      {/* ========================================== */}
      {step === 'results' && results && (
        <div className="max-w-4xl mx-auto w-full px-4 py-8 animate-in fade-in duration-500">
          
          {/* Header Card */}
          <div className="glass border-b border-border rounded-3xl p-8 shadow-xl text-center mb-6 relative overflow-hidden">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-64 h-32 bg-primary/5 rounded-b-full filter blur-2xl"></div>
            
            <Award size={48} className="text-accent mx-auto mb-4 animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Resultado de Diagnóstico</span>
            <h2 className="text-3xl md:text-4xl font-black text-text-main mt-1">Examen Concluido</h2>
            
            {/* Score Ring / Radial Circle */}
            <div className="flex flex-col items-center justify-center my-8">
              <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-border shadow-inner">
                <div className="text-center">
                  <span className="text-5xl font-black text-text-main font-mono">{Math.round(results.percentage)}%</span>
                  <p className="text-[9px] uppercase tracking-wider text-text-muted font-black mt-1">Puntaje Global</p>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-3 font-semibold">
                Contestaste correctamente <strong className="text-text-main font-black">{results.correct}</strong> de {results.total} reactivos.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep('intro')}
                className="px-6 py-3 rounded-2xl bg-white/5 border border-border text-text-main font-black text-xs uppercase hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Nuevo Intento
              </button>
              <button
                onClick={() => onClose()}
                className="px-6 py-3 rounded-2xl bg-text-main text-bg-primary font-black text-xs uppercase hover:opacity-90 transition-all flex items-center gap-2"
              >
                Ir al Panel CESA
              </button>
            </div>
          </div>

          {/* Section Score Grid */}
          <div className="glass rounded-3xl p-6 md:p-8 shadow-xl border border-border mb-6">
            <h3 className="font-black text-sm text-text-main uppercase tracking-widest border-b border-border pb-3 mb-6">
              Desempeño por Habilidad Académica
            </h3>
            
            <div className="space-y-6">
              {Object.entries(results.sectionStats).map(([sect, data]) => {
                const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                let barColor = "bg-primary";
                if (percentage < 60) barColor = "bg-red-500";
                else if (percentage >= 80) barColor = "bg-green-500";

                return (
                  <div key={sect} className="group">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold text-text-main uppercase tracking-wider">{sect}</span>
                      <span className="font-black font-mono bg-white/5 px-2 py-0.5 rounded-lg">
                        {data.correct}/{data.total} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 border border-border/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barColor} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================== */}
          {/* REVIEW MODE INTERFACE */}
          {/* ========================================== */}
          <div className="glass rounded-3xl p-6 md:p-8 shadow-xl border border-border">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-6">
              <h3 className="font-black text-sm text-text-main uppercase tracking-widest flex items-center gap-2">
                <Eye size={16} />
                Revisión Detallada de Respuestas
              </h3>
              <button
                onClick={() => {
                  setIsReviewMode(!isReviewMode);
                  setReviewIdx(0);
                }}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider ${isReviewMode ? 'bg-accent text-white' : 'bg-white/5 border border-border text-text-main hover:bg-white/10'}`}
              >
                {isReviewMode ? 'Ocultar Revisión' : 'Iniciar Revisión'}
              </button>
            </div>

            {isReviewMode ? (
              <div className="flex flex-col gap-6">
                
                {/* Navigation inside review */}
                <div className="flex justify-between items-center bg-white/5 border border-border rounded-2xl p-4">
                  <button
                    disabled={reviewIdx === 0}
                    onClick={() => setReviewIdx(prev => prev - 1)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-border disabled:opacity-20 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black text-text-main uppercase tracking-wider">
                    Reactivo {reviewIdx + 1} de {shuffledQuestions.length}
                  </span>
                  <button
                    disabled={reviewIdx === shuffledQuestions.length - 1}
                    onClick={() => setReviewIdx(prev => prev + 1)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-border disabled:opacity-20 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Question breakdown info */}
                {(() => {
                  const q = shuffledQuestions[reviewIdx];
                  const userAnswer = answers[reviewIdx];
                  const isCorrect = userAnswer === q.newCorrectIdx;
                  
                  return (
                    <div className="space-y-4">
                      
                      {/* Section label */}
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase bg-white/5 border border-border/50 text-text-muted px-2.5 py-1 rounded-xl">
                          {q.section}
                        </span>
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-xl ${isCorrect ? 'bg-green-500/10 text-green-500 border border-green-500/20' : userAnswer === undefined ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {isCorrect ? (
                            <><Check size={12} /> Correcto</>
                          ) : userAnswer === undefined ? (
                            <><AlertCircle size={12} /> Sin Contestar</>
                          ) : (
                            <><X size={12} /> Incorrecto</>
                          )}
                        </div>
                      </div>

                      {/* Display context if present */}
                      {q.context && (
                        <div className="bg-white/5 border border-border rounded-2xl p-5 text-xs max-h-40 overflow-y-auto mb-2 custom-scrollbar">
                          <h5 className="font-black text-text-main mb-1">{q.context.title}</h5>
                          <p className="text-text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: q.context.content }} />
                        </div>
                      )}

                      {/* Question */}
                      <h4 className="text-base font-bold text-text-main leading-normal">{q.q}</h4>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.shuffledOpts.map((opt, oIdx) => {
                          const isUserSelection = userAnswer === oIdx;
                          const isCorrectOpt = oIdx === q.newCorrectIdx;

                          let styleClass = "border-border bg-white/5 text-text-main";
                          let labelClass = "bg-white/10 text-text-muted";

                          if (isCorrectOpt) {
                            styleClass = "border-green-500 bg-green-500/10 text-green-500";
                            labelClass = "bg-green-500 text-white";
                          } else if (isUserSelection) {
                            styleClass = "border-red-500 bg-red-500/10 text-red-500";
                            labelClass = "bg-red-500 text-white";
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`flex items-center border p-3 rounded-2xl text-sm md:text-base font-semibold ${styleClass}`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] mr-3 flex-shrink-0 ${labelClass}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </div>
                              <span className="flex-1 leading-snug">{opt}</span>
                              {isCorrectOpt && <Check size={14} className="text-green-500 ml-2" />}
                              {isUserSelection && !isCorrectOpt && <X size={14} className="text-red-500 ml-2" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-xs md:text-sm text-text-main/90 font-medium">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider mb-2 text-xs">
                          <Eye size={14} />
                          Explicación Diagnóstica:
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{q.expl}</p>
                      </div>

                    </div>
                  );
                })()}

                {/* Grid Navigation inside Review */}
                <div className="border-t border-border/50 pt-6 mt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-3">
                    Saltar a Pregunta
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {shuffledQuestions.map((q, idx) => {
                      const userAnswer = answers[idx];
                      const isCorrect = userAnswer === q.newCorrectIdx;
                      
                      let statusClass = "bg-white/5 border-border hover:bg-white/10 text-text-muted";
                      if (userAnswer === undefined) statusClass = "border-yellow-500 bg-yellow-500/5 text-yellow-500";
                      else if (isCorrect) statusClass = "border-green-500 bg-green-500/5 text-green-500";
                      else statusClass = "border-red-500 bg-red-500/5 text-red-500";
                      
                      if (reviewIdx === idx) statusClass += " ring-2 ring-accent/40 font-black scale-105";

                      return (
                        <button
                          key={idx}
                          onClick={() => setReviewIdx(idx)}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black transition-all ${statusClass}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-text-muted leading-relaxed font-semibold">
                Haz clic en el botón de arriba para iniciar la revisión de reactivos. Podrás repasar cada pregunta, tu respuesta, la respuesta correcta y la explicación diagnóstica.
              </p>
            )}

          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* AD OVERLAY (INTERSTITIAL) */}
      {/* ========================================== */}
      <InterstitialAd show={showInterstitialAd} onClose={() => setShowInterstitialAd(false)} />

    </div>
  );
}
