/**
 * CESA API Client - Bridge React ↔ PHP Backend
 * Maneja todas las comunicaciones con api/*.php
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class CesaApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
    this.loadCsrfToken();
  }

  /**
   * Carga el token CSRF desde el meta tag del documento
   */
  private loadCsrfToken(): void {
    if (typeof document !== 'undefined') {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) {
          this.csrfToken = meta.getAttribute('content');
        }
    }
  }

  /**
   * Refresca el token CSRF desde el backend
   */
  async refreshCsrfToken(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/csrf.php`);
      const data = await res.json();
      if (data.token) {
        this.csrfToken = data.token;
        if (typeof document !== 'undefined') {
            let meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            if (!meta) {
              meta = document.createElement('meta');
              meta.name = 'csrf-token';
              document.head.appendChild(meta);
            }
            meta.content = data.token;
        }
      }
    } catch (e) {
      console.error('Error refreshing CSRF:', e);
    }
  }

  /**
   * Método principal para hacer requests
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
    } = options;

    const defaultHeaders: Record<string, string> = {
      ...headers
    };

    const lsToken = typeof localStorage !== 'undefined' ? localStorage.getItem('cesa_token') : null;
    if (lsToken) {
       defaultHeaders['Authorization'] = `Bearer ${lsToken}`;
    }

    if (this.csrfToken) {
      defaultHeaders['X-CSRF-Token'] = this.csrfToken;
    }

    let finalBody: string | FormData | undefined;
    
    if (body) {
      if (body instanceof FormData) {
        finalBody = body;
      } else {
        defaultHeaders['Content-Type'] = 'application/json';
        finalBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method,
        headers: defaultHeaders,
        body: finalBody,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.status === 419 && this.csrfToken) {
        await this.refreshCsrfToken();
        return this.request(endpoint, options);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  // ============================================
  // MÉTODOS DE AUTENTICACIÓN (PHP auth.php)
  // ============================================

  async login(identifier: string, pass?: string, curp?: string, telefono?: string): Promise<ApiResponse<{
    user?: any;
    token?: string;
    redirect_url?: string;
  }>> {
    const res: any = await this.request('auth.php?action=login', {
      method: 'POST',
      body: { action: 'login', identifier, email: identifier, password: pass, curp, telefono: telefono || pass },
      requiresAuth: false
    });
    
    if (res.success) {
        const token = res.token || (res.data && res.data.token);
        const user = res.user || (res.data && res.data.user) || res.data;
        if (token && typeof localStorage !== 'undefined') {
            localStorage.setItem('cesa_token', token);
        }
        return { 
          success: true, 
          data: { 
            user, 
            token, 
            redirect_url: (user?.rol === 'admin' || user?.email === 'software@fondothoth.com' || user?.email === 'a213203453@unison.mx') ? '/admin/dashboard' : '/dashboard' 
          } 
        };
    }
    return res;
  }

  async signup(data: {
    email: string;
    password?: string;
    nombre_completo: string;
    matricula?: string;
    telefono?: string;
    curp?: string;
    rol?: string;
    carrera?: string;
  }): Promise<ApiResponse<{ message?: string }>> {
    return this.request('auth.php?action=signup', {
      method: 'POST',
      body: { action: 'signup', ...data },
      requiresAuth: false
    });
  }

  async logout(): Promise<ApiResponse> {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('cesa_token');
    await this.request('auth.php?action=logout', { method: 'POST' });
    return { success: true };
  }

  async getPerfil(): Promise<ApiResponse<User>> {
    return this.request('auth.php?action=me');
  }

  async updatePerfil(data: Partial<User>): Promise<ApiResponse> {
    return this.request('auth.php?action=update', {
      method: 'POST',
      body: data,
      requiresAuth: true
    });
  }

  async checkSession(): Promise<ApiResponse<{ user: User; token?: string; session_expires: string }>> {
    const res: any = await this.request('auth.php?action=me');
    if (res.success && (res.user || res.data)) {
        const userObj = res.user || (res.data && res.data.user) || res.data;
        const currentToken = typeof localStorage !== 'undefined' ? localStorage.getItem('cesa_token') : null;
        return { 
          success: true, 
          data: { 
            user: userObj, 
            token: currentToken || undefined, 
            session_expires: '30d' 
          } 
        };
    }
    return res;
  }
}

// Tipos TypeScript
export interface User {
  id: number;
  matricula: string;
  expediente?: string;
  nombre_completo: string;
  nombre?: string;
  email: string;
  carrera: string;
  rol: 'estudiante' | 'admin' | 'mesa_directiva' | 'coordinador_impulso' | 'sociedad' | 'empresa';
  avatar_url?: string;
  verificado?: boolean;
  created_at?: string;
  publicar_anuncios?: boolean | number;
  bazar_y_reservaciones?: boolean | number;
  bolsa_trabajo?: boolean | number;
  roles_social?: boolean | number;
  ver_denuncias?: boolean | number;
  rol_comunicacion?: boolean | number;
  consejo_elecciones?: boolean | number;
  permiso_ia?: boolean | number;
}

export interface Negocio {
  id: number;
  nombre_negocio: string;
  descripcion: string;
  categoria: string;
  whatsapp: string;
  instagram?: string;
  verificado: boolean;
  views: number;
  creador: string;
}

export interface Vacante {
  id: number;
  titulo: string;
  empresa: string;
  descripcion: string;
  requisitos: string;
  ubicacion: string;
  salario?: string;
  activa: boolean;
  created_at: string;
}

export const api = new CesaApiClient();
export const { login, signup, logout, getPerfil, updatePerfil, checkSession } = api;
