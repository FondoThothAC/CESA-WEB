'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function ChatInterface() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = {
    role: 'bot',
    text: `¡Hola, ${user?.nombre.split(' ')[0]}! Soy CESA Bot. 🦉\n\nPuedo ayudarte con la Bolsa de Trabajo, el Bazar, Reportes y más. ¿Qué necesitas hoy?`,
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

    try {
      const res = await fetch('http://localhost:8000/api/chat.php', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ message: messageText })
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
    "📋 Bolsa de trabajo",
    "🗣️ Hacer un reporte",
    "🛒 Bazar Emprendedor",
    "🎓 Buscar colegas"
  ];

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">🦉</div>
          <div>
            <h3 className="font-bold text-white">CESA Bot</h3>
            <p className="text-[10px] text-green-400 font-mono tracking-widest uppercase">● En línea</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' 
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none shadow-md'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className="mt-1 text-[10px] opacity-40 text-right">{m.timestamp}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex gap-1 animate-pulse">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar outline-none">
        {suggestions.map(s => (
          <button 
            key={s}
            onClick={() => handleSend(undefined, s)}
            className="whitespace-nowrap px-3 py-1 bg-slate-800 hover:bg-indigo-900/50 border border-slate-700 rounded-full text-xs text-slate-400 hover:text-white transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-slate-800/30 border-t border-slate-700">
        <div className="relative">
          <input 
            type="text"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
            placeholder="Pregúntame algo..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="absolute right-2 top-1.5 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95">
             <span className="sr-only">Enviar</span>
             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
}
