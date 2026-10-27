'use client';

import React, { useState } from 'react';

const orgData = {
  mesa_directiva: {
    title: "Mesa Directiva CESA",
    members: [
      { role: "Presidente", name: "Estudiante Titular", email: "presidencia@fondothoth.com" },
      { role: "Vicepresidente", name: "Estudiante Titular", email: "vicepresidencia@fondothoth.com" },
      { role: "Secretario General", name: "Estudiante Titular", email: "secretaria@fondothoth.com" },
      { role: "Tesorero", name: "Estudiante Titular", email: "tesoreria@fondothoth.com" }
    ]
  },
  coordinaciones: [
    {
      name: "Coordinación de Comunicación",
      head: "Coordinador de Comunicación",
      responsibilities: ["Gestión del Muro de Noticias", "Redes Sociales", "Relaciones Públicas"]
    },
    {
      name: "Coordinación de Emprendimiento",
      head: "Coordinador de Bazar",
      responsibilities: ["Moderación del Bazar", "Verificación de Negocios", "Asignación de Karma"]
    },
    {
      name: "Coordinación de Relaciones Corporativas",
      head: "Coordinador de Servicio Social y Prácticas Profesionales",
      responsibilities: ["Auditoría de Vacantes", "Contacto con Empresas", "Simuladores de Entrevistas"]
    },
    {
      name: "Comité de Transparencia y Honor",
      head: "Auditor Estudiantil",
      responsibilities: ["Supervisión de Votaciones", "Resolución de Denuncias", "Auditoría de IA (BOB)"]
    }
  ],
  sociedades: [
    { name: "Sociedad de Alumnos de Sistemas", acronym: "SAS", members: 45 },
    { name: "Sociedad de Alumnos de Industrial", acronym: "SAI", members: 60 },
    { name: "Sociedad de Alumnos de Mecatrónica", acronym: "SAM", members: 35 },
    { name: "Sociedad de Alumnos de Civil", acronym: "SAC", members: 50 }
  ]
};

export default function OrgChart() {
  const [activeView, setActiveView] = useState<'mesa' | 'coordinaciones' | 'sociedades'>('mesa');

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Organigrama Institucional</h2>
        <p className="text-indigo-400 text-xs uppercase font-black tracking-widest max-w-xl mx-auto leading-relaxed">
          Estructura de Gobernanza Estudiantil, Sociedades y Comités de Moderación.
        </p>
      </div>

      {/* Navegación del Organigrama */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'mesa', label: 'Mesa Directiva', icon: '👑' },
          { id: 'coordinaciones', label: 'Coordinaciones Operativas', icon: '⚙️' },
          { id: 'sociedades', label: 'Sociedades Estudiantiles', icon: '🎓' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeView === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800 hover:text-white border border-white/5'
            }`}
          >
            <span className="text-sm">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Vistas Dinámicas */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 md:p-16 min-h-[400px] relative overflow-hidden backdrop-blur-xl">
        
        {/* Efecto de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          {activeView === 'mesa' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-500">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-2xl shadow-indigo-500/30 mb-6 border-4 border-slate-900">
                  🦅
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{orgData.mesa_directiva.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {/* Línea conectora decorativa */}
                <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10"></div>
                
                {orgData.mesa_directiva.members.map((m, i) => (
                  <div key={i} className="bg-slate-900/80 border border-white/10 p-6 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300">
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-4">{m.role}</p>
                    <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full mb-4 border-2 border-white/5"></div>
                    <p className="text-white font-bold text-sm">{m.name}</p>
                    <p className="text-slate-500 text-[9px] mt-1 break-words">{m.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'coordinaciones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-500">
              {orgData.coordinaciones.map((c, i) => (
                <div key={i} className="bg-slate-900/80 border border-white/10 p-8 rounded-[2rem] hover:border-indigo-500/30 transition-colors group">
                  <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-indigo-400 transition-colors">{c.name}</h4>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Líder: <span className="text-white">{c.head}</span></p>
                  
                  <div className="space-y-3">
                    <p className="text-[8px] uppercase tracking-widest text-indigo-500 font-bold">Responsabilidades Clave:</p>
                    <ul className="space-y-2">
                      {c.responsibilities.map((r, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'sociedades' && (
            <div className="animate-in slide-in-from-bottom-10 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {orgData.sociedades.map((s, i) => (
                  <div key={i} className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/5 p-8 rounded-[2rem] text-center hover:border-indigo-500/20 transition-colors">
                    <div className="w-20 h-20 mx-auto bg-black/50 rounded-full flex items-center justify-center border border-white/5 mb-6 text-2xl font-black text-indigo-400">
                      {s.acronym}
                    </div>
                    <h5 className="text-white font-bold text-sm mb-4 leading-tight h-10">{s.name}</h5>
                    <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      {s.members} Miembros
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-xs text-slate-500 italic max-w-xl mx-auto">
                  Las Sociedades Estudiantiles operan bajo la jurisdicción de la Mesa Directiva del CESA y son fundamentales para la representación de cada carrera.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
