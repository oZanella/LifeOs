import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'life-os-session';

const SESSION_DURATION_DAYS = 30;

interface SessionRow {
  user_id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  is_admin: number;
  token: string;
  expires_at: string;
}

interface UserRow {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  is_admin: number;
  password_hash: string;
  password_salt: string;
}

interface UpdateUserInput {
  email?: string;
  username?: string;
  password?: string;
  avatarUrl?: string;
}

interface AdminUpdateUserInput extends UpdateUserInput {
  isAdmin?: boolean;
}

export function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
}

export function createPasswordRecord(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return { salt, hash };
}

export function verifyPassword(password: string, user: UserRow) {
  const calculated = hashPassword(password, user.password_salt);
  const provided = Buffer.from(calculated, 'hex');
  const expected = Buffer.from(user.password_hash, 'hex');

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function findUserByUsername(username: string) {
  return db
    .prepare(
      'SELECT id, username, email, avatar_url, is_admin, password_hash, password_salt FROM users WHERE username = ?',
    )
    .get(normalizeUsername(username)) as UserRow | undefined;
}

export function findUserByEmail(email: string) {
  return db
    .prepare(
      'SELECT id, username, email, avatar_url, is_admin, password_hash, password_salt FROM users WHERE email = ?',
    )
    .get(normalizeEmail(email)) as UserRow | undefined;
}

export function findUserById(userId: number) {
  return db
    .prepare(
      'SELECT id, username, email, avatar_url, is_admin, password_hash, password_salt FROM users WHERE id = ?',
    )
    .get(userId) as UserRow | undefined;
}

export function createUser(email: string, username: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  const { salt, hash } = createPasswordRecord(password);
  const isAdminByDefault = true;

  const result = db
    .prepare(
      'INSERT INTO users (username, email, avatar_url, is_admin, password_hash, password_salt) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(normalizedUsername, normalizedEmail, null, isAdminByDefault ? 1 : 0, hash, salt);

  return {
    id: Number(result.lastInsertRowid),
    username: normalizedUsername,
    email: normalizedEmail,
    avatarUrl: null,
    isAdmin: isAdminByDefault,
  };
}

export function createSession(userId: number) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
    userId,
    token,
    expiresAt.toISOString(),
  );

  return {
    token,
    expiresAt,
  };
}

export function updateUserAccount(userId: number, data: UpdateUserInput) {
  const updates: string[] = [];
  const params: Array<string | number | null> = [];

  if (typeof data.email === 'string' && data.email.length > 0) {
    updates.push('email = ?');
    params.push(normalizeEmail(data.email));
  }

  if (typeof data.username === 'string' && data.username.length > 0) {
    updates.push('username = ?');
    params.push(normalizeUsername(data.username));
  }

  if (typeof data.password === 'string' && data.password.length > 0) {
    const { salt, hash } = createPasswordRecord(data.password);
    updates.push('password_hash = ?');
    updates.push('password_salt = ?');
    params.push(hash, salt);
  }

  if (typeof data.avatarUrl === 'string') {
    updates.push('avatar_url = ?');
    params.push(data.avatarUrl.trim() || null);
  }

  if (updates.length === 0) {
    return null;
  }

  db.prepare(
    `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = ?
    `,
  ).run(...params, userId);

  return findUserById(userId);
}

export function deleteUserById(userId: number) {
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
}

export function listUsersForAdmin() {
  const rows = db
    .prepare(
      `SELECT id, username, email, is_admin, created_at
      , avatar_url
       FROM users
       ORDER BY created_at ASC`,
    )
    .all() as Array<{
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
    is_admin: number;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url,
    isAdmin: Boolean(row.is_admin),
    createdAt: row.created_at,
  }));
}

export function countAdmins() {
  const row = db
    .prepare('SELECT COUNT(*) as total FROM users WHERE is_admin = 1')
    .get() as { total: number };
  return row.total;
}

export function updateUserByAdmin(userId: number, data: AdminUpdateUserInput) {
  const updates: string[] = [];
  const params: Array<string | number | null> = [];

  if (typeof data.email === 'string' && data.email.length > 0) {
    updates.push('email = ?');
    params.push(normalizeEmail(data.email));
  }

  if (typeof data.username === 'string' && data.username.length > 0) {
    updates.push('username = ?');
    params.push(normalizeUsername(data.username));
  }

  if (typeof data.password === 'string' && data.password.length > 0) {
    const { salt, hash } = createPasswordRecord(data.password);
    updates.push('password_hash = ?');
    updates.push('password_salt = ?');
    params.push(hash, salt);
  }

  if (typeof data.avatarUrl === 'string') {
    updates.push('avatar_url = ?');
    params.push(data.avatarUrl.trim() || null);
  }

  if (typeof data.isAdmin === 'boolean') {
    updates.push('is_admin = ?');
    params.push(data.isAdmin ? 1 : 0);
  }

  if (updates.length === 0) {
    return null;
  }

  db.prepare(
    `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = ?
    `,
  ).run(...params, userId);

  return findUserById(userId);
}

export function deleteSessionByToken(token: string) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = db
    .prepare(
      `
      SELECT s.user_id, u.username, u.email, u.avatar_url, s.token, s.expires_at
      , u.is_admin
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
      `,
    )
    .get(token) as SessionRow | undefined;

  if (!session) {
    return null;
  }

  const isExpired = new Date(session.expires_at).getTime() < Date.now();

  if (isExpired) {
    deleteSessionByToken(token);
    return null;
  }

  return {
    userId: session.user_id,
    username: session.username,
    email: session.email,
    avatarUrl: session.avatar_url,
    isAdmin: Boolean(session.is_admin),
    token: session.token,
    expiresAt: session.expires_at,
  };
}
