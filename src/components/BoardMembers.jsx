import React from 'react';

const members = [
  { name: "Ángela Carrasco Ibarra", role: "Presidenta" },
  { name: "Arturo Zamorano Córdova", role: "Coord. General" },
  { name: "Sherlyn A. Noriega González", role: "Tesorera" }
];

const BoardMembers = () => {
  return (
    <section className="container" style={{ paddingBottom: '6rem' }}>
      <div className="glass" style={{ padding: '3rem', borderRadius: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Mesa <span className="gradient-text">Directiva</span></h2>
          <p style={{ color: 'var(--text-muted)' }}>Liderazgo comprometido con la comunidad estudiantil.</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          {members.map((member, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '4px solid rgba(255,255,255,0.1)'
              }}>
                👤
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{member.name}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoardMembers;
