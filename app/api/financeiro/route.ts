import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import {
  ensureDefaultCategories,
  listCategories,
  listEntries,
} from '@/lib/financeiro-db';

export const GET = withSession(async (_request, session) => {
  await ensureDefaultCategories(session.userId);

  const [categories, entries] = await Promise.all([
    listCategories(session.userId),
    listEntries(session.userId),
  ]);

  return NextResponse.json({ categories, entries });
});
