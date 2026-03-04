'use client';

import { useEffect, useState } from 'react';
import { BadgeTone } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/providers/auth-provider/auth.provider';

interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminDraft {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? 'Erro no controle de usuarios.');
  }

  return data;
}

export function HomeConfiguracoesView({ tone }: { tone?: BadgeTone }) {
  const { user } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminDrafts, setAdminDrafts] = useState<Record<number, AdminDraft>>(
    {},
  );
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSubmittingId, setAdminSubmittingId] = useState<number | null>(
    null,
  );
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const loadAdminUsers = async () => {
    setAdminError('');
    setAdminSuccess('');
    setAdminLoading(true);

    try {
      const data = await requestJson<{ users: AdminUser[] }>(
        '/api/admin/users',
      );
      setAdminUsers(data.users);
      setAdminDrafts(
        data.users.reduce<Record<number, AdminDraft>>((acc, item) => {
          acc[item.id] = {
            username: item.username,
            email: item.email ?? '',
            password: '',
            isAdmin: item.isAdmin,
          };
          return acc;
        }, {}),
      );
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao carregar usuarios.',
      );
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      void loadAdminUsers();
    }
  }, [user?.isAdmin]);

  const handleAdminSave = async (targetUserId: number) => {
    const draft = adminDrafts[targetUserId];
    if (!draft) {
      return;
    }

    setAdminSubmittingId(targetUserId);
    setAdminError('');
    setAdminSuccess('');

    try {
      const data = await requestJson<{ users: AdminUser[] }>(
        `/api/admin/users/${targetUserId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            email: draft.email,
            username: draft.username,
            password: draft.password || undefined,
            isAdmin: draft.isAdmin,
          }),
        },
      );

      setAdminUsers(data.users);
      setAdminDrafts(
        data.users.reduce<Record<number, AdminDraft>>((acc, item) => {
          acc[item.id] = {
            username: item.username,
            email: item.email ?? '',
            password: '',
            isAdmin: item.isAdmin,
          };
          return acc;
        }, {}),
      );
      setAdminSuccess('Usuario atualizado.');
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao atualizar usuario.',
      );
    } finally {
      setAdminSubmittingId(null);
    }
  };

  const handleAdminDelete = async (targetUserId: number) => {
    const confirmed = window.confirm('Excluir este usuario?');

    if (!confirmed) {
      return;
    }

    setAdminSubmittingId(targetUserId);
    setAdminError('');
    setAdminSuccess('');

    try {
      const data = await requestJson<{ users: AdminUser[] }>(
        `/api/admin/users/${targetUserId}`,
        {
          method: 'DELETE',
        },
      );

      setAdminUsers(data.users);
      setAdminDrafts(
        data.users.reduce<Record<number, AdminDraft>>((acc, item) => {
          acc[item.id] = {
            username: item.username,
            email: item.email ?? '',
            password: '',
            isAdmin: item.isAdmin,
          };
          return acc;
        }, {}),
      );
      setAdminSuccess('Usuario excluido.');
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao excluir usuario.',
      );
    } finally {
      setAdminSubmittingId(null);
    }
  };

  if (!user?.isAdmin) {
    return (
      <section
        data-tone={tone}
        className="mb-4 rounded-xl border border-border/50 bg-card/50 p-4"
      >
        <h3 className="text-sm font-bold">Configuracoes</h3>
        <p className="text-xs text-muted-foreground mt-2">
          Apenas usuarios administradores podem controlar os usuários
          cadastrados.
        </p>
      </section>
    );
  }

  return (
    <section
      data-tone={tone}
      className="mb-4 rounded-xl border border-border/50 bg-card/50 p-4"
    >
      <h3 className="text-sm font-bold">Controle de Usuarios</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Gerencie usuários, permissões de administrador, e-mail, nome e senha.
      </p>

      {adminError && <p className="mt-3 text-xs text-red-500">{adminError}</p>}
      {adminSuccess && (
        <p className="mt-3 text-xs text-emerald-500">{adminSuccess}</p>
      )}

      <div className="mt-3 space-y-3">
        {adminLoading && (
          <p className="text-xs text-muted-foreground">
            Carregando usuários...
          </p>
        )}

        {!adminLoading && adminUsers.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Nenhum usuário cadastrado.
          </p>
        )}

        {!adminLoading &&
          adminUsers.map((item) => {
            const draft = adminDrafts[item.id];

            if (!draft) {
              return null;
            }

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border/40 p-3 space-y-2"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      setAdminDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          email: event.target.value,
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Usuário"
                    value={draft.username}
                    onChange={(event) =>
                      setAdminDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          username: event.target.value,
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Nova senha (opcional)"
                    type="password"
                    value={draft.password}
                    onChange={(event) =>
                      setAdminDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          password: event.target.value,
                        },
                      }))
                    }
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <Switch
                      checked={draft.isAdmin}
                      onCheckedChange={(checked) =>
                        setAdminDrafts((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            isAdmin: checked,
                          },
                        }))
                      }
                    />
                    <span>Usuário Administrador</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleAdminSave(item.id)}
                    disabled={adminSubmittingId === item.id}
                    className="cursor-pointer"
                  >
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleAdminDelete(item.id)}
                    disabled={adminSubmittingId === item.id}
                    className="cursor-pointer"
                  >
                    Excluir
                  </Button>
                  <span className="text-[10px] text-muted-foreground">
                    ID: {item.id} | Criado:{' '}
                    {new Date(item.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
