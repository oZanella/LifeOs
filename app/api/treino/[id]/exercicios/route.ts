import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  createExercicio,
  listTreinos,
  parseExercicioInput,
} from '@/lib/treino-db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: treinoId } = await params;
  const data = parseExercicioInput(await req.json());
  if (!data.name) {
    return NextResponse.json(
      { message: 'Informe o nome do exercício.' },
      { status: 400 },
    );
  }

  await createExercicio(Number(session.userId), treinoId, {
    ...data,
    name: data.name,
  });
  const treinos = await listTreinos(Number(session.userId));

  return NextResponse.json({ treinos });
}
