import React from 'react';
import Link from 'next/link';
import { Landmark, GraduationCap, Users, MapPin } from 'lucide-react';

const Hero = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
    return (
        <section className="container mx-auto pt-20 pb-24 text-center px-8 relative z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full -z-10"></div>
            
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                {/* Logo CESA */}
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-white overflow-hidden flex items-center justify-center shadow-2xl border border-border">
                        <img src="/logo-cesa.jpg" alt="Logo CESA UNISON" className="w-full h-full object-cover" onError={(e) => {
                            // Fallback si la imagen no carga
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<span style="font-size:48px">🦉</span>';
                        }} />
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary border border-border text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8 backdrop-blur-sm shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    Gestión Institucional 2026 - 2028
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] uppercase tracking-[-0.04em] text-text-main drop-shadow-sm">
                    Tu voz, nuestra <br />
                    <span className="text-accent italic">fuerza motriz</span>
                </h1>
                
                <p className="text-text-muted text-base md:text-xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed px-4">
                    Elevando el estándar de la representación estudiantil en la Universidad de Sonora 
                    a través de la <span className="text-primary font-bold">industrialización digital</span> y la transparencia absoluta.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center items-center">
                    <Link href="/mapa/" className="btn-clean-primary flex items-center gap-3 group text-[10px] font-black uppercase tracking-[0.2em]">
                        Mapa 3D 🗺️
                    </Link>
                    <button onClick={() => onNavigate('empleos')} className="btn-clean-primary flex items-center gap-3 group text-[10px] font-black uppercase tracking-[0.2em]">
                        Prácticas y Bolsa de Trabajo 🚀
                    </button>
                    <button onClick={() => onNavigate('reportes')} className="btn-clean text-[10px] font-black uppercase tracking-[0.2em] bg-bg-primary/50 hover:bg-bg-secondary shadow-sm">
                        Contáctanos
                    </button>
                </div>

                {/* Institutional Partners */}
                <div className="mt-20 flex justify-center gap-12 md:gap-16 opacity-50 hover:opacity-100 transition-all duration-700">
                    <div className="text-[10px] font-black uppercase tracking-tighter flex flex-col items-center gap-2 text-text-muted">
                        <Landmark size={24} />
                        UNISON
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-tighter flex flex-col items-center gap-2 text-text-muted">
                        <Users size={24} />
                        CESA UNISON
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-tighter flex flex-col items-center gap-2 text-text-muted">
                        <GraduationCap size={24} />
                        Vinculación
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
