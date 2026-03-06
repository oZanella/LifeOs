import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionByToken } from '@/lib/auth';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteSessionByToken(token);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
}
