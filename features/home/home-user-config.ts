'use client';

import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider/auth.provider';

function buildInitials(username: string) {
  const parts = username.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'US';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function useHomeUserConfig() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      name: user?.username ?? 'Usuario',
      email: user?.email ?? '',
      status: 'Online',
      initials: buildInitials(user?.username ?? 'Usuario'),
    }),
    [user?.email, user?.username],
  );
}
