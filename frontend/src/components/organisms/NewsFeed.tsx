'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import directorioData from '@/lib/directorio.json';
import { 
  Search, 
  Calendar, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Mail, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Bell,
  Newspaper,
  Instagram
} from 'lucide-react';

const PRE_SEEDED_ITEMS = [
  {
    id: 10001,
    titulo: "Acompañamiento a Estudiantes Afectados por Huelga",
    contenido: "El CESA invita a todos los alumnos con problemas en servicio social, prácticas profesionales o estancias académicas a reportar sus datos. Daremos seguimiento de manera individual con la administración universitaria.",
    imagen_url: "/logo-cesa.jpg",
    tipo: "general",
    fuente: "Comunicado Oficial",
    fecha_publicacion: "2026-06-20T12:00:00Z",
    created_at: "2026-06-20T12:00:00Z",
    autor_nombre: "Ángela Carrasco"
  },
  {
    id: 10002,
    titulo: "Aviso importante sobre el Servicio Social 📲",
    contenido: "🦉 ¡Hola a todos! Les recordamos que ya estamos recibiendo las solicitudes de estudiantes para revalidar horas de servicio social afectadas por las pasadas huelgas. No se queden fuera del registro, link en la biografía del canal para llenar el formulario directamente.",
    imagen_url: null,
    tipo: "logro",
    fuente: "Instagram Broadcast",
    fecha_publicacion: "2026-06-15T15:30:00Z",
    created_at: "2026-06-15T15:30:00Z",
    autor_nombre: "Canal CESA Unison"
  },
  {
    id: 10003,
    titulo: "Resolución del Verano y Alternativas de Titulación",
    contenido: "En reunión con las autoridades de la Universidad de Sonora, se confirmó que los Cursos Especiales de Verano no se realizarán debido al paro laboral. Sin embargo, hemos acordado alternativas administrativas para que los alumnos de último semestre puedan egresar sin contratiempos. Acércate a tu sociedad.",
    imagen_url: "/logo-cesa.jpg",
    tipo: "urgente",
    fuente: "Comunicado Oficial",
    fecha_publicacion: "2026-06-12T10:00:00Z",
    created_at: "2026-06-12T10:00:00Z",
    autor_nombre: "Ángela Carrasco"
  },
  {
    id: 10004,
    titulo: "Incertidumbre por Huelga del STAUS",
    contenido: "Manifestamos la gran preocupación de la comunidad estudiantil ante la huelga del STAUS. Exigimos diálogo abierto y soluciones que no perjudiquen el avance académico ni los cursos de verano.",
    imagen_url: null,
    tipo: "urgente",
    fuente: "Comunicado Oficial",
    fecha_publicacion: "2026-06-03T09:00:00Z",
    created_at: "2026-06-03T09:00:00Z",
    autor_nombre: "Ángela Carrasco"
  },
  {
    id: 10005,
    titulo: "Seguimiento Pliego Petitorio 2026 🗣️",
    contenido: "Seguimos firmes en la mesa de diálogo. Presentamos los puntos prioritarios sobre infraestructura, seguridad y flexibilización académica. ¡La voz de los estudiantes se escucha fuerte! #CesaUnison #TuVozNuestraFuerza",
    imagen_url: "/logo-cesa.jpg",
    tipo: "general",
    fuente: "Publicación Social",
    fecha_publicacion: "2026-05-18T18:00:00Z",
    created_at: "2026-05-18T18:00:00Z",
    autor_nombre: "CESA Instagram"
  },
  {
    id: 10006,
    titulo: "Ángela Carrasco Asume la Presidencia CESA 2026-2028",
    contenido: "Hoy inicia una nueva era de representación estudiantil en la Universidad de Sonora. Ángela Carrasco Ibarra tomó protesta oficial como presidenta del Consejo Estudiantil de Sociedades de Alumnos (CESA) para el periodo 2026-2028 en un evento solemne realizado en el Teatro Emiliana de Zubeldía.\n\nLa nueva mesa directiva queda conformada por Luis Ángel Ramírez Olguín en la vicepresidencia, Arturo Zamorano Córdova en la Coordinación General y Sherlyn Alexandra Noriega González en la tesorería. Esta administración marca una transición histórica hacia un modelo de coordinaciones temáticas horizontales que sustituye al esquema presidencialista tradicional.\n\nBajo el lema \"Ven y Actúa\", el proyecto de Carrasco Ibarra prioriza el liderazgo estudiantil, la salud física y mental, la inclusión de pueblos originarios, la diversidad estudiantil, el apoyo al emprendimiento y una estrecha vinculación institucional.",
    imagen_url: "/angela_carrasco.png",
    tipo: "general",
    fuente: "Comunicado Oficial",
    fuente_url: "https://www.unison.mx",
    fecha_publicacion: "2026-02-24T11:00:00Z",
    created_at: "2026-02-24T11:00:00Z",
    autor_nombre: "Mesa Directiva CESA"
  }

];

export default function NewsFeed() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedNoticia, setSelectedNoticia] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    imagen_url: '',
    tipo: 'general',
    carrera_destino: '',
    send_push: false
  });
  
  const { token, user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  const canPublish = user?.rol === 'admin' || user?.rol === 'mesa_directiva' || user?.publicar_anuncios || user?.rol_comunicacion || user?.rol === 'sociedad';

  // Synchronize news detail open/close with history for PWA back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.type === 'noticia') {
        const found = noticias.find(n => n.id === event.state.id);
        if (found) {
          setSelectedNoticia(found);
        } else {
          setSelectedNoticia(null);
        }
      } else {
        setSelectedNoticia(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [noticias]);

  const handleSelectNoticia = (n: any) => {
    setSelectedNoticia(n);
    window.history.pushState({ type: 'noticia', id: n.id }, '');
  };

  const handleBackToFeed = () => {
    setSelectedNoticia(null);
    if (window.history.state && window.history.state.type === 'noticia') {
      window.history.back();
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, [token]);


  const fetchNoticias = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/noticias.php?action=list`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      let dbNoticias = [];
      if (data.success) {
        dbNoticias = data.data || data.noticias || [];
      }

      // Add fuente tag to db news
      const mappedDb = dbNoticias.map((n: any) => ({
        ...n,
        fuente: n.carrera_destino ? `Anuncio: ${n.carrera_destino}` : "Comunicado Oficial"
      }));

      // Combine with preseeded
      const combined = [...mappedDb, ...PRE_SEEDED_ITEMS];
      
      // Remove duplicates
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.titulo === v.titulo) === i);

      // Sort chronological descending
      unique.sort((a, b) => new Date(b.fecha_publicacion || b.created_at).getTime() - new Date(a.fecha_publicacion || a.created_at).getTime());

      setNoticias(unique);
    } catch (e) {
      console.error("Error al cargar noticias", e);
      // Fallback only to preseeded
      setNoticias(PRE_SEEDED_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.contenido) return alert("Título y contenido requeridos.");
    
    const fd = new FormData();
    fd.append('action', 'create');
    fd.append('titulo', formData.titulo);
    fd.append('contenido', formData.contenido);
    fd.append('imagen_url', formData.imagen_url);
    fd.append('tipo', formData.tipo);
    fd.append('carrera_destino', formData.carrera_destino);
    fd.append('send_push', formData.send_push ? 'true' : 'false');

    try {
      const res = await fetch(`${API_URL}/noticias.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert("Noticia publicada correctamente.");
        setFormData({ titulo: '', contenido: '', imagen_url: '', tipo: 'general', carrera_destino: '', send_push: false });
        setShowForm(false);
        fetchNoticias();
      } else {
        alert(data.error || "Error al publicar la noticia.");
      }
    } catch (e) {
      alert("Error de conexión al servidor.");
    }
  };

  const handleDelete = async (id: number) => {
    if (id >= 10000) {
      alert("No se pueden eliminar las noticias históricas pre-cargadas.");
      return;
    }
    if (!confirm("¿Eliminar noticia?")) return;

    try {
      const res = await fetch(`${API_URL}/noticias.php?action=delete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        if (selectedNoticia?.id === id) {
          setSelectedNoticia(null);
        }
        fetchNoticias();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  const filteredNoticias = noticias.filter(n => {
    const matchesSearch = 
      n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.contenido.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || n.tipo === selectedCategory || (selectedCategory === 'redes' && n.fuente !== 'Comunicado Oficial');
    return matchesSearch && matchesCategory;
  });

  const recentNoticias = noticias.slice(0, 5);

  const formatNewsDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const shareOnSocial = (platform: string, noticia: any) => {
    const url = encodeURIComponent(window.location.origin + `/noticias/${noticia.id}`);
    const text = encodeURIComponent(`Gaceta CESA UNISON: ${noticia.titulo}`);
    
    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else if (platform === 'email') {
      shareUrl = `mailto:?subject=${text}&body=Consulta la noticia aquí: ${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) return <div className="text-center py-20 text-text-muted uppercase font-black tracking-widest animate-pulse">Cargando Gaceta CESA...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Upper Control Bar */}
      <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['todos', 'general', 'urgente', 'evento', 'logro'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedNoticia(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-black/30 text-slate-400 hover:bg-black/50 hover:text-white'
              }`}
            >
              {cat === 'todos' ? 'Ver Todas' : cat}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedCategory('redes');
              setSelectedNoticia(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === 'redes' 
                ? 'bg-accent text-white shadow-lg' 
                : 'bg-black/30 text-slate-400 hover:bg-black/50 hover:text-white'
            }`}
          >
            Redes y Canales
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar comunicados..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedNoticia(null);
              }}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {canPublish && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setSelectedNoticia(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                showForm 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
              }`}
            >
              <Plus size={14} />
              {showForm ? 'Cerrar' : 'Redactar'}
            </button>
          )}
        </div>
      </div>

      {/* Write News Form */}
      {showForm && canPublish && (
        <form onSubmit={handleCreate} className="bg-slate-900/60 p-8 rounded-[2rem] border border-emerald-500/20 space-y-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
           <div className="border-b border-white/5 pb-4 flex justify-between items-center">
              <h3 className="text-white font-black uppercase text-xs tracking-wider flex items-center gap-2">
                <Newspaper size={16} className="text-emerald-500" /> Redactar Comunicado Oficial u Anuncio
              </h3>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="text-[8px] uppercase font-black text-emerald-400 tracking-widest block mb-2">Título del Anuncio</label>
                 <input 
                    type="text" 
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Título formal y llamativo (Máx 150 caracteres)"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
                    maxLength={150}
                    required
                 />
              </div>
              <div>
                 <label className="text-[8px] uppercase font-black text-emerald-400 tracking-widest block mb-2">Cuerpo de la Noticia</label>
                 <textarea 
                    value={formData.contenido}
                    onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                    placeholder="Redacta la información detalladamente..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-40 focus:border-emerald-500 outline-none resize-none"
                    required
                 ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                   <label className="text-[8px] uppercase font-black text-emerald-400 tracking-widest block mb-2">URL Imagen Destacada (Opcional)</label>
                   <input 
                      type="url" 
                      value={formData.imagen_url}
                      onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                   />
                </div>
                <div>
                   <label className="text-[8px] uppercase font-black text-emerald-400 tracking-widest block mb-2">Categoría Informativa</label>
                   <select 
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                   >
                     <option value="general">General</option>
                     <option value="evento">Evento</option>
                     <option value="urgente">Urgente</option>
                     <option value="logro">Logro / Sociedad</option>
                   </select>
                </div>
                <div>
                   <label className="text-[8px] uppercase font-black text-emerald-400 tracking-widest block mb-2">Carrera Destino (Anuncio Dirigido)</label>
                   <select 
                      value={formData.carrera_destino}
                      onChange={(e) => setFormData({...formData, carrera_destino: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                   >
                     <option value="">-- General (Todos) --</option>
                     {directorioData.map((d: any, idx: number) => (
                       <option key={idx} value={d.Carrera}>{d.Carrera}</option>
                     ))}
                   </select>
                </div>
                <div className="flex items-end pb-1">
                   <label className="flex items-center gap-3 cursor-pointer w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 hover:border-emerald-500/50 transition-all">
                     <input 
                       type="checkbox"
                       checked={formData.send_push}
                       onChange={(e) => setFormData({...formData, send_push: e.target.checked})}
                       className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 bg-slate-900 border-white/10"
                     />
                     <div>
                       <p className="text-[9px] uppercase font-black text-white leading-tight flex items-center gap-1"><Bell size={10} className="text-emerald-500 animate-bounce" /> Enviar Notificación Push</p>
                       <p className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">Alerta global en móviles</p>
                     </div>
                   </label>
                </div>
              </div>
           </div>
           
           <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                 type="submit"
                 className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                 Publicar Comunicado 🚀
              </button>
           </div>
        </form>
      )}

      {/* Main Grid: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Main Column - 8 / 12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedNoticia ? (
            /* Selected News Detail View */
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8 animate-in fade-in duration-500 shadow-2xl relative">
              
              <button 
                onClick={handleBackToFeed}
                className="flex items-center gap-2 px-4 py-2 bg-black/30 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all mb-4 self-start border border-white/5"
              >
                <ChevronLeft size={12} />
                Volver a la Gaceta
              </button>


              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    selectedNoticia.tipo === 'urgente' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    selectedNoticia.tipo === 'evento' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    selectedNoticia.tipo === 'logro' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {selectedNoticia.tipo}
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-accent/20 text-accent border border-accent/30">
                    {selectedNoticia.fuente || 'Gaceta'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white leading-none uppercase tracking-tight">
                  {selectedNoticia.titulo}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-slate-500 text-xs pt-2 border-b border-white/5 pb-4">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Calendar size={14} className="text-slate-400" />
                    {formatNewsDate(selectedNoticia.fecha_publicacion || selectedNoticia.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <User size={14} className="text-slate-400" />
                    {selectedNoticia.autor_nombre || 'CESA Oficial'}
                  </span>
                </div>
              </div>

              {/* Social Media Sharing bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Share2 size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Compartir Nota:</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => shareOnSocial('facebook', selectedNoticia)} 
                    className="w-10 h-10 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-xl flex items-center justify-center transition-all border border-[#1877F2]/20"
                    title="Compartir en Facebook"
                  >
                    <Facebook size={16} />
                  </button>
                  <button 
                    onClick={() => shareOnSocial('twitter', selectedNoticia)}
                    className="w-10 h-10 bg-slate-800 text-white hover:bg-black rounded-xl flex items-center justify-center transition-all border border-white/10"
                    title="Compartir en X (Twitter)"
                  >
                    <Twitter size={16} />
                  </button>
                  <button 
                    onClick={() => shareOnSocial('whatsapp', selectedNoticia)}
                    className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl flex items-center justify-center transition-all border border-[#25D366]/20"
                    title="Compartir en WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button 
                    onClick={() => shareOnSocial('email', selectedNoticia)}
                    className="w-10 h-10 bg-slate-700/30 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl flex items-center justify-center transition-all border border-white/5"
                    title="Compartir por Correo"
                  >
                    <Mail size={16} />
                  </button>
                </div>
              </div>

              {selectedNoticia.imagen_url && (
                <div className="w-full max-h-[400px] overflow-hidden rounded-[2rem] border border-white/5 relative bg-slate-950">
                  <img 
                    src={selectedNoticia.imagen_url} 
                    alt={selectedNoticia.titulo} 
                    className="w-full h-full object-cover max-h-[400px]" 
                  />
                </div>
              )}

              <div className="text-slate-200 text-base leading-relaxed font-medium align-justify whitespace-pre-wrap select-text pr-2 md:pr-4">
                {selectedNoticia.contenido}
              </div>

              {selectedNoticia.fuente_url && (
                <div className="mt-6 p-5 bg-black/20 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Fuente Informativa</p>
                    <p className="text-xs text-slate-300 font-bold mt-1">Esta nota fue publicada originalmente por la Universidad de Sonora.</p>
                  </div>
                  <a 
                    href={selectedNoticia.fuente_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 text-center"
                  >
                    Ver nota original ➔
                  </a>
                </div>
              )}

              <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm border border-white/10">🦉</div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">{selectedNoticia.autor_nombre || 'Mesa Directiva CESA'}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{selectedNoticia.fuente || 'Gaceta'}</p>
                  </div>
                </div>

                {canPublish && selectedNoticia.id < 10000 && (
                  <button 
                    onClick={() => handleDelete(selectedNoticia.id)} 
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    Eliminar Nota
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* News Grid View */
            <div className="space-y-6">
              {filteredNoticias.length === 0 ? (
                <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-16 text-center shadow-xl">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">No se encontraron noticias que coincidan con la búsqueda.</p>
                </div>
              ) : (
                filteredNoticias.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleSelectNoticia(n)}
                    className="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/40 hover:shadow-2xl transition-all duration-300 group cursor-pointer flex flex-col md:flex-row h-auto md:h-64"
                  >
                    <div className="w-full md:w-80 h-48 md:h-full bg-slate-950 flex-shrink-0 relative overflow-hidden">
                      <img 
                        src={n.imagen_url || "/logo-cesa.jpg"} 
                        alt={n.titulo} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                      />
                      {n.fuente === "Instagram Broadcast" && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl p-2 shadow-lg flex items-center justify-center">
                          <Instagram size={14} />
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              n.tipo === 'urgente' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              n.tipo === 'evento' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              n.tipo === 'logro' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {n.tipo}
                            </span>
                            <span className="inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-accent/20 text-accent border border-accent/20">
                              {n.fuente || 'Gaceta'}
                            </span>
                          </div>
                          
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{formatNewsDate(n.fecha_publicacion || n.created_at)}</span>
                        </div>
                        
                        <h3 className="text-xl font-black text-white leading-snug group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-2">
                          {n.titulo}
                        </h3>
                        
                        <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed font-medium">
                          {n.contenido}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">🦉</div>
                           <span className="text-[9px] uppercase font-black text-slate-400">{n.autor_nombre || 'CESA'}</span>
                         </div>
                         <span className="text-[8px] text-primary font-black uppercase tracking-widest group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                           Ver Detalles ➜
                         </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Right Column (Sidebar) */}
        <div className={`${selectedNoticia ? 'hidden lg:block' : ''} lg:col-span-4 space-y-6`}>
          
          <div className="bg-[#0c1e45] rounded-[2rem] border border-blue-500/20 overflow-hidden shadow-2xl">
            <div className="bg-[#050f24] py-5 px-6 border-b border-blue-500/10 flex items-center gap-2">
              <Newspaper className="text-blue-400" size={16} />
              <h4 className="text-white font-black uppercase text-xs tracking-wider">Comunicados Recientes</h4>
            </div>

            <div className="p-6 divide-y divide-blue-500/10">
              {recentNoticias.length === 0 ? (
                <p className="text-blue-200/40 text-[9px] font-black uppercase text-center py-8">No hay novedades registradas.</p>
              ) : (
                recentNoticias.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => handleSelectNoticia(n)}
                    className="py-4 first:pt-0 last:pb-0 group cursor-pointer flex gap-4 items-start"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-blue-500/10 relative">
                      <img 
                        src={n.imagen_url || "/logo-cesa.jpg"} 
                        alt={n.titulo} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-black text-white group-hover:text-blue-400 transition-all leading-snug line-clamp-2 uppercase">
                        {n.titulo}
                      </h5>
                      <p className="text-[8px] font-black uppercase tracking-tighter text-blue-300/60">
                        {formatNewsDate(n.fecha_publicacion || n.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-[#050f24]/50 py-4 px-6 border-t border-blue-500/10 text-center">
              <button 
                onClick={() => {
                  setSelectedNoticia(null);
                  setSelectedCategory('todos');
                }}
                className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors"
              >
                Ver Gaceta Completa
              </button>
            </div>

          </div>

          {/* Sponsored Side Ad Box */}
          <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-[8px] font-black uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg text-slate-500 border border-white/5">Patrocinador</span>
               <span className="text-[7px] text-slate-600 font-bold">Anuncio</span>
             </div>
             <div className="border border-white/5 rounded-2xl p-4 bg-black/40 text-center space-y-2">
               <h5 className="text-white font-black text-xs">🦉 UNISON Deportes</h5>
               <p className="text-[9px] text-slate-400 font-medium leading-relaxed">¡Apoya a los Búhos en el torneo estatal de basquetbol este fin de semana! Gimnasio Universitario.</p>
               <a href="https://www.unison.mx" target="_blank" rel="noopener noreferrer" className="inline-block text-[8px] font-black uppercase text-primary hover:underline mt-2">Más Info ➔</a>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
}
