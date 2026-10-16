import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  updateExercicio,
  deleteExercicio,
  listTreinos,
  parseExercicioInput,
} from '@/lib/treino-db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; exercicioId: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: treinoId, exercicioId } = await params;
  const data = parseExercicioInput(await req.json());
  if (data.name !== undefined && !data.name) {
    return NextResponse.json(
      { message: 'Informe o nome do exercício.' },
      { status: 400 },
    );
  }

  await updateExercicio(Number(session.userId), treinoId, exercicioId, data);
  const treinos = await listTreinos(Number(session.userId));

  return NextResponse.json({ treinos });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; exercicioId: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: treinoId, exercicioId } = await params;
  await deleteExercicio(Number(session.userId), treinoId, exercicioId);
  const treinos = await listTreinos(Number(session.userId));

  return NextResponse.json({ treinos });
}
