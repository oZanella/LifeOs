import { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  createUser,
  findUserByEmail,
  findUserByUsername,
} from '@/lib/auth';
import { handleRouteError, jsonError, setSessionCookie } from '@/lib/api';

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
      return jsonError(
        'Cadastro inválido. Informe email válido, usuário com 3+ caracteres e senha com 6+.',
      );
    }
    if (await findUserByEmail(email)) {
      return jsonError('Este email já está em uso.', 409);
    }
    if (await findUserByUsername(username)) {
      return jsonError('Este usuário já existe.', 409);
    }

    const user = await createUser(email, username, password);
    const response = NextResponse.json({ user });

    return setSessionCookie(response, await createSession(user.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
