import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, listUsersForAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json({ message: 'Acesso permitido apenas para ADM.' }, { status: 403 });
  }

  return NextResponse.json({ users: listUsersForAdmin() });
}
