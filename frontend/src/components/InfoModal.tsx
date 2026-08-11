import React from 'react';
import { X, Shield, Book, Award, Users } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  type: 'privacidad' | 'reglamento' | 'vinculacion' | null;
  onClose: () => void;
}

export default function InfoModal({ isOpen, type, onClose }: InfoModalProps) {
  if (!isOpen || !type) return null;

  const getTitle = () => {
    switch (type) {
      case 'privacidad':
        return 'Aviso de Privacidad';
      case 'reglamento':
        return 'Reglamento General';
      case 'vinculacion':
        return 'Comités de Vinculación';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 transition-all duration-300">
      {/* Backdrop Click Dismiss */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0c0d12]/95 border border-[#C5A059]/30 rounded-[32px] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(197,160,89,0.15)] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#C5A059]/20 bg-gradient-to-r from-[#002147]/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              {type === 'privacidad' && <Shield className="w-5 h-5" />}
              {type === 'reglamento' && <Book className="w-5 h-5" />}
              {type === 'vinculacion' && <Users className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">{getTitle()}</h3>
              <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest">CESA UNISON 2026-2028</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-[#C5A059]/10 hover:border-[#C5A059]/30 transition-all flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
          
          {/* PRIVACY POLICY */}
          {type === 'privacidad' && (
            <div className="space-y-6 font-medium">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                <div className="text-2xl mt-1">🛡️</div>
                <div>
                  <h4 className="font-black text-white uppercase text-xs tracking-wider mb-1">Compromiso CBIT-01</h4>
                  <p className="text-xs text-slate-400">
                    Nuestra plataforma opera bajo los estándares de auditoría de seguridad y anonimato **CBIT-01**, garantizando que tus datos personales e institucionales estén resguardados de forma cifrada en todo momento.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs md:text-sm">
                <h5 className="font-bold text-white uppercase tracking-wider text-xs">1. Información Recopilada</h5>
                <p>
                  Recopilamos únicamente tu nombre completo, correo institucional (`@unison.mx` u homólogos) y matrícula estudiantil al iniciar sesión mediante tokens de seguridad (JWT). Esto asegura la legitimidad de la representación y el acceso exclusivo a los estudiantes de la Universidad de Sonora.
                </p>

                <h5 className="font-bold text-white uppercase tracking-wider text-xs">2. Anonimato en Reportes</h5>
                <p>
                  El Buzón Digital de Reportes cuenta con un motor de privacidad que elimina la traza de direcciones IP y metadatos de los estudiantes al momento del envío. El análisis de sentimiento se procesa de forma agregada sin asociar tu perfil.
                </p>

                <h5 className="font-bold text-white uppercase tracking-wider text-xs">3. Bazar y Publicidad</h5>
                <p>
                  Los datos de geolocalización e información comercial del Bazar Estudiantil se publican únicamente bajo el consentimiento explícito de cada emprendedor registrado.
                </p>

                <h5 className="font-bold text-white uppercase tracking-wider text-xs">4. Derechos ARCO</h5>
                <p>
                  Puedes solicitar la rectificación, cancelación o eliminación total de tu cuenta y datos asociados en cualquier momento a través de la pestaña de Perfil o contactando a la Mesa Directiva de CESA.
                </p>
              </div>
            </div>
          )}

          {/* REGULATIONS */}
          {type === 'reglamento' && (
            <div className="space-y-6 font-medium">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                <div className="text-2xl mt-1">📜</div>
                <div>
                  <h4 className="font-black text-white uppercase text-xs tracking-wider mb-1">Estatuto de Representación</h4>
                  <p className="text-xs text-slate-400">
                    El CESA es el órgano de representación estudiantil democrático y legítimo ante las autoridades de la Universidad de Sonora. Este reglamento rige el uso y convivencia en nuestros espacios digitales.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs md:text-sm">
                <h5 className="font-bold text-white uppercase tracking-wider text-xs">1. Convivencia en el Muro Social</h5>
                <p>
                  El Muro Social es un espacio institucional de diálogo, crítica constructiva y organización. Queda estrictamente prohibido el discurso de odio, lenguaje ofensivo, spam comercial no autorizado o acoso digital. Las publicaciones infractoras serán moderadas por el comité del Muro.
                </p>

                <h5 className="font-bold text-white uppercase tracking-wider text-xs">2. Registro en Bazar Emprendedor</h5>
                <p>
                  Para mantener tu puesto activo en el mapa interactivo del Bazar, debes ser estudiante regular inscrito y cumplir con el reglamento de venta física en las instalaciones universitarias. No se permite la promoción de artículos ilícitos o sustancias prohibidas.
                </p>

                <h5 className="font-bold text-white uppercase tracking-wider text-xs">3. Buzón y Reportes Responsables</h5>
                <p>
                  Los reportes deben reflejar problemáticas reales de la comunidad estudiantil (infraestructura, docencia, trámites o acoso). El uso indebido o malintencionado del buzón anónimo para calumniar o saturar el sistema será evaluado por la Mesa Directiva.
                </p>
              </div>
            </div>
          )}

          {/* VINCULACIÓN (COMMITTEES GRID MATCHING CANVA IMAGES) */}
          {type === 'vinculacion' && (
            <div className="space-y-6">
              <p className="text-slate-400 text-xs md:text-sm font-medium">
                Conoce los comités y áreas de trabajo que conforman el **Consejo Estudiantil de Sociedades de Alumnos (CESA)**. A través de ellos impulsamos el liderazgo, la inclusión, la diversidad y el talento de la comunidad estudiantil.
              </p>

              {/* Committees Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* RAICES */}
                <div className="p-4 rounded-2xl bg-white/5 border border-green-500/20 hover:border-green-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-400 fill-none stroke-current" strokeWidth="1.5">
                      <path d="M12 22v-8m0 0a4 4 0 004-4V6a4 4 0 00-8 0v4a4 4 0 004 4zm-4-4a4 4 0 00-4 4m8-4a4 4 0 014 4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-green-400 text-xs uppercase tracking-wider">RAÍCES</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Comité de Pueblos Originarios</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Preservación de la cultura, apoyo y representación a estudiantes pertenecientes a comunidades indígenas.</p>
                  </div>
                </div>

                {/* LIBRX */}
                <div className="p-4 rounded-2xl bg-white/5 border border-pink-500/20 hover:border-pink-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-pink-400 fill-none stroke-current" strokeWidth="1.5">
                      <path d="M12 19V5m-7 8c2-2 5-2 7 0m0 0c2-2 5-2 7 0M5 14h14" strokeLinecap="round" />
                      <circle cx="12" cy="5" r="1" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-pink-400 text-xs uppercase tracking-wider">LIBRX</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Comité de Diversidad Estudiantil</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Promoción de la igualdad de derechos, expresión libre de identidad y libre desarrollo de la personalidad.</p>
                  </div>
                </div>

                {/* HUMANO */}
                <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/20 hover:border-amber-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-amber-400 fill-none stroke-current" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M17.64 6.36l1.42-1.42" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-amber-400 text-xs uppercase tracking-wider">HUMANO</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Comité de Inclusión Universitaria</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Accesibilidad universal, adecuaciones curriculares y apoyo continuo para estudiantes con discapacidad.</p>
                  </div>
                </div>

                {/* INTEGRAL */}
                <div className="p-4 rounded-2xl bg-white/5 border border-sky-500/20 hover:border-sky-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-sky-400 fill-none stroke-current" strokeWidth="1.5">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-sky-400 text-xs uppercase tracking-wider">INTEGRAL</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Comité de Salud Física y Mental</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Campañas de salud preventiva, brigadas médicas y atención psico-emocional gratuita estudiantil.</p>
                  </div>
                </div>

                {/* LA RED */}
                <div className="p-4 rounded-2xl bg-white/5 border border-violet-500/20 hover:border-violet-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-violet-400 fill-none stroke-current" strokeWidth="1.5">
                      <path d="M12 14a6 6 0 100-12 6 6 0 000 12zm0 0v8m-3-3h6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-violet-400 text-xs uppercase tracking-wider">LA RED</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Comité de Mujeres Universitarias</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Red de apoyo, sororidad, capacitación en perspectiva de género y canalización ante casos de violencia.</p>
                  </div>
                </div>

                {/* CONECTA-T */}
                <div className="p-4 rounded-2xl bg-white/5 border border-orange-500/20 hover:border-orange-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-400 fill-none stroke-current" strokeWidth="1.5">
                      <circle cx="12" cy="5" r="3" />
                      <circle cx="5" cy="19" r="3" />
                      <circle cx="19" cy="19" r="3" />
                      <path d="M12 8v8M5 16l5-5m9 5l-5-5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-orange-400 text-xs uppercase tracking-wider">CONECTA-T</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Comité de Vinculación Laboral</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Enlace con el sector productivo, talleres de empleabilidad, CV reviews e impulso de la Bolsa de Trabajo.</p>
                  </div>
                </div>

                {/* CRECE */}
                <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-400 fill-none stroke-current" strokeWidth="1.5">
                      <path d="m12 3-1.912 5.886H3.882l5.024 3.65-1.912 5.886 5.006-3.637 5.006 3.637-1.912-5.886 5.024-3.65h-6.206L12 3z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-indigo-400 text-xs uppercase tracking-wider">CRECE</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Escuela de Líderes Universitarios</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Capacitación en liderazgo, debates, oratoria, diseño de proyectos sociales y formación estudiantil.</p>
                  </div>
                </div>

                {/* CESA TV */}
                <div className="p-4 rounded-2xl bg-white/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-yellow-400 fill-none stroke-current" strokeWidth="1.5">
                      <rect x="2" cy="3" width="20" height="14" rx="2" />
                      <path d="m22 10-6 4v-4l6 4zM8 21h8M12 17v4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-yellow-400 text-xs uppercase tracking-wider">CESA TV</h4>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Medio de Comunicación</p>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">Cobertura audiovisual de eventos universitarios, difusión de actividades académicas e informativas.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#C5A059]/20 bg-black/40 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
