import { NextResponse } from 'next/server';
import { jsonError, withSession } from '@/lib/api';
import { listTreinos, createTreino } from '@/lib/treino-db';

export const GET = withSession(async (_request, session) =>
  NextResponse.json({ treinos: await listTreinos(session.userId) }),
);

export const POST = withSession(async (request, session) => {
  const data = await request.json();
  if (!data?.title?.trim()) {
    return jsonError('Informe o nome do treino.');
  }

  const id = await createTreino(session.userId, {
    title: data.title.trim(),
    description: data.description,
    tone: data.tone || 'default',
  });

  return NextResponse.json({
    treinos: await listTreinos(session.userId),
    createdTreinoId: id,
  });
});
