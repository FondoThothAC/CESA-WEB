'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import InfoModal from '@/components/InfoModal';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [usePassword, setUsePassword] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [curp, setCurp] = useState('');
    const [rol, setRol] = useState('estudiante');
    const [carrera, setCarrera] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeModal, setActiveModal] = useState<'privacidad' | 'reglamento' | 'vinculacion' | null>(null);
    
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);

        try {
            if (isLogin) {
                const val = password || telefono;
                const res = await login(identifier, val, curp, val);
                if (res.success) {
                    window.location.href = '/';
                } else {
                    setError(res.error || 'Número de expediente, correo o celular incorrectos.');
                }
            } else {
                // Registro Real con Asignación de Perfil e Identidad Unificada
                if (!identifier.endsWith('@unison.mx') && !identifier.endsWith('@fondothoth.com')) {
                    setError('Solo se permiten correos institucionales @unison.mx o @fondothoth.com');
                    setIsSubmitting(false);
                    return;
                }

                const res = await api.signup({
                    email: identifier,
                    password: password || 'Unison2026!',
                    nombre_completo: nombre,
                    matricula,
                    telefono,
                    curp,
                    rol,
                    carrera
                });

                if (res.success) {
                    setSuccessMsg('¡Cuenta registrada exitosamente con perfil ' + rol.toUpperCase() + '! Iniciando sesión...');
                    const loginRes = await login(identifier, password, curp, telefono);
                    if (loginRes.success) {
                        setTimeout(() => router.push('/'), 1000);
                    } else {
                        setIsLogin(true);
                    }
                } else {
                    setError(res.error || 'Error al completar el registro.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-black">
            {/* Fondo con degradado ambiental */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-black to-indigo-950/20 pointer-events-none" />

            <div className="w-full max-w-md bg-slate-950/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative z-10 shadow-2xl">
                <div className="text-center mb-8">
                    <img src="/logo-cesa.jpg" alt="CESA UNISON" className="w-16 h-16 rounded-2xl mx-auto mb-4 border border-white/10 shadow-xl" />
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">Portal CESA UNISON</h1>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Identidad Estudiantil & Servicios</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-2xl mb-6 font-semibold animate-in fade-in">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-2xl mb-6 font-semibold animate-in fade-in">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Nombre Completo</label>
                                <input 
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                    placeholder="Nombre completo"
                                    required={!isLogin}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Asignar Perfil / Rol</label>
                                <select 
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs font-bold"
                                >
                                    <option value="estudiante">🎓 Estudiante UNISON</option>
                                    <option value="empresa">🏢 Empresa / Empleador</option>
                                    <option value="sociedad">🏛️ Sociedad de Alumnos</option>
                                    <option value="mesa_directiva">⭐ Mesa Directiva CESA</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Carrera UNISON (Opcional)</label>
                                <select 
                                    value={carrera}
                                    onChange={(e) => setCarrera(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                >
                                    <option value="">-- Seleccionar Carrera (Opcional) --</option>
                                    <option value="Ing. en Sistemas de Información">Ing. en Sistemas de Información</option>
                                    <option value="Lic. en Ciencias de la Computación">Lic. en Ciencias de la Computación</option>
                                    <option value="Ing. Industrial y de Sistemas">Ing. Industrial y de Sistemas</option>
                                    <option value="Ing. Mecatrónica">Ing. Mecatrónica</option>
                                    <option value="Ing. Civil">Ing. Civil</option>
                                    <option value="Lic. en Derecho">Lic. en Derecho</option>
                                    <option value="Lic. en Psicología">Lic. en Psicología</option>
                                    <option value="Lic. en Administración">Lic. en Administración</option>
                                    <option value="Lic. en Contaduría Pública">Lic. en Contaduría Pública</option>
                                    <option value="Lic. en Medicina">Lic. en Medicina</option>
                                    <option value="Químico Biólogo Clínico">Químico Biólogo Clínico</option>
                                    <option value="Lic. en Arquitectura">Lic. en Arquitectura</option>
                                    <option value="Lic. en Mercadotecnia">Lic. en Mercadotecnia</option>
                                    <option value="Otra Carrera UNISON">Otra Carrera UNISON</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Celular (10 dígitos)</label>
                                    <input 
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                        placeholder="6624102866"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">CURP (Opcional)</label>
                                    <input 
                                        type="text"
                                        value={curp}
                                        onChange={(e) => setCurp(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs uppercase"
                                        placeholder="ABCD900101HSON..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Matrícula / Expediente UNISON</label>
                                <input 
                                    type="text"
                                    value={matricula}
                                    onChange={(e) => setMatricula(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                    placeholder="222219849"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">
                            {isLogin ? 'Número de Expediente o Correo' : 'Correo Institucional'}
                        </label>
                        <input 
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                            placeholder={isLogin ? 'Ej: 222219849 o usuario@unison.mx' : 'usuario@unison.mx'}
                            required
                        />
                    </div>

                    {isLogin && (
                        <div>
                            <div className="flex items-center justify-between mb-1 ml-2">
                                <label className="text-[10px] uppercase font-black text-white/40 block">
                                    {usePassword ? 'Contraseña Tradicional' : 'Número de Celular Registrado'}
                                </label>
                                <button 
                                    type="button" 
                                    onClick={() => setUsePassword(!usePassword)}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-all font-semibold"
                                >
                                    {usePassword ? '📱 Entrar con Celular' : '🔑 Usar Contraseña'}
                                </button>
                            </div>
                            <input 
                                type={usePassword ? "password" : "tel"}
                                value={password || telefono}
                                onChange={(e) => { setPassword(e.target.value); setTelefono(e.target.value); }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                placeholder={usePassword ? "••••••••" : "Ej: 6624102866"}
                                required
                            />
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full py-4 mt-6 text-xs font-bold tracking-widest uppercase shadow-[0_10px_30px_rgba(26,115,232,0.3)] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Procesando...' : (isLogin ? 'Ingresar al Portal' : 'Crear Cuenta Real')}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-3">
                    <p className="text-[var(--text-muted)] text-xs">
                        {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya eres parte de la comunidad?'}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                            className="ml-2 text-[var(--primary)] font-bold hover:underline"
                        >
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                        </button>
                    </p>

                    <p className="text-[11px] text-white/40">
                        Al continuar, aceptas el{' '}
                        <button 
                            type="button"
                            onClick={() => setActiveModal('privacidad')}
                            className="text-[#C5A059] hover:underline font-semibold"
                        >
                            Aviso de Privacidad Institucional
                        </button>
                    </p>
                </div>
            </div>

            {/* Modal de Información / Privacidad */}
            <InfoModal 
                isOpen={activeModal !== null}
                type={activeModal}
                onClose={() => setActiveModal(null)}
            />
        </div>
    );
};

export default LoginPage;
