'use client';

import React, { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import SocietyCard from '@/components/SocietyCard';
import ChatInterface from '@/components/ChatInterface';
import SocialWall from '@/components/SocialWall';
import BazarGrid from '@/components/BazarGrid';
import ReportForm from '@/components/ReportForm';
import JobsBoard from '@/components/JobsBoard';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';
import directorioData from '@/lib/directorio.json';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directorio');
  const [filteredSocieties, setFilteredSocieties] = useState<any[]>([]);
  const { user, logout } = useAuth();

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

  const isAdmin = user && (user.rol === 'admin' || user.rol === 'mesa_directiva');

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-6xl z-50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-2xl cursor-pointer" onClick={() => setActiveTab('directorio')}>
          <span className="text-3xl">🎓</span>
          <span className="text-white">CESA</span>
          <span className="text-[var(--primary)]">UNISON</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[var(--text-muted)]">
          {['Directorio', 'Muro', 'Bazar', 'Reportes', 'Empleos'].map((tab) => (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`cursor-pointer transition-colors hover:text-white ${activeTab === tab.toLowerCase() ? 'text-white' : ''}`}
            >
              {tab}
            </span>
          ))}
          
          {isAdmin && (
            <span 
              onClick={() => setActiveTab('admin')}
              className={`cursor-pointer transition-colors hover:text-white flex items-center gap-2 ${activeTab === 'admin' ? 'text-white' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse"></span>
              Admin
            </span>
          )}

          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right">
                <p className="text-white text-xs font-bold leading-none">{user.nombre}</p>
                <p className="text-[var(--primary)] text-[9px] uppercase tracking-widest font-black leading-tight mt-1">{user.rol}</p>
              </div>
              <button 
                onClick={logout}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all group"
              >
                <span className="text-xs group-hover:scale-110 transition-transform">🚪</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-[var(--primary)] text-white px-6 py-1.5 rounded-full cursor-pointer hover:brightness-110 shadow-lg shadow-[var(--primary-glow)] transition-all">
              Ingresar
            </Link>
          )}
        </div>
      </nav>

      {/* Content based on Active Tab */}
      <div className={activeTab === 'directorio' ? '' : 'pt-32'}>
        {activeTab === 'directorio' && (
          <>
            <Hero />
            <section className="container mx-auto pb-24 px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold mb-4">Directorio de <span className="gradient-text">Sociedades</span></h2>
                <p className="text-[var(--text-muted)]">Localiza la representación estudiantil de tu licenciatura.</p>
              </div>

              <div className="glass p-6 mb-12 max-w-2xl mx-auto flex gap-4 items-center">
                 <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Buscar carrera o siglas..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/20 border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSocieties.map((society, index) => (
                  <SocietyCard key={index} society={society} />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'muro' && (
          <section className="container mx-auto px-8">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Muro <span className="gradient-text">Social</span></h2>
               <p className="text-[var(--text-muted)]">Avisos oficiales y eventos de la comunidad universitaria.</p>
            </div>
            <SocialWall />
          </section>
        )}

        {activeTab === 'bazar' && (
          <section className="container mx-auto px-8">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Bazar <span className="gradient-text">Emprendedor</span></h2>
               <p className="text-[var(--text-muted)]">Apoya el talento y los proyectos de tus compañeros.</p>
            </div>
            <BazarGrid />
          </section>
        )}

        {activeTab === 'reportes' && (
          <section className="container mx-auto px-8">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Buzón de <span className="gradient-text">Reportes</span></h2>
               <p className="text-[var(--text-muted)]">Anónimo, seguro y procesado por nuestra IA Institucional.</p>
            </div>
            <ReportForm />
          </section>
        )}

        {activeTab === 'empleos' && (
          <section className="container mx-auto px-8">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Bolsa de <span className="gradient-text">Trabajo</span></h2>
               <p className="text-[var(--text-muted)]">Conectamos el talento de la UNISON con las mejores empresas.</p>
            </div>
            <JobsBoard />
          </section>
        )}

        {activeTab === 'admin' && isAdmin && (
          <section className="container mx-auto px-8">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Comando <span className="gradient-text">Mesa Directiva</span></h2>
               <p className="text-[var(--text-muted)]">Inteligencia de gestión para el periodo 2026-2028.</p>
            </div>
            <AdminDashboard />
          </section>
        )}
      </div>

      <ChatInterface />

      <footer className="border-t border-[var(--border)] bg-black/40 py-16 text-center mt-24">
        <div className="container mx-auto px-8">
           <div className="mb-8">
              <span className="text-2xl font-black text-white">CESA</span>
              <span className="text-2xl font-black text-[var(--primary)]">UNISON</span>
           </div>
           <p className="text-[var(--text-muted)] text-sm mb-4">© 2026 Consejo Estudiantil de Sociedades de Alumnos - UNISON</p>
           <div className="flex justify-center gap-6 text-sm mb-10">
              <a href="#" className="text-[var(--primary)] hover:underline">Privacidad</a>
              <a href="#" className="text-[var(--primary)] hover:underline">Reglamento</a>
              <a href="#" className="text-[var(--primary)] hover:underline">Contacto</a>
           </div>
           <p className="text-[10px] uppercase tracking-widest opacity-20">Spec-Driven Development v3.5 | Hybrid IA Engine</p>
        </div>
      </footer>
    </main>
  );
}
