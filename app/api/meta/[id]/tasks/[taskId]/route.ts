import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import { updateTask, deleteTask, listMetas } from '@/lib/meta-db';

type Params = { id: string; taskId: string };

export const PATCH = withSession<Params>(
  async (request, session, { taskId }) => {
    await updateTask(session.userId, taskId, await request.json());
    return NextResponse.json({ metas: await listMetas(session.userId) });
  },
);

export const DELETE = withSession<Params>(
  async (_request, session, { taskId }) => {
    await deleteTask(session.userId, taskId);
    return NextResponse.json({ metas: await listMetas(session.userId) });
  },
);
