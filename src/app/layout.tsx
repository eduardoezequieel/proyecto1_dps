/** Layout raíz: fuentes, providers de tema y autenticación, script de tema inicial. */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Proyectos',
  description: 'Plataforma de gestión de proyectos y tareas',
};

type RootLayoutProps = {
  children: React.ReactNode;
  params?: Promise<Record<string, string | string[]>>;
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  if (params) await params;
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}