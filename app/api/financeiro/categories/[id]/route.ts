import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/lib/financeiro-db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      tone?: string;
    };

    await updateCategory(session.userId, id, body);

    return NextResponse.json({ categories: await listCategories(session.userId) });
  } catch {
    return NextResponse.json({ message: 'Erro ao atualizar categoria.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  const { id } = await context.params;

  await deleteCategory(session.userId, id);

  return NextResponse.json({ categories: await listCategories(session.userId) });
}
