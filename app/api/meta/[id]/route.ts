import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { updateMeta, deleteMeta, listMetas } from '@/lib/meta-db';

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
  await updateMeta(Number(session.userId), id, data);
  const metas = await listMetas(Number(session.userId));

  return NextResponse.json({ metas });
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
  await deleteMeta(Number(session.userId), id);
  const metas = await listMetas(Number(session.userId));

  return NextResponse.json({ metas });
}
