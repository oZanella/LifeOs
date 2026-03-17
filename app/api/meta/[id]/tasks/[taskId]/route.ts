import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { updateTask, deleteTask, listMetas } from '@/lib/meta-db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId } = await params;
  const data = await req.json();
  await updateTask(taskId, data);
  const metas = await listMetas(Number(session.userId));

  return NextResponse.json({ metas });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId } = await params;
  await deleteTask(taskId);
  const metas = await listMetas(Number(session.userId));

  return NextResponse.json({ metas });
}
