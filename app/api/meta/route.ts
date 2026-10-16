import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import { listMetas, createMeta } from '@/lib/meta-db';

export const GET = withSession(async (_request, session) =>
  NextResponse.json({ metas: await listMetas(session.userId) }),
);

export const POST = withSession(async (request, session) => {
  const id = await createMeta(session.userId, await request.json());
  return NextResponse.json({
    metas: await listMetas(session.userId),
    createdMetaId: id,
  });
});
