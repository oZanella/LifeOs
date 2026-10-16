import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { updateTreino, deleteTreino, listTreinos } from '@/lib/treino-db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();
  await updateTreino(Number(session.userId), id, data);
  const treinos = await listTreinos(Number(session.userId));

  return NextResponse.json({ treinos });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await deleteTreino(Number(session.userId), id);
  const treinos = await listTreinos(Number(session.userId));

  return NextResponse.json({ treinos });
}
