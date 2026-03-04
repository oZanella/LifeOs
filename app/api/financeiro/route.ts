import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  ensureDefaultCategories,
  listCategories,
  listEntries,
} from '@/lib/financeiro-db';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  ensureDefaultCategories(session.userId);

  return NextResponse.json({
    categories: listCategories(session.userId),
    entries: listEntries(session.userId),
  });
}
