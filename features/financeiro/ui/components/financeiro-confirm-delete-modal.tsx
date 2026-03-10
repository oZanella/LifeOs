'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinanceiroConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  count?: number;
  hasParent?: boolean;
}

export function FinanceiroConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  count = 1,
  hasParent = false,
}: FinanceiroConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5 text-red-500">
              <div className="p-2 rounded-full bg-red-500/10">
                <Trash2 size={18} />
              </div>
              <h3 className="font-bold tracking-tight">
                {title || 'Confirmar exclusão'}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="px-6 py-4 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description ||
                (count > 1
                  ? `Tem certeza que deseja excluir os ${count} lançamentos selecionados?`
                  : 'Tem certeza que deseja excluir este lançamento?')}
              <span className="block mt-1 font-medium text-foreground">
                Esta ação não poderá ser desfeita.
              </span>
            </p>

            {hasParent && (
              <div className="flex gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Aviso importante
                  </p>
                  <p className="text-xs leading-normal font-medium italic opacity-90">
                    Este registro é a origem de lançamentos recorrentes. Todas
                    as parcelas vinculadas a ele também serão excluídas
                    automaticamente.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 px-5 pb-5">
            <Button
              variant="ghost"
              className="flex-1 cursor-pointer order-2 sm:order-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1 font-bold bg-red-500 hover:bg-red-600 cursor-pointer order-1 sm:order-2"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
