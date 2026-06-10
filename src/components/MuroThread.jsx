import React, { useState } from 'react';

const Comment = ({ comment, onReply, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className={`comment-thread ${depth > 0 ? 'ml-6 border-l border-white/5 pl-4 mt-4' : 'mt-6'}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
          {comment.autor_nombre?.charAt(0) || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white/90">{comment.autor_nombre}</span>
            <span className="text-[10px] text-white/30 font-mono italic">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{comment.contenido}</p>
          
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-[10px] uppercase tracking-widest font-black text-indigo-400 hover:text-white transition-all"
            >
              Responder
            </button>
            <span className="text-[10px] text-white/20 flex items-center gap-1">
              <i className="far fa-heart"></i> {comment.likes_count || 0}
            </span>
          </div>

          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none focus:border-indigo-500 transition-all"
                autoFocus
              />
              <button 
                onClick={handleReplySubmit}
                className="bg-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase"
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.respuestas && comment.respuestas.length > 0 && (
        <div className="replies-container">
          {comment.respuestas.map(reply => (
            <Comment key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const MuroThread = ({ post, onAddComment }) => {
  return (
    <div className="glass-panel p-6 mb-6 animate-fadeIn">
      {/* Post Header */}
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/20">
          {(post.alias_autor || post.nombre_completo || 'U')[0]}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white/90">
                {post.alias_autor || post.nombre_completo}
                {post.alias_autor && <span className="ml-2 text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-indigo-300">Anónimo</span>}
              </h3>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-wider">
                {post.coordinacion_destino} • {new Date(post.created_at).toLocaleTimeString()}
              </p>
            </div>
            {post.destacada && (
              <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md font-black uppercase tracking-tighter">Destacado</span>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        <p className="text-white/80 leading-relaxed text-sm lg:text-base">{post.contenido}</p>
        
        {/* Link Preview */}
        {post.link_preview && (
          <a 
            href={post.url_externa} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.01] duration-300"
          >
            <div className="flex flex-col sm:flex-row">
              {post.link_preview.image && (
                <div className="sm:w-32 h-32 sm:h-auto overflow-hidden">
                  <img src={post.link_preview.image} alt="Preview" className="w-full h-full object-cover opacity-80" />
                </div>
              )}
              <div className="p-4 flex-1">
                <h4 className="text-xs font-bold text-indigo-300 mb-1 line-clamp-1">{post.link_preview.title}</h4>
                <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">{post.link_preview.description}</p>
                <span className="text-[9px] font-mono text-white/20 mt-2 block italic">{post.link_preview.domain}</span>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-6 mt-6 pt-6 border-t border-white/5">
        <button className="flex items-center gap-2 text-white/40 hover:text-red-500 transition-all text-xs group">
          <div className={`p-2 rounded-xl group-hover:bg-red-500/10 transition-all ${post.me_gusta ? 'text-red-500 bg-red-500/10' : ''}`}>
            <i className="fas fa-heart"></i>
          </div>
          <span className="font-bold">{post.likes_count}</span>
        </button>
        <button className="flex items-center gap-2 text-white/40 hover:text-indigo-400 transition-all text-xs group">
          <div className="p-2 rounded-xl group-hover:bg-indigo-400/10 transition-all">
            <i className="fas fa-comment"></i>
          </div>
          <span className="font-bold">{post.comentarios_count}</span>
        </button>
        <button className="flex items-center gap-2 text-white/40 hover:text-green-500 transition-all text-xs group ml-auto">
          <div className="p-2 rounded-xl group-hover:bg-green-500/10 transition-all">
            <i className="fas fa-share-alt"></i>
          </div>
        </button>
      </div>

      {/* Threaded Comments Container */}
      <div className="mt-8 space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5 pb-2">Hilo de Discusión</h4>
        {post.comentarios && post.comentarios.length > 0 ? (
          post.comentarios.map(comment => (
            <Comment key={comment.id} comment={comment} onReply={onAddComment} />
          ))
        ) : (
          <p className="text-[10px] text-white/20 italic py-4">No hay comentarios aún. ¡Sé el primero!</p>
        )}
      </div>
    </div>
  );
};

export default MuroThread;
