import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionByToken } from '@/lib/auth';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';
import { clearSessionCookie } from '@/lib/api';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }

  return clearSessionCookie(NextResponse.json({ ok: true }));
}
