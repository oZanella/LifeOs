import { NextRequest, NextResponse } from 'next/server';
import {
  deleteSessionByToken,
  countAdmins,
  findUserByEmail,
  findUserByUsername,
  getSessionFromRequest,
  SESSION_COOKIE_NAME,
  updateUserAccount,
  deleteUserById,
} from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      username?: string;
      password?: string;
      avatarUrl?: string;
    };

    const nextEmail = body.email?.trim().toLowerCase();
    const nextUsername = body.username?.trim().toLowerCase();
    const nextPassword = body.password?.trim();
    const avatarInput = body.avatarUrl;
    const hasAvatarField = typeof avatarInput === 'string';
    const nextAvatarUrl = hasAvatarField ? avatarInput.trim() : undefined;

    if (nextEmail && !nextEmail.includes('@')) {
      return NextResponse.json({ message: 'Email invalido.' }, { status: 400 });
    }

    if (nextUsername && nextUsername.length < 3) {
      return NextResponse.json(
        { message: 'Nome de usuario precisa ter 3+ caracteres.' },
        { status: 400 },
      );
    }

    if (nextPassword && nextPassword.length < 6) {
      return NextResponse.json(
        { message: 'Senha precisa ter 6+ caracteres.' },
        { status: 400 },
      );
    }

    if (typeof nextAvatarUrl === 'string' && nextAvatarUrl.length > 2_000_000) {
      return NextResponse.json(
        { message: 'Avatar muito grande.' },
        { status: 400 },
      );
    }

    if (nextEmail) {
      const existing = findUserByEmail(nextEmail);
      if (existing && existing.id !== session.userId) {
        return NextResponse.json({ message: 'Este email ja esta em uso.' }, { status: 409 });
      }
    }

    if (nextUsername) {
      const existing = findUserByUsername(nextUsername);
      if (existing && existing.id !== session.userId) {
        return NextResponse.json(
          { message: 'Este nome de usuario ja existe.' },
          { status: 409 },
        );
      }
    }

    const updated = updateUserAccount(session.userId, {
      email: nextEmail,
      username: nextUsername,
      password: nextPassword,
      avatarUrl: hasAvatarField ? nextAvatarUrl : undefined,
    });

    if (!updated) {
      return NextResponse.json({ message: 'Nada para atualizar.' }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        avatarUrl: updated.avatar_url,
        isAdmin: Boolean(updated.is_admin),
      },
    });
  } catch {
    return NextResponse.json({ message: 'Erro ao atualizar usuario.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (session.isAdmin && countAdmins() <= 1) {
    return NextResponse.json(
      { message: 'Nao e permitido remover o ultimo usuario ADM.' },
      { status: 400 },
    );
  }

  deleteUserById(session.userId);

  if (token) {
    deleteSessionByToken(token);
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
