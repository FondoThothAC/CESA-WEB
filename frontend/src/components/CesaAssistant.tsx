"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function CesaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy el Asistente CESA. ¿En qué te puedo ayudar hoy con el Directorio y Vinculación Estudiantil?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Si abrimos por primera vez, asegurar el scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error('Error de red');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: 'El servicio está saturado. Verifica tu conexión e intenta en un momento.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-28 md:bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[30rem] bg-cesa-card dark:bg-navy-dark border border-cesa-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-navy p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-gold" />
              <span className="font-semibold font-sans">Asistente CESA</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gold transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cesa-bg/50 dark:bg-navy-dark/90 backdrop-blur-sm">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-navy text-white rounded-br-none' 
                    : msg.role === 'system'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-white dark:bg-slate-800 border border-cesa-border shadow-sm rounded-bl-none text-slate-700 dark:text-slate-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-cesa-border p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-slow"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-slow" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse-slow" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-cesa-border">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre el directorio, becas..."
                className="w-full bg-cesa-bg dark:bg-slate-800 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-navy border border-transparent focus:border-navy transition-all"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 bg-gold hover:bg-gold-dark disabled:bg-slate-300 text-white rounded-full transition-colors"
                aria-label="Enviar mensaje"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-300 bg-navy hover:bg-navy-light text-white p-4 rounded-full shadow-[0_8px_30px_rgb(30,58,138,0.3)] flex items-center justify-center animate-pulse-slow group`}
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
