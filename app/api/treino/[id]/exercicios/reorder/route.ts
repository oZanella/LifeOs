import { NextResponse } from 'next/server';
import { jsonError, withSession } from '@/lib/api';
import { listTreinos, reorderExercicios } from '@/lib/treino-db';

export const POST = withSession<{ id: string }>(
  async (request, session, { id }) => {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.some((item) => typeof item !== 'string')) {
      return jsonError('Ordem de exercícios inválida.');
    }

    await reorderExercicios(session.userId, id, ids);
    return NextResponse.json({ treinos: await listTreinos(session.userId) });
  },
);
