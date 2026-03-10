import { dbQuery } from './lib/db';

async function debugConstraints() {
  try {
    console.log('--- Inspecting Constraints for financeiro_entries ---');
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

    console.table(constraints);

    console.log(
      '--- Constraint Types: p = primary key, f = foreign key, c = check ---',
    );
    console.log(
      '--- Foreign Key Delete Options: a = no action, r = restrict, c = cascade, n = set null, d = set default ---',
    );

    const columns = await dbQuery(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'financeiro_entries'
      ORDER BY ordinal_position;
    `);
    console.table(columns);
  } catch (error: unknown) {
    console.error('Debug failed:', error);
  } finally {
    process.exit();
  }
}

debugConstraints();
