import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';

export const GET = withSession(async (_request, session) =>
  NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
      email: session.email,
      avatarUrl: session.avatarUrl,
      isAdmin: session.isAdmin,
    },
  }),
);
