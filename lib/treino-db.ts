import { dbExec, dbQuery } from '@/lib/db';

export interface TreinoSet {
  reps: number | null;
  weight: number | null;
}

export interface Treino {
  id: string;
  title: string;
  description: string | null;
  tone: string;
  exercicios: TreinoExercicio[];
}

export interface TreinoExercicio {
  id: string;
  treinoId: string;
  name: string;
  sets: TreinoSet[];
  orderIndex: number;
}

type ExercicioInput = {
  name: string;
  sets: TreinoSet[];
};

const MAX_SETS = 20;

export async function listTreinos(userId: number): Promise<Treino[]> {
  const treinos = await dbQuery<{
    id: string;
    title: string;
    description: string | null;
    tone: string;
  }>(
    'SELECT id, title, description, tone FROM treinos WHERE user_id = $1 ORDER BY created_at ASC',
    [userId],
  );

  const exercicios = await dbQuery<{
    id: string;
    treino_id: string;
    name: string;
    sets: TreinoSet[];
    order_index: number;
  }>(
    `SELECT te.id, te.treino_id, te.name, te.sets, te.order_index
     FROM treino_exercicios te
     JOIN treinos t ON te.treino_id = t.id
     WHERE t.user_id = $1
     ORDER BY te.order_index ASC, te.created_at ASC`,
    [userId],
  );

  return treinos.map((treino) => ({
    ...treino,
    exercicios: exercicios
      .filter((e) => e.treino_id === treino.id)
      .map((e) => ({
        id: e.id,
        treinoId: e.treino_id,
        name: e.name,
        sets: e.sets ?? [],
        orderIndex: e.order_index,
      })),
  }));
}

export async function createTreino(
  userId: number,
  data: { title: string; description?: string | null; tone: string },
) {
  const id = crypto.randomUUID();
  await dbExec(
    'INSERT INTO treinos (id, user_id, title, description, tone) VALUES ($1, $2, $3, $4, $5)',
    [id, userId, data.title, data.description || null, data.tone],
  );
  return id;
}

export async function updateTreino(
  userId: number,
  treinoId: string,
  data: Partial<{ title: string; description: string | null; tone: string }>,
) {
  const sets: string[] = [];
  const params: unknown[] = [];
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
  params.push(treinoId, userId);

  await dbExec(
    `UPDATE treinos SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i++}`,
    params,
  );
}

export async function deleteTreino(userId: number, treinoId: string) {
  await dbExec('DELETE FROM treinos WHERE id = $1 AND user_id = $2', [
    treinoId,
    userId,
  ]);
}

// Exercise mutations check that the parent treino belongs to the user.
export async function createExercicio(
  userId: number,
  treinoId: string,
  data: Partial<ExercicioInput> & { name: string },
) {
  const id = crypto.randomUUID();
  await dbExec(
    `INSERT INTO treino_exercicios (id, treino_id, name, sets, order_index)
     SELECT $1, t.id, $3, $4::jsonb,
       (SELECT COALESCE(MAX(order_index), -1) + 1 FROM treino_exercicios WHERE treino_id = t.id)
     FROM treinos t
     WHERE t.id = $2 AND t.user_id = $5`,
    [id, treinoId, data.name, JSON.stringify(data.sets ?? []), userId],
  );
  return id;
}

export async function updateExercicio(
  userId: number,
  treinoId: string,
  exercicioId: string,
  data: Partial<ExercicioInput>,
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (data.name !== undefined) {
    sets.push(`name = $${i++}`);
    params.push(data.name);
  }
  if (data.sets !== undefined) {
    sets.push(`sets = $${i++}::jsonb`);
    params.push(JSON.stringify(data.sets));
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = NOW()`);
  params.push(exercicioId, treinoId, userId);

  await dbExec(
    `UPDATE treino_exercicios SET ${sets.join(', ')}
     WHERE id = $${i++} AND treino_id = $${i++}
       AND EXISTS (SELECT 1 FROM treinos t WHERE t.id = treino_exercicios.treino_id AND t.user_id = $${i++})`,
    params,
  );
}

export async function reorderExercicios(
  userId: number,
  treinoId: string,
  orderedIds: string[],
) {
  await dbExec(
    `UPDATE treino_exercicios te
     SET order_index = o.position - 1, updated_at = NOW()
     FROM unnest($1::text[]) WITH ORDINALITY AS o(id, position)
     WHERE te.id = o.id AND te.treino_id = $2
       AND EXISTS (SELECT 1 FROM treinos t WHERE t.id = te.treino_id AND t.user_id = $3)`,
    [orderedIds, treinoId, userId],
  );
}

export async function deleteExercicio(
  userId: number,
  treinoId: string,
  exercicioId: string,
) {
  await dbExec(
    `DELETE FROM treino_exercicios
     WHERE id = $1 AND treino_id = $2
       AND EXISTS (SELECT 1 FROM treinos t WHERE t.id = treino_exercicios.treino_id AND t.user_id = $3)`,
    [exercicioId, treinoId, userId],
  );
}

function toNullableNumber(value: unknown, integer: boolean) {
  if (value === null || value === undefined || value === '') return null;
  const parsed =
    typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return integer ? Math.round(parsed) : parsed;
}

// Normalizes a request body into the fields accepted for an exercise.
export function parseExercicioInput(body: Record<string, unknown>) {
  const data: Partial<ExercicioInput> = {};

  if (typeof body.name === 'string') data.name = body.name.trim();
  if (Array.isArray(body.sets)) {
    data.sets = body.sets.slice(0, MAX_SETS).map((set) => ({
      reps: toNullableNumber(set?.reps, true),
      weight: toNullableNumber(set?.weight, false),
    }));
  }

  return data;
}
