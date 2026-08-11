'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  Brain,
  ShieldCheck,
  User
} from 'lucide-react';

interface Comment {
  id: number;
  autor_nombre: string;
  contenido: string;
  likes_count: number;
  created_at: string;
  respuestas: Comment[];
}

interface Post {
  id: number;
  nombre_completo: string;
  alias_autor?: string | null;
  rol: string;
  contenido: string;
  url_externa?: string;
  link_preview?: {
    title: string;
    description: string;
    image: string;
    domain: string;
  } | null;
  upvotes_count: number;
  downvotes_count: number;
  comentarios_count: number;
  coordinacion_destino: string;
  created_at: string;
  user_vote: number | null;
  sentiment_score: number | null;
  sentiment_summary?: string;
  comentarios?: Comment[];
}

const CommentThread = ({ comment, onReply, depth = 0 }: { comment: Comment, onReply: any, depth?: number }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  return (
    <div className={`mt-4 ${depth > 0 ? 'ml-6 border-l border-border pl-4' : ''}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
          {comment.autor_nombre?.[0] || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-text-main">{comment.autor_nombre}</span>
            <span className="text-[8px] text-text-muted font-mono italic">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-text-main/70 leading-relaxed">{comment.contenido}</p>
          
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setShowReply(!showReply)}
              className="text-[8px] uppercase tracking-widest font-black text-primary hover:text-accent transition-all"
            >
              Responder
            </button>
          </div>

          {showReply && (
            <div className="mt-2 flex gap-2">
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Responde a este hilo..."
                className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-1 text-[10px] outline-none text-text-main"
              />
              <button 
                onClick={() => { onReply(comment.id, replyText); setReplyText(''); setShowReply(false); }}
                className="btn-clean-primary px-3 py-1 text-[8px]"
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>
      {comment.respuestas?.map(reply => (
        <CommentThread key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
};

const SocialWall = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [useAlias, setUseAlias] = useState(false);
  const [coordinacion, setCoordinacion] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const { user, token: contextToken } = useAuth();

  // Leer el token del localStorage como fuente de verdad para evitar el
  // problema de hidratación donde el estado React llega tarde
  const getToken = () => {
    if (contextToken) return contextToken;
    if (typeof window !== 'undefined') return localStorage.getItem('cesa_token');
    return null;
  };

  const BASE_URL = '/api';

  useEffect(() => {
    fetchPosts();
  }, [coordinacion]);

  const fetchPosts = async () => {
    try {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/muro.php?coordinacion=${coordinacion}`, { headers });
      const data = await res.json();
      if (data.success) setPosts(data.posts || data.data || []);
    } catch (e) { console.error("Error al cargar el muro", e); }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    const token = getToken();
    if (!token) {
      alert("Por favor inicia sesión con tu número de expediente o correo para publicar en CESA Social.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/muro.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'publicar',
          contenido: content,
          url_externa: url || null,
          coordinacion: coordinacion,
          usar_alias: useAlias
        })
      });
      const data = await res.json();
      if (data.success) {
        setContent('');
        setUrl('');
        fetchPosts();
      } else {
        alert(data.error || data.message || "Error al publicar en el muro.");
      }
    } catch (e) { alert("Error de conexión al muro."); }
    finally { setIsLoading(false); }
  };

  const handleVote = async (postId: number, valor: number) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/muro.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'votar', publicacion_id: postId, valor })
      });
      const data = await res.json();
      if (data.success) fetchPosts();
    } catch (e) { }
  };


  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Sidebar Izquierda - Navegación de Comunidades */}
      <div className="hidden lg:block space-y-6">
        <div className="clean-card p-6">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" /> Comunidades
          </h5>
          <nav className="space-y-1">
            {['todos', 'general', 'integral', 'impulso'].map(c => (
              <button 
                key={c}
                onClick={() => setCoordinacion(c)}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${coordinacion === c ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-secondary'}`}
              >
                <span>c/{c}</span>
                {coordinacion === c && <div className="w-1 h-1 bg-white rounded-full"></div>}
              </button>
            ))}
          </nav>
        </div>

        <div className="clean-card p-6">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Tendencias 🦉</h5>
          <div className="space-y-4">
             <div className="cursor-pointer hover:bg-bg-secondary p-2 rounded-lg transition-all">
                <p className="text-[10px] font-black text-primary">#EleccionesCESA</p>
                <p className="text-[8px] text-text-muted uppercase">240 posts</p>
             </div>
             <div className="cursor-pointer hover:bg-bg-secondary p-2 rounded-lg transition-all">
                <p className="text-[10px] font-black text-primary">#BazarPrimavera</p>
                <p className="text-[8px] text-text-muted uppercase">112 posts</p>
             </div>
          </div>
        </div>
      </div>

      {/* Feed Principal (Reddit Style) */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Formulario de Publicación Reddit-Style */}
        <form onSubmit={handlePost} className="clean-card p-4 flex gap-4 items-center group focus-within:border-primary transition-all">
          <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-primary font-bold">
            <User size={20} />
          </div>
          <input 
            type="text" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (content.trim()) handlePost(e);
              }
            }}
            placeholder="Escribe en CESA Social... (Presiona Enter para enviar 🚀)" 
            className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-2 text-xs text-text-main focus:outline-none focus:border-accent"
          />
          <button 
            type="submit"
            disabled={isLoading || !content.trim()}
            className="btn-clean-primary px-5 py-2 text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isLoading ? 'Guardando...' : 'Enviar'}</span> 🚀
          </button>
        </form>

        {content.trim() !== '' && (
          <div className="glass p-8 animate-in slide-in-from-top-4 duration-300 relative z-10 border-primary/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nueva Discusión 🏛️</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-[8px] font-black uppercase text-text-muted group-hover:text-primary transition-all">Publicar como Anónimo</span>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${useAlias ? 'bg-primary' : 'bg-bg-secondary'}`} onClick={() => setUseAlias(!useAlias)}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-all ${useAlias ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>
            
            <form onSubmit={handlePost} className="space-y-4">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handlePost(e);
                  }
                }}
                placeholder="¿De qué quieres hablar con la comunidad? (Usa Ctrl+Enter o presiona Publicar)"
                className="w-full bg-bg-primary border border-border rounded-2xl p-6 text-text-main text-sm focus:outline-none focus:border-primary min-h-[150px] transition-all resize-none"
              />
              
              <div className="flex items-center justify-between">
                 <select 
                  value={coordinacion === 'todos' ? 'general' : coordinacion}
                  onChange={(e) => setCoordinacion(e.target.value)}
                  className="bg-bg-secondary border border-border text-[9px] font-black uppercase text-text-muted rounded-xl px-4 py-2 outline-none"
                >
                  <option value="general">Mesa Directiva</option>
                  <option value="integral">Bienestar Integral</option>
                  <option value="impulso">Impulso Emprendedor</option>
                </select>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setContent('')} className="px-6 py-2 text-[10px] font-black uppercase text-text-muted hover:text-red-500 transition-all">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="btn-clean-primary px-8 py-2 text-[10px] flex items-center gap-1">
                    <span>{isLoading ? 'Subiendo...' : 'Publicar'}</span> 🚀
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Feed de Posts */}
        <div className="space-y-6">
          {posts.map((post: any) => (
            <div key={post.id} className="clean-card p-0 overflow-hidden flex group transition-all hover:border-accent/30 hover:shadow-xl">
              
              {/* Votación Lateral (Reddit Style) */}
              <div className="w-12 bg-bg-secondary flex flex-col items-center pt-6 gap-1 border-r border-border group-hover:bg-accent/5 transition-colors">
                 <button 
                  onClick={() => handleVote(post.id, 1)}
                  className={`p-2 rounded-lg transition-all ${post.user_vote == 1 ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-primary'}`}
                 >
                   <ArrowBigUp size={24} fill={post.user_vote == 1 ? "currentColor" : "none"} />
                 </button>
                 <span className={`text-xs font-black font-mono ${post.user_vote == 1 ? 'text-accent' : post.user_vote == -1 ? 'text-red-500' : 'text-text-main'}`}>
                   {(post.upvotes_count || 0) - (post.downvotes_count || 0)}
                 </span>
                 <button 
                  onClick={() => handleVote(post.id, -1)}
                  className={`p-2 rounded-lg transition-all ${post.user_vote == -1 ? 'text-red-500 bg-red-500/10' : 'text-text-muted hover:text-red-500'}`}
                 >
                   <ArrowBigDown size={24} fill={post.user_vote == -1 ? "currentColor" : "none"} />
                 </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs ${post.alias_autor ? 'bg-text-muted' : 'bg-primary'}`}>
                      {(post.alias_autor || post.nombre_completo)?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-primary uppercase">c/{post.coordinacion_destino}</span>
                         <span className="text-text-muted text-[10px]">•</span>
                         <span className="text-[10px] font-bold text-text-main">u/{post.alias_autor || post.nombre_completo}</span>
                      </div>
                      <p className="text-[8px] text-text-muted font-mono">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <p className="text-text-main/90 text-sm leading-relaxed">{post.contenido}</p>

                <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                   <button className="flex items-center gap-2 text-[9px] font-black uppercase text-text-muted hover:text-primary">
                      <MessageSquare size={14} /> {post.comentarios_count || 0} Comentarios
                   </button>
                   <button className="flex items-center gap-2 text-[9px] font-black uppercase text-text-muted hover:text-primary">
                      <Share2 size={14} /> Compartir
                   </button>
                   <div className="flex-1"></div>
                   {post.sentiment_score !== null && (
                      <div className="flex items-center gap-2 text-[7px] font-black uppercase text-text-muted opacity-40">
                         <Brain size={10} /> IA Tone: {post.sentiment_score}%
                      </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Derecha - Reglas y Info */}
      <div className="hidden lg:block space-y-6">
         <div className="clean-card p-6 bg-primary text-white border-none shadow-primary/20">
            <h5 className="text-[12px] font-black uppercase tracking-tighter mb-4">Acerca de CESA Social 🏛️</h5>
            <p className="text-[10px] leading-relaxed opacity-80 mb-6">
              El espacio oficial para el diálogo, la transparencia y la construcción de la comunidad UNISON. Tu voz cuenta.
            </p>
            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
               <div className="text-center">
                  <p className="text-sm font-black">1.2k</p>
                  <p className="text-[7px] uppercase font-bold opacity-60">Potros</p>
               </div>
               <div className="text-center">
                  <p className="text-sm font-black">45</p>
                  <p className="text-[7px] uppercase font-bold opacity-60">En Línea</p>
               </div>
            </div>
         </div>

         <div className="clean-card p-6">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6">Reglas de la Casa</h5>
            <div className="space-y-4">
               {[
                 'Ser respetuoso con todos.',
                 'No publicar SPAM institucional.',
                 'Verificar fuentes antes de postear.',
                 'Usar etiquetas correctas.'
               ].map((rule, i) => (
                 <div key={i} className="flex gap-3 items-start">
                    <span className="text-[10px] font-black text-primary">{i+1}.</span>
                    <p className="text-[9px] text-text-main/70 leading-tight">{rule}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SocialWall;
