'use client';

/** Contenedor del dashboard: barra lateral colapsable y área principal. */
import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';

interface SidebarShellProps {
  children: ReactNode;
  initialCollapsed: boolean;
}

export default function SidebarShell({ children, initialCollapsed }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  /** Alterna la barra y guarda el estado en cookie. */
  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `sidebar-collapsed=${next}; path=/; max-age=31536000`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}
      >
        <main className="p-4 sm:p-6 lg:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
