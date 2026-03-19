'use client';

/** Contexto de autenticación: usuario actual, login y logout (simulado con json-server). */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { getUserByEmail } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'gestion_proyectos_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recupera el usuario guardado al cargar (hidratación).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Inicia sesión con email y contraseña; guarda usuario sin contraseña en estado y localStorage. */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await getUserByEmail(email);
      const users = response.data;
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );
      if (foundUser) {
        const { password: _, ...safeUser } = foundUser;
        setUser(safeUser as User);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
        document.cookie = `app_role=${safeUser.role}; path=/; SameSite=Lax`;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  /** Cierra sesión y limpia estado, localStorage y cookie de rol. */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = 'app_role=; path=/; max-age=0';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}