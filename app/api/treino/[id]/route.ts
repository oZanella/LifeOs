import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import { updateTreino, deleteTreino, listTreinos } from '@/lib/treino-db';

type Params = { id: string };

export const PATCH = withSession<Params>(async (request, session, { id }) => {
  await updateTreino(session.userId, id, await request.json());
  return NextResponse.json({ treinos: await listTreinos(session.userId) });
});

export const DELETE = withSession<Params>(async (_request, session, { id }) => {
  await deleteTreino(session.userId, id);
  return NextResponse.json({ treinos: await listTreinos(session.userId) });
});
