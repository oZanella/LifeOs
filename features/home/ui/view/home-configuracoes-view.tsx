'use client';
import { BadgeTone } from '@/components/ui/badge';
import { AdminUserCard } from '../components/admin-user-card';
import { AdminUserEditModal } from '../components/admin-user-edit-modal';
import { AdminUserDeleteModal } from '../components/admin-user-delete-modal';
import { useAdminUserManagement } from './use-admin-user-management';
import { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const canManageUsers = Boolean(user?.isAdmin);
  const visibleUsers = useMemo(() => {
    if (!user) {
      return [];
    }
    if (canManageUsers) {
      return adminUsers;
    }
    return adminUsers.filter((item) => item.id === user.id);
  }, [adminUsers, canManageUsers, user]);
  const totalUsers = visibleUsers.length;
  const adminCount = canManageUsers
    ? visibleUsers.filter((item) => item.isAdmin).length
    : 0;
  const editingUser = visibleUsers.find((item) => item.id === editingUserId);
  const editingDraft = editingUser ? adminDrafts[editingUser.id] : null;
  const deleteTargetUser = visibleUsers.find((item) => item.id === deleteTargetId);

  return (
    <section className="relative mb-4 flex flex-col min-h-0 h-full overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-background via-background to-muted/30 p-6 sm:p-8 shadow-[0_26px_70px_-40px_rgba(0,0,0,0.7)]">
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
              {canManageUsers
                ? 'Gerencie usuarios, permissoes e avatar com recorte responsivo.'
                : 'Edite apenas seus dados e avatar.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            Total: <span className="text-foreground">{totalUsers}</span>
          </div>
          {canManageUsers && (
            <div className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              Admins: <span className="text-foreground">{adminCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-5 flex-1 overflow-visible sm:min-h-0 sm:overflow-auto pr-1 custom-scrollbar">
        {adminError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
            {adminError}
          </div>
        )}

        {adminSuccess && (
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-500">
            {adminSuccess}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {adminLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4 sm:p-5 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!adminLoading && visibleUsers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              Nenhum usuário cadastrado.
            </p>
          )}
          {!adminLoading &&
            visibleUsers.map((item) => {
              const draft = adminDrafts[item.id];
              if (!draft) return null;

              return (
                <AdminUserCard
                  key={item.id}
                  item={item}
                  draft={draft}
                  isEditing={editingUserId === item.id}
                  isSubmitting={adminSubmittingId === item.id}
                  canDelete={canManageUsers}
                  // Props de ação
                  onToggleEdit={() => {
                    setAdminError('');
                    setAdminSuccess('');
                    setEditingUserId((prev) =>
                      prev === item.id ? null : item.id,
                    );
                  }}
                  onDelete={() => {
                    setAdminError('');
                    setAdminSuccess('');
                    setDeleteTargetId(item.id);
                  }}
                />
              );
            })}
        </div>
      </div>

      {editingUser && editingDraft && (
        <AdminUserEditModal
          item={editingUser}
          draft={editingDraft}
          isOpen={Boolean(editingUserId)}
          isSubmitting={adminSubmittingId === editingUser.id}
          avatarCrop={avatarCrop}
          canEditAdmin={canManageUsers}
          onClose={() => {
            setAvatarCrop(null);
            setEditingUserId(null);
          }}
          onSave={async () => {
            if (avatarCrop?.userId === editingUser.id) {
              const cropped = await applyAvatarCrop();
              if (!cropped) {
                return;
              }
              await updateUser(editingUser.id, { avatarUrl: cropped });
              return;
            }

            await updateUser(editingUser.id);
          }}
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

      {canManageUsers && deleteTargetUser && (
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
