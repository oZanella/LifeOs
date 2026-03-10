import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET() {
  try {
    const constraints = await dbQuery(`
      SELECT
        conname,
        contype,
        confupdtype,
        confdeltype,
        a.attname AS column_name
      FROM
        pg_constraint c
      JOIN
        pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
      WHERE
        conrelid = 'financeiro_entries'::regclass;
    `);

    const columns = await dbQuery(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'financeiro_entries'
      ORDER BY ordinal_position;
    `);

    return NextResponse.json({ constraints, columns });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
