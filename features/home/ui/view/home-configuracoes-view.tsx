'use client';
import { BadgeTone } from '@/components/ui/badge';
import { AdminUserCard } from '../components/admin-user-card';
import { AdminUserEditModal } from '../components/admin-user-edit-modal';
import { AdminUserDeleteModal } from '../components/admin-user-delete-modal';
import { useAdminUserManagement } from './use-admin-user-management';
import { useState } from 'react';

export function HomeConfiguracoesView({}: { tone?: BadgeTone }) {
  const {
    user,
    fileInputRefs,
    adminUsers,
    adminDrafts,
    adminLoading,
    adminSubmittingId,
    editingUserId,
    avatarCrop,
    adminError,
    adminSuccess,
    setAdminDrafts,
    setEditingUserId,
    setAvatarCrop,
    setAdminError,
    setAdminSuccess,
    updateCropZoom,
    resetCrop,
    handleCropPointerDown,
    handleCropPointerMove,
    handleCropPointerUp,
    handleCropWheel,
    handleAvatarUpload,
    applyAvatarCrop,
    updateUser,
    deleteUser,
  } = useAdminUserManagement();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const totalUsers = adminUsers.length;
  const adminCount = adminUsers.filter((item) => item.isAdmin).length;
  const editingUser = adminUsers.find((item) => item.id === editingUserId);
  const editingDraft = editingUser ? adminDrafts[editingUser.id] : null;
  const deleteTargetUser = adminUsers.find((item) => item.id === deleteTargetId);

  if (!user?.isAdmin) {
    return (
      <section className="mb-4 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.6)]">
        <h3 className="text-lg font-semibold text-foreground">Configurações</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Apenas usuários administradores podem controlar os usuários
          cadastrados.
        </p>
      </section>
    );
  }

  return (
    <section className="relative mb-4 overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-background via-background to-muted/30 p-6 sm:p-8 shadow-[0_26px_70px_-40px_rgba(0,0,0,0.7)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Configurações
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Controle de Usuarios
            </h3>
            <p className="text-sm text-muted-foreground">
              Gerencie usuarios, permissoes e avatar com recorte responsivo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            Total: <span className="text-foreground">{totalUsers}</span>
          </div>
          <div className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            Admins: <span className="text-foreground">{adminCount}</span>
          </div>
        </div>
      </div>

      {adminError && (
        <div className="relative z-10 mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
          {adminError}
        </div>
      )}

      {adminSuccess && (
        <div className="relative z-10 mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-500">
          {adminSuccess}
        </div>
      )}

      <div className="relative z-10 mt-6 space-y-3">
        {adminLoading && (
          <p className="text-sm text-zinc-400 animate-pulse">
            Carregando usuários...
          </p>
        )}
        {!adminLoading && adminUsers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhum usuário cadastrado.
          </p>
        )}
        {!adminLoading &&
          adminUsers.map((item) => {
            const draft = adminDrafts[item.id];
            if (!draft) return null;

            return (
              <AdminUserCard
                key={item.id}
                item={item}
                draft={draft}
                isEditing={editingUserId === item.id}
                isSubmitting={adminSubmittingId === item.id}
                // Props de ação
                onToggleEdit={() => {
                  setAdminError('');
                  setAdminSuccess('');
                  setEditingUserId((prev) =>
                    prev === item.id ? null : item.id,
                  );
                }}
                onDelete={() => {
                  if (user?.id === item.id) {
                    setDeleteTargetId(item.id);
                    return;
                  }
                  void deleteUser(item.id);
                }}
              />
            );
          })}
      </div>

      {editingUser && editingDraft && (
        <AdminUserEditModal
          item={editingUser}
          draft={editingDraft}
          isOpen={Boolean(editingUserId)}
          isSubmitting={adminSubmittingId === editingUser.id}
          avatarCrop={avatarCrop}
          onClose={() => {
            setAvatarCrop(null);
            setEditingUserId(null);
          }}
          onSave={() => void updateUser(editingUser.id)}
          onCancel={() => {
            setAdminDrafts((prev) => ({
              ...prev,
              [editingUser.id]: {
                username: editingUser.username,
                email: editingUser.email ?? '',
                password: '',
                avatarUrl: editingUser.avatarUrl ?? '',
                isAdmin: editingUser.isAdmin,
              },
            }));
            setAvatarCrop(null);
            setEditingUserId(null);
          }}
          onDraftChange={(nextDraft) =>
            setAdminDrafts((prev) => ({
              ...prev,
              [editingUser.id]: nextDraft,
            }))
          }
          onAvatarSelect={() => fileInputRefs.current[editingUser.id]?.click()}
          onAvatarFileChange={(file) =>
            void handleAvatarUpload(editingUser.id, file)
          }
          setFileInputRef={(element) => {
            // eslint-disable-next-line react-hooks/immutability
            fileInputRefs.current[editingUser.id] = element;
          }}
          onCropPointerDown={handleCropPointerDown}
          onCropPointerMove={handleCropPointerMove}
          onCropPointerUp={handleCropPointerUp}
          onCropWheel={handleCropWheel}
          onCropZoomStep={(userId, step) => {
            const current = avatarCrop?.userId === userId ? avatarCrop.zoom : 1;
            updateCropZoom(userId, current + step);
          }}
          onCropZoomSet={updateCropZoom}
          onCropReset={resetCrop}
          onApplyCrop={() => void applyAvatarCrop()}
          onCancelCrop={() => setAvatarCrop(null)}
        />
      )}

      {deleteTargetUser && (
        <AdminUserDeleteModal
          item={deleteTargetUser}
          isOpen={Boolean(deleteTargetId)}
          isSubmitting={adminSubmittingId === deleteTargetUser.id}
          error={adminError}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={(password) =>
            void deleteUser(deleteTargetUser.id, password)
          }
        />
      )}
    </section>
  );
}
