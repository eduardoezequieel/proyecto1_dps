/** Layout del dashboard: ruta protegida y shell con barra lateral (estado desde cookie). */
import { cookies } from 'next/headers';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SidebarShell from '@/components/layout/SidebarShell';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<Record<string, string | string[]>>;
};

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  await params;
  const cookieStore = await cookies();
  const collapsed = cookieStore.get('sidebar-collapsed')?.value === 'true';

  return (
    <ProtectedRoute>
      <SidebarShell initialCollapsed={collapsed}>
        {children}
      </SidebarShell>
    </ProtectedRoute>
  );
}
