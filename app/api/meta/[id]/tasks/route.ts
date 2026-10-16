import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import { createTask, listMetas } from '@/lib/meta-db';

export const POST = withSession<{ id: string }>(
  async (request, session, { id }) => {
    await createTask(session.userId, id, await request.json());
    return NextResponse.json({ metas: await listMetas(session.userId) });
  },
);
