import { dbExec, dbQuery } from '@/lib/db';

export interface Meta {
  id: string;
  title: string;
  description: string | null;
  tone: string;
  tasks?: MetaTask[];
}

export interface MetaTask {
  id: string;
  metaId: string;
  description: string;
  completed: boolean;
  isHighlighted: boolean;
  orderIndex: number;
}

export async function listMetas(userId: number): Promise<Meta[]> {
  const metas = await dbQuery<{
    id: string;
    title: string;
    description: string | null;
    tone: string;
  }>(
    'SELECT id, title, description, tone FROM metas WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );

  const tasks = await dbQuery<{
    id: string;
    meta_id: string;
    description: string;
    completed: boolean;
    is_highlighted: boolean;
    order_index: number;
  }>(
    `SELECT mt.id, mt.meta_id, mt.description, mt.completed, mt.is_highlighted, mt.order_index 
     FROM meta_tasks mt
     JOIN metas m ON mt.meta_id = m.id
     WHERE m.user_id = $1
     ORDER BY mt.order_index ASC, mt.created_at ASC`,
    [userId],
  );

  return metas.map((meta) => ({
    ...meta,
    tasks: tasks
      .filter((t) => t.meta_id === meta.id)
      .map((t) => ({
        id: t.id,
        metaId: t.meta_id,
        description: t.description,
        completed: t.completed,
        isHighlighted: t.is_highlighted,
        orderIndex: t.order_index,
      })),
  }));
}

export async function createMeta(
  userId: number,
  data: { title: string; description?: string; tone: string },
) {
  const id = crypto.randomUUID();
  await dbExec(
    'INSERT INTO metas (id, user_id, title, description, tone) VALUES ($1, $2, $3, $4, $5)',
    [id, userId.toString(), data.title, data.description || null, data.tone],
  );
  return id;
}

export async function updateMeta(
  userId: number,
  metaId: string,
  data: Partial<{ title: string; description: string | null; tone: string }>,
) {
  const sets: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (data.title !== undefined) {
    sets.push(`title = $${i++}`);
    params.push(data.title);
  }
  if (data.description !== undefined) {
    sets.push(`description = $${i++}`);
    params.push(data.description);
  }
  if (data.tone !== undefined) {
    sets.push(`tone = $${i++}`);
    params.push(data.tone);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = NOW()`);
  params.push(metaId, userId);

  await dbExec(
    `UPDATE metas SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i++}`,
    params,
  );
}

export async function deleteMeta(userId: number, metaId: string) {
  await dbExec('DELETE FROM metas WHERE id = $1 AND user_id = $2', [
    metaId,
    userId,
  ]);
}

export async function createTask(
  metaId: string,
  data: { description: string; orderIndex?: number },
) {
  const id = crypto.randomUUID();
  await dbExec(
    'INSERT INTO meta_tasks (id, meta_id, description, order_index) VALUES ($1, $2, $3, $4)',
    [id, metaId, data.description, data.orderIndex || 0],
  );
  return id;
}

export async function updateTask(
  taskId: string,
  data: Partial<{
    description: string;
    completed: boolean;
    isHighlighted: boolean;
    orderIndex: number;
  }>,
) {
  const sets: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (data.description !== undefined) {
    sets.push(`description = $${i++}`);
    params.push(data.description);
  }
  if (data.completed !== undefined) {
    sets.push(`completed = $${i++}`);
    params.push(data.completed);
  }
  if (data.isHighlighted !== undefined) {
    sets.push(`is_highlighted = $${i++}`);
    params.push(data.isHighlighted);
  }
  if (data.orderIndex !== undefined) {
    sets.push(`order_index = $${i++}`);
    params.push(data.orderIndex);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = NOW()`);
  params.push(taskId);

  await dbExec(
    `UPDATE meta_tasks SET ${sets.join(', ')} WHERE id = $${i++}`,
    params,
  );
}

export async function deleteTask(taskId: string) {
  await dbExec('DELETE FROM meta_tasks WHERE id = $1', [taskId]);
}
