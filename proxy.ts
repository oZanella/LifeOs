import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from './lib/auth-constants';

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  // Se o usuário NÃO tem sessão e NÃO está na página de login, redireciona para /login
  if (!sessionToken && pathname !== '/login') {
    // Evitar redirecionar chamadas de API ou arquivos estáticos (embora o config.matcher deva cuidar disso)
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se o usuário JÁ tem sessão e está tentando acessar a página de login, redireciona para a home
  if (sessionToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configuração para rodar o middleware apenas em rotas relevantes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
