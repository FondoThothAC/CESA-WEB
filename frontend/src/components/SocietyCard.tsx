'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { 
  Instagram, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Megaphone, 
  Vote, 
  Send, 
  Link2,
  AlertCircle
} from 'lucide-react';

interface Society {
  Carrera: string;
  Siglas: string;
  Instagram?: string;
  Facebook?: string;
  Presidente?: string;
  "Estatus Renovacion"?: string;
  "Link Activo (2026)"?: string;
}

export default function SocietyCard({ society }: { society: Society }) {
  const [expanded, setExpanded] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  
  // Announcement Form State
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [posting, setPosting] = useState(false);

  // Election request state
  const [electionRequested, setElectionRequested] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [submittingElection, setSubmittingElection] = useState(false);

  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Check if current user can publish announcements for this specific society
  const canPublishAnnouncement = 
    user && (
      user.rol === 'admin' || 
      user.rol === 'mesa_directiva' || 
      (user.rol === 'sociedad' && user.carrera === society.Carrera)
    );

  const hasNoSociety = !society.Presidente || society.Presidente.trim() === "";

  useEffect(() => {
    if (expanded) {
      fetchAnnouncements();
    }
  }, [expanded]);

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await fetch(`${API_URL}/noticias.php?action=list&carrera_destino=${encodeURIComponent(society.Carrera)}`);
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data || data.noticias || []);
      }
    } catch (e) {
      console.error("Error loading career announcements", e);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAnnouncement) return alert("Título y mensaje son obligatorios");

    setPosting(true);
    try {
      const fd = new FormData();
      fd.append('action', 'create');
      fd.append('titulo', newTitle);
      fd.append('contenido', newAnnouncement);
      fd.append('tipo', 'logro');
      fd.append('carrera_destino', society.Carrera);

      const res = await fetch(`${API_URL}/noticias.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert("Anuncio publicado con éxito.");
        setNewTitle('');
        setNewAnnouncement('');
        fetchAnnouncements();
      } else {
        alert(data.error || "Error al publicar");
      }
    } catch (e) {
      alert("Error de red");
    } finally {
      setPosting(false);
    }
  };

  const handleRequestElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Inicia sesión para solicitar elecciones.");
      return;
    }

    setSubmittingElection(true);
    try {
      const fd = new FormData();
      fd.append('action', 'create');
      fd.append('carrera', society.Carrera);
      fd.append('motivo', requestReason || "Crear Sociedad de Alumnos");

      const res = await fetch(`${API_URL}/solicitudes_elecciones.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setElectionRequested(true);
        alert(data.message || "Solicitud de elecciones enviada con éxito.");
      } else {
        alert(data.error || "Error al enviar solicitud");
      }
    } catch (e) {
      alert("Error al conectar con el servidor.");
    } finally {
      setSubmittingElection(false);
    }
  };

  return (
    <div className={`clean-card group transition-all duration-300 hover:border-accent shadow-lg flex flex-col justify-between ${expanded ? 'md:col-span-2 lg:col-span-3 border-accent ring-2 ring-accent/20 bg-slate-900/10' : 'hover:scale-[1.02] active:scale-[0.98]'}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-primary dark:text-accent font-extrabold text-sm tracking-widest uppercase">
            {society.Siglas || 'SA'}
          </span>
          <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            {society.Instagram && (
              <a 
                href={`https://instagram.com/${society.Instagram.replace('@','')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs hover:text-accent flex items-center gap-1 font-bold"
              >
                <Instagram size={14} /> IG
              </a>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-black text-text-main mb-2 leading-tight uppercase tracking-tight">
          {society.Carrera}
        </h3>
        
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div>
            <p className="uppercase font-bold tracking-wider text-[10px]">Presidente</p>
            <p className="text-text-main font-black mt-0.5">{society.Presidente || 'Por definir'}</p>
          </div>
          <div>
            <p className="uppercase font-bold tracking-wider text-[10px] text-right">Estatus</p>
            <p className={`font-black mt-0.5 uppercase tracking-widest text-[9px] ${hasNoSociety ? 'text-red-500' : 'text-emerald-500'}`}>
              {hasNoSociety ? 'Inactivo' : (society["Estatus Renovacion"] || 'Activo')}
            </p>
          </div>
        </div>

        {/* Expanded detail section (Sub-site style) */}
        {expanded && (
          <div className="mt-6 pt-6 border-t-2 border-dashed border-border space-y-6 animate-in slide-in-from-top-4 duration-300">
            
            {/* Social Posts section */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-primary dark:text-accent tracking-wider flex items-center gap-1.5">
                <Link2 size={14} /> Redes Sociales y Última Publicación
              </h4>
              <div className="bg-bg-secondary p-4 rounded-2xl border border-border space-y-2">
                <p className="text-xs font-semibold text-text-main">
                  Última actualización:
                </p>
                <p className="text-[11px] text-text-muted leading-relaxed italic">
                  "¡Los invitamos a nuestro próximo evento integrador de fin de semestre! Detalles en nuestro perfil oficial de Instagram {society.Instagram || society["Link Activo (2026)"] || '@cesa.unison'}"
                </p>
                {society.Instagram && (
                  <a 
                    href={`https://instagram.com/${society.Instagram.replace('@','')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-accent transition-all"
                  >
                    Ver última publicación <Instagram size={10} />
                  </a>
                )}
              </div>
            </div>

            {/* Career specific announcements (Sub-sitio de Anuncios) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-primary dark:text-accent tracking-wider flex items-center gap-1.5">
                <Megaphone size={14} /> Espacio de Anuncios ({society.Siglas || 'SA'})
              </h4>

              {announcementsLoading ? (
                <p className="text-[10px] text-text-muted animate-pulse uppercase font-black">Cargando anuncios...</p>
              ) : announcements.length === 0 ? (
                <div className="bg-bg-secondary p-4 rounded-xl border border-border text-center text-text-muted text-[10px] font-bold">
                  No hay anuncios recientes para esta carrera.
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {announcements.map((ann, idx) => (
                    <div key={idx} className="bg-bg-secondary p-3 rounded-xl border border-border space-y-1">
                      <div className="flex justify-between items-center text-[8px] font-bold text-text-muted">
                        <span className="uppercase text-accent font-black">Anuncio Oficial</span>
                        <span>{new Date(ann.created_at || ann.fecha_publicacion).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-black text-text-main">{ann.titulo}</p>
                      <p className="text-[10px] text-text-muted leading-normal">{ann.contenido}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Form to Post Announcement (Only for Society Representatives or Admins) */}
              {canPublishAnnouncement && (
                <form onSubmit={handlePostAnnouncement} className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-3">
                  <p className="text-[9px] uppercase font-black text-primary dark:text-accent tracking-widest">Publicar en Sub-sitio</p>
                  <input 
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Título del anuncio..."
                    className="w-full bg-bg-secondary border border-border rounded-xl px-3 py-1.5 text-xs text-text-main outline-none focus:border-accent"
                    required
                  />
                  <textarea 
                    value={newAnnouncement}
                    onChange={e => setNewAnnouncement(e.target.value)}
                    placeholder="Escribe el comunicado para esta carrera..."
                    className="w-full bg-bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-text-main h-16 outline-none focus:border-accent resize-none"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={posting}
                    className="w-full py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-accent flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={10} /> {posting ? 'Publicando...' : 'Enviar Anuncio'}
                  </button>
                </form>
              )}
            </div>

            {/* Elections Request block for Careers without active Society */}
            {hasNoSociety && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-red-500 leading-tight">Sin Sociedad de Alumnos</h5>
                    <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Esta carrera no cuenta con una representación formal activa.</p>
                  </div>
                </div>

                {electionRequested ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                    ✓ Solicitud de Elecciones Recibida
                  </div>
                ) : (
                  <form onSubmit={handleRequestElection} className="space-y-2">
                    <p className="text-[9px] text-text-muted font-bold leading-normal">
                      Si eres estudiante de esta carrera, puedes pedir formalmente al CESA que convoque a elecciones para conformar una sociedad.
                    </p>
                    <input 
                      type="text" 
                      value={requestReason}
                      onChange={e => setRequestReason(e.target.value)}
                      placeholder="Motivo / Plan de conformación..."
                      className="w-full bg-bg-secondary border border-border rounded-xl px-3 py-1.5 text-[10px] text-text-main outline-none focus:border-red-500/50"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={submittingElection}
                      className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Vote size={11} /> Solicitar Elecciones al Consejo
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-4 py-2 border border-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/5 text-text-muted flex items-center justify-center gap-1 transition-all"
      >
        {expanded ? (
          <>Cerrar Detalles <ChevronUp size={12} /></>
        ) : (
          <>Ver Detalles y Anuncios <ChevronDown size={12} /></>
        )}
      </button>
    </div>
  );
}
