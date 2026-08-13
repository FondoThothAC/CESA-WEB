'use client';

import React from 'react';
import { X, Shield, Book, Award, Users, Lock, CheckCircle, FileText, HelpCircle, Phone, Mail } from 'lucide-react';

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
        return 'Aviso de Privacidad Integral';
      case 'reglamento':
        return 'Reglamento General';
      case 'vinculacion':
        return 'Comités de Vinculación';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 transition-all duration-300">
      {/* Cierre al dar clic en el fondo */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0d12]/95 border border-[#C5A059]/30 rounded-[32px] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(197,160,89,0.15)] animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#C5A059]/20 bg-gradient-to-r from-[#002147]/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              {type === 'privacidad' && <Shield className="w-5 h-5" />}
              {type === 'reglamento' && <Book className="w-5 h-5" />}
              {type === 'vinculacion' && <Users className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">{getTitle()}</h3>
              <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest">Consejo Estudiantil de Sociedades de Alumnos • UNISON</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-[#C5A059]/10 hover:border-[#C5A059]/30 transition-all flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Contenido */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
          
          {/* AVISO DE PRIVACIDAD INTEGRAL */}
          {type === 'privacidad' && (
            <div className="space-y-6 font-medium">
              
              {/* Resumen Ejecutivo Destacado */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 flex flex-col md:flex-row gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-white uppercase text-xs tracking-wider mb-1">
                    Compromiso Institucional de Protección de Datos Personales (CBIT-01)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    El <strong>Consejo Estudiantil de Sociedades de Alumnos (CESA UNISON)</strong> opera esta plataforma digital bajo los más estrictos estándares de seguridad, confidencialidad y ética digital, en cumplimiento con la <em>Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados</em> y la normativa universitaria de la Universidad de Sonora.
                  </p>
                </div>
              </div>

              <div className="space-y-6 text-xs md:text-sm text-slate-300">
                
                {/* 1. Responsable */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-1">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">1. Identidad y Domicilio del Responsable</h5>
                  <p>
                    El <strong>Consejo Estudiantil de Sociedades de Alumnos (CESA)</strong>, con sede en el Campus Hermosillo de la Universidad de Sonora (Blvd. Luis Encinas y Rosales S/N, Col. Centro, C.P. 83000, Hermosillo, Sonora, México), es el responsable del tratamiento, uso y resguardo de los datos personales recabados en este portal web y sus servicios conexos.
                  </p>
                </div>

                {/* 2. Datos Recabados */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-2">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">2. Datos Personales que se Recaban</h5>
                  <p>Para la prestación de los servicios digitales universitarios, se recaban las siguientes categorías de datos:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li><strong>Datos de Identificación y Acceso:</strong> Nombre completo, correo institucional (<code>@unison.mx</code> o <code>@fondothoth.com</code>), número de expediente/matrícula estudiantil, Clave Única de Registro de Población (CURP) y fotografía de perfil (opcional).</li>
                    <li><strong>Datos de Contacto:</strong> Número de teléfono celular (utilizado como factor de doble autenticación e inicio de sesión sin contraseña).</li>
                    <li><strong>Datos Académicos:</strong> Licenciatura o posgrado cursado, semestre calculado, créditos acumulados y estado de trayectoria académica.</li>
                    <li><strong>Datos de Competencias y Evaluaciones:</strong> Respuestas y resultados de pruebas psicométricas, diagnósticos vocacionales y certificaciones digitales de habilidades (CBIT-01).</li>
                    <li><strong>Datos de Emprendimiento (Bazar):</strong> Nombre comercial del emprendimiento, descripción de productos y ubicación asignada de stand dentro del campus.</li>
                  </ul>
                </div>

                {/* 3. Finalidades del Tratamiento */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-2">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">3. Finalidades del Tratamiento de Datos</h5>
                  <p><strong>Finalidades Primarias (Necesarias para el servicio):</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>Autenticar de manera fehaciente la identidad del estudiante como alumno regular de la Universidad de Sonora.</li>
                    <li>Generar el Carnet y Credencial Digital institucional con código QR dinámico y hash criptográfico verificable.</li>
                    <li>Validar el padrón electoral estudiantil para garantizar votaciones electrónicas democráticas, únicas, transparentes y libres de duplicidad.</li>
                    <li>Emitir constancias y micro-credenciales de competencias digitales con identificador UUID único.</li>
                    <li>Gestionar reservas de puestos físicos en las ediciones oficiales del Bazar Emprendedor CESA.</li>
                    <li>Permitir la postulación transparente a vacantes de prácticas profesionales y bolsa de trabajo.</li>
                  </ul>
                  <p className="mt-2"><strong>Finalidades Secundarias (Estadísticas y Mejora Comunitaria):</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>Generar indicadores globales y agregados de rendimiento y sentimiento estudiantil sin vincular perfiles individuales.</li>
                    <li>Notificar sobre convocatorias, becas, eventos académicos y actividades de las Sociedades de Alumnos.</li>
                  </ul>
                </div>

                {/* 4. Anonimato y Voto Secreto */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-2">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">4. Mecanismos de Anonimato y Urna Digital Cifrada</h5>
                  <p>
                    <strong>Buzón de Reportes Anónimos:</strong> Cuenta con una arquitectura de privacidad en capas que remueve automáticamente la dirección IP de origen, huella del navegador y metadatos del estudiante emisor antes de almacenar la denuncia.
                  </p>
                  <p>
                    <strong>Votaciones Electrónicas Seguras:</strong> El sistema emplea un algoritmo de cifrado asimétrico/determinista (AES-256) que desvincula la identidad del votante de la opción elegida. Una vez emitido el voto, se registra un token criptográfico que impide votos duplicados garantizando el secreto universal del sufragio.
                  </p>
                </div>

                {/* 5. Transferencias de Datos */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-1">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">5. Transferencia de Datos a Terceros</h5>
                  <p>
                    El CESA <strong>no vende, renta ni comercializa</strong> tus datos personales con terceros. Los datos de contacto y CV solo serán compartidos con empresas y empleadores cuando el estudiante decida voluntariamente enviar su postulación a una vacante en la Bolsa de Trabajo.
                  </p>
                </div>

                {/* 6. Derechos ARCO */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-2">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">6. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h5>
                  <p>
                    Tienes el derecho inalienable de conocer qué datos personales tenemos registrados, rectificarlos en caso de ser inexactos, solicitar su cancelación definitiva de nuestras bases de datos u oponerte al tratamiento de los mismos.
                  </p>
                  <p>
                    Para ejercer tus derechos ARCO, puedes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>Actualizar tus datos directamente en la pestaña <strong>Expediente / Perfil</strong> de este portal.</li>
                    <li>Enviar una solicitud formal al correo oficial de la Mesa Directiva: <code className="text-[#C5A059]">privacidad@cesaunison.fondothoth.com</code> indicando tu nombre, expediente y derecho que deseas ejercer.</li>
                  </ul>
                </div>

                {/* 7. Seguridad Tecnológica */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-1">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">7. Medidas de Seguridad Tecnológica</h5>
                  <p>
                    Toda la comunicación entre tu navegador y nuestros servidores viaja cifrada mediante certificados SSL/TLS 1.3 de alta graduación. Las contraseñas se almacenan procesadas mediante algoritmos de derivación de claves criptográficas Bcrypt (factor de costo 12) y las sesiones se protegen mediante JSON Web Tokens (JWT) con firma criptográfica.
                  </p>
                </div>

                {/* 8. Actualizaciones */}
                <div className="border-l-2 border-[#C5A059] pl-4 space-y-1">
                  <h5 className="font-black text-white uppercase tracking-wider text-xs">8. Modificaciones al Presente Aviso</h5>
                  <p>
                    El CESA se reserva el derecho de actualizar este aviso de privacidad ante reformas estatutarias o adición de nuevos servicios universitarios. Las modificaciones estarán siempre publicadas y accesibles en este portal web.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    Última actualización: 13 de Agosto de 2026 • Versión 4.2 CBIT Integral
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* REGLAMENTO GENERAL */}
          {type === 'reglamento' && (
            <div className="space-y-6 font-medium">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                <div className="text-2xl mt-1">📜</div>
                <div>
                  <h4 className="font-black text-white uppercase text-xs tracking-wider mb-1">Estatuto de Representación Estudiantil</h4>
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

          {/* COMITÉS DE VINCULACIÓN */}
          {type === 'vinculacion' && (
            <div className="space-y-6">
              <p className="text-slate-400 text-xs md:text-sm font-medium">
                Conoce los comités y áreas de trabajo que conforman el <strong>Consejo Estudiantil de Sociedades de Alumnos (CESA)</strong>. A través de ellos impulsamos el liderazgo, la inclusión, la diversidad y el talento de la comunidad estudiantil.
              </p>

              {/* Cuadrícula de Comités */}
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

        {/* Pie del Modal */}
        <div className="px-6 py-4 border-t border-[#C5A059]/20 bg-black/40 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 font-mono">
            CESA UNISON • Plataforma Institucional Segura
          </p>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-[#C5A059]/20 hover:border-[#C5A059]/40 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
