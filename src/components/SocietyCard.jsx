import React from 'react';

const SocietyCard = ({ society }) => {
  const { Carrera, Siglas, Instagram, Presidente, "Estatus Renovacion": Estatus } = society;
  
  return (
    <div className="glass society-card animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, var(--primary), #1a2a44)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: '800',
          color: 'var(--accent)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {Siglas ? Siglas.substring(0, 3) : "🎓"}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{Carrera}</h3>
          <span style={{ 
            fontSize: '0.75rem', 
            background: 'rgba(26, 115, 232, 0.1)', 
            color: 'var(--primary)', 
            padding: '2px 8px', 
            borderRadius: '4px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {Siglas || "CESA"}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong style={{ color: 'var(--text-main)' }}>Presidencia:</strong> {Presidente || "Vacante / En gestión"}
        </p>
        <p style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-main)' }}>Estatus:</strong> {Estatus}
        </p>
      </div>

      {Instagram && (
        <a 
          href={`https://instagram.com/${Instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          <span>📸</span> Seguir en Instagram
        </a>
      )}
    </div>
  );
};

export default SocietyCard;
