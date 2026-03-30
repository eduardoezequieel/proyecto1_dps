'use client';

/** Contexto de tema claro/oscuro; persiste en localStorage y aplica clase .dark al documento. */
import React, { createContext, useEffect, useState, ReactNode } from 'react';

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

/** Lee el tema guardado en localStorage (solo en cliente). */
function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);

  // Aplica la clase al DOM cuando el tema cambia.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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
