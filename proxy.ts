/** Proxy: protege rutas del dashboard por cookie de rol (gerente/usuario). */
import { NextRequest, NextResponse } from 'next/server';

const GERENTE_ROUTES = ['/dashboard/projects', '/dashboard/tasks', '/dashboard/users'];
const USUARIO_ROUTES = ['/dashboard/my-tasks'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('app_role')?.value;

  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (GERENTE_ROUTES.some((r) => pathname.startsWith(r)) && role !== 'gerente') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (USUARIO_ROUTES.some((r) => pathname.startsWith(r)) && role !== 'usuario') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path+'],
};