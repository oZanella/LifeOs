import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const dataDir = process.env.DB_DATA_DIR
  ? path.resolve(process.env.DB_DATA_DIR)
  : isVercel
    ? '/tmp/life-os-data'
    : path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'life-os.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Better concurrency for Next.js route handlers.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    avatar_url TEXT,
    is_admin INTEGER NOT NULL DEFAULT 0,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS financeiro_categories (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    tone TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS financeiro_entries (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('receita', 'despesa')),
    is_fixed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_financeiro_entries_user_id ON financeiro_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_financeiro_categories_user_id ON financeiro_categories(user_id);
`);

const userColumns = db
  .prepare("PRAGMA table_info('users')")
  .all() as Array<{ name: string }>;
const hasEmailColumn = userColumns.some((column) => column.name === 'email');
const hasAdminColumn = userColumns.some((column) => column.name === 'is_admin');
const hasAvatarColumn = userColumns.some((column) => column.name === 'avatar_url');

if (!hasEmailColumn) {
  db.exec('ALTER TABLE users ADD COLUMN email TEXT');
}

if (!hasAdminColumn) {
  db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');
}

if (!hasAvatarColumn) {
  db.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT');
}

db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email)');

export { db };
