import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';
import { ApiError } from '@/lib/api-error';

type Session = NonNullable<Awaited<ReturnType<typeof getSessionFromRequest>>>;

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const jsonError = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status);
  }
  // request.json() on a malformed body.
  if (error instanceof SyntaxError) {
    return jsonError('Requisição inválida.');
  }
  console.error(error);
  return jsonError('Erro interno. Tente novamente.', 500);
}

/**
 * Wraps a route handler: rejects requests without a valid session, resolves
 * the dynamic params and turns thrown errors into JSON responses.
 */
export function withSession<P = object>(
  handler: (
    request: NextRequest,
    session: Session,
    params: P,
  ) => Promise<Response>,
) {
  return async (request: NextRequest, context: { params: Promise<P> }) => {
    try {
      const session = await getSessionFromRequest(request);
      if (!session) {
        return jsonError('Não autenticado.', 401);
      }
      return await handler(request, session, await context.params);
    } catch (error) {
      return handleRouteError(error);
    }
  };
}

export function setSessionCookie(
  response: NextResponse,
  session: { token: string; expiresAt: Date },
) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: session.expiresAt,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}
