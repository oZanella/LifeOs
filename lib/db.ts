import { Pool, QueryResultRow } from 'pg';

declare global {
  var __lifeOsPgPool: Pool | undefined;
  var __lifeOsPgReady: Promise<void> | undefined;
  var __lifeOsPgSchemaVersion: number | undefined;
}

// Bump when runMigrations changes so a running dev server (whose globals
// survive hot reload) applies the new schema without a restart.
const SCHEMA_VERSION = 5;

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

  const needsSsl = !/@(localhost|127\.0\.0\.1)(:\d+)?\//i.test(
    connectionString,
  );

  const pool = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
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
        is_paid BOOLEAN NOT NULL DEFAULT FALSE,
        is_archived_paid BOOLEAN NOT NULL DEFAULT FALSE,
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

        -- Ensure is_paid exists for legacy DBs.
        BEGIN
          ALTER TABLE financeiro_entries ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT FALSE;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;

        -- Entries preserved from deleted installments already paid in past months.
        BEGIN
          ALTER TABLE financeiro_entries ADD COLUMN is_archived_paid BOOLEAN NOT NULL DEFAULT FALSE;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;

        -- Remove orphan rows (from DBs where FK wasn't enforced previously).
        DELETE FROM financeiro_entries e
        WHERE e.parent_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM financeiro_entries p WHERE p.id = e.parent_id
          );

        -- Ensure FK exists and cascades: add if not exists.
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_entries_parent_id_fkey'
        ) THEN
          ALTER TABLE financeiro_entries
            ADD CONSTRAINT financeiro_entries_parent_id_fkey
            FOREIGN KEY (parent_id)
            REFERENCES financeiro_entries(id)
            ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_entries_type_check'
        ) THEN
          ALTER TABLE financeiro_entries ADD CONSTRAINT financeiro_entries_type_check CHECK (type IN ('receita', 'despesa', 'investimento'));
        END IF;

        -- Ensure parent_id exists on financeiro_categories for subcategories.
        BEGIN
          ALTER TABLE financeiro_categories ADD COLUMN parent_id TEXT;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;

        -- Remove references to parents that no longer exist (legacy DBs).
        UPDATE financeiro_categories c
        SET parent_id = NULL
        WHERE c.parent_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM financeiro_categories p WHERE p.id = c.parent_id
          );

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_categories_parent_id_fkey'
        ) THEN
          ALTER TABLE financeiro_categories
            ADD CONSTRAINT financeiro_categories_parent_id_fkey
            FOREIGN KEY (parent_id)
            REFERENCES financeiro_categories(id)
            ON DELETE SET NULL;
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_financeiro_entries_user_id ON financeiro_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_categories_user_id ON financeiro_categories(user_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_entries_parent_id ON financeiro_entries(parent_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_categories_parent_id ON financeiro_categories(parent_id);
  
      CREATE TABLE IF NOT EXISTS metas (
        id TEXT PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        tone TEXT NOT NULL DEFAULT 'warning',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS meta_tasks (
        id TEXT PRIMARY KEY,
        meta_id TEXT NOT NULL REFERENCES metas(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_metas_user_id ON metas(user_id);
      CREATE INDEX IF NOT EXISTS idx_meta_tasks_meta_id ON meta_tasks(meta_id);

      CREATE TABLE IF NOT EXISTS treinos (
        id TEXT PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        tone TEXT NOT NULL DEFAULT 'default',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS treino_exercicios (
        id TEXT PRIMARY KEY,
        treino_id TEXT NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        -- Each set is { reps, weight }.
        sets JSONB NOT NULL DEFAULT '[]'::jsonb,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      DO $$
      BEGIN
        BEGIN
          ALTER TABLE treino_exercicios ADD COLUMN sets JSONB NOT NULL DEFAULT '[]'::jsonb;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END;

        -- Legacy DBs stored series/repetitions/weight as flat columns:
        -- convert them into individual sets, then drop them.
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'treino_exercicios'
            AND column_name = 'series'
        ) THEN
          EXECUTE $sql$
            UPDATE treino_exercicios
            SET sets = (
              SELECT jsonb_agg(jsonb_build_object('reps', repetitions, 'weight', weight) ORDER BY g)
              FROM generate_series(1, GREATEST(COALESCE(series, 1), 1)) AS g
            )
            WHERE sets = '[]'::jsonb
              AND (series IS NOT NULL OR repetitions IS NOT NULL OR weight IS NOT NULL)
          $sql$;
        END IF;

        ALTER TABLE treino_exercicios
          DROP COLUMN IF EXISTS series,
          DROP COLUMN IF EXISTS repetitions,
          DROP COLUMN IF EXISTS weight,
          DROP COLUMN IF EXISTS muscle_group,
          DROP COLUMN IF EXISTS notes;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_treinos_user_id ON treinos(user_id);
      CREATE INDEX IF NOT EXISTS idx_treino_exercicios_treino_id ON treino_exercicios(treino_id);
    `);
    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
}

async function ensureDbReady() {
  if (
    !globalThis.__lifeOsPgReady ||
    globalThis.__lifeOsPgSchemaVersion !== SCHEMA_VERSION
  ) {
    globalThis.__lifeOsPgSchemaVersion = SCHEMA_VERSION;
    // Forget a failed run so the next request retries instead of failing forever.
    globalThis.__lifeOsPgReady = runMigrations().catch((error) => {
      globalThis.__lifeOsPgReady = undefined;
      throw error;
    });
  }

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
