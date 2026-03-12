'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminUser } from '../view/home-configuracoes.types';

interface AdminUserDeleteModalProps {
  item: AdminUser;
  isOpen: boolean;
  isSubmitting: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export function AdminUserDeleteModal({
  item,
  isOpen,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: AdminUserDeleteModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar exclusao"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-background p-4 shadow-2xl">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-foreground">
              Excluir conta
            </h3>
            <p className="text-xs text-muted-foreground">
              Confirme sua senha para excluir a conta de{' '}
              <span className="font-semibold text-foreground">
                {item.username}
              </span>
              .
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto px-6 cursor-pointer"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="w-full sm:w-auto px-8 cursor-pointer font-bold"
                onClick={() => onConfirm(password)}
                disabled={isSubmitting}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
