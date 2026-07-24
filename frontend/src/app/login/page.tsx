'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [usePassword, setUsePassword] = useState(true);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [matricula, setMatricula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [curp, setCurp] = useState('');
    const [rol, setRol] = useState('estudiante');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);

        try {
            if (isLogin) {
                const success = await login(identifier, password, curp, telefono);
                if (success) {
                    router.push('/');
                } else {
                    setError('Identificador, contraseña o datos de identidad incorrectos.');
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
                    rol
                });

                if (res.success) {
                    setSuccessMsg('¡Cuenta registrada exitosamente con perfil ' + rol.toUpperCase() + '! Iniciando sesión...');
                    const loginRes = await login(identifier, password, curp, telefono);
                    if (loginRes) {
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
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--primary)] opacity-10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent)] opacity-5 rounded-full blur-[120px]"></div>
            </div>

            <div className="glass w-full max-w-md p-10 relative z-10 border-white/5 shadow-2xl">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 inline-block">🎓</span>
                    <h1 className="text-3xl font-black text-white">CESA <span className="text-[var(--primary)]">UNISON</span></h1>
                    <p className="text-[var(--text-muted)] text-sm uppercase tracking-[0.2em] font-bold mt-2">
                        {isLogin ? 'Acceso Unificado (Correo / Celular / CURP)' : 'Registro de Identidad UNISON'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-6 text-center">
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
                                    placeholder="Juan Pérez"
                                    required
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

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Celular (10 dígitos)</label>
                                    <input 
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                        placeholder="6621234567"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">CURP</label>
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
                                <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Matrícula UNISON (Opcional)</label>
                                <input 
                                    type="text"
                                    value={matricula}
                                    onChange={(e) => setMatricula(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                    placeholder="219200000"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">
                            {isLogin ? 'Correo (@unison.mx), Celular o CURP' : 'Correo Institucional'}
                        </label>
                        <input 
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                            placeholder={isLogin ? 'usuario@unison.mx / 6621234567 / CURP' : 'usuario@unison.mx'}
                            required
                        />
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-between text-[11px] px-1 py-1">
                            <button 
                                type="button" 
                                onClick={() => setUsePassword(!usePassword)}
                                className="text-white/60 hover:text-white transition-all underline font-semibold"
                            >
                                {usePassword ? '🔓 Entrar por Validación de Identidad (Sin contraseña)' : '🔑 Usar Contraseña Tradicional'}
                            </button>
                        </div>
                    )}

                    {usePassword ? (
                        <div>
                            <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Contraseña</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-xs"
                                placeholder="••••••••"
                                required={usePassword && isLogin}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Validación de Triple Identidad Institucional</p>
                            <div>
                                <label className="text-[9px] uppercase font-black text-white/40 mb-1 block">Celular Registrado</label>
                                <input 
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                                    placeholder="6621234567"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-black text-white/40 mb-1 block">CURP</label>
                                <input 
                                    type="text"
                                    value={curp}
                                    onChange={(e) => setCurp(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs uppercase"
                                    placeholder="ABCD900101..."
                                    required
                                />
                            </div>
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

                <div className="mt-8 text-center">
                    <p className="text-[var(--text-muted)] text-xs">
                        {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya eres parte de la comunidad?'}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                            className="ml-2 text-[var(--primary)] font-bold hover:underline"
                        >
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
