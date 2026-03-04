import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  createCategory,
  ensureDefaultCategories,
  listCategories,
} from '@/lib/financeiro-db';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      tone?: string;
    };

    if (!body.name || typeof body.tone !== 'string') {
      return NextResponse.json({ message: 'Dados invalidos.' }, { status: 400 });
    }

    await createCategory(session.userId, {
      name: body.name,
      tone: body.tone,
    });

    await ensureDefaultCategories(session.userId);

    return NextResponse.json({ categories: await listCategories(session.userId) });
  } catch {
    return NextResponse.json({ message: 'Erro ao criar categoria.' }, { status: 500 });
  }
}
