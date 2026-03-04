import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { createEntry, listEntries } from '@/lib/financeiro-db';

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      date?: string;
      description?: string;
      categoryId?: string;
      amount?: number;
      type?: 'receita' | 'despesa';
      isFixed?: boolean;
    };

    if (
      !body.date ||
      !body.description ||
      typeof body.categoryId !== 'string' ||
      typeof body.amount !== 'number' ||
      (body.type !== 'receita' && body.type !== 'despesa')
    ) {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 400 });
    }

    createEntry(session.userId, {
      date: body.date,
      description: body.description,
      categoryId: body.categoryId,
      amount: body.amount,
      type: body.type,
      isFixed: Boolean(body.isFixed),
    });

    return NextResponse.json({ entries: listEntries(session.userId) });
  } catch {
    return NextResponse.json({ message: 'Erro ao criar entrada.' }, { status: 500 });
  }
}
