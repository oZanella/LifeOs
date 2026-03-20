import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, listUsersForAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  const users = await listUsersForAdmin();

  if (!session.isAdmin) {
    return NextResponse.json({
      users: users.filter((item) => item.id === session.userId),
    });
  }

  return NextResponse.json({ users });
}
