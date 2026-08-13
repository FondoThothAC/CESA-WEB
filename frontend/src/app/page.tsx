'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import SocietyCard from '@/components/SocietyCard';
import SocialWall from '@/components/SocialWall';
import BazarGrid from '@/components/BazarGrid';
import ReportForm from '@/components/ReportForm';
import JobsBoard from '@/components/JobsBoard';
import AdminDashboard from '@/components/AdminDashboard';
import AcademicProfile from '@/components/AcademicProfile';
import NotificationBell from '@/components/NotificationBell';
import InfoModal from '@/components/InfoModal';
import InstallPrompt from '@/components/InstallPrompt';
import ExaniSimulator from '@/components/ExaniSimulator';
import ExaniThreeGuide from '@/components/ExaniThreeGuide';
import LanguagePracticeInterface from '@/components/LanguagePracticeInterface';
import PracticeInterface from '@/components/PracticeInterface';
import InterstitialAd from '@/components/InterstitialAd';
import { useAuth } from '@/lib/useAuth';
import directorioData from '@/lib/directorio.json';
import { 
  BookOpen, 
  MessageSquare, 
  Store, 
  Briefcase, 
  UserCircle, 
  Flag, 
  ShieldAlert,
  Mail,
  GraduationCap,
  HelpCircle,
  Menu,
  Newspaper
} from 'lucide-react';
import Inbox from '@/components/Inbox';
import NewsFeed from '@/components/organisms/NewsFeed';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('noticias');
  const [filteredSocieties, setFilteredSocieties] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'privacidad' | 'reglamento' | 'vinculacion' | null>(null);
  const [showExaniSimulator, setShowExaniSimulator] = useState(false);
  const [showExaniThreeGuide, setShowExaniThreeGuide] = useState(false);
  const [activeLanguagePractice, setActiveLanguagePractice] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activePracticeId, setActivePracticeId] = useState<number | null>(null);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const { user, logout, token } = useAuth();
  
  // Portal Interstitial Ad states
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  useEffect(() => {
    const validData = directorioData.filter((item: any) => item.Carrera && item.Carrera.trim() !== "");
    setFilteredSocieties(validData);
  }, []);

  useEffect(() => {
    const validData = directorioData.filter((item: any) => item.Carrera && item.Carrera.trim() !== "");
    const results = validData.filter((s: any) => 
      s.Carrera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.Siglas && s.Siglas.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSocieties(results);
  }, [searchTerm]);

  useEffect(() => {
    if (token && activeTab === 'perfil') {
      const baseUrl = API_URL.includes('/api/v1') ? API_URL : `${API_URL}/v1`;
      fetch(`${baseUrl}/expediente`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(async (res) => {
        if (!res.ok) {
          const phpRes = await fetch(`${API_URL}/perfil.php`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return phpRes.json();
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success && data.data) {
          setProfileData(data.data);
        }
      })
      .catch(e => console.error("Error al obtener perfil/expediente:", e));
    }
  }, [token, activeTab, API_URL]);

  const effectiveProfile = profileData || (user ? {
    nombre_completo: (user as any).nombre_completo || (user as any).nombre || user.email?.split('@')[0] || "Estudiante UNISON",
    nombre: (user as any).nombre || (user as any).nombre_completo || "Estudiante UNISON",
    expediente: user.expediente || user.matricula || "213203453",
    carrera: user.carrera || "Ingeniería en Sistemas de Información",
    progreso_academico: {
      semestre_real: 6,
      creditos_acumulados: 240,
      porcentaje_semestre_actual: 85,
      creditos_faltantes_siguiente_sem: 20,
      es_irregular: false
    },
    skills: []
  } : null);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/skills.php?action=listar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSkillsCatalog(data.catalog || data.data || []);
        }
      })
      .catch(e => console.error("Error catalog", e));
    }
  }, [token, API_URL]);

  useEffect(() => {
    // Reset simulator view if active tab changes away from tutoriales
    if (activeTab !== 'tutoriales') {
      setShowExaniSimulator(false);
      setShowExaniThreeGuide(false);
      setActiveLanguagePractice(null);
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.type === 'tab') {
        setActiveTab(event.state.id);
      } else {
        setActiveTab('noticias');
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Configurar estado inicial
    if (!window.history.state) {
      window.history.replaceState({ type: 'tab', id: 'noticias' }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;

    setPendingTab(tabId);
    setShowInterstitialAd(true);
    window.history.pushState({ type: 'tab', id: tabId }, '');
  };

  const isAdmin = user && (
    user.rol === 'admin' || 
    user.rol === 'mesa_directiva' || 
    user.email === 'software@fondothoth.com' || 
    user.email === 'a213203453@unison.mx'
  );

  return (
    <main className="min-h-screen bg-bg-primary text-text-main selection:bg-accent/30 transition-colors duration-300">
      {/* Background Decor */}
      <div className="blob-container">
        <div className="blob bg-primary/5 top-[-10%] left-[-10%]"></div>
        <div className="blob bg-accent/5 bottom-[-10%] right-[-10%] animation-delay-2000"></div>
      </div>

      {/* Navigation: The Glass Dock */}
      <nav className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 px-3 md:px-6 py-3 md:py-4 glass rounded-[32px] flex items-center gap-1 md:gap-2 shadow-2xl group animate-in slide-in-from-bottom-20 duration-1000 max-w-[calc(100vw-24px)]">
        <div className="flex items-center gap-1 pr-2 md:pr-4 border-r border-border mr-1 md:mr-2 flex-shrink-0">
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-white overflow-hidden flex items-center justify-center shadow-2xl cursor-pointer md:hover:scale-110 active:scale-95 transition-all" onClick={() => handleTabChange('noticias')}>
             <img src="/logo-cesa.jpg" alt="Logo CESA" className="w-full h-full object-cover" />
           </div>
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'noticias', icon: Newspaper, label: 'Noticias' },
            { id: 'directorio', icon: BookOpen, label: 'Directorio' },
            { id: 'muro', icon: MessageSquare, label: 'Social' },
            { id: 'bazar', icon: Store, label: 'Bazar' },
            { id: 'tutoriales', icon: GraduationCap, label: 'Aprende' },
            { id: 'mensajes', icon: Mail, label: 'Inbox' },
            { id: 'empleos', icon: Briefcase, label: 'Bolsa' },
            { id: 'perfil', icon: UserCircle, label: 'Perfil' },
            { id: 'reportes', icon: Flag, label: 'Reportes' }
          ].map((item, index) => (
            <div 
              key={item.id}
              onClick={() => { handleTabChange(item.id); setShowMoreMenu(false); }}
              className={`relative flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-2xl cursor-pointer transition-all duration-300 group/nav flex-shrink-0 
                ${index >= 4 ? 'hidden md:flex' : 'flex'} 
                ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'text-text-muted hover:bg-primary/5 hover:text-primary'}`}
            >
              <item.icon size={18} className="relative z-10 md:w-5 md:h-5" />
              <span className={`absolute -top-12 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-lg opacity-0 translate-y-2 transition-all duration-300 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 shadow-xl whitespace-nowrap hidden md:block`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <span className="absolute bottom-1.5 md:bottom-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
              )}
            </div>
          ))}

          {/* Botón MÁS (solo en móvil) */}
          <div className="relative md:hidden">
            <div 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center justify-center w-11 h-11 rounded-2xl cursor-pointer transition-all flex-shrink-0 ${showMoreMenu ? 'bg-primary/20 text-primary' : 'text-text-muted hover:bg-primary/5'}`}
            >
              <Menu size={18} />
            </div>

            {/* Menú Flotante Móvil */}
            {showMoreMenu && (
              <div className="fixed bottom-[85px] right-4 md:right-auto glass p-2 flex flex-col gap-2 min-w-[160px] z-[100] animate-in slide-in-from-bottom-5 duration-200">
                {[
                  { id: 'tutoriales', icon: GraduationCap, label: 'Aprende' },
                  { id: 'mensajes', icon: Mail, label: 'Inbox' },
                  { id: 'empleos', icon: Briefcase, label: 'Bolsa' },
                  { id: 'perfil', icon: UserCircle, label: 'Perfil' },
                  { id: 'reportes', icon: Flag, label: 'Reportes' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => { handleTabChange(item.id); setShowMoreMenu(false); }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary text-white' : 'text-text-main hover:bg-primary/10'}`}
                  >
                    <item.icon size={16} />
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                ))}
                
                {isAdmin && (
                  <>
                    <div className="h-px bg-border my-1"></div>
                    <div
                      onClick={() => { handleTabChange('admin'); setShowMoreMenu(false); }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-500/10'}`}
                    >
                      <ShieldAlert size={16} />
                      <span className="text-sm font-bold">Admin</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {isAdmin && (
            <div 
              onClick={() => handleTabChange('admin')}
              className={`hidden md:flex w-14 h-14 rounded-2xl items-center justify-center cursor-pointer transition-all flex-shrink-0 ${activeTab === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'text-text-muted hover:bg-primary/5 hover:text-primary'}`}
            >
              <ShieldAlert size={20} />
            </div>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-border ml-1 md:ml-2 flex-shrink-0">
             <div className="relative group/user">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-accent/20 border border-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden cursor-pointer" onClick={() => handleTabChange('perfil')}>
                   {user.nombre?.[0]}
                </div>
                <div className="absolute bottom-full right-0 mb-4 w-48 glass rounded-2xl p-4 opacity-0 scale-95 pointer-events-none group-hover/user:opacity-100 group-hover/user:scale-100 transition-all origin-bottom-right">
                   <p className="text-text-main text-xs font-black truncate">{user.nombre}</p>
                   <p className="text-accent text-[8px] uppercase font-black tracking-widest mt-1">{user.rol}</p>
                   <button onClick={logout} className="w-full mt-4 py-2 bg-red-500/10 text-red-500 text-[9px] font-black uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all">Salir del Portal</button>
                </div>
             </div>
             <NotificationBell />
          </div>
        ) : (
          <div className="pl-2 md:pl-4 border-l border-border ml-1 md:ml-2 flex-shrink-0">
            <Link href="/login" className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-primary flex items-center justify-center text-white hover:bg-accent transition-all shadow-lg active:scale-95">
              <UserCircle size={18} />
            </Link>
          </div>
        )}
      </nav>

      {/* Main Container */}
      <div className={activeTab === 'noticias' ? '' : 'pt-24'}>
        {activeTab === 'noticias' && (
          <div className="animate-in fade-in duration-1000">
            <Hero onNavigate={handleTabChange} />
            <section className="container mx-auto pb-24 px-8 animate-in slide-in-from-bottom-10 duration-700">
              <div className="text-center mb-12">
                 <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">Gaceta <span className="text-accent italic">CESA</span></h2>
                 <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Comunicados y Noticias de la Universidad</p>
              </div>
              <NewsFeed />
            </section>
          </div>
        )}

        {activeTab === 'directorio' && (
          <section className="container mx-auto pb-24 px-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter text-text-main">Directorio de <span className="text-accent italic">Sociedades</span></h2>
              <p className="text-text-muted font-bold uppercase tracking-[0.4em] text-[9px] opacity-70">Vinculación Estudiantil 2026-2028</p>
            </div>

            <div className="clean-card mb-16 max-w-2xl mx-auto flex gap-4 items-center scale-105 shadow-2xl">
               <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
                  <input 
                    type="text" 
                    placeholder="Buscar carrera o siglas..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-2xl py-4 pl-12 pr-4 text-text-main focus:outline-none focus:border-accent transition-colors"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSocieties.map((society, index) => (
                 <SocietyCard key={index} society={society} />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'muro' && (
          <section className="container mx-auto px-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">CESA <span className="text-accent italic">Social</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Foros de Opinión y Diálogo Estudiantil</p>
            </div>
            <SocialWall />
          </section>
        )}

        {activeTab === 'mensajes' && (
          <section className="container mx-auto px-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">CESA <span className="text-accent italic">Inbox</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Mensajería Directa y Asistente IA</p>
            </div>
            <Inbox />
          </section>
        )}

        {activeTab === 'bazar' && (
          <section className="container mx-auto px-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">Bazar <span className="text-accent italic">Emprendedor</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Impulsando Proyectos Universitarios</p>
            </div>
            <BazarGrid onViewReservations={() => setActiveTab('perfil')} />
          </section>
        )}

        {activeTab === 'empleos' && (
          <section className="container mx-auto px-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">Bolsa de <span className="text-accent italic">Trabajo</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]"><span className="text-accent">Comité Conecta-T CESA</span> • Vinculación Laboral y Empresarial</p>
            </div>
            <JobsBoard />
          </section>
        )}

        {activeTab === 'perfil' && (
          <section className="container mx-auto px-8 max-w-6xl animate-in slide-in-from-bottom-10 duration-700">
             <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">Expediente <span className="text-accent italic">Digital</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Identidad y Progreso Académico</p>
             </div>
             <AcademicProfile profile={effectiveProfile} />
          </section>
        )}

        {activeTab === 'tutoriales' && (
          <section className="container mx-auto px-8 max-w-5xl animate-in slide-in-from-bottom-10 duration-700">
             <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">Plataforma de <span className="text-accent italic">Aprendizaje</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]"><span className="text-accent">Comité Conecta-T CESA</span> • Simuladores Interactivos</p>
             </div>
              {showExaniSimulator ? (
                <ExaniSimulator onClose={() => setShowExaniSimulator(false)} />
              ) : showExaniThreeGuide ? (
                <ExaniThreeGuide onClose={() => setShowExaniThreeGuide(false)} />
              ) : (
                <>
                  {/* 1. SECCIÓN EXAMEN DE ADMISIÓN (EXANI) */}
                  <div className="space-y-8">
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">Simuladores de Admisión (EXANI)</h3>
                      <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">Simulación y Guías Oficiales de Ingreso • CESA</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* EXANI-II Card */}
                      <div className="clean-card flex flex-col items-center justify-center py-12 px-6 text-center border-t-4 border-t-primary shadow-2xl h-full">
                        <HelpCircle size={56} className="text-primary mb-6 animate-pulse" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Comité Conecta-T CESA</div>
                        <h3 className="text-2xl font-black mb-4">Simulador Examen <span className="text-accent italic">EXANI-II</span></h3>
                        <p className="text-text-muted mb-8 max-w-sm mx-auto font-medium text-sm">
                          Simula el examen de ingreso a la licenciatura. Reactivos aleatorios de Matemáticas, Lectura, Gramática e Inglés con explicaciones paso a paso.
                        </p>
                        <button onClick={() => setShowExaniSimulator(true)} className="btn-clean-primary flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 transition-opacity border-none">
                          Iniciar Simulador <i className="fas fa-play"></i>
                        </button>
                      </div>

                      {/* EXANI-III Card */}
                      <div className="clean-card flex flex-col items-center justify-center py-12 px-6 text-center border-t-4 border-t-accent shadow-2xl h-full">
                        <GraduationCap size={56} className="text-accent mb-6 animate-pulse" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Comité Conecta-T CESA</div>
                        <h3 className="text-2xl font-black mb-4">Guía y Simulador <span className="text-primary italic">EXANI-III</span></h3>
                        <p className="text-text-muted mb-8 max-w-sm mx-auto font-medium text-sm">
                          Guía de estudio oficial y reactivos diagnósticos interactivos para el examen de ingreso a posgrados y maestrías.
                        </p>
                        <button onClick={() => setShowExaniThreeGuide(true)} className="btn-clean-primary flex items-center gap-3 bg-gradient-to-r from-accent to-primary hover:opacity-95 transition-opacity border-none">
                          Ver Guía y Reactivos <i className="fas fa-book-open"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. SECCIÓN IDIOMAS - PRÁCTICA DINÁMICA */}
                  <div className="mt-20 space-y-8">
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">Idiomas - Práctica Dinámica</h3>
                      <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">Exámenes Diagnósticos Generados Dinámicamente por IA • Comité Conecta-T CESA</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {['Alemán', 'Árabe', 'Chino', 'Coreano', 'Español', 'Francés', 'Inglés', 'Italiano', 'Japonés', 'Portugués', 'Ruso'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            if (!token) {
                              alert("Inicia sesión para poder acceder a los exámenes de práctica generados por IA.");
                              return;
                            }
                            setActiveLanguagePractice(lang);
                          }}
                          className="clean-card p-4 border border-border flex flex-col items-center justify-center text-center hover:border-primary/40 hover:shadow-lg transition-all gap-3 group bg-bg-secondary/40"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
                            {lang.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-black uppercase text-text-main group-hover:text-primary transition-colors">{lang}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. SECCIÓN ESPECIALIZACIÓN */}
                  <div className="mt-20 space-y-8">
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">Ejercicios de Especialización</h3>
                      <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">Herramientas y simuladores profesionales para la especialización laboral</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Pedimento Card */}
                      <div className="clean-card flex flex-col items-center justify-center py-12 px-6 text-center border-t-4 border-t-accent shadow-2xl h-full">
                        <GraduationCap size={56} className="text-accent mb-6" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Comité Conecta-T CESA</div>
                        <h3 className="text-3xl font-black mb-4">Pedimento Aduanal <span className="text-primary italic">Interactivo</span></h3>
                        <p className="text-text-muted mb-8 max-w-sm mx-auto font-medium text-sm">
                          Accede a nuestro simulador del Anexo 22. Aprende a llenar pedimentos de importación y exportación con validaciones en tiempo real para estudiantes de Negocios.
                        </p>
                        <a href="/pedimento/" target="_blank" rel="noopener noreferrer" className="btn-clean-primary flex items-center gap-3">
                          Abrir Simulador <i className="fas fa-external-link-alt"></i>
                        </a>
                      </div>

                      {/* Proximamente Card */}
                      <div className="clean-card flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-border/80 bg-bg-secondary/20 h-full">
                        <div className="w-14 h-14 rounded-full bg-border/20 text-text-muted flex items-center justify-center mb-6">
                          <i className="fas fa-plus text-lg"></i>
                        </div>
                        <h3 className="text-xl font-black mb-2 text-text-muted">Próximas Especialidades</h3>
                        <p className="text-xs text-text-muted mb-8 max-w-xs mx-auto font-medium leading-relaxed text-center">
                          Conforme los estudiantes lo soliciten, las coordinaciones del CESA irán agregando simuladores adicionales de áreas específicas. ¡Haz tu propuesta en el Buzón Digital!
                        </p>
                        <button 
                          onClick={() => setActiveTab('reportes')} 
                          className="text-xs font-black text-primary hover:text-accent uppercase tracking-widest transition-colors"
                        >
                          Ir al Buzón Digital →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ejercicios de Certificación (Práctica de Habilidades) */}
                  <div className="mt-20 space-y-8">
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">Ejercicios de Certificación</h3>
                      <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">Práctica Interactiva por Habilidad • Comité Conecta-T CESA</p>
                    </div>
                    
                    {skillsCatalog.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skillsCatalog.map((skill) => (
                          <div key={skill.id} className="clean-card p-6 border border-border flex flex-col justify-between hover:border-primary/30 hover:shadow-xl transition-all">
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg" style={{ color: skill.color_hex }}>
                                  <i className={skill.icono}></i>
                                </div>
                                <div>
                                  <h4 className="text-xs font-black uppercase text-text-main leading-tight">{skill.nombre}</h4>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">{skill.categoria}</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-text-muted mb-6 leading-relaxed line-clamp-2">{skill.descripcion}</p>
                            </div>
                            <button 
                              onClick={() => setActivePracticeId(skill.id)}
                              className="w-full py-2.5 bg-bg-secondary border border-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-play text-[8px]"></i> Iniciar Práctica
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="clean-card p-8 text-center text-text-muted text-xs font-bold uppercase tracking-widest bg-bg-secondary">
                        Inicia sesión para ver las habilidades disponibles para practicar.
                      </div>
                    )}
                  </div>
                </>
              )}
          </section>
        )}

        {activeTab === 'reportes' && (
          <section className="container mx-auto px-8 max-w-4xl animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">Buzón <span className="text-accent italic">Digital</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Transparencia y Gestión de la Mesa Directiva</p>
            </div>
            <ReportForm />
          </section>
        )}

        {activeTab === 'admin' && isAdmin && (
          <section className="container mx-auto px-8 max-w-7xl animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter text-text-main">Mando <span className="text-accent italic">Directivo</span></h2>
               <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Analítica de Gestión 2026-2028</p>
            </div>
            <AdminDashboard />
          </section>
        )}
      </div>

      <footer className="border-t border-border bg-bg-secondary py-16 md:py-20 text-center mt-32 relative z-10 pb-28 md:pb-20">
        <div className="container mx-auto px-8">
           <div className="mb-8 font-black text-3xl tracking-tighter md:hover:scale-105 transition-all inline-block cursor-default">
              <span className="text-primary">CESA </span>
              <span className="text-accent">UNISON</span>
           </div>
           <p className="text-text-muted text-xs font-bold mb-6">© 2026 Consejo Estudiantil de Sociedades de Alumnos - UNISON Campus Hermosillo</p>
           <div className="flex justify-center gap-6 md:gap-10 text-[10px] uppercase font-black tracking-widest text-text-muted mb-12">
              <a href="#privacidad" onClick={(e) => { e.preventDefault(); setActiveModal('privacidad'); }} className="hover:text-accent transition-colors cursor-pointer" title="Aviso de Privacidad CESA UNISON">Privacidad</a>
              <a href="#reglamento" onClick={(e) => { e.preventDefault(); setActiveModal('reglamento'); }} className="hover:text-accent transition-colors cursor-pointer" title="Reglamento Interno CESA">Reglamento</a>
              <a href="#vinculacion" onClick={(e) => { e.preventDefault(); setActiveModal('vinculacion'); }} className="hover:text-accent transition-colors cursor-pointer" title="Programa de Vinculación Estudiantil">Vinculación</a>
           </div>
           <p className="text-[9px] uppercase tracking-[0.4em] text-text-muted/40 font-bold border border-border inline-block px-6 py-2 rounded-full">CESA UNISON • Plataforma Digital v4.0</p>
        </div>
      </footer>

      {/* Info Modals */}
      <InfoModal 
        isOpen={activeModal !== null} 
        type={activeModal} 
        onClose={() => setActiveModal(null)} 
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Practice Overlay */}
      {activePracticeId && (
        <PracticeInterface 
          skillId={activePracticeId} 
          onClose={() => setActivePracticeId(null)}
        />
      )}

      {/* Language Practice Overlay */}
      {activeLanguagePractice && (
        <LanguagePracticeInterface 
          language={activeLanguagePractice} 
          onClose={() => setActiveLanguagePractice(null)}
        />
      )}

      {/* Real Interstitial Ad Component */}
      <InterstitialAd 
        show={showInterstitialAd} 
        onClose={() => {
          setShowInterstitialAd(false);
          if (pendingTab !== null) {
            setActiveTab(pendingTab);
            setPendingTab(null);
          }
        }} 
      />
    </main>
  );
}
