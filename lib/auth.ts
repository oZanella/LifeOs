import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { dbExec, dbQuery, dbQueryOne } from '@/lib/db';
import { SESSION_COOKIE_NAME } from './auth-constants';

const SESSION_DURATION_DAYS = 30;

interface SessionRow {
  user_id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  token: string;
  expires_at: string | Date;
}

interface UserRow {
  id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
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
  return crypto
    .pbkdf2Sync(password, salt, 120000, 64, 'sha512')
    .toString('hex');
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

export async function findUserByUsername(username: string) {
  return dbQueryOne<UserRow>(
    `
      SELECT
        id::int as id,
        username,
        email,
        avatar_url,
        is_admin,
        password_hash,
        password_salt
      FROM users
      WHERE username = $1
    `,
    [normalizeUsername(username)],
  );
}

export async function findUserByEmail(email: string) {
  return dbQueryOne<UserRow>(
    `
      SELECT
        id::int as id,
        username,
        email,
        avatar_url,
        is_admin,
        password_hash,
        password_salt
      FROM users
      WHERE email = $1
    `,
    [normalizeEmail(email)],
  );
}

export async function findUserById(userId: number) {
  return dbQueryOne<UserRow>(
    `
      SELECT
        id::int as id,
        username,
        email,
        avatar_url,
        is_admin,
        password_hash,
        password_salt
      FROM users
      WHERE id = $1
    `,
    [userId],
  );
}

export async function createUser(
  email: string,
  username: string,
  password: string,
) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  const { salt, hash } = createPasswordRecord(password);
  const isAdminByDefault = true;

  const created = await dbQueryOne<{ id: number }>(
    `
      INSERT INTO users (username, email, avatar_url, is_admin, password_hash, password_salt)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id::int as id
    `,
    [normalizedUsername, normalizedEmail, null, isAdminByDefault, hash, salt],
  );

  if (!created) {
    throw new Error('Falha ao criar usuario.');
  }

  return {
    id: created.id,
    username: normalizedUsername,
    email: normalizedEmail,
    avatarUrl: null,
    isAdmin: isAdminByDefault,
  };
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await dbExec(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt.toISOString()],
  );

  return {
    token,
    expiresAt,
  };
}

export async function updateUserAccount(userId: number, data: UpdateUserInput) {
  const updates: string[] = [];
  const params: Array<string | number | null> = [];

  if (typeof data.email === 'string' && data.email.length > 0) {
    params.push(normalizeEmail(data.email));
    updates.push(`email = $${params.length}`);
  }

  if (typeof data.username === 'string' && data.username.length > 0) {
    params.push(normalizeUsername(data.username));
    updates.push(`username = $${params.length}`);
  }

  if (typeof data.password === 'string' && data.password.length > 0) {
    const { salt, hash } = createPasswordRecord(data.password);
    params.push(hash);
    updates.push(`password_hash = $${params.length}`);
    params.push(salt);
    updates.push(`password_salt = $${params.length}`);
  }

  if (typeof data.avatarUrl === 'string') {
    params.push(data.avatarUrl.trim() || null);
    updates.push(`avatar_url = $${params.length}`);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId);
  await dbExec(
    `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
    `,
    params,
  );

  return findUserById(userId);
}

export async function deleteUserById(userId: number) {
  await dbExec('DELETE FROM users WHERE id = $1', [userId]);
}

export async function listUsersForAdmin() {
  const rows = await dbQuery<{
    id: number;
    username: string;
    email: string | null;
    avatar_url: string | null;
    is_admin: boolean;
    created_at: string | Date;
  }>(
    `
      SELECT
        id::int as id,
        username,
        email,
        avatar_url,
        is_admin,
        created_at
      FROM users
      ORDER BY created_at ASC
    `,
  );

  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url,
    isAdmin: Boolean(row.is_admin),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }));
}

export async function countAdmins() {
  const row = await dbQueryOne<{ total: number }>(
    'SELECT COUNT(*)::int as total FROM users WHERE is_admin = TRUE',
  );
  return row?.total ?? 0;
}

export async function updateUserByAdmin(
  userId: number,
  data: AdminUpdateUserInput,
) {
  const updates: string[] = [];
  const params: Array<string | number | boolean | null> = [];

  if (typeof data.email === 'string' && data.email.length > 0) {
    params.push(normalizeEmail(data.email));
    updates.push(`email = $${params.length}`);
  }

  if (typeof data.username === 'string' && data.username.length > 0) {
    params.push(normalizeUsername(data.username));
    updates.push(`username = $${params.length}`);
  }

  if (typeof data.password === 'string' && data.password.length > 0) {
    const { salt, hash } = createPasswordRecord(data.password);
    params.push(hash);
    updates.push(`password_hash = $${params.length}`);
    params.push(salt);
    updates.push(`password_salt = $${params.length}`);
  }

  if (typeof data.avatarUrl === 'string') {
    params.push(data.avatarUrl.trim() || null);
    updates.push(`avatar_url = $${params.length}`);
  }

  if (typeof data.isAdmin === 'boolean') {
    params.push(data.isAdmin);
    updates.push(`is_admin = $${params.length}`);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId);
  await dbExec(
    `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
    `,
    params,
  );

  return findUserById(userId);
}

export async function deleteSessionByToken(token: string) {
  await dbExec('DELETE FROM sessions WHERE token = $1', [token]);
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await dbQueryOne<SessionRow>(
    `
      SELECT
        s.user_id::int as user_id,
        u.username,
        u.email,
        u.avatar_url,
        u.is_admin,
        s.token,
        s.expires_at
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token = $1
    `,
    [token],
  );

  if (!session) {
    return null;
  }

  const expiresTime = new Date(session.expires_at).getTime();
  if (expiresTime < Date.now()) {
    await deleteSessionByToken(token);
    return null;
  }

  return {
    userId: session.user_id,
    username: session.username,
    email: session.email,
    avatarUrl: session.avatar_url,
    isAdmin: Boolean(session.is_admin),
    token: session.token,
    expiresAt: new Date(session.expires_at).toISOString(),
  };
}
