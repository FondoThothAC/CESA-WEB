import React from 'react';

const Hero = () => {
    return (
        <section className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
            <div className="animate-fade-in">
                <h1>Directorio de Sociedades de <span className="gradient-text">Alumnos</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                    Conoce a las mesas directivas que representan a la comunidad búho de la Universidad de Sonora. 
                    Liderazgo, gestión y compromiso estudiantil.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-primary">Explorar Facultades</button>
                    <button className="glass" style={{ padding: '0.8rem 1.8rem', borderRadius: '50px', fontWeight: '600', color: 'white', cursor: 'pointer' }}>
                        Ver CESA Central
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
