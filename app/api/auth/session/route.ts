import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      isAdmin: session.isAdmin,
    },
  });
}
