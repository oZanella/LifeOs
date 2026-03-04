'use client';

import { BadgeTone } from '@/components/ui/badge';
import { AdminUserCard } from '../components/admin-user-card';
import { useAdminUserManagement } from './use-admin-user-management';

export function HomeConfiguracoesView({ tone }: { tone?: BadgeTone }) {
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

  if (!user?.isAdmin) {
    return (
      <section data-tone={tone} className="mb-4 rounded-xl border border-border/50 bg-card/70 p-4">
        <h3 className="text-sm font-bold">Configuracoes</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Apenas usuarios administradores podem controlar os usuarios cadastrados.
        </p>
      </section>
    );
  }

  return (
    <section data-tone={tone} className="mb-4 rounded-xl border border-border/50 bg-card/70 p-4">
      <h3 className="text-sm font-bold">Controle de Usuarios</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Gerencie usuarios, permissões e avatar com recorte responsivo.
      </p>

      {adminError && <p className="mt-3 text-xs text-red-500">{adminError}</p>}
      {adminSuccess && <p className="mt-3 text-xs text-emerald-500">{adminSuccess}</p>}

      <div className="mt-3 space-y-3">
        {adminLoading && <p className="text-xs text-muted-foreground">Carregando usuarios...</p>}

        {!adminLoading && adminUsers.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum usuario cadastrado.</p>
        )}

        {!adminLoading &&
          adminUsers.map((item) => {
            const draft = adminDrafts[item.id];
            if (!draft) {
              return null;
            }

            return (
              <AdminUserCard
                key={item.id}
                item={item}
                draft={draft}
                isEditing={editingUserId === item.id}
                isSubmitting={adminSubmittingId === item.id}
                avatarCrop={avatarCrop}
                onToggleEdit={() => {
                  setAdminError('');
                  setAdminSuccess('');
                  setEditingUserId((prev) => (prev === item.id ? null : item.id));
                }}
                onDelete={() => void deleteUser(item.id)}
                onSave={() => void updateUser(item.id)}
                onCancel={() => {
                  setAdminDrafts((prev) => ({
                    ...prev,
                    [item.id]: {
                      username: item.username,
                      email: item.email ?? '',
                      password: '',
                      avatarUrl: item.avatarUrl ?? '',
                      isAdmin: item.isAdmin,
                    },
                  }));
                  setAvatarCrop((prev) => (prev?.userId === item.id ? null : prev));
                  setEditingUserId(null);
                }}
                onDraftChange={(nextDraft) =>
                  setAdminDrafts((prev) => ({ ...prev, [item.id]: nextDraft }))
                }
                onAvatarSelect={() => fileInputRefs.current[item.id]?.click()}
                onAvatarFileChange={(file) => void handleAvatarUpload(item.id, file)}
                setFileInputRef={(element) => {
                  fileInputRefs.current[item.id] = element;
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
            );
          })}
      </div>
    </section>
  );
}
