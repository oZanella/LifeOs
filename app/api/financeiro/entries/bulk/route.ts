import { NextResponse } from 'next/server';
import { jsonError, withSession } from '@/lib/api';
import {
  createEntries,
  deleteEntries,
  listEntries,
  setEntriesPaid,
  type FinanceiroEntry,
} from '@/lib/financeiro-db';

const isIdList = (ids: unknown): ids is string[] =>
  Array.isArray(ids) &&
  ids.length > 0 &&
  ids.every((id) => typeof id === 'string');

export const POST = withSession(async (request, session) => {
  const { entries } = (await request.json()) as {
    entries?: Omit<FinanceiroEntry, 'id'>[];
  };

  if (!Array.isArray(entries) || entries.length === 0) {
    return jsonError('Dados inválidos.');
  }

  await createEntries(
    session.userId,
    entries.map((entry) => ({
      ...entry,
      isArchivedPaid: Boolean(entry.isArchivedPaid),
    })),
  );

  return NextResponse.json({ entries: await listEntries(session.userId) });
});

export const DELETE = withSession(async (request, session) => {
  const { ids } = await request.json();
  if (!isIdList(ids)) {
    return jsonError('IDs inválidos.');
  }

  await deleteEntries(session.userId, ids);
  return NextResponse.json({ entries: await listEntries(session.userId) });
});

export const PATCH = withSession(async (request, session) => {
  const { ids, isPaid } = await request.json();
  if (!isIdList(ids) || typeof isPaid !== 'boolean') {
    return jsonError('Dados inválidos.');
  }

  await setEntriesPaid(session.userId, ids, isPaid);
  return NextResponse.json({ entries: await listEntries(session.userId) });
});
