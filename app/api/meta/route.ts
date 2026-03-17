import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { listMetas, createMeta } from '@/lib/meta-db';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const metas = await listMetas(Number(session.userId));
  return NextResponse.json({ metas });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const id = await createMeta(Number(session.userId), data);
  const metas = await listMetas(Number(session.userId));

  return NextResponse.json({ metas, createdMetaId: id });
}
