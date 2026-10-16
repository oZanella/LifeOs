import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import { updateMeta, deleteMeta, listMetas } from '@/lib/meta-db';

type Params = { id: string };

export const PATCH = withSession<Params>(async (request, session, { id }) => {
  await updateMeta(session.userId, id, await request.json());
  return NextResponse.json({ metas: await listMetas(session.userId) });
});

export const DELETE = withSession<Params>(async (_request, session, { id }) => {
  await deleteMeta(session.userId, id);
  return NextResponse.json({ metas: await listMetas(session.userId) });
});
