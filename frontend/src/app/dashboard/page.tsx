'use client';

import { useAuth } from '@/lib/useAuth';
import AdminIAConfig from '../admin/api-config/page';
import AdminDashboard from '@/components/AdminDashboard';
import SocietyCard from '@/components/SocietyCard';
import BazarGrid from '@/components/BazarGrid';
import JobsBoard from '@/components/JobsBoard';
import ReportForm from '@/components/ReportForm';
import ChatInterface from '@/components/ChatInterface';
import NotificationCenter from '@/components/NotificationCenter';

export default function UnifiedDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-20 text-center">Cargando plataforma...</div>;
  if (!user) return <div className="p-20 text-center">Inicia sesión para acceder</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              HOLA, {user.nombre.toUpperCase()}
            </h1>
            <p className="text-slate-400 mt-2">Panel Institucional CESA • Rol: <span className="text-indigo-400 font-bold uppercase">{user.rol}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-bold">
              LOGOUT
            </button>
          </div>
        </header>

        {/* VISTA SEGÚN ROL */}
        {user.rol === 'admin' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Llamadas IA (1h)</p>
                <h4 className="text-3xl font-black text-indigo-400 mt-2">1,240</h4>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Latencia Media</p>
                <h4 className="text-3xl font-black text-green-400 mt-2">145ms</h4>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Status Mac Mini</p>
                <h4 className="text-3xl font-black text-blue-400 mt-2">ONLINE</h4>
              </div>
            </div>
            <AdminDashboard />
            <div className="bg-indigo-900/20 p-6 rounded-3xl border border-indigo-500/30">
              <h3 className="text-xl font-bold mb-4">Acceso Rápido a Configuración de IA</h3>
              <p className="text-sm text-indigo-300 mb-6">Gestiona las API Keys y la conexión con la Mac Mini M4 desde el panel centralizado.</p>
              <a href="/admin/api-config" className="bg-indigo-600 px-6 py-3 rounded-xl font-bold">Ir a Config IA</a>
            </div>
          </div>
        )}

        {user.rol === 'mesa_directiva' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <AdminDashboard />
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
              <h2 className="text-2xl font-bold mb-6">Gestión de Coordinación</h2>
              <p className="text-slate-400 mb-6">Como miembro de la Mesa Directiva, tienes acceso al "Mood-o-meter" institucional y a la moderación de reportes urgentes.</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-slate-900 rounded-2xl text-center border border-slate-700 hover:border-indigo-500 transition-all">
                   📢 Publicar Comunicado
                </button>
                <button className="p-4 bg-slate-900 rounded-2xl text-center border border-slate-700 hover:border-indigo-500 transition-all">
                   ✅ Validar Empresas
                </button>
              </div>
            </div>
          </div>
        )}

        {user.rol === 'sociedad' && (
          <div className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-xl">
                 <h2 className="text-3xl font-bold mb-2">MI SOCIEDAD</h2>
                 <p className="text-indigo-200">Gestiona las noticias de tu carrera</p>
                 <button className="mt-6 bg-white text-indigo-900 px-6 py-2 rounded-xl font-bold">Nueva Noticia</button>
              </div>
              <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                 <h2 className="text-3xl font-bold mb-2">ESTADÍSTICAS</h2>
                 <p className="text-slate-400">Nivel de engagement en tu facultad</p>
                 <p className="text-5xl font-black mt-4 text-indigo-400">84%</p>
              </div>
            </div>
          </div>
        )}

        {user.rol === 'estudiante' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="#bazar" className="p-6 bg-slate-800 rounded-2xl text-center border border-slate-700 hover:scale-105 transition-all">🛍️ Bazar</a>
                <a href="#empleos" className="p-6 bg-slate-800 rounded-2xl text-center border border-slate-700 hover:scale-105 transition-all">💼 Empleos</a>
                <a href="#reportar" className="p-6 bg-slate-800 rounded-2xl text-center border border-slate-700 hover:scale-105 transition-all">🗣️ Reportar</a>
                <a href="#" className="p-6 bg-slate-800 rounded-2xl text-center border border-slate-700 hover:scale-105 transition-all">📱 Perfil</a>
              </div>
              
              <section id="reportar" className="bg-indigo-900/10 p-8 rounded-3xl border border-indigo-500/20">
                <h2 className="text-2xl font-bold mb-6">Buzón de Reportes Anónimos</h2>
                <ReportForm />
              </section>

              <section id="bazar">
                <h2 className="text-2xl font-bold mb-6">Bazar Emprendedor</h2>
                <BazarGrid />
              </section>

              <section id="empleos">
                <h2 className="text-2xl font-bold mb-6">Bolsa de Trabajo</h2>
                <JobsBoard />
              </section>
            </div>

            {/* Sidebar con ChatBot */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold px-2">🦉 CESA Bot 24/7</h2>
              <ChatInterface />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
