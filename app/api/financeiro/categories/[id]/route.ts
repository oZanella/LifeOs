import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api';
import {
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/lib/financeiro-db';

type Params = { id: string };

export const PATCH = withSession<Params>(async (request, session, { id }) => {
  await updateCategory(session.userId, id, await request.json());
  return NextResponse.json({
    categories: await listCategories(session.userId),
  });
});

export const DELETE = withSession<Params>(async (_request, session, { id }) => {
  await deleteCategory(session.userId, id);
  return NextResponse.json({
    categories: await listCategories(session.userId),
  });
});
