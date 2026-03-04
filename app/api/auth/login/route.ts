import { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  findUserByEmail,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from '@/lib/auth';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: 'Email nao encontrado.' }, { status: 401 });
    }

    if (!verifyPassword(password, user)) {
      return NextResponse.json(
        { message: 'Senha incorreta.' },
        { status: 401 },
      );
    }

    const session = await createSession(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        isAdmin: Boolean(user.is_admin),
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
      expires: session.expiresAt,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer login.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
