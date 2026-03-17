import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { createTask, listMetas } from '@/lib/meta-db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: metaId } = await params;
  const data = await req.json();
  await createTask(metaId, data);
  const metas = await listMetas(Number(session.userId));

  return NextResponse.json({ metas });
}
