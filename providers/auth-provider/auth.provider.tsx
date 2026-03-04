'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  isAdmin: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  username: string;
}

interface UpdateAccountInput {
  email?: string;
  username?: string;
  password?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  updateAccount: (data: UpdateAccountInput) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
  } & T;

  if (!response.ok) {
    throw new Error(data.message ?? 'Erro de autenticacao.');
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const normalizeUser = useCallback(
    (user: Partial<AuthUser> | null | undefined): AuthUser | null => {
      if (!user || typeof user.id !== 'number' || typeof user.username !== 'string') {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email ?? null,
        isAdmin: Boolean(user.isAdmin),
      };
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    try {
      const data = await requestJson<{ user: AuthUser }>('/api/auth/session', {
        method: 'GET',
      });
      setUser(normalizeUser(data.user));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [normalizeUser]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [loading, pathname, router, user]);

  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
      const data = await requestJson<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setUser(normalizeUser(data.user));
      router.replace('/');
      router.refresh();
    },
    [normalizeUser, router],
  );

  const register = useCallback(
    async ({ email, username, password }: RegisterCredentials) => {
      const data = await requestJson<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });

      setUser(normalizeUser(data.user));
      router.replace('/');
      router.refresh();
    },
    [normalizeUser, router],
  );

  const logout = useCallback(async () => {
    await requestJson('/api/auth/logout', {
      method: 'POST',
    });
    setUser(null);
    router.replace('/login');
    router.refresh();
  }, [router]);

  const updateAccount = useCallback(
    async (data: UpdateAccountInput) => {
      const payload = {
        email: data.email,
        username: data.username,
        password: data.password,
      };

      await requestJson<{ user: AuthUser }>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      // Force new login after account changes to avoid stale auth state.
      await requestJson('/api/auth/logout', {
        method: 'POST',
      });

      setUser(null);
      router.replace('/login');
      router.refresh();
    },
    [router],
  );

  const deleteAccount = useCallback(async () => {
    await requestJson('/api/auth/profile', {
      method: 'DELETE',
    });
    setUser(null);
    router.replace('/login');
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      updateAccount,
      deleteAccount,
      logout,
      refreshSession,
    }),
    [deleteAccount, loading, login, logout, refreshSession, register, updateAccount, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider');
  }

  return context;
}
