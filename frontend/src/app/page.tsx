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
import PracticeInterface from '@/components/PracticeInterface';
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
  Menu
} from 'lucide-react';
import Inbox from '@/components/Inbox';

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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directorio');
  const [filteredSocieties, setFilteredSocieties] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'privacidad' | 'reglamento' | 'vinculacion' | null>(null);
  const [showExaniSimulator, setShowExaniSimulator] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activePracticeId, setActivePracticeId] = useState<number | null>(null);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const { user, logout, token } = useAuth();
  
  // Portal Interstitial Ad states
  const [showPortalAd, setShowPortalAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [activeAd, setActiveAd] = useState(0);

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
      fetch(`${API_URL}/perfil.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setProfileData(data.data);
      })
      .catch(e => console.error("Error perfil", e));
    }
  }, [token, activeTab, API_URL]);

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
    }
  }, [activeTab]);

  // Portal Ad countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showPortalAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPortalAd, adTimer]);

  const handleTabChange = (tabId: string) => {
    // If the tab is the same, do nothing
    if (tabId === activeTab) return;

    // Check daily frequency capping for ads
    const today = new Date().toISOString().split('T')[0];
    const adDate = localStorage.getItem('cesa_ad_date');
    const adCountStr = localStorage.getItem('cesa_ad_count');
    let adCount = 0;

    if (adDate === today && adCountStr) {
      adCount = parseInt(adCountStr, 10);
    } else {
      localStorage.setItem('cesa_ad_date', today);
      localStorage.setItem('cesa_ad_count', '0');
    }

    if (adCount < 2) {
      // Trigger portal ad!
      setPendingTab(tabId);
      setActiveAd(Math.floor(Math.random() * SPONSORED_ADS.length));
      setAdTimer(5);
      setShowPortalAd(true);
      
      // Update count
      localStorage.setItem('cesa_ad_count', (adCount + 1).toString());
      return;
    }

    setActiveTab(tabId);
  };

  const isAdmin = user && (user.rol === 'admin' || user.rol === 'mesa_directiva');

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
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-white overflow-hidden flex items-center justify-center shadow-2xl cursor-pointer md:hover:scale-110 active:scale-95 transition-all" onClick={() => handleTabChange('directorio')}>
             <img src="/logo-cesa.jpg" alt="Logo CESA" className="w-full h-full object-cover" />
           </div>
        </div>

        <div className="flex items-center gap-1">
          {[
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
              <div className="fixed bottom-[85px] right-4 md:right-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 flex flex-col gap-2 min-w-[160px] z-[100] animate-in slide-in-from-bottom-5 duration-200">
                {[
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
      <div className={activeTab === 'directorio' ? '' : 'pt-24'}>
        {activeTab === 'directorio' && (
          <div className="animate-in fade-in duration-1000">
            <Hero onNavigate={handleTabChange} />
            <section className="container mx-auto pb-24 px-8">
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
          </div>
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
            <BazarGrid />
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
            <AcademicProfile profile={profileData} />
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
             ) : (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Pedimento Card */}
                   <div className="clean-card flex flex-col items-center justify-center py-16 px-6 text-center border-t-4 border-t-accent shadow-2xl h-full">
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

                   {/* EXANI-II Card */}
                   <div className="clean-card flex flex-col items-center justify-center py-16 px-6 text-center border-t-4 border-t-primary shadow-2xl h-full">
                       <HelpCircle size={56} className="text-primary mb-6 animate-pulse" />
                       <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Comité Conecta-T CESA</div>
                       <h3 className="text-3xl font-black mb-4">Simulador Examen <span className="text-accent italic">EXANI-II</span></h3>
                       <p className="text-text-muted mb-8 max-w-sm mx-auto font-medium text-sm">
                           Simula el examen de ingreso a la universidad. Reactivos aleatorios de Matemáticas, Lectura, Gramática e Inglés con explicaciones paso a paso.
                       </p>
                       <button onClick={() => setShowExaniSimulator(true)} className="btn-clean-primary flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 transition-opacity border-none">
                           Iniciar Simulador <i className="fas fa-play"></i>
                       </button>
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

      {/* Portal Interstitial Ad Overlay */}
      {showPortalAd && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className={`max-w-2xl w-full bg-gradient-to-br ${SPONSORED_ADS[activeAd].bgClass} border rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]`}>
            {/* Header info */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${SPONSORED_ADS[activeAd].badgeColor}`}>
                  Anuncio Patrocinado
                </span>
                <span className="text-xs text-white/50 font-bold">
                  CESA Conecta-T
                </span>
              </div>

              {/* Ad Brand / Logo */}
              <div className="mb-6">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                  {SPONSORED_ADS[activeAd].brand}
                </h2>
                <p className={`text-lg md:text-xl font-bold bg-gradient-to-r ${SPONSORED_ADS[activeAd].gradientText} bg-clip-text text-transparent`}>
                  {SPONSORED_ADS[activeAd].tagline}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium mb-8">
                {SPONSORED_ADS[activeAd].description}
              </p>
            </div>

            {/* Actions & Skip button */}
            <div className="space-y-4">
              <a
                href={SPONSORED_ADS[activeAd].actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all text-center block shadow-lg"
              >
                {SPONSORED_ADS[activeAd].cta}
              </a>

              <button
                disabled={adTimer > 0}
                onClick={() => {
                  setShowPortalAd(false);
                  if (pendingTab !== null) {
                    setActiveTab(pendingTab);
                  }
                }}
                className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest border transition-all text-xs ${
                  adTimer > 0
                    ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/25"
                }`}
              >
                {adTimer > 0 ? `Continuar en ${adTimer}s` : "Saltar Anuncio y Continuar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
