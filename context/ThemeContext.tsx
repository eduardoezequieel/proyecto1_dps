'use client';

/** Contexto de tema claro/oscuro; persiste en localStorage y aplica clase .dark al documento. */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Aplica la clase 'dark' al html según el tema. */
function applyTheme(t: 'light' | 'dark') {
  if (t === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Inicializa el tema desde localStorage al montar.
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = stored ?? 'light';
    setTheme(initial);
    applyTheme(initial);
  }, []);

  /** Alterna entre claro y oscuro; guarda en estado y localStorage. */
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
