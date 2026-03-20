'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { requestJson } from '@/lib/request-json';
import { useAuth } from '@/providers/auth-provider/auth.provider';
import {
  AdminDraft,
  AdminUser,
  AvatarCropState,
} from './home-configuracoes.types';
import {
  buildAdminDrafts,
  clamp,
  cropAvatarToDataUrl,
  getCropLayout,
  readFileAsDataUrl,
  readImageSize,
} from './home-configuracoes.utils';

export function useAdminUserManagement() {
  const { user, logout, refreshSession } = useAuth();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const dragStateRef = useRef<{
    userId: number;
    startX: number;
    startY: number;
    originOffsetX: number;
    originOffsetY: number;
  } | null>(null);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminDrafts, setAdminDrafts] = useState<Record<number, AdminDraft>>(
    {},
  );
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSubmittingId, setAdminSubmittingId] = useState<number | null>(
    null,
  );
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [avatarCrop, setAvatarCrop] = useState<AvatarCropState | null>(null);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const applyUsers = useCallback((users: AdminUser[]) => {
    setAdminUsers(users);
    setAdminDrafts(buildAdminDrafts(users));
  }, []);

  const loadAdminUsers = useCallback(async () => {
    setAdminError('');
    setAdminSuccess('');
    setAdminLoading(true);

    try {
      const data = await requestJson<{ users: AdminUser[] }>(
        '/api/admin/users',
      );
      applyUsers(data.users);
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao carregar usuarios.',
      );
    } finally {
      setAdminLoading(false);
    }
  }, [applyUsers]);

  useEffect(() => {
    if (user) {
      void loadAdminUsers();
    }
  }, [loadAdminUsers, user]);

  const updateCropZoom = useCallback((userId: number, nextZoom: number) => {
    setAvatarCrop((prev) => {
      if (!prev || prev.userId !== userId) {
        return prev;
      }
      return { ...prev, zoom: clamp(nextZoom, 1, 3) };
    });
  }, []);

  const resetCrop = useCallback((userId: number) => {
    setAvatarCrop((prev) => {
      if (!prev || prev.userId !== userId) {
        return prev;
      }
      return { ...prev, zoom: 1, offsetX: 0, offsetY: 0 };
    });
  }, []);

  const handleCropPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, userId: number) => {
      if (!avatarCrop || avatarCrop.userId !== userId) {
        return;
      }

      dragStateRef.current = {
        userId,
        startX: event.clientX,
        startY: event.clientY,
        originOffsetX: avatarCrop.offsetX,
        originOffsetY: avatarCrop.offsetY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [avatarCrop],
  );

  const handleCropPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, userId: number) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.userId !== userId) {
        return;
      }

      setAvatarCrop((prev) => {
        if (!prev || prev.userId !== userId) {
          return prev;
        }

        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;
        const layout = getCropLayout(prev);

        return {
          ...prev,
          offsetX: clamp(
            dragState.originOffsetX + deltaX,
            -layout.maxOffsetX,
            layout.maxOffsetX,
          ),
          offsetY: clamp(
            dragState.originOffsetY + deltaY,
            -layout.maxOffsetY,
            layout.maxOffsetY,
          ),
        };
      });
    },
    [],
  );

  const handleCropPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, userId: number) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.userId !== userId) {
        return;
      }

      dragStateRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  const handleCropWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>, userId: number) => {
      event.preventDefault();
      if (!avatarCrop || avatarCrop.userId !== userId) {
        return;
      }
      updateCropZoom(
        userId,
        avatarCrop.zoom + (event.deltaY > 0 ? -0.06 : 0.06),
      );
    },
    [avatarCrop, updateCropZoom],
  );

  const handleAvatarUpload = async (
    targetUserId: number,
    file: File | null,
  ) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminError('Selecione um arquivo de imagem para o avatar.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAdminError('Imagem muito grande. Use ate 5MB.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const size = await readImageSize(dataUrl);
      setAvatarCrop({
        userId: targetUserId,
        imageSrc: dataUrl,
        naturalWidth: size.width,
        naturalHeight: size.height,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
      setAdminError('');
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao carregar avatar.',
      );
    }
  };

  const applyAvatarCrop = async () => {
    if (!avatarCrop) {
      return null;
    }

    try {
      const croppedAvatar = await cropAvatarToDataUrl(avatarCrop);
      setAdminDrafts((prev) => ({
        ...prev,
        [avatarCrop.userId]: {
          ...prev[avatarCrop.userId],
          avatarUrl: croppedAvatar,
        },
      }));
      setAvatarCrop(null);
      setAdminError('');
      return croppedAvatar;
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao recortar avatar.',
      );
      return null;
    }
  };

  const updateUser = async (
    targetUserId: number,
    draftOverride?: Partial<AdminDraft>,
  ) => {
    const baseDraft = adminDrafts[targetUserId];
    if (!baseDraft) {
      return;
    }

    const draft = draftOverride ? { ...baseDraft, ...draftOverride } : baseDraft;
    if (!draft) {
      return;
    }

    setAdminSubmittingId(targetUserId);
    setAdminError('');
    setAdminSuccess('');

    try {
      const payload: Record<string, unknown> = {
        email: draft.email,
        username: draft.username,
        password: draft.password || undefined,
        avatarUrl: draft.avatarUrl,
      };

      if (user?.isAdmin) {
        payload.isAdmin = draft.isAdmin;
      }

      const data = await requestJson<{ users: AdminUser[] }>(
        `/api/admin/users/${targetUserId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      applyUsers(data.users);
      setEditingUserId(null);
      setAvatarCrop(null);

      if (user && targetUserId === user.id) {
        await refreshSession();
      }

      setAdminSuccess('Usuário atualizado.');
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao atualizar usuario.',
      );
    } finally {
      setAdminSubmittingId(null);
    }
  };

  const deleteUser = async (targetUserId: number, password?: string) => {
    const isSelf = user?.id === targetUserId;

    if (!password) {
      setAdminError('Informe sua senha para excluir.');
      return;
    }

    setAdminSubmittingId(targetUserId);
    setAdminError('');
    setAdminSuccess('');

    try {
      const init: RequestInit = {
        method: 'DELETE',
        body: password ? JSON.stringify({ password }) : undefined,
      };

      const data = await requestJson<{ users: AdminUser[] }>(
        `/api/admin/users/${targetUserId}`,
        init,
      );
      applyUsers(data.users);
      setEditingUserId((prev) => (prev === targetUserId ? null : prev));
      setAvatarCrop((prev) => (prev?.userId === targetUserId ? null : prev));

      if (isSelf) {
        await logout();
        return;
      }

      setAdminSuccess('Usuario excluido.');
    } catch (err) {
      setAdminError(
        err instanceof Error ? err.message : 'Erro ao excluir usuario.',
      );
    } finally {
      setAdminSubmittingId(null);
    }
  };

  return {
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
  };
}
