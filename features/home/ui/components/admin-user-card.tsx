/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import { toTitleCaseName } from '../../home-user-config';
import { AdminDraft, AdminUser } from '../view/home-configuracoes.types';
import { buildInitials } from '../view/home-configuracoes.utils';

interface AdminUserCardProps {
  item: AdminUser;
  draft: AdminDraft;
  isEditing: boolean;
  isSubmitting: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
}

export function AdminUserCard({
  item,
  draft,
  isEditing,
  isSubmitting,
  onToggleEdit,
  onDelete,
}: AdminUserCardProps) {
  const displayName = toTitleCaseName(item.username);
  const avatarSrc = draft.avatarUrl || item.avatarUrl || '';

  return (
    <div className="rounded-lg border border-border/40 bg-background/60 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`Avatar de ${displayName}`}
              className="h-10 w-10 rounded-full object-cover border border-border/60"
            />
          ) : (
            <div className="h-10 w-10 rounded-full border border-border/60 bg-muted/60 flex items-center justify-center text-xs font-bold text-muted-foreground">
              {buildInitials(displayName)}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.email ?? 'Sem e-mail'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-1 rounded-full border border-border/60 bg-muted/40">
            {item.isAdmin ? 'Administrador' : 'Usuário'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleEdit}
            className="cursor-pointer"
          >
            {isEditing ? 'Fechar' : 'Editar'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
