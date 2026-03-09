import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { createEntries, listEntries } from '@/lib/financeiro-db';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      entries: Array<{
        date: string;
        description: string;
        categoryId: string;
        amount: number;
        type: 'receita' | 'despesa' | 'investimento';
        isFixed: boolean;
        parentId?: string | null;
      }>;
    };

    if (
      !body.entries ||
      !Array.isArray(body.entries) ||
      body.entries.length === 0
    ) {
      return NextResponse.json(
        { message: 'Dados inválidos.' },
        { status: 400 },
      );
    }

    await createEntries(session.userId, body.entries);

    return NextResponse.json({
      entries: await listEntries(session.userId),
    });
  } catch (error) {
    console.error('Bulk creation error detail:', error);
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { message: 'Erro ao criar entradas em lote.', error: message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const { ids } = (await request.json()) as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'IDs inválidos.' }, { status: 400 });
    }

    const { deleteEntries, listEntries } = await import('@/lib/financeiro-db');
    await deleteEntries(session.userId, ids);

    return NextResponse.json({
      entries: await listEntries(session.userId),
    });
  } catch (error) {
    console.error('Bulk deletion error:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir entradas em lote.' },
      { status: 500 },
    );
  }
}
