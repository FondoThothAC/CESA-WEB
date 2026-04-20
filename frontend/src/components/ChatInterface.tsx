'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  provider?: string;
  latency?: number;
}

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: '¡Hola! Soy CESA Bot 🤖. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Intentar conectar con el backend PHP local
      const response = await fetch('http://localhost:8000/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: data.response,
          provider: data.provider,
          latency: data.latency_ms
        }]);
      } else {
        throw new Error(data.error || 'Error en la IA');
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Lo siento, no pude conectar con el servidor de IA local. Verifica que el backend PHP esté corriendo en el puerto 8000.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Botón Flotante */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-[var(--primary)] shadow-2xl flex items-center justify-center text-3xl animate-bounce hover:scale-110 transition-transform"
        >
          💬
        </button>
      )}

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="glass w-[380px] h-[500px] flex flex-col overflow-hidden shadow-2xl border-[var(--primary)]">
          {/* Header */}
          <div className="bg-[var(--primary)] p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-white font-bold text-sm">CESA Bot</h3>
                <p className="text-white/70 text-[10px] uppercase tracking-widest">Inferencia Híbrida v3.5</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">✕</button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-white/10 text-white/90 border border-white/5'
                }`}>
                  {msg.content}
                  {msg.provider && (
                    <div className="mt-2 pt-1 border-t border-white/10 text-[9px] opacity-40 flex justify-between">
                      <span>Procesado vía: {msg.provider.toUpperCase()}</span>
                      <span>{msg.latency}ms</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-3 rounded-2xl animate-pulse text-xs opacity-50">
                  Pensando...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu duda aquí..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
              />
              <button 
                onClick={handleSend}
                className="bg-[var(--primary)] px-4 rounded-xl hover:brightness-110 transition-all"
              >
                🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
