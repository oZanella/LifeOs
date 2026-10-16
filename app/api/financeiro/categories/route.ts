import { NextResponse } from 'next/server';
import { jsonError, withSession } from '@/lib/api';
import { createCategory, listCategories } from '@/lib/financeiro-db';

export const POST = withSession(async (request, session) => {
  const body = (await request.json()) as {
    name?: string;
    tone?: string;
    parentId?: string | null;
  };

  if (!body.name || typeof body.tone !== 'string') {
    return jsonError('Dados inválidos.');
  }

  await createCategory(session.userId, {
    name: body.name,
    tone: body.tone,
    parentId: body.parentId || null,
  });

  return NextResponse.json({
    categories: await listCategories(session.userId),
  });
});
