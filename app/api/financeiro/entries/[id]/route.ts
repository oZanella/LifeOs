import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import { deleteEntry, listEntries, updateEntry } from '@/lib/financeiro-db';

type Params = { id: string };

export const PATCH = withSession<Params>(async (request, session, { id }) => {
  await updateEntry(session.userId, id, await request.json());
  return NextResponse.json({ entries: await listEntries(session.userId) });
});

export const DELETE = withSession<Params>(async (_request, session, { id }) => {
  await deleteEntry(session.userId, id);
  return NextResponse.json({ entries: await listEntries(session.userId) });
});
