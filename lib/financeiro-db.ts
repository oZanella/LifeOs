import crypto from 'node:crypto';
import { db } from '@/lib/db';

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
  { name: 'Alimentacao', tone: 'secondary' },
  { name: 'Transporte', tone: 'info' },
  { name: 'Saude', tone: 'error' },
  { name: 'Lazer', tone: 'accent' },
  { name: 'Salario', tone: 'success' },
];

export function ensureDefaultCategories(userId: number) {
  const total = db
    .prepare('SELECT COUNT(*) as total FROM financeiro_categories WHERE user_id = ?')
    .get(userId) as { total: number };

  if (total.total > 0) {
    return;
  }

  const stmt = db.prepare(
    'INSERT INTO financeiro_categories (id, user_id, name, tone) VALUES (?, ?, ?, ?)',
  );

  const insertMany = db.transaction(() => {
    for (const item of DEFAULT_CATEGORIES) {
      stmt.run(crypto.randomUUID(), userId, item.name, item.tone);
    }
  });

  insertMany();
}

export function listCategories(userId: number) {
  return db
    .prepare(
      'SELECT id, name, tone FROM financeiro_categories WHERE user_id = ? ORDER BY created_at ASC',
    )
    .all(userId) as FinanceiroCategory[];
}

export function listEntries(userId: number) {
  const rows = db
    .prepare(
      `
      SELECT id, date, description, category_id, amount, type, is_fixed
      FROM financeiro_entries
      WHERE user_id = ?
      ORDER BY date DESC, created_at DESC
      `,
    )
    .all(userId) as Array<{
    id: string;
    date: string;
    description: string;
    category_id: string;
    amount: number;
    type: EntryType;
    is_fixed: number;
  }>;

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

export function createEntry(userId: number, data: Omit<FinanceiroEntry, 'id'>) {
  const id = crypto.randomUUID();

  db.prepare(
    `
    INSERT INTO financeiro_entries
      (id, user_id, date, description, category_id, amount, type, is_fixed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    id,
    userId,
    data.date,
    data.description,
    data.categoryId,
    data.amount,
    data.type,
    data.isFixed ? 1 : 0,
  );

  return id;
}

export function updateEntry(
  userId: number,
  entryId: string,
  data: Partial<Omit<FinanceiroEntry, 'id'>>,
) {
  const updateParts: string[] = [];
  const params: Array<string | number> = [];

  if (typeof data.date === 'string') {
    updateParts.push('date = ?');
    params.push(data.date);
  }

  if (typeof data.description === 'string') {
    updateParts.push('description = ?');
    params.push(data.description);
  }

  if (typeof data.categoryId === 'string') {
    updateParts.push('category_id = ?');
    params.push(data.categoryId);
  }

  if (typeof data.amount === 'number') {
    updateParts.push('amount = ?');
    params.push(data.amount);
  }

  if (data.type === 'receita' || data.type === 'despesa') {
    updateParts.push('type = ?');
    params.push(data.type);
  }

  if (typeof data.isFixed === 'boolean') {
    updateParts.push('is_fixed = ?');
    params.push(data.isFixed ? 1 : 0);
  }

  if (updateParts.length === 0) {
    return;
  }

  updateParts.push("updated_at = datetime('now')");

  db.prepare(
    `
    UPDATE financeiro_entries
    SET ${updateParts.join(', ')}
    WHERE id = ? AND user_id = ?
    `,
  ).run(...params, entryId, userId);
}

export function deleteEntry(userId: number, entryId: string) {
  db.prepare('DELETE FROM financeiro_entries WHERE id = ? AND user_id = ?').run(
    entryId,
    userId,
  );
}

export function createCategory(
  userId: number,
  data: Omit<FinanceiroCategory, 'id'>,
) {
  const id = crypto.randomUUID();

  db.prepare(
    'INSERT INTO financeiro_categories (id, user_id, name, tone) VALUES (?, ?, ?, ?)',
  ).run(id, userId, data.name, data.tone);

  return id;
}

export function updateCategory(
  userId: number,
  categoryId: string,
  data: Partial<Omit<FinanceiroCategory, 'id'>>,
) {
  const updateParts: string[] = [];
  const params: string[] = [];

  if (typeof data.name === 'string') {
    updateParts.push('name = ?');
    params.push(data.name);
  }

  if (typeof data.tone === 'string') {
    updateParts.push('tone = ?');
    params.push(data.tone);
  }

  if (updateParts.length === 0) {
    return;
  }

  db.prepare(
    `
    UPDATE financeiro_categories
    SET ${updateParts.join(', ')}
    WHERE id = ? AND user_id = ?
    `,
  ).run(...params, categoryId, userId);
}

export function deleteCategory(userId: number, categoryId: string) {
  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE financeiro_entries SET category_id = '' WHERE user_id = ? AND category_id = ?",
    ).run(userId, categoryId);
    db.prepare('DELETE FROM financeiro_categories WHERE id = ? AND user_id = ?').run(
      categoryId,
      userId,
    );
  });

  tx();
}
