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
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
  
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_financeiro_entries_user_id ON financeiro_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_categories_user_id ON financeiro_categories(user_id);
  
      -- Migrations
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE financeiro_entries DROP CONSTRAINT financeiro_entries_type_check;
        EXCEPTION
          WHEN undefined_object THEN NULL;
        END;
        ALTER TABLE financeiro_entries ADD CONSTRAINT financeiro_entries_type_check CHECK (type IN ('receita', 'despesa', 'investimento'));
      END $$;
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
