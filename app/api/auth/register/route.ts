import { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  createUser,
  findUserByEmail,
  findUserByUsername,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      username?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? '';
    const username = body.username?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    if (!email.includes('@') || username.length < 3 || password.length < 6) {
      return NextResponse.json(
        {
          message:
            'Cadastro invalido. Informe email valido, usuario com 3+ caracteres e senha com 6+.',
        },
        { status: 400 },
      );
    }

    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
      return NextResponse.json({ message: 'Este email ja esta em uso.' }, { status: 409 });
    }

    const existing = await findUserByUsername(username);

    if (existing) {
      return NextResponse.json(
        { message: 'Este usuario ja existe.' },
        { status: 409 },
      );
    }

    const user = await createUser(email, username, password);
    const session = await createSession(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
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
    const message =
      error instanceof Error ? error.message : 'Erro ao registrar usuario.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
