import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { listTreinos, reorderExercicios } from '@/lib/treino-db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: treinoId } = await params;
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
    return NextResponse.json(
      { message: 'Ordem de exercícios inválida.' },
      { status: 400 },
    );
  }

  await reorderExercicios(Number(session.userId), treinoId, ids);
  const treinos = await listTreinos(Number(session.userId));

  return NextResponse.json({ treinos });
}
