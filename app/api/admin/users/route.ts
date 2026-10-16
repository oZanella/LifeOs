import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import { listUsersForAdmin } from '@/lib/auth';

export const GET = withSession(async (_request, session) => {
  const users = await listUsersForAdmin();

  return NextResponse.json({
    users: session.isAdmin
      ? users
      : users.filter((item) => item.id === session.userId),
  });
});
