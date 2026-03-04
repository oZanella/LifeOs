export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminDraft {
  username: string;
  email: string;
  password: string;
  avatarUrl: string;
  isAdmin: boolean;
}

export interface AvatarCropState {
  userId: number;
  imageSrc: string;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}
