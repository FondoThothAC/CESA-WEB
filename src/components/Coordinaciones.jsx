import React from 'react';

const coordinaciones = [
  { id: "integral", name: "INTEGRAL", description: "Salud Física y Mental" },
  { id: "la_red", name: "LA RED", description: "Mujeres Universitarias" },
  { id: "librx", name: "LIBRX", description: "Diversidad Estudiantil" },
  { id: "raices", name: "RAÍCES", description: "Pueblos Originarios" },
  { id: "impulso", name: "IMPULSO", description: "Emprendimiento" },
  { id: "humano", name: "HUMANO", description: "Escuela de Liderazgo" }
];

const Coordinaciones = () => {
  return (
    <section className="container" style={{ paddingBottom: '6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Nuevas <span className="gradient-text">Coordinaciones</span></h2>
        <p style={{ color: 'var(--text-muted)' }}>Áreas especializadas para el desarrollo integral del estudiante.</p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {coordinaciones.map((coord) => (
          <div key={coord.id} className="glass" style={{ 
            padding: '2rem', 
            textAlign: 'center',
            transition: 'transform 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h4 style={{ 
              color: 'var(--primary)', 
              fontSize: '1.3rem', 
              letterSpacing: '2px', 
              marginBottom: '0.8rem',
              fontWeight: '800'
            }}>
              {coord.name}
            </h4>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{coord.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Coordinaciones;
