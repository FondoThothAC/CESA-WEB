'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function ChatInterface() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  const welcomeMessage = {
    role: 'bot',
    text: `¡Hola, ${user?.nombre || user?.nombre_completo?.split(' ')[0] || 'Estudiante'}! Soy Bob. 🦉\n\nPuedo ayudarte a calcular tu semestre real por créditos, encontrar negocios en el mapa o ver la bolsa de trabajo. También puedo enviar mensajes privados o delegar tareas por ti. ¿Qué necesitas hoy?`,
    timestamp: new Date().toLocaleTimeString()
  };

  useEffect(() => {
    setMessages([welcomeMessage]);
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, text?: string) => {
    if (e) e.preventDefault();
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg = { role: 'user', text: messageText, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let lat: number | null = null;
    let lon: number | null = null;

    if (navigator.geolocation) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            resolve();
          },
          () => {
            resolve();
          },
          { timeout: 1000 }
        );
      });
    }

    try {
      const res = await fetch(`${API_URL}/chat.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ message: messageText, lat, lon })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: data.response, 
          action: data.action, 
          url: data.url,
          timestamp: new Date().toLocaleTimeString() 
        }]);

        if (data.action === 'redirect' && data.url) {
          setTimeout(() => {
            window.location.href = data.url;
          }, 3000);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error de conexión. Intenta de nuevo. 🦉', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "🎓 Mi semestre real",
    "📍 Mapa del Bazar",
    "📋 Bolsa de trabajo",
    "🗣️ Hacer un reporte",
  ];

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all">
      {/* Header */}
      <div className="p-6 bg-slate-800/20 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30">🦉</div>
          <div>
            <h3 className="font-black text-white uppercase tracking-tighter">Asistente CESA (Bob)</h3>
            <p className="text-[9px] text-green-400 font-black tracking-widest uppercase flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               En línea
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/20 font-medium' 
              : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className="mt-2 text-[8px] uppercase font-black opacity-30 text-right tracking-widest">{m.timestamp}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1.5">
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Wrapper */}
      <div className="px-6 py-2 flex gap-3 overflow-x-auto no-scrollbar mask-fade-edges">
        {suggestions.map(s => (
          <button 
            key={s}
            onClick={() => handleSend(undefined, s)}
            className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-6 bg-black/20 border-t border-white/5">
        <div className="relative group">
          <input 
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
            placeholder="Pregúntame algo sobre la UNISON..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="absolute right-2 top-2 w-10 h-10 bg-indigo-600 hover:bg-white hover:text-black rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90 group-focus-within:shadow-indigo-600/30">
             <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </form>
    </div>
  );
}
