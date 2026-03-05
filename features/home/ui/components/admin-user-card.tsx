/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toTitleCaseName } from '../../home-user-config';
import {
  AdminDraft,
  AdminUser,
  AvatarCropState,
} from '../view/home-configuracoes.types';
import { buildInitials } from '../view/home-configuracoes.utils';
import { AdminUserAvatarCropper } from './admin-user-avatar-cropper';

interface AdminUserCardProps {
  item: AdminUser;
  draft: AdminDraft;
  isEditing: boolean;
  isSubmitting: boolean;
  avatarCrop: AvatarCropState | null;
  onToggleEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDraftChange: (nextDraft: AdminDraft) => void;
  onAvatarSelect: () => void;
  onAvatarFileChange: (file: File | null) => void;
  setFileInputRef: (element: HTMLInputElement | null) => void;
  onCropPointerDown: (
    event: React.PointerEvent<HTMLDivElement>,
    userId: number,
  ) => void;
  onCropPointerMove: (
    event: React.PointerEvent<HTMLDivElement>,
    userId: number,
  ) => void;
  onCropPointerUp: (
    event: React.PointerEvent<HTMLDivElement>,
    userId: number,
  ) => void;
  onCropWheel: (
    event: React.WheelEvent<HTMLDivElement>,
    userId: number,
  ) => void;
  onCropZoomStep: (userId: number, step: number) => void;
  onCropZoomSet: (userId: number, zoom: number) => void;
  onCropReset: (userId: number) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

export function AdminUserCard({
  item,
  draft,
  isEditing,
  isSubmitting,
  avatarCrop,
  onToggleEdit,
  onDelete,
  onSave,
  onCancel,
  onDraftChange,
  onAvatarSelect,
  onAvatarFileChange,
  setFileInputRef,
  onCropPointerDown,
  onCropPointerMove,
  onCropPointerUp,
  onCropWheel,
  onCropZoomStep,
  onCropZoomSet,
  onCropReset,
  onApplyCrop,
  onCancelCrop,
}: AdminUserCardProps) {
  const displayName = toTitleCaseName(item.username);
  const avatarSrc = draft.avatarUrl || item.avatarUrl || '';
  const isCroppingThisUser = avatarCrop?.userId === item.id;

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

      {isEditing && (
        <div className="mt-4 space-y-3 border-t border-border/40 pt-3">
          <div className="rounded-md border border-border/50 bg-muted/20 p-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
              <div className="shrink-0 flex flex-col items-center md:items-start">
                <button
                  type="button"
                  onClick={onAvatarSelect}
                  className="cursor-pointer rounded-full border border-border/60 p-1"
                  aria-label="Selecionar avatar"
                  title="Selecionar avatar"
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={`Avatar de ${displayName}`}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full border border-border/60 bg-muted/60 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {buildInitials(displayName)}
                    </div>
                  )}
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={setFileInputRef}
                  onChange={(event) =>
                    onAvatarFileChange(event.target.files?.[0] ?? null)
                  }
                  className="hidden"
                />
              </div>

              <div className="min-w-0 w-full">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Nome de usuario"
                    value={draft.username}
                    onChange={(event) =>
                      onDraftChange({ ...draft, username: event.target.value })
                    }
                  />

                  <Input
                    placeholder="E-mail"
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      onDraftChange({ ...draft, email: event.target.value })
                    }
                  />

                  <Input
                    placeholder="Nova senha (opcional)"
                    type="password"
                    value={draft.password}
                    onChange={(event) =>
                      onDraftChange({ ...draft, password: event.target.value })
                    }
                  />

                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 rounded-md border border-border/50 bg-background/70">
                    <Switch
                      checked={draft.isAdmin}
                      onCheckedChange={(checked) =>
                        onDraftChange({ ...draft, isAdmin: checked })
                      }
                    />
                    <span>Usuário Administrador</span>
                  </div>
                </div>
              </div>
            </div>

            {isCroppingThisUser && avatarCrop && (
              <AdminUserAvatarCropper
                itemId={item.id}
                crop={avatarCrop}
                onPointerDown={onCropPointerDown}
                onPointerMove={onCropPointerMove}
                onPointerUp={onCropPointerUp}
                onWheel={onCropWheel}
                onZoomStep={onCropZoomStep}
                onZoomSet={onCropZoomSet}
                onReset={onCropReset}
                onApply={onApplyCrop}
                onCancel={onCancelCrop}
              />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Salvar
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="cursor-pointer"
            >
              Cancelar
            </Button>

            <span className="text-[10px] text-muted-foreground">
              ID: {item.id} | Criado:{' '}
              {new Date(item.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
