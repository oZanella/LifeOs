import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  ensureDefaultCategories,
  listCategories,
  listEntries,
} from '@/lib/financeiro-db';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  await ensureDefaultCategories(session.userId);

  return NextResponse.json({
    categories: await listCategories(session.userId),
    entries: await listEntries(session.userId),
  });
}
