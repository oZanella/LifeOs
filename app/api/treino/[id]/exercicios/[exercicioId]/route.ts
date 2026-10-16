import { NextResponse } from 'next/server';
import { jsonError, withSession } from '@/lib/api';
import {
  updateExercicio,
  deleteExercicio,
  listTreinos,
  parseExercicioInput,
} from '@/lib/treino-db';

type Params = { id: string; exercicioId: string };

export const PATCH = withSession<Params>(
  async (request, session, { id, exercicioId }) => {
    const data = parseExercicioInput(await request.json());
    if (data.name !== undefined && !data.name) {
      return jsonError('Informe o nome do exercício.');
    }

    await updateExercicio(session.userId, id, exercicioId, data);
    return NextResponse.json({ treinos: await listTreinos(session.userId) });
  },
);

export const DELETE = withSession<Params>(
  async (_request, session, { id, exercicioId }) => {
    await deleteExercicio(session.userId, id, exercicioId);
    return NextResponse.json({ treinos: await listTreinos(session.userId) });
  },
);
