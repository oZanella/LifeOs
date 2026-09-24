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
      parentId?: string | null;
    };

    await updateCategory(session.userId, id, body);

    return NextResponse.json({ categories: await listCategories(session.userId) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar categoria.';
    return NextResponse.json({ message }, { status: 400 });
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
