'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('cesa_token');
    if (savedToken) {
      checkAuth(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = async (t: string) => {
    try {
      const res = await fetch(`http://localhost:8000/auth.php?action=me`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(t);
      } else {
        logout();
      }
    } catch (e) {
      console.error("Auth check error", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`http://localhost:8000/auth.php?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('cesa_token', data.token);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cesa_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
