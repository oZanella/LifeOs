import { NextRequest, NextResponse } from 'next/server';
import { createSession, findUserByEmail, verifyPassword } from '@/lib/auth';
import { handleRouteError, jsonError, setSessionCookie } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const user = await findUserByEmail(body.email ?? '');
    if (!user) {
      return jsonError('Email não encontrado.', 401);
    }
    if (!verifyPassword(body.password ?? '', user)) {
      return jsonError('Senha incorreta.', 401);
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        isAdmin: Boolean(user.is_admin),
      },
    });

    return setSessionCookie(response, await createSession(user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
