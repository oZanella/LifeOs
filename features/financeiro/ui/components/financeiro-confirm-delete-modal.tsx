'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 size={16} />
            </div>
            <DialogTitle>{title || 'Confirmar exclusão'}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description ||
              (count > 1
                ? `Tem certeza que deseja excluir os ${count} lançamentos selecionados?`
                : 'Tem certeza que deseja excluir este lançamento?')}
            <span className="mt-1 block font-medium text-foreground">
              Esta ação não poderá ser desfeita.
            </span>
          </p>

          {hasParent && (
            <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold">Aviso importante</p>
                <p className="text-xs leading-normal opacity-90">
                  Este registro faz parte de um lançamento parcelado. Parcelas
                  de meses anteriores serão mantidas em Lançamentos pagos, e
                  parcelas do mês atual em diante serão excluídas.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" className="cursor-pointer" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
