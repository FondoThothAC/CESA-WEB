import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import SocietyCard from './components/SocietyCard';
import BoardMembers from './components/BoardMembers';
import Coordinaciones from './components/Coordinaciones';
import directorioData from './data/directorio.json';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directorio');
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);

  useEffect(() => {
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
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>
          {['Directorio', 'Muro', 'Bazar', 'Empleos'].map((tab) => (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              style={{ 
                cursor: 'pointer', 
                color: activeTab === tab.toLowerCase() ? 'var(--text-main)' : 'inherit',
                transition: 'color 0.3s'
              }}
            >
              {tab}
            </span>
          ))}
          <span style={{ cursor: 'pointer', background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px' }}>Ingresar</span>
        </div>
      </nav>

      <Hero />

      {activeTab === 'directorio' && (
        <>
          <BoardMembers />
          <Coordinaciones />
          
          <main className="container" id="directorio" style={{ paddingBottom: '8rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Directorio de <span className="gradient-text">Sociedades</span></h2>
              <p style={{ color: 'var(--text-muted)' }}>Localiza la representación estudiantil de tu licenciatura.</p>
            </div>

            <div className="glass" style={{ 
              padding: '1.5rem', 
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
                  placeholder="Buscar carrera o siglas (ej: Civil, SEVET)..." 
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
            </div>

            <div className="directory-grid">
              {filteredSocieties.map((society, index) => (
                <SocietyCard key={index} society={society} />
              ))}
            </div>
          </main>
        </>
      )}

      {activeTab !== 'directorio' && (
        <section className="container" style={{ padding: '4rem 0', textAlign: 'center', minHeight: '40vh' }}>
          <div className="glass" style={{ padding: '4rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Módulo de {activeTab.toUpperCase()}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Este módulo está siendo habilitado para el periodo 2026-2028.</p>
            <div style={{ marginTop: '2rem', fontSize: '3rem' }}>🚧</div>
          </div>
        </section>
      )}

      <footer style={{ 
        borderTop: '1px solid var(--border)', 
        padding: '4rem 0', 
        background: 'rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
             <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-main)' }}>CESA</span>
             <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--primary)' }}>UNISON</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            © 2026 Consejo Estudiantil de Sociedades de Alumnos - UNISON
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
             <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Aviso de Privacidad</a>
             <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Reglamento</a>
             <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Contacto</a>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.3 }}>
            Desarrollado con metodología Spec-Driven Development (SDD) v1.1
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
