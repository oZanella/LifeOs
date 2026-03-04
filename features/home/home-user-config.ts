'use client';

import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider/auth.provider';

export function toTitleCaseName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildInitials(username: string) {
  const parts = toTitleCaseName(username).split(/\s+/).filter(Boolean);

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
  const displayName = toTitleCaseName(user?.username ?? 'Usuario');

  return useMemo(
    () => ({
      name: displayName,
      email: user?.email ?? '',
      avatarUrl: user?.avatarUrl ?? null,
      status: 'Online',
      initials: buildInitials(displayName),
    }),
    [displayName, user?.avatarUrl, user?.email],
  );
}
