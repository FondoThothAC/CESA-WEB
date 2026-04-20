'use client';

import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  nombre_completo: string;
  rol: string;
  contenido: string;
  tipo: 'aviso' | 'evento' | 'urgente' | 'comun';
  imagen_url?: string | null;
  created_at: string;
  likes: number;
}

const SocialWall = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState<'aviso' | 'evento' | 'urgente' | 'comun'>('comun');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:8000/muro.php');
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch (e) {
      console.error("Error al cargar el muro", e);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('contenido', content);
    formData.append('tipo', type);
    if (image) formData.append('imagen', image);

    try {
      const res = await fetch('http://localhost:8000/muro.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setContent('');
        setImage(null);
        setType('comun');
      }
    } catch (e) {
      alert("Error al publicar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4">
      {/* Formulario de Publicación */}
      <div className="glass p-6 mb-12 border-[var(--primary)] shadow-[0_0_20px_rgba(26,115,232,0.1)]">
        <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tighter">Comparte con la Comunidad</h3>
        <form onSubmit={handlePost}>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué está pasando en tu facultad?"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[var(--primary)] min-h-[100px] mb-4"
          />
          
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-2 outline-none"
              >
                <option value="comun">Publicación Normal</option>
                <option value="aviso">Aviso Oficial</option>
                <option value="evento">Evento Estudiantil</option>
                <option value="urgente">Urgente</option>
              </select>

              <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg transition-colors">
                📷 Imagen
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-2 py-2"
            >
              {isLoading ? 'Publicando...' : 'Publicar 🚀'}
            </button>
          </div>
          {image && <p className="mt-2 text-[10px] text-[var(--primary)]">📎 Seleccionado: {image.name}</p>}
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {posts.map((post) => (
          <div key={post.id} className="glass overflow-hidden border-white/5 group hover:border-white/10 transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center font-bold text-white">
                    {post.nombre_completo[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{post.nombre_completo}</h4>
                    <span className="text-[10px] text-[var(--primary)] uppercase tracking-widest font-black">
                      {post.rol === 'mesa_directiva' ? '👑 Mesa Directiva' : '🎓 Estudiante'}
                    </span>
                  </div>
                </div>
                {post.tipo !== 'comun' && (
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                    post.tipo === 'urgente' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                    post.tipo === 'aviso' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {post.tipo}
                  </span>
                )}
              </div>

              <p className="text-white/80 text-sm leading-relaxed mb-4">
                {post.contenido}
              </p>

              {post.imagen_url && (
                <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img 
                    src={`http://localhost:8000/${post.imagen_url}`} 
                    alt="Post" 
                    className="w-full object-cover max-h-[400px]"
                  />
                </div>
              )}

              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 text-white/50 hover:text-[var(--accent)] transition-colors text-xs font-bold">
                  <span>❤️</span> {post.likes}
                </button>
                <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold">
                  <span>💬</span> Comentar
                </button>
                <span className="ml-auto text-[10px] text-white/30">{post.created_at}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialWall;
