/**
 * useAuth - Hook simplificado para autenticación
 * Re-exporta desde AuthProvider para compatibilidad
 */
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './AuthProvider';

// Re-exportamos el hook recomendado y el Provider para compatibilidad
export { useAuthContext as useAuth, AuthProvider } from './AuthProvider';

// Hook legacy para componentes que ya usaban useAuth
export function useAuthDeprecated() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.warn('useAuthDeprecated: Usar AuthProvider en la app');
  }
  
  return {
    // Legacy props (compatibilidad)
    user: context?.user,
    loading: context?.isLoading,
    authenticated: context?.isAuthenticated,
    token: typeof localStorage !== 'undefined' ? localStorage.getItem('cesa_token') : null,
    // Nuevos métodos
    login: async (email: string, pass: string) => {
        if (context?.login) {
            const res = await context.login(email, pass);
            return res.success;
        }
        return false;
    },
    logout: context?.logout,
    refresh: context?.refreshUser,
    hasRole: context?.hasRole,
    // Utilidades
    isAdmin: context?.user?.rol === 'admin',
    isMesaDirectiva: context?.user?.rol === 'mesa_directiva',
    isCoordinador: context?.user?.rol === 'coordinador_impulso',
    // Getters rápidos
    getUserId: () => context?.user?.id,
    getMatricula: () => context?.user?.matricula,
    getNombre: () => context?.user?.nombre_completo,
  };
}
