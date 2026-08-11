import React from 'react';

const AcademicProfile = ({ profile }) => {
  if (!profile) return null;

  const { progreso_academico, skills, nombre_completo, carrera, expediente } = profile;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-indigo-600 flex items-center justify-center font-black text-4xl shadow-2xl shadow-indigo-500/20 border-4 border-white/5">
            {nombre_completo.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black mb-1">{nombre_completo}</h2>
            <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4">
              {carrera} • EXP: {expediente}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-white/5 border border-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white/50">
                Alumno Regular
              </span>
              <span className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-400">
                Pilar Liderazgo
              </span>
            </div>
          </div>
          <div className="md:text-right">
             <div className="text-4xl font-black text-white/90 leading-none">{progreso_academico.semestre_real}º</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">Semestre Real</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Progress Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-6">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Carga Académica Real</h3>
              <span className="text-xs font-mono text-indigo-400">{progreso_academico.creditos_acumulados} / 450 Créditos</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-white/60">
                  <span>Progreso de Titulación</span>
                  <span>{Math.round((progreso_academico.creditos_acumulados / 450) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${(progreso_academico.creditos_acumulados / 450) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Faltan</div>
                  <div className="text-xl font-black">{progreso_academico.creditos_faltantes_siguiente_sem}</div>
                  <div className="text-[9px] text-indigo-400 font-bold">Créditos p/ sgte. semestre</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Status</div>
                  <div className={`text-xl font-black ${progreso_academico.es_irregular ? 'text-amber-500' : 'text-green-500'}`}>
                    {progreso_academico.es_irregular ? 'Irregular' : 'Óptimo'}
                  </div>
                  <div className="text-[9px] text-white/40 font-bold">Trayectoria académica</div>
                </div>
              </div>
            </div>
          </div>

          {/* CV & Docs Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="glass-panel p-6 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                <div>
                   <h4 className="text-sm font-bold">Currículum Vitae</h4>
                   <p className="text-[10px] text-white/40 tracking-wider">Última actualización: Ayer</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                   <i className="fas fa-file-pdf"></i>
                </div>
             </div>
             <div className="glass-panel p-6 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                <div>
                   <h4 className="text-sm font-bold">Kárdex Oficial</h4>
                   <p className="text-[10px] text-white/40 tracking-wider">Periodo: 2026-1</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                   <i className="fas fa-external-link-alt"></i>
                </div>
             </div>
          </div>
        </div>

        {/* Verified Skills Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 border-b border-white/5 pb-4">Skills Verificadas</h3>
            <div className="space-y-4">
              {skills && skills.length > 0 ? (
                skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                      <i className="fas fa-certificate text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{skill.nombre}</h4>
                      <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{skill.nivel}</p>
                    </div>
                    <i className="fas fa-check-circle text-green-500 ml-auto text-xs"></i>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                   <div className="text-2xl opacity-10 mb-2">📜</div>
                   <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Sin certificaciones vigentes</p>
                   <button className="mt-4 text-[9px] bg-indigo-600 px-4 py-2 rounded-lg font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                      Iniciar Examen
                   </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="glass-panel p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
             <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-indigo-300">Portafolio Digital</h4>
             <p className="text-[10px] text-white/40 leading-relaxed mb-4">Tu portafolio es visible para empresas asociadas al programa de empleabilidad CESA.</p>
             <button className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Configurar Privacidad
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicProfile;
