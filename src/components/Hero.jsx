import React from 'react';

const Hero = () => {
    return (
        <section className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
            <div className="animate-fade-in">
                <span className="glass" style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '50px', 
                    fontSize: '0.8rem', 
                    fontWeight: '700', 
                    color: 'var(--accent)',
                    marginBottom: '1.5rem',
                    display: 'inline-block',
                    border: '1px solid var(--accent)'
                }}>
                    PERIODO 2026 - 2028
                </span>
                <h1 style={{ marginTop: '1rem' }}>Tu voz, nuestra <span className="gradient-text">fuerza motriz</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
                    Consejo Estudiantil de Sociedades de Alumnos de la Universidad de Sonora. 
                    Trabajamos todos los días para consolidar una representación legítima, escucharte y apoyarte.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-primary">Bolsa de Trabajo</button>
                    <button className="glass" style={{ padding: '0.8rem 1.8rem', borderRadius: '50px', fontWeight: '600', color: 'white', cursor: 'pointer' }}>
                        Contáctanos
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
