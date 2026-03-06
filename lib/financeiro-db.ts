import crypto from 'node:crypto';
import { dbExec, dbQuery, dbQueryOne } from '@/lib/db';

export type EntryType = 'receita' | 'despesa';

export interface FinanceiroCategory {
  id: string;
  name: string;
  tone: string;
}

export interface FinanceiroEntry {
  id: string;
  date: string;
  description: string;
  categoryId: string;
  amount: number;
  type: EntryType;
  isFixed: boolean;
}

const DEFAULT_CATEGORIES: Array<{ name: string; tone: string }> = [
  { name: 'Transporte', tone: 'info' },
  { name: 'Saúde', tone: 'error' },
  { name: 'Lazer', tone: 'accent' },
  { name: 'Salário', tone: 'success' },
];

export async function ensureDefaultCategories(userId: number) {
  const total = await dbQueryOne<{ total: number }>(
    'SELECT COUNT(*)::int as total FROM financeiro_categories WHERE user_id = $1',
    [userId],
  );

  if ((total?.total ?? 0) > 0) {
    return;
  }

  await Promise.all(
    DEFAULT_CATEGORIES.map((item) =>
      dbExec(
        'INSERT INTO financeiro_categories (id, user_id, name, tone) VALUES ($1, $2, $3, $4)',
        [crypto.randomUUID(), userId, item.name, item.tone],
      ),
    ),
  );
}

export async function listCategories(userId: number) {
  return dbQuery<FinanceiroCategory>(
    'SELECT id, name, tone FROM financeiro_categories WHERE user_id = $1 ORDER BY created_at ASC',
    [userId],
  );
}

export async function listEntries(userId: number) {
  const rows = await dbQuery<{
    id: string;
    date: string;
    description: string;
    category_id: string;
    amount: number;
    type: EntryType;
    is_fixed: boolean;
  }>(
    `
      SELECT id, date, description, category_id, amount, type, is_fixed
      FROM financeiro_entries
      WHERE user_id = $1
      ORDER BY date DESC, created_at DESC
    `,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    description: row.description,
    categoryId: row.category_id,
    amount: row.amount,
    type: row.type,
    isFixed: Boolean(row.is_fixed),
  }));
}

export async function createEntry(
  userId: number,
  data: Omit<FinanceiroEntry, 'id'>,
) {
  const id = crypto.randomUUID();

  await dbExec(
    `
      INSERT INTO financeiro_entries
        (id, user_id, date, description, category_id, amount, type, is_fixed)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      id,
      userId,
      data.date,
      data.description,
      data.categoryId,
      data.amount,
      data.type,
      data.isFixed,
    ],
  );

  return id;
}

export async function updateEntry(
  userId: number,
  entryId: string,
  data: Partial<Omit<FinanceiroEntry, 'id'>>,
) {
  const updateParts: string[] = [];
  const params: Array<string | number | boolean> = [];

  if (typeof data.date === 'string') {
    params.push(data.date);
    updateParts.push(`date = $${params.length}`);
  }

  if (typeof data.description === 'string') {
    params.push(data.description);
    updateParts.push(`description = $${params.length}`);
  }

  if (typeof data.categoryId === 'string') {
    params.push(data.categoryId);
    updateParts.push(`category_id = $${params.length}`);
  }

  if (typeof data.amount === 'number') {
    params.push(data.amount);
    updateParts.push(`amount = $${params.length}`);
  }

  if (data.type === 'receita' || data.type === 'despesa') {
    params.push(data.type);
    updateParts.push(`type = $${params.length}`);
  }

  if (typeof data.isFixed === 'boolean') {
    params.push(data.isFixed);
    updateParts.push(`is_fixed = $${params.length}`);
  }

  if (updateParts.length === 0) {
    return;
  }

  updateParts.push('updated_at = NOW()');

  params.push(entryId, userId);

  await dbExec(
    `
      UPDATE financeiro_entries
      SET ${updateParts.join(', ')}
      WHERE id = $${params.length - 1} AND user_id = $${params.length}
    `,
    params,
  );
}

export async function deleteEntry(userId: number, entryId: string) {
  await dbExec(
    'DELETE FROM financeiro_entries WHERE id = $1 AND user_id = $2',
    [entryId, userId],
  );
}

export async function createCategory(
  userId: number,
  data: Omit<FinanceiroCategory, 'id'>,
) {
  const id = crypto.randomUUID();

  await dbExec(
    'INSERT INTO financeiro_categories (id, user_id, name, tone) VALUES ($1, $2, $3, $4)',
    [id, userId, data.name, data.tone],
  );

  return id;
}

export async function updateCategory(
  userId: number,
  categoryId: string,
  data: Partial<Omit<FinanceiroCategory, 'id'>>,
) {
  const updateParts: string[] = [];
  const params: Array<string | number> = [];

  if (typeof data.name === 'string') {
    params.push(data.name);
    updateParts.push(`name = $${params.length}`);
  }

  if (typeof data.tone === 'string') {
    params.push(data.tone);
    updateParts.push(`tone = $${params.length}`);
  }

  if (updateParts.length === 0) {
    return;
  }

  params.push(categoryId, userId);

  await dbExec(
    `
      UPDATE financeiro_categories
      SET ${updateParts.join(', ')}
      WHERE id = $${params.length - 1} AND user_id = $${params.length}
    `,
    params,
  );
}

export async function deleteCategory(userId: number, categoryId: string) {
  await dbExec(
    "UPDATE financeiro_entries SET category_id = '' WHERE user_id = $1 AND category_id = $2",
    [userId, categoryId],
  );

  await dbExec(
    'DELETE FROM financeiro_categories WHERE id = $1 AND user_id = $2',
    [categoryId, userId],
  );
}
