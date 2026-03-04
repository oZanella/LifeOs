import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { deleteEntry, listEntries, updateEntry } from '@/lib/financeiro-db';

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
      date?: string;
      description?: string;
      categoryId?: string;
      amount?: number;
      type?: 'receita' | 'despesa';
      isFixed?: boolean;
    };

    await updateEntry(session.userId, id, body);

    return NextResponse.json({ entries: await listEntries(session.userId) });
  } catch {
    return NextResponse.json({ message: 'Erro ao atualizar entrada.' }, { status: 500 });
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

  await deleteEntry(session.userId, id);

  return NextResponse.json({ entries: await listEntries(session.userId) });
}
