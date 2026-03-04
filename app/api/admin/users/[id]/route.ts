import { NextRequest, NextResponse } from 'next/server';
import {
  countAdmins,
  deleteUserById,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  getSessionFromRequest,
  listUsersForAdmin,
  updateUserByAdmin,
} from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json({ message: 'Acesso permitido apenas para ADM.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const targetId = Number(id);

    if (!Number.isFinite(targetId)) {
      return NextResponse.json({ message: 'Usuario invalido.' }, { status: 400 });
    }

    const target = findUserById(targetId);
    if (!target) {
      return NextResponse.json({ message: 'Usuario nao encontrado.' }, { status: 404 });
    }

    const body = (await request.json()) as {
      email?: string;
      username?: string;
      password?: string;
      isAdmin?: boolean;
      avatarUrl?: string;
    };

    const nextEmail = body.email?.trim().toLowerCase();
    const nextUsername = body.username?.trim().toLowerCase();
    const nextPassword = body.password?.trim();
    const nextIsAdmin = body.isAdmin;
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
      return NextResponse.json({ message: 'Avatar muito grande.' }, { status: 400 });
    }

    if (nextEmail) {
      const existing = findUserByEmail(nextEmail);
      if (existing && existing.id !== targetId) {
        return NextResponse.json({ message: 'Este email ja esta em uso.' }, { status: 409 });
      }
    }

    if (nextUsername) {
      const existing = findUserByUsername(nextUsername);
      if (existing && existing.id !== targetId) {
        return NextResponse.json(
          { message: 'Este nome de usuario ja existe.' },
          { status: 409 },
        );
      }
    }

    if (typeof nextIsAdmin === 'boolean' && !nextIsAdmin && target.is_admin === 1) {
      const admins = countAdmins();
      if (admins <= 1) {
        return NextResponse.json(
          { message: 'Nao e permitido remover o ultimo usuario ADM.' },
          { status: 400 },
        );
      }
    }

    const updated = updateUserByAdmin(targetId, {
      email: nextEmail,
      username: nextUsername,
      password: nextPassword,
      avatarUrl: hasAvatarField ? nextAvatarUrl : undefined,
      isAdmin: nextIsAdmin,
    });

    if (!updated) {
      return NextResponse.json({ message: 'Nada para atualizar.' }, { status: 400 });
    }

    return NextResponse.json({ users: listUsersForAdmin() });
  } catch {
    return NextResponse.json({ message: 'Erro ao atualizar usuario.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json({ message: 'Acesso permitido apenas para ADM.' }, { status: 403 });
  }

  const { id } = await context.params;
  const targetId = Number(id);

  if (!Number.isFinite(targetId)) {
    return NextResponse.json({ message: 'Usuario invalido.' }, { status: 400 });
  }

  const target = findUserById(targetId);
  if (!target) {
    return NextResponse.json({ message: 'Usuario nao encontrado.' }, { status: 404 });
  }

  if (target.is_admin === 1 && countAdmins() <= 1) {
    return NextResponse.json(
      { message: 'Nao e permitido remover o ultimo usuario ADM.' },
      { status: 400 },
    );
  }

  deleteUserById(targetId);

  return NextResponse.json({ users: listUsersForAdmin() });
}
