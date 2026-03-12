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
  verifyPassword,
} from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json(
      { message: 'Acesso permitido apenas para ADM.' },
      { status: 403 },
    );
  }

  try {
    const { id } = await context.params;
    const targetId = Number(id);

    if (!Number.isFinite(targetId)) {
      return NextResponse.json(
        { message: 'Usuário inválido.' },
        { status: 400 },
      );
    }

    const target = await findUserById(targetId);
    if (!target) {
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      );
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
      return NextResponse.json({ message: 'Email inválido.' }, { status: 400 });
    }

    if (nextUsername && nextUsername.length < 3) {
      return NextResponse.json(
        { message: 'Nome de usuário precisa ter 3+ caracteres.' },
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
      const existing = await findUserByEmail(nextEmail);
      if (existing && existing.id !== targetId) {
        return NextResponse.json(
          { message: 'Este email já esta em uso.' },
          { status: 409 },
        );
      }
    }

    if (nextUsername) {
      const existing = await findUserByUsername(nextUsername);
      if (existing && existing.id !== targetId) {
        return NextResponse.json(
          { message: 'Este nome de usuário já existe.' },
          { status: 409 },
        );
      }
    }

    if (typeof nextIsAdmin === 'boolean' && !nextIsAdmin && target.is_admin) {
      const admins = await countAdmins();
      if (admins <= 1) {
        return NextResponse.json(
          { message: 'Não e permitido remover o último usuário ADM.' },
          { status: 400 },
        );
      }
    }

    const updated = await updateUserByAdmin(targetId, {
      email: nextEmail,
      username: nextUsername,
      password: nextPassword,
      avatarUrl: hasAvatarField ? nextAvatarUrl : undefined,
      isAdmin: nextIsAdmin,
    });

    if (!updated) {
      return NextResponse.json(
        { message: 'Nada para atualizar.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ users: await listUsersForAdmin() });
  } catch {
    return NextResponse.json(
      { message: 'Erro ao atualizar usuário.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json(
      { message: 'Acesso permitido apenas para ADM.' },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const targetId = Number(id);

  if (!Number.isFinite(targetId)) {
    return NextResponse.json({ message: 'Usuario invalido.' }, { status: 400 });
  }

  const target = await findUserById(targetId);
  if (!target) {
    return NextResponse.json(
      { message: 'Usuario nao encontrado.' },
      { status: 404 },
    );
  }

  if (session.userId === targetId) {
    const body = (await request.json().catch(() => null)) as {
      password?: string;
    } | null;
    const password = body?.password?.trim();

    if (!password) {
      return NextResponse.json(
        { message: 'Senha obrigatória para excluir sua conta.' },
        { status: 400 },
      );
    }

    if (!verifyPassword(password, target)) {
      return NextResponse.json({ message: 'Senha inválida.' }, { status: 401 });
    }
  }

  if (target.is_admin && (await countAdmins()) <= 1) {
    return NextResponse.json(
      { message: 'Não e permitido remover o último usuário ADM.' },
      { status: 400 },
    );
  }

  await deleteUserById(targetId);

  return NextResponse.json({ users: await listUsersForAdmin() });
}
