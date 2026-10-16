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
import { useRouter } from 'next/navigation';
import { requestJson } from '@/lib/request-json';

interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(
  user: Partial<AuthUser> | null | undefined,
): AuthUser | null {
  if (
    !user ||
    typeof user.id !== 'number' ||
    typeof user.username !== 'string'
  ) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email ?? null,
    avatarUrl: user.avatarUrl ?? null,
    isAdmin: Boolean(user.isAdmin),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');

      if (response.status === 401) {
        setUser(null);
        // A cookie that no longer maps to a session would make proxy.ts bounce
        // between / and /login, so clear it and send the user to log in again.
        if (window.location.pathname !== '/login') {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.replace('/login');
        }
        return;
      }

      const data = (await response.json()) as { user?: AuthUser };
      setUser(normalizeUser(data.user));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const authenticate = useCallback(
    async (url: string, body: LoginCredentials | RegisterCredentials) => {
      const data = await requestJson<{ user: AuthUser }>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setUser(normalizeUser(data.user));
      router.replace('/');
      router.refresh();
    },
    [router],
  );

  const login = useCallback(
    (credentials: LoginCredentials) =>
      authenticate('/api/auth/login', credentials),
    [authenticate],
  );

  const register = useCallback(
    (credentials: RegisterCredentials) =>
      authenticate('/api/auth/register', credentials),
    [authenticate],
  );

  const logout = useCallback(async () => {
    await requestJson('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.replace('/login');
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refreshSession }),
    [user, loading, login, register, logout, refreshSession],
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
