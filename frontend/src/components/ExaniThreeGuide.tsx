'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  GraduationCap, 
  Check, 
  X, 
  FileText, 
  AlertCircle, 
  Award, 
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface Question {
  id: number;
  section: string;
  q: string;
  opts: string[];
  ans: number;
  expl: string;
}

const exaniThreeSampleQuestions: Question[] = [
  {
    id: 1,
    section: "Metodología de la Investigación",
    q: "En una investigación clínica se desea comparar los promedios del nivel de hemoglobina antes y después de aplicar un tratamiento en un grupo de 30 pacientes. ¿Qué prueba estadística es la más adecuada para este contraste?",
    opts: [
      "Prueba t de Student para muestras relacionadas (emparejadas)",
      "Análisis de Varianza (ANOVA) de un factor",
      "Prueba Chi-cuadrada de independencia"
    ],
    ans: 0,
    expl: "Se trata de comparar el promedio de una misma variable numérica continua (hemoglobina) medida en dos momentos temporales distintos (antes y después) sobre los mismos sujetos (muestras relacionadas). La prueba idónea es la t de Student para muestras emparejadas."
  },
  {
    id: 2,
    section: "Pensamiento Matemático",
    q: "Si la media aritmética de 5 números enteros consecutivos es 15, ¿cuál es el producto del número menor por el número mayor?",
    opts: [
      "221",
      "224",
      "225"
    ],
    ans: 0,
    expl: "Representemos los 5 números consecutivos como: x-2, x-1, x, x+1, x+2. Su suma es 5x, por lo que la media es x = 15. Los números son 13, 14, 15, 16, 17. El producto del menor (13) por el mayor (17) es 13 × 17 = 221."
  },
  {
    id: 3,
    section: "Metodología de la Investigación",
    q: "Identifique la definición adecuada para el concepto de 'Hipótesis Nula' ($H_0$) en un contraste estadístico.",
    opts: [
      "Postula que no existe diferencia o asociación significativa entre los grupos o variables evaluadas.",
      "Afirma la existencia de un efecto o diferencia significativa en la población de estudio.",
      "Es la predicción del investigador respecto al impacto directo de la variable independiente."
    ],
    ans: 0,
    expl: "La hipótesis nula ($H_0$) es el supuesto inicial que establece que cualquier diferencia observada entre los grupos o variables es debida puramente al azar, es decir, no existe efecto o diferencia real."
  },
  {
    id: 4,
    section: "Redacción Indirecta",
    q: "Elija el enunciado que cumple rigurosamente con las reglas de concordancia gramatical y normativa recomendadas para la redacción académica:",
    opts: [
      "El análisis del discurso de los participantes reveló contradicciones importantes.",
      "Hubieron muchas inconsistencias metodológicas en el análisis de los datos.",
      "El grupo de tesistas presentaron sus avances ante el sínodo evaluador."
    ],
    ans: 0,
    expl: "A es correcta: el núcleo del sujeto singular (el análisis) concuerda con el verbo en singular (reveló). B tiene el error de usar el impersonal haber en plural (debe ser 'hubo'). C tiene concordancia colectiva errónea, ya que 'el grupo' (singular) requiere el verbo en singular ('presentó')."
  },
  {
    id: 5,
    section: "Comprensión Lectora",
    q: "'La ciencia no procede por acumulación pasiva de certezas, sino mediante la demolición activa de errores. Un enunciado solo adquiere valor científico en la medida en que se expone a la falsación'. De acuerdo con el texto anterior, se deduce que la ciencia es un proceso:",
    opts: [
      "Dinámico y fundamentado en la refutabilidad constante.",
      "Lineal y enfocado en comprobar verdades absolutas.",
      "Subjetivo y dependiente del criterio del investigador."
    ],
    ans: 0,
    expl: "Al decir que progresa 'demoliendo errores' y mediante la 'exposición a la falsación', el fragmento describe una naturaleza dinámica y fundamentada en la refutabilidad (falsabilidad) popperiana."
  }
];

export default function ExaniThreeGuide({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'estructura' | 'simulador' | 'recursos'>('estructura');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSelectOption = (qId: number, oIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: oIdx
    }));
  };

  const getScore = () => {
    let score = 0;
    exaniThreeSampleQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.ans) score++;
    });
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 animate-in fade-in duration-500 pb-20">
      
      {/* Return Button */}
      <button 
        onClick={onClose} 
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6 text-sm font-bold uppercase tracking-wider group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a Plataforma
      </button>

      {/* Guide Card */}
      <div className="glass border-t-4 border-t-accent rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
            <GraduationCap size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Nivel Posgrado / Maestría</span>
            <h2 className="text-3xl font-black tracking-tight text-text-main leading-tight">
              Guía de Preparación <span className="text-primary italic">EXANI-III</span>
            </h2>
          </div>
        </div>

        {/* Inner Tabs */}
        <div className="flex border-b border-border mb-8 gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('estructura')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'estructura' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            Estructura Oficial
          </button>
          <button
            onClick={() => setActiveTab('simulador')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'simulador' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            Preguntas Diagnósticas
          </button>
          <button
            onClick={() => setActiveTab('recursos')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'recursos' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            Recursos y Guía Oficial
          </button>
        </div>

        {/* Tab Content: Estructura */}
        {activeTab === 'estructura' && (
          <div className="space-y-6">
            <p className="text-sm text-text-muted font-medium leading-relaxed">
              El **EXANI-III** es el instrumento diagnóstico nacional del CENEVAL enfocado a evaluar los conocimientos y aptitudes de los aspirantes a ingresar a estudios de Posgrado (Especialidad, Maestría y Doctorado). A continuación, se muestra el temario y ponderación oficial vigente:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary font-black text-xs">
                  30q
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-main mb-1">Metodología de la Investigación</h4>
                  <p className="text-xs text-text-muted leading-normal">
                    Protocolos de investigación, diseños de estudio (cualitativo y cuantitativo), variables, análisis y estadística aplicada.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary font-black text-xs">
                  30q
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-main mb-1">Pensamiento Matemático</h4>
                  <p className="text-xs text-text-muted leading-normal">
                    Aritmética, álgebra, geometría, estimación de probabilidad, análisis estadístico y lógica cuantitativa.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary font-black text-xs">
                  30q
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-main mb-1">Comprensión Lectora</h4>
                  <p className="text-xs text-text-muted leading-normal">
                    Interpretación de textos científicos, literarios e informativos. Identificación de hipótesis y síntesis.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary font-black text-xs">
                  30q
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-main mb-1">Redacción Indirecta</h4>
                  <p className="text-xs text-text-muted leading-normal">
                    Normativa de escritura, cohesión gramatical, ortografía, semántica y estructuración científica formal.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-accent/20 bg-accent/5 flex items-start gap-4 mt-6">
              <AlertCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-black text-xs uppercase tracking-wider text-accent mb-1">Sección de Diagnóstico Adicional</h5>
                <p className="text-xs text-text-main leading-relaxed">
                  Adicionalmente se aplican **30 reactivos de Inglés como lengua extranjera** (Comprensión de lectura y Redacción indirecta en nivel B2) que no se promedian en la calificación total obligatoria, a menos que el programa específico de posgrado lo requiera.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Simulador */}
        {activeTab === 'simulador' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            <div>
              <h4 className="font-black text-sm uppercase text-text-main mb-1">Reactivos de Práctica Diagnóstica</h4>
              <p className="text-xs text-text-muted font-medium">Prueba tus conocimientos con estos reactivos muestra diseñados bajo las pautas oficiales del CENEVAL.</p>
            </div>

            <div className="space-y-6">
              {exaniThreeSampleQuestions.map((q, idx) => {
                const selectedIdx = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="p-6 bg-bg-secondary rounded-2xl border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg">
                        {q.section}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold">Reactivo {idx + 1}</span>
                    </div>

                    <h5 className="font-bold text-sm leading-relaxed text-text-main">{q.q}</h5>

                    <div className="space-y-2">
                      {q.opts.map((opt, oIdx) => {
                        const isSelected = selectedIdx === oIdx;
                        const isCorrect = q.ans === oIdx;
                        
                        let btnStyle = "border-border bg-bg-primary hover:border-text-muted/30 text-text-main";
                        if (isSelected) {
                          btnStyle = "border-primary bg-primary/10 text-primary";
                        }
                        if (quizSubmitted) {
                          if (isCorrect) {
                            btnStyle = "border-green-500 bg-green-500/10 text-green-500";
                          } else if (isSelected) {
                            btnStyle = "border-red-500 bg-red-500/10 text-red-500";
                          } else {
                            btnStyle = "border-border opacity-50";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectOption(q.id, oIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center transition-all ${btnStyle}`}
                          >
                            <span className="mr-3 text-[10px] font-black uppercase bg-white/5 w-6 h-6 rounded flex items-center justify-center">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {quizSubmitted && isCorrect && <Check size={14} className="text-green-500 ml-2" />}
                            {quizSubmitted && isSelected && !isCorrect && <X size={14} className="text-red-500 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs font-medium text-text-main leading-relaxed">
                        <strong className="text-primary font-bold block mb-1">Explicación Académica:</strong>
                        {q.expl}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit Panel */}
            <div className="pt-4 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              {!quizSubmitted ? (
                <>
                  <p className="text-xs text-text-muted font-medium">Responde todos los reactivos de práctica para ver los resultados.</p>
                  <button
                    disabled={Object.keys(selectedAnswers).length < exaniThreeSampleQuestions.length}
                    onClick={() => setQuizSubmitted(true)}
                    className="py-3 px-6 bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg active:scale-95 self-end"
                  >
                    Calificar Respuestas
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col md:flex-row items-center justify-between bg-accent/5 border border-accent/20 rounded-2xl p-6 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                      <Award size={24} />
                    </div>
                    <div>
                      <h5 className="font-black text-sm uppercase text-text-main">Tu Puntuación Diagnóstica</h5>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
                        {getScore()} de {exaniThreeSampleQuestions.length} correctas ({Math.round((getScore() / exaniThreeSampleQuestions.length) * 100)}%)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="py-3 px-6 bg-white/5 border border-border hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-text-main"
                  >
                    Reiniciar Práctica
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Recursos */}
        {activeTab === 'recursos' && (
          <div className="space-y-6">
            <h4 className="font-black text-sm uppercase text-text-main">Descargas y Ligas Oficiales de Ceneval</h4>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              Utiliza la documentación oficial para estructurar tu plan de estudio de forma rigurosa y evitar estudiar temarios obsoletos:
            </p>

            <div className="space-y-4">
              <a 
                href="https://ceneval.edu.mx/exani-iii" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-bg-secondary border border-border hover:border-accent/40 hover:bg-accent/5 transition-all flex items-center justify-between group"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <ExternalLink size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-text-main group-hover:text-accent transition-colors flex items-center gap-1.5">
                      Portal Oficial EXANI-III Ceneval
                    </h5>
                    <p className="text-[10px] text-text-muted mt-0.5 font-bold uppercase tracking-wider">LIGA EXTERNA • REGISTRO Y FECHAS</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
              </a>

              <a 
                href="https://ceneval.edu.mx/wp-content/uploads/2021/09/Guia_EXANI-III_2021.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-bg-secondary border border-border hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">
                      Guía del Sustentante Oficial EXANI-III (PDF)
                    </h5>
                    <p className="text-[10px] text-text-muted mt-0.5 font-bold uppercase tracking-wider">DESCARGAR DOCUMENTO OFICIAL</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-bg-secondary border border-border space-y-4">
              <h5 className="font-bold text-xs uppercase tracking-wider text-text-main flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                Recomendaciones para Aprobar
              </h5>
              <ul className="space-y-2 text-xs text-text-muted font-medium list-disc list-inside">
                <li>Dedica el 40% del tiempo de estudio al módulo de <strong>Metodología de la Investigación</strong>, ya que es el módulo que suele tener mayor tasa de error.</li>
                <li>Familiarízate con las pruebas de estadística inferencial comunes (Prueba T, ANOVA, Correlación de Pearson, Chi-cuadrada).</li>
                <li>Practica la lectura fluida de artículos de divulgación científica para mejorar en el módulo de <strong>Comprensión Lectora</strong>.</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
