'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import ExamInterface from './ExamInterface';
import PracticeInterface from './PracticeInterface';
import PsychometricTests from './PsychometricTests';
import { QRCodeSVG } from 'qrcode.react';

interface AcademicProfileProps {
  profile: {
    nombre_completo?: string;
    nombre?: string;
    expediente?: string;
    matricula?: string;
    carrera?: string;
    avatar_path?: string;
    progreso_academico?: {
      semestre_real?: number;
      creditos_acumulados?: number;
      porcentaje_semestre_actual?: number;
      creditos_faltantes_siguiente_sem?: number;
      es_irregular?: boolean;
    };
    skills?: Array<{ nombre: string; nivel: string }>;
  } | null;
}

const AcademicProfile = ({ profile }: AcademicProfileProps) => {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [myCerts, setMyCerts] = useState<any[]>([]);
  const [activeExamId, setActiveExamId] = useState<number | null>(null);
  const [activePracticeId, setActivePracticeId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [showCarnet, setShowCarnet] = useState(false);
  const [identidad, setIdentidad] = useState<any>(null);
  const [loadingCarnet, setLoadingCarnet] = useState(false);
  const [reservas, setReservas] = useState<any[]>([]);
  const { token } = useAuth();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    if (token) {
      fetchCatalog();
      fetchReservas();
    }
  }, [token]);

  const fetchReservas = async () => {
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=mis_reservas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setReservas(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      console.error('Error cargando reservas:', e);
    }
  };

  const downloadTicket = async (id: number, folio: string) => {
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=descargar_ticket&id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folio}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al descargar ticket:', e);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API_URL}/skills.php?action=listar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        // Ordenar: Inglés primero, luego idiomas por popularidad decreciente, luego psicometría, luego el resto
        const IDIOMA_ORDER: Record<string, number> = {
          'inglés': 1, 'ingles': 1,
          'francés': 2, 'frances': 2,
          'japonés': 3, 'japones': 3,
          'alemán': 4, 'aleman': 4,
          'italiano': 5,
          'portugués': 6, 'portugues': 6,
          'chino': 7,
        };
        const rawCatalog = Array.isArray(data.catalog) ? data.catalog : (Array.isArray(data.data) ? data.data : []);
        const sortedCatalog = [...rawCatalog].sort((a: any, b: any) => {
          const catA = (a.categoria || '').toLowerCase();
          const catB = (b.categoria || '').toLowerCase();
          const nameA = (a.nombre || '').toLowerCase();
          const nameB = (b.nombre || '').toLowerCase();
          const isIdiomaA = catA.includes('idioma');
          const isIdiomaB = catB.includes('idioma');
          const isPsicoA = catA.includes('psico') || nameA.includes('psico');
          const isPsicoB = catB.includes('psico') || nameB.includes('psico');
          if (isIdiomaA && isIdiomaB) {
            const findOrder = (name: string) => {
              for (const [key, val] of Object.entries(IDIOMA_ORDER)) {
                if (name.includes(key)) return val;
              }
              return 99;
            };
            return findOrder(nameA) - findOrder(nameB);
          }
          if (isIdiomaA) return -1;
          if (isIdiomaB) return 1;
          if (isPsicoA) return -1;
          if (isPsicoB) return 1;
          return 0;
        });
        setCatalog(sortedCatalog);
        setMyCerts(Array.isArray(data.my_certs) ? data.my_certs : []);
      }
    } catch (e) {
      console.error('Error al cargar catálogo de skills:', e);
    }
  };

  const fetchIdentidad = async () => {
    setLoadingCarnet(true);
    try {
      const res = await fetch(`${API_URL}/auth/identidad.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success && data.identity) {
        setIdentidad(data.identity);
        setShowCarnet(true);
      } else {
        alert("No se pudo obtener la identidad digital en este momento.");
      }
    } catch (e) {
      console.error('Error al sincronizar identidad digital:', e);
      alert("Error de conexión al sincronizar identidad digital.");
    } finally {
      setLoadingCarnet(false);
    }
  };

  if (!profile) {
    return (
      <div className="clean-card border border-border p-20 text-center bg-bg-secondary/60">
         <div className="text-4xl mb-4 opacity-20">🔐</div>
         <p className="text-text-muted font-black uppercase text-[10px] tracking-widest leading-relaxed max-w-xs mx-auto">
           Acceso restringido. Inicia sesión con tu cuenta UNISON para visualizar tu progreso académico acumulado.
         </p>
      </div>
    );
  }

  // Normalización defensiva de datos del perfil
  const displayName = profile.nombre_completo || profile.nombre || 'Estudiante UNISON';
  const initialLetter = displayName.trim().charAt(0).toUpperCase() || 'U';
  const userExpediente = profile.expediente || profile.matricula || '213203453';
  const userCarrera = profile.carrera || 'Ingeniería en Sistemas de Información';

  const progreso = profile.progreso_academico || {
    semestre_real: 6,
    creditos_acumulados: 240,
    porcentaje_semestre_actual: 85,
    creditos_faltantes_siguiente_sem: 20,
    es_irregular: false
  };

  const safeCerts = Array.isArray(myCerts) ? myCerts : [];
  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  const safeReservas = Array.isArray(reservas) ? reservas : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 text-text-main">
      {activeExamId && (
        <ExamInterface 
          skillId={activeExamId} 
          onClose={() => setActiveExamId(null)}
          onFinish={(res) => {
            setLastResult(res);
            setActiveExamId(null);
            fetchCatalog();
          }}
        />
      )}

      {activePracticeId && (
        <PracticeInterface 
          skillId={activePracticeId} 
          onClose={() => {
            setActivePracticeId(null);
            fetchCatalog();
          }}
        />
      )}

      {lastResult && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="glass max-w-md w-full p-10 rounded-[3rem] border-white/10 text-center space-y-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-4xl ${lastResult.aprobo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <i className={`fas ${lastResult.aprobo ? 'fa-award' : 'fa-times-circle'}`}></i>
            </div>
            <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter">
              {lastResult.aprobo ? '¡Certificación Obtenida!' : 'Resultado Insuficiente'}
            </h3>
            <p className="text-text-muted text-sm">{lastResult.mensaje}</p>
            <div className="text-5xl font-black text-text-main">{lastResult.calificacion}%</div>
            {lastResult.certificado_uuid && (
              <div className="bg-bg-secondary p-4 rounded-2xl border border-border">
                <p className="text-[8px] uppercase font-black text-primary tracking-widest mb-1">ID de Verificación</p>
                <p className="text-[10px] font-mono text-text-muted truncate">{lastResult.certificado_uuid}</p>
              </div>
            )}
            <button onClick={() => setLastResult(null)} className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent transition-all">Regresar al Perfil</button>
          </div>
        </div>
      )}

      {/* Tarjeta de Encabezado Premium */}
      <div className="clean-card border border-border p-10 rounded-[40px] relative overflow-hidden bg-bg-secondary/60 backdrop-blur-xl animate-in fade-in duration-1000">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          {profile.avatar_path ? (
            <div className="w-32 h-32 rounded-[40px] overflow-hidden shadow-2xl shadow-primary/30 border-2 border-primary">
              <img src={profile.avatar_path} alt={displayName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-[40px] bg-primary flex items-center justify-center font-black text-4xl shadow-2xl shadow-primary/40 text-white">
              {initialLetter}
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black mb-1 text-text-main tracking-tighter">{displayName}</h2>
            <p className="text-primary font-bold uppercase tracking-widest text-[10px] mb-4">
              {userCarrera} • EXP: {userExpediente}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
               <span className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary italic">Alumno Regular</span>
               {userCarrera && userCarrera !== 'No especificada' && (
                 <span className="bg-bg-primary/50 border border-border px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-text-muted">{userCarrera}</span>
               )}
            </div>
          </div>
          <div className="text-center md:text-right space-y-4">
             <div>
                <div className="text-5xl font-black text-text-main leading-none">{progreso.semestre_real || 1}º</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">Semestre Real</div>
             </div>
             <button 
                onClick={fetchIdentidad}
                disabled={loadingCarnet}
                className="w-full md:w-auto bg-bg-primary hover:bg-primary border border-border px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-text-main hover:text-white transition-all flex items-center justify-center gap-3"
             >
                <i className={`fas ${loadingCarnet ? 'fa-spinner fa-spin' : 'fa-id-card'}`}></i>
                {loadingCarnet ? 'Firmando...' : 'Ver Carnet Digital'}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-3 clean-card border border-indigo-500/20 p-8 rounded-[40px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Mis Reservas del Bazar</h3>
            <span className="text-[9px] text-indigo-400 font-black uppercase">{safeReservas.length} ticket(s)</span>
          </div>
          {safeReservas.length === 0 ? (
            <p className="text-sm text-text-muted">Aún no tienes reservas registradas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {safeReservas.map((r) => (
                <div key={r.id || r.folio} className="rounded-3xl border border-border bg-bg-primary/40 p-5 flex gap-5 items-center">
                  <div className="bg-white p-2 rounded-xl shrink-0">
                    <QRCodeSVG value={r.verify_url || `https://cesaunison.fondothoth.com/bazar?ticket=${r.folio}`} size={88} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-black text-indigo-400">{r.folio}</p>
                    <p className="text-sm font-bold text-text-main truncate">{r.nombre_negocio || 'Puesto de Bazar'}</p>
                    <p className="text-[10px] text-text-muted uppercase">Puesto #{r.puesto_id || 'Liberado'} · {r.zona || '—'}</p>
                    <span className={`inline-block mt-2 text-[9px] font-black uppercase px-2 py-1 rounded-full ${r.estado === 'Aprobada' ? 'bg-emerald-500/10 text-emerald-400' : r.estado === 'Rechazada' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {r.estado || 'Pendiente'}
                    </span>
                    <button onClick={() => downloadTicket(r.id, r.folio)} className="block mt-3 text-[9px] font-black uppercase text-indigo-400 hover:text-white">
                      Descargar PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-10">
           {/* Progreso de Titulación */}
           <div className="clean-card border border-border p-8 rounded-[40px] bg-bg-secondary/45">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Progreso de Titulación</h3>
                 <span className="font-mono text-xs text-primary">{progreso.creditos_acumulados || 0} / 450 créditos</span>
              </div>
              
              <div className="space-y-8">
                 <div className="h-4 w-full bg-bg-primary border border-border rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000"
                       style={{ width: `${Math.min(100, ((progreso.creditos_acumulados || 0) / 450) * 100)}%` }}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-bg-primary/50 p-6 rounded-3xl border border-border">
                       <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Faltan p/ sgte. semestre</p>
                       <div className="text-2xl font-black text-text-main">{progreso.creditos_faltantes_siguiente_sem ?? 20}</div>
                       <p className="text-[9px] font-bold text-primary mt-1 uppercase tracking-tighter">Créditos Unison</p>
                    </div>
                    <div className="bg-bg-primary/50 p-6 rounded-3xl border border-border">
                       <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Trayectoría Académica</p>
                       <div className={`text-2xl font-black ${progreso.es_irregular ? 'text-amber-500' : 'text-green-500'}`}>
                          {progreso.es_irregular ? 'Irregular' : 'Óptimo'}
                       </div>
                       <p className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-tighter">Estado de Carga</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Catálogo de Certificaciones */}
           <div className="space-y-6">
              <h3 className="text-xl font-black text-text-main uppercase tracking-tighter border-l-4 border-primary pl-4">Catálogo de Certificaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeCatalog.map((skill) => {
                  const hasCert = safeCerts.some(c => c.habilidad_id === skill.id);
                  return (
                    <div key={skill.id} className="clean-card p-6 border border-border rounded-3xl group hover:border-primary/30 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-bg-primary/50 rounded-2xl flex items-center justify-center text-xl" style={{ color: skill.color_hex || '#4F46E5' }}>
                            <i className={skill.icono || 'fas fa-award'}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-text-main uppercase leading-tight">{skill.nombre}</h4>
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{skill.categoria}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-text-muted mb-6 line-clamp-2">{skill.descripcion}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-border/40">
                        <div className="text-[9px] font-black uppercase text-text-muted">
                          <i className="fas fa-clock mr-1"></i> {skill.duracion_minutos || skill.tiempo_limite_minutos || 30} MIN
                        </div>
                        {hasCert ? (
                          <span className="text-[9px] font-black uppercase text-green-500 bg-green-500/10 px-4 py-2 rounded-xl">
                            <i className="fas fa-check-circle mr-1"></i> Certificado
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setActivePracticeId(skill.id)}
                              className="bg-bg-primary border border-border text-text-main px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all"
                            >
                              Practicar
                            </button>
                            <button 
                              onClick={() => setActiveExamId(skill.id)}
                              className="bg-primary text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                            >
                              Examen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
               </div>

               {/* Pruebas Psicométricas */}
               <div className="mt-12 pt-12 border-t border-border">
                  <PsychometricTests />
               </div>
           </div>
        </div>

        <div className="space-y-10">
           {/* Habilidades Verificadas */}
           <div className="clean-card border border-border p-8 rounded-[40px]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-8 border-b border-border pb-4">Mis Credenciales Activas</h3>
              <div className="space-y-4">
                 {safeCerts.length > 0 ? safeCerts.map((cert, i) => (
                    <div key={i} className="bg-bg-primary/50 p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                          <i className="fas fa-certificate"></i>
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-tighter text-text-main truncate">
                            {safeCatalog.find(s => s.id === cert.habilidad_id)?.nombre || 'Certificación'}
                          </p>
                          <p className="text-[7px] font-mono text-emerald-500 uppercase tracking-widest truncate">{cert.uuid}</p>
                       </div>
                       <i className="fas fa-check-circle text-emerald-500 ml-auto flex-shrink-0"></i>
                    </div>
                 )) : (
                    <div className="text-center py-8">
                       <p className="text-[9px] uppercase font-black tracking-widest text-text-muted/40">No hay certificaciones vigentes</p>
                       <p className="text-[8px] text-text-muted/60 italic mt-2">Completa un examen para aparecer en el padrón de habilidades de UNISON.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Consejo Académico */}
           <div className="bg-primary/10 border border-primary/20 p-8 rounded-[40px]">
              <i className="fas fa-lightbulb text-primary mb-4 block text-2xl animate-bounce"></i>
              <h4 className="text-primary font-black uppercase text-xs mb-2">Consejo Académico</h4>
              <p className="text-text-muted text-xs leading-relaxed font-medium">
                Las certificaciones con check verde son verificables por empresas y sociedades vinculadas. Mantén tus habilidades actualizadas para mejorar tu visibilidad en el tablero de Servicio Social y Prácticas Profesionales.
              </p>
           </div>
        </div>
      </div>

      {/* MODAL DEL CARNET DIGITAL */}
      {showCarnet && identidad && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="relative w-full max-w-sm">
             {/* Cerramiento */}
             <button onClick={() => setShowCarnet(false)} className="absolute -top-12 right-0 text-text-muted hover:text-text-main transition-all uppercase text-[10px] font-black tracking-widest">Cerrar [ESC]</button>
             
             {/* Contenedor del Carnet */}
             <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-1 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                <div className="bg-[#0f172a] rounded-[2.8rem] overflow-hidden relative">
                   {/* Decoración */}
                   <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600/20 blur-[60px]"></div>
                   
                   {/* Cabecera Credencial */}
                   <div className="p-8 pb-4 flex justify-between items-start relative">
                      <div>
                         <h4 className="text-white font-black text-xl leading-tight">MESA DIRECTIVA</h4>
                         <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.3em]">Consejo Estudiantil CESA</p>
                      </div>
                      <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                         <img src="/pwa/assets/icons/icon-192x192.png" className="w-8 h-8 opacity-40" alt="CESA" />
                      </div>
                   </div>

                   {/* Foto y Datos Básicos */}
                   <div className="px-8 flex items-center gap-6 relative">
                      {identidad.avatar_path ? (
                        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl shadow-indigo-600/20 border border-indigo-500/20">
                          <img src={identidad.avatar_path} alt={identidad.full_name || displayName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-600/20">
                           {(identidad.full_name || displayName).trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                         <h5 className="text-white font-bold text-sm truncate uppercase">{identidad.full_name || displayName}</h5>
                         <p className="text-white/80 text-[9px] font-black mt-1 uppercase truncate">{identidad.carrera || userCarrera}</p>
                         <p className="text-indigo-400 text-[9px] font-bold mt-1">EXP: {identidad.expediente || userExpediente}</p>
                      </div>
                   </div>

                   {/* Código QR */}
                   <div className="p-8 flex flex-col items-center gap-6">
                      <div className="bg-white p-4 rounded-[2rem] shadow-2xl relative group">
                         <QRCodeSVG value={identidad.qr_data || `CESA:${userExpediente}`} size={180} level="H" /> 
                         <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-[2rem] pointer-events-none group-hover:border-indigo-500 transition-all"></div>
                      </div>
                      
                      <div className="text-center space-y-1">
                         <code className="text-[9px] font-mono text-white/60 uppercase tracking-tighter">HASH: {(identidad.hash || '0000000000000000').substring(0, 16)}...</code>
                         <p className="text-[7px] text-white/50 uppercase font-black tracking-widest mt-1">Escaneable por Seguridad CESA</p>
                         <p className="text-[7px] text-white/40 uppercase font-bold tracking-widest mt-1">Válido para Acceso Institucional • 2026</p>
                      </div>
                   </div>

                   {/* Pie de Carnet */}
                   <div className="h-14 bg-indigo-600 flex items-center justify-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                      <span className="text-white font-black text-[9px] uppercase tracking-[0.4em]">Sincronizado con UNISON</span>
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AcademicProfile;
