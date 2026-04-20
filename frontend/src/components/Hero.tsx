import React from 'react';

const Hero = () => {
    return (
        <section className="container mx-auto pt-32 pb-16 text-center px-8">
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <span className="glass px-4 py-2 rounded-full text-xs font-bold text-[var(--accent)] mb-6 inline-block border border-[var(--accent)]">
                    PERIODO 2026 - 2028
                </span>
                <h1 className="text-6xl font-extrabold mb-4 mt-4 leading-tight">
                    Tu voz, nuestra <span className="gradient-text">fuerza motriz</span>
                </h1>
                <p className="text-[var(--text-muted)] text-xl max-w-2xl mx-auto mb-10">
                    Consejo Estudiantil de Sociedades de Alumnos de la Universidad de Sonora. 
                    Trabajamos todos los días para escuchar y apoyarte.
                </p>
                <div className="flex gap-4 justify-center">
                    <button className="btn-primary">Bolsa de Trabajo</button>
                    <button className="glass px-7 py-3 font-semibold text-white/90 hover:bg-white/10 transition-colors">
                        Contáctanos
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
