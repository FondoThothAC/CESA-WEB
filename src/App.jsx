import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import SocietyCard from './components/SocietyCard';
import directorioData from './data/directorio.json';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);

  useEffect(() => {
    // Clean data from JSON (some entries might be empty)
    const validData = directorioData.filter(item => item.Carrera && item.Carrera.trim() !== "");
    setSocieties(validData);
    setFilteredSocieties(validData);
  }, []);

  useEffect(() => {
    const results = societies.filter(s => 
      s.Carrera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.Siglas && s.Siglas.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSocieties(results);
  }, [searchTerm, societies]);

  return (
    <div className="app-wrapper">
      <nav className="glass" style={{
        position: 'fixed',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 4rem)',
        maxWidth: '1200px',
        zIndex: 1000,
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: '800', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.8rem' }}>🎓</span>
          <span style={{ color: 'var(--text-main)' }}>CESA</span>
          <span style={{ color: 'var(--primary)' }}>UNISON</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontWeight: '500' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text-main)' }}>Directorio</span>
          <span style={{ cursor: 'pointer' }}>Nosotros</span>
          <span style={{ cursor: 'pointer' }}>Transparencia</span>
        </div>
      </nav>

      <Hero />

      <main className="container" style={{ paddingBottom: '8rem' }}>
        <div className="glass" style={{ 
          padding: '2rem', 
          marginBottom: '3rem', 
          display: 'flex', 
          gap: '1.5rem', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por carrera o siglas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button className="glass" style={{ padding: '0.8rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>Todas</button>
            <button className="glass" style={{ padding: '0.8rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>Ingenierías</button>
            <button className="glass" style={{ padding: '0.8rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>Sociales</button>
          </div>
        </div>

        <div className="directory-grid">
          {filteredSocieties.map((society, index) => (
            <SocietyCard key={index} society={society} />
          ))}
          {filteredSocieties.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
              <p style={{ fontSize: '1.5rem' }}>No se encontraron sociedades para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </main>

      <footer style={{ 
        borderTop: '1px solid var(--border)', 
        padding: '4rem 0', 
        background: 'rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)' }}>
            &copy; 2026 Consejo Estudiantil de Sociedades de Alumnos - UNISON
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.3 }}>
            Desarrollado con metodología Spec-Driven Development (SDD) v2.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
