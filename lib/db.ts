import { Pool, QueryResultRow } from 'pg';

declare global {
  var __lifeOsPgPool: Pool | undefined;
  var __lifeOsPgReady: Promise<void> | undefined;
}

function getPool() {
  if (globalThis.__lifeOsPgPool) {
    return globalThis.__lifeOsPgPool;
  }

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NO_SSL;

  if (!connectionString) {
    throw new Error(
      'Banco nao configurado. Defina DATABASE_URL ou conecte o Vercel Postgres (POSTGRES_URL).',
    );
  }

  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  });

  globalThis.__lifeOsPgPool = pool;
  return pool;
}

async function runMigrations() {
  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        avatar_url TEXT,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
  
      CREATE TABLE IF NOT EXISTS sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
  
      CREATE TABLE IF NOT EXISTS financeiro_categories (
        id TEXT PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        tone TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
  
      CREATE TABLE IF NOT EXISTS financeiro_entries (
        id TEXT PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('receita', 'despesa', 'investimento')),
        is_fixed BOOLEAN NOT NULL DEFAULT FALSE,
        parent_id TEXT REFERENCES financeiro_entries(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
  
      -- Migrations
      DO $$ 
      DECLARE
        fk_name TEXT;
      BEGIN
        -- Ensure parent_id exists (older DBs may already have it without FK).
        BEGIN
          ALTER TABLE financeiro_entries ADD COLUMN parent_id TEXT;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;

        -- Remove orphan rows (from DBs where FK wasn't enforced previously).
        DELETE FROM financeiro_entries e
        WHERE e.parent_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM financeiro_entries p WHERE p.id = e.parent_id
          );

        -- Ensure FK exists and cascades: drop any FK on parent_id and re-add.
        FOR fk_name IN
          SELECT c.conname
          FROM pg_constraint c
          JOIN pg_attribute a
            ON a.attnum = ANY (c.conkey) AND a.attrelid = c.conrelid
          WHERE c.conrelid = 'financeiro_entries'::regclass
            AND c.contype = 'f'
            AND a.attname = 'parent_id'
        LOOP
          EXECUTE format('ALTER TABLE financeiro_entries DROP CONSTRAINT %I', fk_name);
        END LOOP;

        BEGIN
          ALTER TABLE financeiro_entries
            ADD CONSTRAINT financeiro_entries_parent_id_fkey
            FOREIGN KEY (parent_id)
            REFERENCES financeiro_entries(id)
            ON DELETE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END;

        BEGIN
          ALTER TABLE financeiro_entries DROP CONSTRAINT financeiro_entries_type_check;
        EXCEPTION
          WHEN undefined_object THEN NULL;
        END;
        ALTER TABLE financeiro_entries ADD CONSTRAINT financeiro_entries_type_check CHECK (type IN ('receita', 'despesa', 'investimento'));
      END $$;

      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_financeiro_entries_user_id ON financeiro_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_categories_user_id ON financeiro_categories(user_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_entries_parent_id ON financeiro_entries(parent_id);
    `);
    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
}

export async function ensureDbReady() {
  // if (!globalThis.__lifeOsPgReady) {
  globalThis.__lifeOsPgReady = runMigrations();
  // }

  await globalThis.__lifeOsPgReady;
}

export async function dbQuery<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const pool = getPool();
  await ensureDbReady();
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function dbQueryOne<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const rows = await dbQuery<T>(text, params);
  return rows[0];
}

export async function dbExec(text: string, params: unknown[] = []) {
  const pool = getPool();
  await ensureDbReady();
  await pool.query(text, params);
}
