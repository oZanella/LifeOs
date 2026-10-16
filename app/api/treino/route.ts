import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { listTreinos, createTreino } from '@/lib/treino-db';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const treinos = await listTreinos(Number(session.userId));
  return NextResponse.json({ treinos });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  if (!data?.title?.trim()) {
    return NextResponse.json(
      { message: 'Informe o nome do treino.' },
      { status: 400 },
    );
  }

  const id = await createTreino(Number(session.userId), {
    title: data.title.trim(),
    description: data.description,
    tone: data.tone || 'default',
  });
  const treinos = await listTreinos(Number(session.userId));

  return NextResponse.json({ treinos, createdTreinoId: id });
}
