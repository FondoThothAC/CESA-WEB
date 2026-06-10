'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import { 
  Search, 
  Send, 
  User, 
  Bot, 
  MoreVertical, 
  Phone, 
  Video,
  CheckCheck,
  Sparkles,
  Mail
} from 'lucide-react';

interface Message {
  id: number;
  emisor_id: number;
  receptor_id: number;
  contenido: string;
  created_at: string;
  is_ai?: boolean;
}

interface ChatThread {
  id: number | 'ai';
  nombre: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isOnline?: boolean;
  avatar?: string;
  is_ai?: boolean;
}

const Inbox = () => {
  const { user, token } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatThread | null>({
    id: 'ai',
    nombre: 'Asistente IA CESA',
    lastMessage: '¿En qué puedo ayudarte hoy?',
    time: 'Ahora',
    isOnline: true,
    is_ai: true
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [threads, setThreads] = useState<ChatThread[]>([
    { id: 'ai', nombre: 'Asistente IA CESA', lastMessage: 'Hola Potro, ¿cómo va tu semestre?', time: 'Ahora', isOnline: true, is_ai: true },
    { id: 2, nombre: 'Coordinación Integral', lastMessage: 'Tu reporte ha sido recibido.', time: '14:20', isOnline: true },
    { id: 3, nombre: 'Bolsa de Trabajo', lastMessage: 'Hay nuevas vacantes para ti.', time: 'Ayer' },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      emisor_id: user?.id || 0,
      receptor_id: typeof activeChat?.id === 'number' ? activeChat.id : 0,
      contenido: newMessage,
      created_at: new Date().toISOString(),
      is_ai: false
    };

    setMessages([...messages, userMsg]);
    setNewMessage('');

    if (activeChat?.is_ai) {
      // Lógica de IA
      try {
        const res = await fetch(`${API_URL}/chat.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage })
        });
        const data = await res.json();
        if (data.success) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            emisor_id: 0,
            receptor_id: user?.id || 0,
            contenido: data.response,
            created_at: new Date().toISOString(),
            is_ai: true
          }]);
        }
      } catch (e) {
        console.error("Error IA", e);
      }
    } else {
      // Lógica P2P (Implementar backend en paso siguiente)
      console.log("Enviando a humano:", activeChat?.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[700px] flex clean-card p-0 overflow-hidden shadow-2xl border-border/50">
      
      {/* Sidebar - Threads */}
      <div className="w-80 border-r border-border bg-bg-secondary flex flex-col">
        <div className="p-6 border-b border-border bg-bg-primary">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-main mb-4">Mis Mensajes</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input 
              type="text" 
              placeholder="Buscar chats..." 
              className="w-full bg-bg-secondary border border-border rounded-xl py-2 pl-10 pr-4 text-[10px] outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.map(thread => (
            <div 
              key={thread.id}
              onClick={() => setActiveChat(thread)}
              className={`p-4 flex gap-4 cursor-pointer transition-all border-b border-border/30 hover:bg-bg-primary group ${activeChat?.id === thread.id ? 'bg-bg-primary border-l-4 border-l-primary shadow-inner' : ''}`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${thread.is_ai ? 'bg-primary text-white' : 'bg-accent/20 text-accent'}`}>
                  {thread.is_ai ? <Bot size={20} /> : <User size={20} />}
                </div>
                {thread.isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-bg-secondary rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[10px] font-black uppercase truncate text-text-main">{thread.nombre}</h4>
                  <span className="text-[8px] text-text-muted font-mono">{thread.time}</span>
                </div>
                <p className="text-[9px] text-text-muted truncate leading-relaxed group-hover:text-text-main transition-colors">
                  {thread.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-bg-primary">
          {/* Header */}
          <div className="p-6 border-b border-border flex justify-between items-center bg-bg-primary/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeChat.is_ai ? 'bg-primary text-white' : 'bg-accent/20 text-accent'}`}>
                {activeChat.is_ai ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                  {activeChat.nombre}
                  {activeChat.is_ai && <Sparkles size={10} className="text-accent animate-pulse" />}
                </h3>
                <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">En línea</span>
              </div>
            </div>
            <div className="flex gap-4 text-text-muted">
              <button className="hover:text-primary transition-all"><Phone size={18} /></button>
              <button className="hover:text-primary transition-all"><Video size={18} /></button>
              <button className="hover:text-primary transition-all"><MoreVertical size={18} /></button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[url('/grid-subtle.png')] bg-repeat">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center">
                  <Mail size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Inicia una conversación industrial</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.emisor_id === user?.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
              >
                <div className={`max-w-[70%] p-4 rounded-3xl text-sm shadow-xl ${msg.emisor_id === user?.id ? 'bg-primary text-white rounded-br-none' : 'bg-bg-secondary text-text-main border border-border rounded-bl-none'}`}>
                  <p className="leading-relaxed">{msg.contenido}</p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-[8px] opacity-40 font-mono italic">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.emisor_id === user?.id && <CheckCheck size={10} className="opacity-40" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border bg-bg-secondary/50">
            <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Escribe un mensaje a ${activeChat.nombre}...`}
                className="flex-1 bg-bg-primary border border-border rounded-2xl px-6 py-4 text-xs text-text-main focus:outline-none focus:border-primary shadow-inner"
              />
              <button 
                type="submit"
                className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl md:hover:bg-accent md:hover:scale-105 transition-all active:scale-95"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary opacity-20">
           <Mail size={64} className="mb-6" />
           <p className="text-xs font-black uppercase tracking-widest">Selecciona un chat para comenzar</p>
        </div>
      )}
    </div>
  );
};

export default Inbox;
