import { toTitleCaseName } from '../../home-user-config';
import { AdminDraft, AdminUser, AvatarCropState } from './home-configuracoes.types';

export const CROP_BOX_SIZE = 220;
export const AVATAR_OUTPUT_SIZE = 256;

export function buildAdminDrafts(users: AdminUser[]) {
  return users.reduce<Record<number, AdminDraft>>((acc, item) => {
    acc[item.id] = {
      username: item.username,
      email: item.email ?? '',
      password: '',
      avatarUrl: item.avatarUrl ?? '',
      isAdmin: item.isAdmin,
    };
    return acc;
  }, {});
}

export function buildInitials(name: string) {
  const parts = toTitleCaseName(name).split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'US';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de avatar.'));
    reader.readAsDataURL(file);
  });
}

export function readImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    image.onerror = () => reject(new Error('Falha ao carregar a imagem.'));
    image.src = src;
  });
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getCropLayout(crop: AvatarCropState) {
  const baseScale = Math.max(
    CROP_BOX_SIZE / crop.naturalWidth,
    CROP_BOX_SIZE / crop.naturalHeight,
  );

  const renderedWidth = crop.naturalWidth * baseScale * crop.zoom;
  const renderedHeight = crop.naturalHeight * baseScale * crop.zoom;

  const maxOffsetX = Math.max(0, (renderedWidth - CROP_BOX_SIZE) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - CROP_BOX_SIZE) / 2);

  const offsetX = clamp(crop.offsetX, -maxOffsetX, maxOffsetX);
  const offsetY = clamp(crop.offsetY, -maxOffsetY, maxOffsetY);

  const left = (CROP_BOX_SIZE - renderedWidth) / 2 + offsetX;
  const top = (CROP_BOX_SIZE - renderedHeight) / 2 + offsetY;

  return {
    renderedWidth,
    renderedHeight,
    maxOffsetX,
    maxOffsetY,
    offsetX,
    offsetY,
    left,
    top,
  };
}

export async function cropAvatarToDataUrl(crop: AvatarCropState) {
  const image = new Image();
  image.src = crop.imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Erro ao processar recorte da imagem.'));
  });

  const layout = getCropLayout(crop);
  const sx = (-layout.left / layout.renderedWidth) * crop.naturalWidth;
  const sy = (-layout.top / layout.renderedHeight) * crop.naturalHeight;
  const sWidth = (CROP_BOX_SIZE / layout.renderedWidth) * crop.naturalWidth;
  const sHeight = (CROP_BOX_SIZE / layout.renderedHeight) * crop.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Nao foi possivel processar o avatar.');
  }

  context.drawImage(
    image,
    sx,
    sy,
    sWidth,
    sHeight,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  );

  return canvas.toDataURL('image/png');
}
