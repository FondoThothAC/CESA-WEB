'use client';

import { useAuth } from '@/lib/useAuth';
import AdminIAConfig from '../admin/api-config/page';
import AdminDashboard from '@/components/AdminDashboard';
import SocietyCard from '@/components/SocietyCard';
import BazarGrid from '@/components/BazarGrid';
import JobsBoard from '@/components/JobsBoard';
import ReportForm from '@/components/ReportForm';
import ReportList from '@/components/ReportList';
import NotificationCenter from '@/components/NotificationCenter';
import ThemeToggle from '@/components/ThemeToggle';
import StudentJobsDashboard from '@/components/organisms/StudentJobsDashboard';
import CompanyJobsDashboard from '@/components/organisms/CompanyJobsDashboard';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UnifiedDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div className="p-20 text-center text-text-main">Cargando plataforma...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-main p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              HOLA, {(user.nombre || user.nombre_completo.split(' ')[0] || 'ESTUDIANTE').toUpperCase()}
            </h1>
            <p className="text-text-muted mt-2">Panel Institucional CESA • Rol: <span className="text-primary font-bold uppercase">{user.rol}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationCenter />
            <button className="btn-clean text-xs font-bold uppercase">
              LOGOUT
            </button>
          </div>
        </header>

        {/* VISTA SEGÚN ROL */}
        {user.rol === 'admin' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="clean-card text-center">
                <p className="text-text-muted text-xs uppercase tracking-widest">Llamadas IA (1h)</p>
                <h4 className="text-3xl font-black text-primary mt-2">1,240</h4>
              </div>
              <div className="clean-card text-center">
                <p className="text-text-muted text-xs uppercase tracking-widest">Latencia Media</p>
                <h4 className="text-3xl font-black text-green-500 mt-2">145ms</h4>
              </div>
              <div className="clean-card text-center">
                <p className="text-text-muted text-xs uppercase tracking-widest">Status Mac Mini</p>
                <h4 className="text-3xl font-black text-blue-500 mt-2">ONLINE</h4>
              </div>
            </div>
            <AdminDashboard />
            <div className="unison-gradient p-8 rounded-3xl text-white">
              <h3 className="text-xl font-bold mb-4">Acceso Rápido a Configuración de IA</h3>
              <p className="text-sm opacity-90 mb-6">Gestiona las API Keys y la conexión con la Mac Mini M4 desde el panel centralizado.</p>
              <a href="/admin/api-config" className="btn-clean text-primary inline-block">Ir a Config IA</a>
            </div>
          </div>
        )}

        {user.rol === 'mesa_directiva' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <AdminDashboard />
            <div className="clean-card">
              <h2 className="text-2xl font-bold mb-6">Gestión de Coordinación</h2>
              <p className="text-text-muted mb-6">Como miembro de la Mesa Directiva, tienes acceso al "Mood-o-meter" institucional y a la moderación de reportes urgentes.</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-bg-primary rounded-2xl text-center border border-border hover:border-primary transition-all">
                   📢 Publicar Comunicado
                </button>
                <button className="p-4 bg-bg-primary rounded-2xl text-center border border-border hover:border-primary transition-all">
                   ✅ Validar Empresas
                </button>
              </div>
            </div>
          </div>
        )}

        {user.rol === 'sociedad' && (
          <div className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div className="unison-gradient p-8 rounded-3xl shadow-xl text-white">
                 <h2 className="text-3xl font-bold mb-2">MI SOCIEDAD</h2>
                 <p className="opacity-90">Gestiona las noticias de tu carrera</p>
                 <button className="mt-6 bg-white text-primary px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all">Nueva Noticia</button>
              </div>
              <div className="clean-card">
                 <h2 className="text-3xl font-bold mb-2">ESTADÍSTICAS</h2>
                 <p className="text-text-muted">Nivel de engagement en tu facultad</p>
                 <p className="text-5xl font-black mt-4 text-primary">84%</p>
              </div>
            </div>
          </div>
        )}

        {user.rol === 'estudiante' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="#bazar" className="p-6 clean-card text-center hover:scale-105">🛍️ Bazar</a>
                <a href="#empleos" className="p-6 clean-card text-center hover:scale-105">💼 Empleos</a>
                <a href="#reportar" className="p-6 clean-card text-center hover:scale-105">🗣️ Reportar</a>
                <a href="#" className="p-6 clean-card text-center hover:scale-105">📱 Perfil</a>
              </div>
              
              <section id="reportar" className="glass p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Buzón de Reportes Anónimos</h2>
                  <ReportForm />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-6 text-primary uppercase tracking-tighter">Reportes de la Comunidad</h2>
                  <ReportList />
                </div>
              </section>

              <section id="bazar">
                <h2 className="text-2xl font-bold mb-6">Bazar Emprendedor</h2>
                <BazarGrid />
              </section>

              <section id="empleos" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Bolsa de Trabajo</h2>
                  <JobsBoard />
                </div>
                <div>
                  <StudentJobsDashboard />
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold px-2">🦉 CESA Bot 24/7</h2>
            </div>
          </div>
        )}

        {user.rol === 'empresa' && (
          <div className="space-y-10">
            <CompanyJobsDashboard />
          </div>
        )}
      </div>
    </div>
  );
}

