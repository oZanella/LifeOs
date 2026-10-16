import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { dbExec, dbQuery, dbQueryOne } from '@/lib/db';
import { SESSION_COOKIE_NAME } from './auth-constants';
import { ApiError } from './api-error';

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
  isAdmin?: boolean;
}

function hashPassword(password: string, salt: string) {
  return crypto
    .pbkdf2Sync(password, salt, 120000, 64, 'sha512')
    .toString('hex');
}

function createPasswordRecord(password: string) {
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

const findUserBy = (column: 'id' | 'email' | 'username', value: unknown) =>
  dbQueryOne<UserRow>(
    `SELECT id::int AS id, username, email, avatar_url, is_admin, password_hash, password_salt
     FROM users WHERE ${column} = $1`,
    [value],
  );

export const findUserByUsername = (username: string) =>
  findUserBy('username', normalizeUsername(username));

export const findUserByEmail = (email: string) =>
  findUserBy('email', normalizeEmail(email));

export const findUserById = (userId: number) => findUserBy('id', userId);

export async function createUser(
  email: string,
  username: string,
  password: string,
) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  const { salt, hash } = createPasswordRecord(password);
  const isAdminByDefault = false;

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

// `isAdmin` is only honored when the caller passes it (admin routes).
export async function updateUser(userId: number, data: UpdateUserInput) {
  const updates: string[] = [];
  const params: Array<string | number | boolean | null> = [];
  const set = (column: string, value: string | number | boolean | null) => {
    params.push(value);
    updates.push(`${column} = $${params.length}`);
  };

  if (data.email) set('email', normalizeEmail(data.email));
  if (data.username) set('username', normalizeUsername(data.username));
  if (data.password) {
    const { salt, hash } = createPasswordRecord(data.password);
    set('password_hash', hash);
    set('password_salt', salt);
  }
  if (typeof data.avatarUrl === 'string') {
    set('avatar_url', data.avatarUrl.trim() || null);
  }
  if (typeof data.isAdmin === 'boolean') set('is_admin', data.isAdmin);

  if (updates.length === 0) {
    return null;
  }

  params.push(userId);
  await dbExec(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`,
    params,
  );

  return findUserById(userId);
}

const MAX_AVATAR_LENGTH = 2_000_000;

/**
 * Validates a profile/admin update body for `targetUserId` and returns the
 * normalized fields to save. Throws ApiError with a user-facing message.
 */
export async function parseAccountUpdate(
  body: Record<string, unknown>,
  targetUserId: number,
): Promise<UpdateUserInput> {
  const text = (value: unknown) =>
    typeof value === 'string' ? value.trim() || undefined : undefined;

  const email = text(body.email)?.toLowerCase();
  const username = text(body.username)?.toLowerCase();
  const password = text(body.password);
  const avatarUrl =
    typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : undefined;

  if (email && !email.includes('@')) throw new ApiError('Email inválido.');
  if (username && username.length < 3) {
    throw new ApiError('Nome de usuário precisa ter 3+ caracteres.');
  }
  if (password && password.length < 6) {
    throw new ApiError('Senha precisa ter 6+ caracteres.');
  }
  if (avatarUrl && avatarUrl.length > MAX_AVATAR_LENGTH) {
    throw new ApiError('Avatar muito grande.');
  }

  if (email) {
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== targetUserId) {
      throw new ApiError('Este email já está em uso.', 409);
    }
  }
  if (username) {
    const existing = await findUserByUsername(username);
    if (existing && existing.id !== targetUserId) {
      throw new ApiError('Este nome de usuário já existe.', 409);
    }
  }

  return { email, username, password, avatarUrl };
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
