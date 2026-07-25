'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  useEffect(() => {
    if (token) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // Polling cada 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications.php?action=mis_notificaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("Error cargando notificaciones", e);
    }
  };

  const markAsRead = async (id?: number) => {
    try {
      await fetch(`${API_URL}/notifications.php?action=mark_read`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative"
      >
        <i className="fas fa-bell text-white/70"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[9px] font-black animate-pulse shadow-lg shadow-indigo-500/50 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute bottom-14 right-0 w-80 bg-[#0f172a] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden glass" style={{zIndex: 9999}}>
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <h3 className="text-white text-sm font-black uppercase tracking-widest">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()}
                className="text-[9px] uppercase font-bold text-indigo-400 hover:text-white"
              >
                Marcar todas leídas
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <i className="fas fa-box-open text-white/20 text-3xl mb-3"></i>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.leida ? 'bg-indigo-900/20' : ''}`}
                  onClick={() => { if(!n.leida) markAsRead(n.id); }}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.tipo === 'success' ? 'bg-emerald-500/20 text-emerald-400' : n.tipo === 'alert' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      <i className={`fas ${n.tipo === 'success' ? 'fa-check' : n.tipo === 'alert' ? 'fa-exclamation' : 'fa-info'}`}></i>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs">{n.titulo}</h4>
                      <p className="text-white/60 text-[10px] mt-1 leading-snug">{n.mensaje}</p>
                      <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest mt-2 block">{n.time_ago}</span>
                    </div>
                    {!n.leida && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
