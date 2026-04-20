'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function NotificationCenter() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      // Por ahora simulamos notificaciones basadas en el historial del chatbot y reportes
      // En producción esto conectaría a api/notifications.php
      const mockNotifs = [
        { id: 1, text: "Tu post en el muro social tiene un nuevo comentario.", type: "social", time: "Hace 5m" },
        { id: 2, text: "Bolsa de Trabajo: Hay 3 nuevas vacantes de TI.", type: "job", time: "Hace 1h" },
        { id: 3, text: "OWL: Tu reporte #452 ha sido recibido.", type: "bot", time: "Hace 2h" }
      ];
      setNotifications(mockNotifs);
      setUnreadCount(mockNotifs.length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // 1 min poll
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); setUnreadCount(0); }}
        className="relative p-2 bg-slate-800 rounded-xl border border-slate-700 hover:border-indigo-500 transition-all text-slate-400 hover:text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white">Notificaciones</h3>
            <span className="text-[10px] text-slate-500 uppercase">Institucional</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm italic">Sin notificaciones pendientes</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-all cursor-pointer">
                  <p className="text-sm text-slate-300">{n.text}</p>
                  <span className="text-[10px] text-indigo-400 mt-2 block">{n.time}</span>
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-slate-800/30 text-center">
            <button className="text-xs text-slate-400 hover:text-white transition-all">Marcar todo como leído</button>
          </div>
        </div>
      )}
    </div>
  );
}
