'use client';

/** Barra lateral del dashboard: navegación por rol, usuario, tema y cerrar sesión. */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const ico = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.75',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const IconHome = () => (
  <svg {...ico}>
    <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5z" />
    <path d="M9.5 21V14h5v7" />
  </svg>
);

const IconFolder = () => (
  <svg {...ico}>
    <path d="M3 7a2 2 0 0 1 2-2h3.5l2 2.5H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

const IconClipboard = () => (
  <svg {...ico}>
    <rect x="8" y="2" width="8" height="4" rx="1.5" />
    <path d="M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

const IconClipboardCheck = () => (
  <svg {...ico}>
    <rect x="8" y="2" width="8" height="4" rx="1.5" />
    <path d="M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconUsers = () => (
  <svg {...ico}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconSun = () => (
  <svg {...ico}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
  </svg>
);

const IconMoon = () => (
  <svg {...ico}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconLogout = () => (
  <svg {...ico}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconChevronLeft = ({ className }: { className?: string }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const gerenteLinks = [
  { href: '/dashboard',          label: 'Inicio', exact: true,  icon: <IconHome /> },
  { href: '/dashboard/projects', label: 'Proyectos', exact: false, icon: <IconFolder /> },
  { href: '/dashboard/tasks',    label: 'Tareas',    exact: false, icon: <IconClipboard /> },
  { href: '/dashboard/users',    label: 'Usuarios',  exact: false, icon: <IconUsers /> },
];

const usuarioLinks = [
  { href: '/dashboard',          label: 'Inicio',  exact: true,  icon: <IconHome /> },
  { href: '/dashboard/my-tasks', label: 'Mis Tareas', exact: false, icon: <IconClipboardCheck /> },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const links = user?.role === 'gerente' ? gerenteLinks : usuarioLinks;

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Cuando collapsed: px-3.5 (14px) centra el ícono de 20px exactamente
  // en los 48px disponibles del nav. Sin gap — el margen va en el texto.
  // Cuando expanded: px-2 (8px) con ml-3 en el texto = aspecto de gap-3.
  const itemPad = collapsed ? 'px-3.5' : 'px-2';
  const userItemCls = collapsed ? 'justify-center px-2' : 'px-2';

  // El texto usa ml-3 (animable) en lugar de gap en el padre
  const labelCls = `text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${
    collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100 ml-3'
  }`;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-30 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle — tab flotante en el borde derecho */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-40 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center shadow-sm transition-colors focus:outline-none"
        title={collapsed ? 'Expandir' : 'Colapsar'}
      >
        <IconChevronLeft className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Logo */}
      <div className="flex items-center px-3 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            GP
          </div>
          <span
            className={`font-semibold text-gray-800 dark:text-white text-sm overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'
            }`}
          >
            GestiónPro
          </span>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {links.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center py-2.5 rounded-lg transition-all duration-300 ${itemPad} ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
              title={collapsed ? link.label : undefined}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              <span className={labelCls}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sección inferior */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-3 space-y-1">
        {/* Datos del usuario */}
        <div className={`flex items-center py-2 transition-all duration-300 ${userItemCls}`}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.avatar ?? user?.name?.charAt(0) ?? '?'}
          </div>
          <div
            className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100 ml-3'
            }`}
          >
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>

        {/* Alternar modo oscuro */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 focus:outline-none ${itemPad}`}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <span className="flex-shrink-0">
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </span>
          <span className={labelCls}>
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </span>
        </button>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 focus:outline-none ${itemPad}`}
          title="Cerrar sesión"
        >
          <span className="flex-shrink-0">
            <IconLogout />
          </span>
          <span className={labelCls}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
