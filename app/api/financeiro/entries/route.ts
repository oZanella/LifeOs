import { NextResponse } from 'next/server';
import { jsonError, withSession } from '@/lib/api';
import {
  createEntry,
  isEntryType,
  listEntries,
  type FinanceiroEntry,
} from '@/lib/financeiro-db';

export const POST = withSession(async (request, session) => {
  const body = (await request.json()) as Partial<FinanceiroEntry>;

  if (
    !body.date ||
    !body.description ||
    typeof body.categoryId !== 'string' ||
    typeof body.amount !== 'number' ||
    !isEntryType(body.type)
  ) {
    return jsonError('Dados inválidos.');
  }

  const createdEntryId = await createEntry(session.userId, {
    date: body.date,
    description: body.description,
    categoryId: body.categoryId,
    amount: body.amount,
    type: body.type,
    isFixed: Boolean(body.isFixed),
    isPaid: Boolean(body.isPaid),
    isArchivedPaid: false,
  });

  return NextResponse.json({
    entries: await listEntries(session.userId),
    createdEntryId,
  });
});
