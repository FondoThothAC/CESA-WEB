'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const success = await login(email, password);
            if (success) {
                router.push('/');
            } else {
                setError('Credenciales incorrectas o servidor offline.');
            }
        } else {
            // Signup Logic
            if (!email.endsWith('@unison.mx')) {
                setError('Solo se permiten correos @unison.mx');
                return;
            }
            alert('Registro simulado. Ahora puedes iniciar sesión.');
            setIsLogin(true);
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
                <div className="text-center mb-10">
                    <span className="text-5xl mb-4 inline-block">🎓</span>
                    <h1 className="text-3xl font-black text-white">CESA <span className="text-[var(--primary)]">UNISON</span></h1>
                    <p className="text-[var(--text-muted)] text-sm uppercase tracking-[0.2em] font-bold mt-2">
                        {isLogin ? 'Inicio de Sesión' : 'Registro Estudiantil'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Nombre Completo</label>
                            <input 
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                placeholder="Juan Pérez"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Correo Institucional</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                            placeholder="usuario@unison.mx"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-black text-white/40 mb-1 block ml-2">Contraseña</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        className="btn-primary w-full py-4 mt-6 text-sm font-bold tracking-widest uppercase shadow-[0_10px_30px_rgba(26,115,232,0.3)]"
                    >
                        {isLogin ? 'Entrar al Portal' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[var(--text-muted)] text-xs">
                        {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya eres parte de la comunidad?'}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
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
