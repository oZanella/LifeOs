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

interface AdminUserEditModalProps {
  item: AdminUser;
  draft: AdminDraft;
  isOpen: boolean;
  isSubmitting: boolean;
  avatarCrop: AvatarCropState | null;
  canEditAdmin: boolean;
  onClose: () => void;
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

export function AdminUserEditModal({
  item,
  draft,
  isOpen,
  isSubmitting,
  avatarCrop,
  canEditAdmin,
  onClose,
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
}: AdminUserEditModalProps) {
  if (!isOpen) return null;

  const displayName = toTitleCaseName(item.username);
  const avatarSrc = draft.avatarUrl || item.avatarUrl || '';
  const isCroppingThisUser = avatarCrop?.userId === item.id;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar edição de usuário"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-border/50 bg-background p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Editar usuário
              </h3>
              <p className="text-xs text-muted-foreground">
                Atualize dados, permissões e avatar do usuário.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
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

                  {canEditAdmin && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 rounded-md border border-border/50 bg-background/70">
                      <Switch
                        checked={draft.isAdmin}
                        onCheckedChange={(checked) =>
                          onDraftChange({ ...draft, isAdmin: checked })
                        }
                      />
                      <span>Usuario Administrador</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isCroppingThisUser && avatarCrop && (
              <div className="mt-4">
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
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <span className="text-[10px] text-muted-foreground">
              ID: {item.id} | Criado:{' '}
              {new Date(item.createdAt).toLocaleString('pt-BR')}
            </span>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto px-6 cursor-pointer"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="w-full sm:w-auto px-8 cursor-pointer font-bold"
                onClick={onSave}
                disabled={isSubmitting}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
