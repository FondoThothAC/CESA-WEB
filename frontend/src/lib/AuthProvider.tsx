'use client';

/**
 * AuthProvider - Context global de autenticación para React
 * Sincroniza con el backend PHP
 */
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, type User } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (matricula: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: User['rol'] | User['rol'][]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verificar sesión al montar el componente
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verificar si hay sesión activa en PHP
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.checkSession();
      
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
        const newToken = response.data.token || (typeof window !== 'undefined' ? localStorage.getItem('cesa_token') : null);
        setToken(newToken);
        if (typeof window !== 'undefined' && response.data.token) {
           localStorage.setItem('cesa_token', response.data.token);
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login - conecta con api/auth/login.php
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
        setToken(response.data.token || null);
        if (typeof window !== 'undefined' && response.data.token) {
            localStorage.setItem('cesa_token', response.data.token);
        }
        // Redirigir según rol
        const redirectUrl = response.data.redirect_url || '/';
        window.location.href = redirectUrl;
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Credenciales inválidas' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error de conexión' 
      };
    }
  }, []);

  /**
   * Logout - conecta con api/auth/logout.php
   */
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  }, []);

  /**
   * Refrescar datos del usuario
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getPerfil();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  }, []);

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = useCallback((role: User['rol'] | User['rol'][]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.rol);
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext debe usarse dentro de un AuthProvider');
  }
  
  return context;
}

/**
 * HOC para componentes que requieren autenticación
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles?: User['rol'][]
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole, user } = useAuthContext();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
          <div className="text-center">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Verificando sesión...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return null;
    }

    if (requiredRoles && !hasRole(requiredRoles)) {
      if (typeof window !== 'undefined') window.location.href = '/';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
