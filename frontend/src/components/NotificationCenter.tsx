'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function NotificationCenter() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/notificaciones.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.notifications) ? data.notifications : [];
        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.leido).length);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const markRead = async (id?: number) => {
    try {
      await fetch(`${API_URL}/notificaciones.php`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'mark_read', id })
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking read", err);
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
        onClick={() => setIsOpen(!isOpen)}
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
            <h3 className="font-bold text-white uppercase text-[10px] tracking-widest opacity-60">Notificaciones</h3>
            <span className="text-[10px] text-indigo-400 font-black">CESA 2026</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs italic">Sin novedades institucionales</div>
            ) : (
              notifications.map(n => (
                <div 
                    key={n.id} 
                    onClick={() => markRead(n.id)}
                    className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-all cursor-pointer ${!n.leido ? 'bg-indigo-500/5' : ''}`}
                >
                  <p className={`text-xs ${!n.leido ? 'text-white font-bold' : 'text-slate-400'}`}>{n.mensaje}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter">{n.tipo}</span>
                    <span className="text-[9px] text-slate-600 italic">{n.time_ago}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 bg-slate-800/30 text-center">
            <button onClick={() => markRead()} className="text-[10px] uppercase font-black text-slate-500 hover:text-white transition-all">Limpiar panel</button>
          </div>
        </div>
      )}
    </div>
  );
}
