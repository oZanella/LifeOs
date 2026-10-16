import { NextResponse } from 'next/server';
import { jsonError, withSession } from '@/lib/api';
import {
  createExercicio,
  listTreinos,
  parseExercicioInput,
} from '@/lib/treino-db';

export const POST = withSession<{ id: string }>(
  async (request, session, { id }) => {
    const { name, sets } = parseExercicioInput(await request.json());
    if (!name) {
      return jsonError('Informe o nome do exercício.');
    }

    await createExercicio(session.userId, id, { name, sets });
    return NextResponse.json({ treinos: await listTreinos(session.userId) });
  },
);
