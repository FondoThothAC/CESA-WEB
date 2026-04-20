import React from 'react';

interface Society {
  Carrera: string;
  Siglas: string;
  "Presidencia Contacto": string;
  Instagram?: string;
  Facebook?: string;
}

const SocietyCard = ({ society }: { society: Society }) => {
  return (
    <div className="glass p-6 society-card group transition-all duration-300 hover:scale-[1.02] hover:border-[var(--primary)] shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[var(--primary)] font-extrabold text-sm tracking-widest uppercase">
          {society.Siglas || 'CESA'}
        </h4>
        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
          {society.Instagram && <span className="text-xs cursor-pointer hover:text-[var(--accent)]">IG</span>}
          {society.Facebook && <span className="text-xs cursor-pointer hover:text-[var(--accent)]">FB</span>}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 leading-tight">
        {society.Carrera}
      </h3>
      
      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <p className="text-[var(--text-muted)] text-sm mb-1 uppercase font-semibold tracking-tighter">Presidencia</p>
        <p className="text-white text-md font-medium">{society["Presidencia Contacto"] || 'Por definir'}</p>
      </div>
    </div>
  );
};

export default SocietyCard;
