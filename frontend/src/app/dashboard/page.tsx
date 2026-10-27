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
import PracticasBoard from '@/components/organisms/PracticasBoard';
import DatosPracticasCard from '@/components/organisms/DatosPracticasCard';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UnifiedDashboard() {
  const { user, isLoading, logout, token } = useAuth();
  const router = useRouter();
  const [mesaView, setMesaView] = useState<'comunicado' | 'empresas' | null>(null);
  const [bolsaActiva, setBolsaActiva] = useState(false);
  const [adminStats, setAdminStats] = useState<{ total_usuarios: number; total_noticias: number; total_emprendimientos: number; total_mensajes_ia: number } | null>(null);
  const [adminStatsDemo, setAdminStatsDemo] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${base}/site_config.php?action=get`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.config) setBolsaActiva(d.config.bolsa_trabajo_activa === '1');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.rol !== 'admin') return;
    const base = process.env.NEXT_PUBLIC_API_URL || '/api';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Rust v1 telemetría es la fuente real; fallback a PHP si no responde
    const tryFetch = async (url: string) => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    };
    (async () => {
      try {
        let data: any = await tryFetch(`${base}/v1/admin/telemetry`);
        if (!data?.data) data = await tryFetch(`${base}/v1/admin/stats`);
        const d = data.data || data;
        if (d.total_usuarios !== undefined) {
          setAdminStats({ total_usuarios: d.total_usuarios, total_noticias: d.total_noticias ?? 0, total_emprendimientos: d.total_emprendimientos ?? d.total_empr ?? 0, total_mensajes_ia: d.total_mensajes_ia ?? d.total_mensajes ?? 0 });
          setAdminStatsDemo(false);
          return;
        }
        throw new Error('no-data');
      } catch {
        // fallback PHP
        try {
          let data2: any = await tryFetch(`${base}/admin/telemetria.php`);
          const d = data2.data || data2;
          if (d.total_usuarios !== undefined) {
            setAdminStats({ total_usuarios: d.total_usuarios, total_noticias: d.total_noticias ?? 0, total_emprendimientos: d.total_emprendimientos ?? 0, total_mensajes_ia: d.total_mensajes_ia ?? 0 });
            setAdminStatsDemo(false);
            return;
          }
        } catch {}
        setAdminStatsDemo(true);
      }
    })();
  }, [user, token]);

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
            <button onClick={() => logout()} className="btn-clean text-xs font-bold uppercase">
              LOGOUT
            </button>
          </div>
        </header>

        {/* VISTA SEGÚN ROL */}
        {user.rol === 'admin' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="clean-card text-center">
                <p className="text-text-muted text-xs uppercase tracking-widest">Total Usuarios</p>
                <h4 className="text-3xl font-black text-primary mt-2">{adminStats ? adminStats.total_usuarios.toLocaleString() : adminStatsDemo ? '—' : '…'}</h4>
                {adminStatsDemo && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">DEMO</span>}
              </div>
              <div className="clean-card text-center">
                <p className="text-text-muted text-xs uppercase tracking-widest">Mensajes IA</p>
                <h4 className="text-3xl font-black text-green-500 mt-2">{adminStats ? adminStats.total_mensajes_ia.toLocaleString() : adminStatsDemo ? '—' : '…'}</h4>
              </div>
              <div className="clean-card text-center">
                <p className="text-text-muted text-xs uppercase tracking-widest">Emprendimientos</p>
                <h4 className="text-3xl font-black text-blue-500 mt-2">{adminStats ? adminStats.total_emprendimientos.toLocaleString() : adminStatsDemo ? '—' : '…'}</h4>
              </div>
            </div>
            {adminStatsDemo && <p className="text-xs text-amber-400 text-center">Sin conexión a telemetría — mostrando DEMO.</p>}
            <AdminDashboard />
            <div className="unison-gradient p-8 rounded-3xl text-white">
              <h3 className="text-xl font-bold mb-4">Acceso Rápido a Configuración de IA</h3>
              <p className="text-sm opacity-90 mb-6">Gestiona las API Keys y la conexión con la Mac Mini M4 desde el panel centralizado.</p>
              <a href="/admin/api-config" className="btn-clean text-primary inline-block">Ir a Config IA</a>
            </div>
          </div>
        )}

        {user.rol === 'mesa_directiva' && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <AdminDashboard />
              <div className="clean-card">
                <h2 className="text-2xl font-bold mb-6">Gestión de Coordinación</h2>
                <p className="text-text-muted mb-6">Como miembro de la Mesa Directiva, tienes acceso al "Mood-o-meter" institucional y a la moderación de reportes urgentes.</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setMesaView(mesaView === 'comunicado' ? null : 'comunicado')} className={`p-4 rounded-2xl text-center border transition-all font-bold text-sm ${mesaView === 'comunicado' ? 'bg-primary text-white border-primary' : 'bg-bg-primary border-border hover:border-primary'}`}>
                     📢 {mesaView === 'comunicado' ? 'Cerrar Editor' : 'Publicar Comunicado'}
                  </button>
                  <button onClick={() => setMesaView(mesaView === 'empresas' ? null : 'empresas')} className={`p-4 rounded-2xl text-center border transition-all font-bold text-sm ${mesaView === 'empresas' ? 'bg-primary text-white border-primary' : 'bg-bg-primary border-border hover:border-primary'}`}>
                     ✅ {mesaView === 'empresas' ? 'Cerrar Validación' : 'Validar Empresas'}
                  </button>
                </div>
              </div>
            </div>
            {mesaView === 'comunicado' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-xl font-bold">Nuevo Comunicado Institucional</h3>
                <div className="clean-card">
                  <p className="text-sm text-text-muted mb-4">Redacta un comunicado que aparecerá en el muro social de todos los estudiantes.</p>
                  <textarea placeholder="Escribe el comunicado aquí..." className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-bg-primary text-text-main focus:outline-none focus:border-primary" id="mesa-comunicado-text" />
                  <button onClick={async () => {
                    const el = document.getElementById('mesa-comunicado-text') as HTMLTextAreaElement;
                    const contenido = el?.value?.trim();
                    if (!contenido) return alert('Escribe un comunicado primero.');
                    try {
                      const token = localStorage.getItem('cesa_token');
                      const res = await fetch('/api/muro.php', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ action: 'publicar', contenido, coordinacion: 'general' }) });
                      const data = await res.json();
                      if (data.success) { alert('Comunicado publicado en CESA Social.'); el.value=''; setMesaView(null); } else alert(data.error || 'Error al publicar.');
                    } catch { alert('Error de red'); }
                  }} className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90">Publicar en Muro Social</button>
                </div>
              </div>
            )}
            {mesaView === 'empresas' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-xl font-bold">Validación de Empresas — Servicio Social, Prácticas y Bolsa</h3>
                <JobsBoard />
              </div>
            )}
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
                  <h2 className="text-2xl font-bold mb-6">Servicio Social y Prácticas Profesionales</h2>
                  <PracticasBoard />
                </div>
                {bolsaActiva && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Bolsa de Trabajo</h2>
                    <JobsBoard />
                  </div>
                )}
                <div>
                  <StudentJobsDashboard />
                </div>
                <div>
                  <DatosPracticasCard />
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

