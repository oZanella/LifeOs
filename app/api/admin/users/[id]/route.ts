import { NextResponse } from 'next/server';
import {
  countAdmins,
  deleteUserById,
  findUserById,
  listUsersForAdmin,
  parseAccountUpdate,
  updateUser,
  verifyPassword,
} from '@/lib/auth';
import { jsonError, withSession } from '@/lib/api';

type Params = { id: string };

export const PATCH = withSession<Params>(async (request, session, { id }) => {
  const targetId = Number(id);
  if (!Number.isFinite(targetId)) {
    return jsonError('Usuário inválido.');
  }
  if (!session.isAdmin && targetId !== session.userId) {
    return jsonError('Acesso permitido apenas ao próprio usuário.', 403);
  }

  const target = await findUserById(targetId);
  if (!target) {
    return jsonError('Usuário não encontrado.', 404);
  }

  const body = await request.json();
  const isAdmin = typeof body.isAdmin === 'boolean' ? body.isAdmin : undefined;

  if (isAdmin !== undefined && !session.isAdmin) {
    return jsonError('Apenas administradores podem alterar permissão.', 403);
  }
  if (isAdmin === false && target.is_admin && (await countAdmins()) <= 1) {
    return jsonError('Não é permitido remover o último usuário ADM.');
  }

  const data = await parseAccountUpdate(body, targetId);
  const updated = await updateUser(targetId, { ...data, isAdmin });

  if (!updated) {
    return jsonError('Nada para atualizar.');
  }

  const users = await listUsersForAdmin();
  return NextResponse.json({
    users: session.isAdmin
      ? users
      : users.filter((item) => item.id === session.userId),
  });
});

export const DELETE = withSession<Params>(async (request, session, { id }) => {
  if (!session.isAdmin) {
    return jsonError('Acesso permitido apenas para ADM.', 403);
  }

  const targetId = Number(id);
  if (!Number.isFinite(targetId)) {
    return jsonError('Usuário inválido.');
  }

  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;
  const password = body?.password?.trim();
  if (!password) {
    return jsonError('Senha obrigatória para excluir.');
  }

  const sessionUser = await findUserById(session.userId);
  if (!sessionUser || !verifyPassword(password, sessionUser)) {
    return jsonError('Senha inválida.', 401);
  }

  const target = await findUserById(targetId);
  if (!target) {
    return jsonError('Usuário não encontrado.', 404);
  }
  if (target.is_admin && (await countAdmins()) <= 1) {
    return jsonError('Não é permitido remover o último usuário ADM.');
  }

  await deleteUserById(targetId);

  return NextResponse.json({ users: await listUsersForAdmin() });
});
