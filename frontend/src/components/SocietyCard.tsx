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
    <div className="clean-card group transition-all duration-300 md:hover:scale-[1.02] active:scale-[0.98] hover:border-[var(--accent)] shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[var(--primary)] font-extrabold text-sm tracking-widest uppercase">
          {society.Siglas || 'SA'}
        </h4>
        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
          {society.Instagram && (
            <a href={`https://instagram.com/${society.Instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-xs cursor-pointer hover:text-[var(--accent)] text-text-muted">IG</a>
          )}
          {society.Facebook && (
            <a href={society.Facebook} target="_blank" rel="noopener noreferrer" className="text-xs cursor-pointer hover:text-[var(--accent)] text-text-muted">FB</a>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-text-main mb-2 leading-tight">
        {society.Carrera}
      </h3>
      
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <p className="text-[var(--text-muted)] text-xs mb-1 uppercase font-semibold tracking-wider">Presidencia</p>
        <p className="text-text-main text-sm font-medium">{society["Presidencia Contacto"] || 'Por definir'}</p>
      </div>
    </div>
  );
};

export default SocietyCard;
